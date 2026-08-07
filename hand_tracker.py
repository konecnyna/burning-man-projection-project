import cv2
import mediapipe as mp
import logging
import threading
import time
from datetime import datetime
from typing import List, Dict
from event_system import Event, EventBus, HandTrackingEvents

logger = logging.getLogger(__name__)

class HandTracker:
    """
    Hand tracking using MediaPipe directly.

    This runs continuously for the life of the installation, so every piece of
    per-hand state here must be bounded. Hand IDs increase monotonically and are
    reissued whenever a frame detects nothing, so anything keyed by hand_id has
    to be pruned to the live set each frame or it grows forever.
    """
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus

        self.mp_hands = mp.solutions.hands

        self.hands = self.mp_hands.Hands(
            max_num_hands=4,
            min_detection_confidence=0.6,
            min_tracking_confidence=0.2,
            model_complexity=0
        )

        self.cap = None
        self.running = False
        self.thread = None
        self.previous_hands = []
        self.fps = 0
        self.last_fps_time = time.time()
        self.frame_count = 0

        # Persistent hand tracking
        self.tracked_hands = {}  # persistent_id -> hand_data
        self.next_hand_id = 0
        self.max_tracking_distance = 0.08  # Max distance to consider same hand

        # Gesture tracking. Both are keyed by hand_id and pruned every frame by
        # _prune_gesture_state() -- see the class docstring.
        self.previous_gestures = {}  # hand_id -> gesture_name
        self.gesture_hold_time = {}  # hand_id -> timestamp

        # Latch so a detached camera logs once, not once per frame.
        self._read_failed = False

        # Camera recovery. At ~10 reads/sec while failing, 30 failures is
        # about 3s of a dead camera before we try to reopen it.
        self._consecutive_failures = 0
        self.REOPEN_AFTER_FAILURES = 30
        self.REOPEN_BACKOFF_SECONDS = 5
        self._last_reopen = 0
        self._camera_index = 0

        # How long start() keeps trying before giving up. See
        # _open_camera_with_retry() for why a single attempt is not enough.
        self.OPEN_RETRY_SECONDS = 30
        self.OPEN_RETRY_INTERVAL = 2

    def _open_camera_with_retry(self, camera_index: int):
        """Open the camera, retrying for OPEN_RETRY_SECONDS before giving up.

        One attempt is not enough, for two reasons that both bite at boot:

          * macOS authorises the camera asynchronously. The first VideoCapture
            after a cold start returns failure immediately -- "not authorized
            to capture video (status 0), requesting..." -- while the grant is
            still being resolved. Measured on the deployment box, a permitted
            process succeeds on roughly the third attempt.
          * At login the USB webcam may not have finished enumerating.

        Failing here used to be permanent: start() returned without setting
        running, so the tracking thread never began and no later reopen was
        ever attempted. The kiosk then ran for days, cycling scenes, blind.
        """
        deadline = time.time() + self.OPEN_RETRY_SECONDS
        attempt = 0
        while True:
            attempt += 1
            cap = cv2.VideoCapture(camera_index)
            if cap.isOpened():
                if attempt > 1:
                    logger.info("Camera %s opened on attempt %d",
                                camera_index, attempt)
                return cap
            cap.release()
            if time.time() >= deadline:
                return None
            logger.info("Camera %s not ready (attempt %d); retrying in %ss",
                        camera_index, attempt, self.OPEN_RETRY_INTERVAL)
            time.sleep(self.OPEN_RETRY_INTERVAL)

    def start(self, camera_index: int = 0):
        """Start the hand tracking system"""
        if self.running:
            return
            
        self._camera_index = camera_index
        self.cap = self._open_camera_with_retry(camera_index)
        if self.cap is None or not self.cap.isOpened():
            # Start anyway, camera-less. This used to `return`, which was the
            # single worst failure mode the installation had: the tracking
            # thread never began, so _reopen_camera() was never reached, and a
            # camera that appeared one second later -- a webcam still
            # enumerating, a TCC grant that landed late -- stayed unused until
            # somebody flew to the desert and restarted the process.
            #
            # Running blind costs one VideoCapture attempt every
            # REOPEN_BACKOFF_SECONDS and recovers by itself the moment the
            # camera exists.
            logger.error(
                "Could not open camera at index %s after %ss. On a Mac mini this "
                "usually means no USB webcam is attached, or camera permission "
                "was never granted to the launching process.",
                camera_index, self.OPEN_RETRY_SECONDS)
            logger.warning(
                "Starting blind; will keep retrying index %s every %ss",
                camera_index, self.REOPEN_BACKOFF_SECONDS)
            self.cap = None
            self.event_bus.emit(Event(
                type=HandTrackingEvents.CAMERA_ERROR,
                data={"error": "Could not open camera"},
                timestamp=datetime.now(),
                source="hand_tracker"
            ))
        else:
            self._log_camera_opened()

        self.running = True
        self.thread = threading.Thread(target=self._tracking_loop)
        self.thread.daemon = True
        self.thread.start()

        if self.cap is not None:
            self.event_bus.emit(Event(
                type=HandTrackingEvents.SYSTEM_READY,
                data={"camera_index": camera_index},
                timestamp=datetime.now(),
                source="hand_tracker"
            ))

    def _log_camera_opened(self):
        """Log what the camera actually negotiated.

        Nothing sets the capture size, so this is whatever the device defaults
        to -- and until it was logged it was unknowable without attaching a
        debugger, which made "is the frame big enough to see a hand at six
        feet" an unanswerable question.

        Deliberately not forced to a smaller size. Less data over USB would be
        cheaper, but MediaPipe costs ~11ms/frame at any input resolution, and
        downscaling could cost detection range on the distant hands that are
        already marginal. Change it only with /calibrate measurements either
        side of the change.
        """
        logger.info(
            "Camera %s opened: %dx%d @ %.0f fps (device default, not set by us)",
            self._camera_index,
            int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            self.cap.get(cv2.CAP_PROP_FPS))
        
    def stop(self):
        """Stop the hand tracking system"""
        self.running = False
        if self.thread:
            self.thread.join()
        if self.cap:
            self.cap.release()
            
    def _tracking_loop(self):
        """Main tracking loop running in separate thread"""
        while self.running:
            # No handle at all: either start() came up blind, or a reopen
            # failed. _reopen_camera() rate-limits itself, so this spins at
            # REOPEN_BACKOFF_SECONDS rather than at frame rate.
            if self.cap is None or not self.cap.isOpened():
                self._reopen_camera()
                time.sleep(0.5)
                continue

            ret, frame = self.cap.read()
            if not ret:
                if not self._read_failed:
                    # Log the transition only; this loop runs at frame rate and
                    # a detached camera would otherwise flood the log forever.
                    logger.error("Camera read failed; retrying every 100ms")
                    self._read_failed = True
                self._consecutive_failures += 1

                self.event_bus.emit(Event(
                    type=HandTrackingEvents.CAMERA_ERROR,
                    data={"error": "Failed to read frame"},
                    timestamp=datetime.now(),
                    source="hand_tracker"
                ))

                # A brief glitch clears itself on the next read. A real
                # disconnect does not: the handle stays dead and retrying it
                # forever means the installation is blind until someone
                # restarts it. After REOPEN_AFTER_FAILURES, throw the handle
                # away and open a fresh one.
                if self._consecutive_failures >= self.REOPEN_AFTER_FAILURES:
                    self._reopen_camera()

                time.sleep(0.1)
                continue

            self._consecutive_failures = 0
                
            if self._read_failed:
                logger.info("Camera recovered")
                self._read_failed = False

            # Flip frame horizontally for mirror effect
            frame = cv2.flip(frame, 1)
            
            # Process frame
            self._process_frame(frame)
            
            # Calculate FPS
            self._update_fps()
            
    def _process_frame(self, frame):
        """Process single frame for hand detection"""
        # Convert BGR to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = self.hands.process(rgb_frame)

        detected_hands = []

        if results.multi_hand_landmarks:
            for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
                # Extract hand data with confidence
                hand_data = self._extract_hand_data(hand_landmarks, frame.shape)

                # Add confidence data
                confidence_data = self._calculate_confidence(hand_landmarks, results, idx)
                hand_data['confidence'] = confidence_data

                detected_hands.append(hand_data)

        # Assign persistent IDs based on position tracking
        current_hands = self._assign_persistent_ids(detected_hands)

        # Detect gestures for tracked hands
        for hand_data in current_hands:
            gesture = self._detect_thumbs_gesture(hand_data)
            self._emit_gesture_events(hand_data['hand_id'], gesture)

        # Drop gesture state for hands that no longer exist. Without this,
        # previous_gestures grows by one entry per hand ID forever.
        self._prune_gesture_state({h['hand_id'] for h in current_hands})

        # Emit events based on state changes
        self._emit_hand_events(current_hands)

        # Heartbeat for consumers that need to know a frame was handled even
        # when no hands are present. Deliberately carries no hand payload --
        # hand data travels on hand_moved / hand_detected only, so it is
        # serialized once per frame rather than twice.
        self.event_bus.emit(Event(
            type=HandTrackingEvents.FRAME_PROCESSED,
            data={
                "hand_count": len(current_hands),
                "fps": self.fps,
            },
            timestamp=datetime.now(),
            source="hand_tracker"
        ))

        self.previous_hands = current_hands

    def _reopen_camera(self):
        """Drop the current capture handle and open a fresh one.

        Rate-limited: a camera that is genuinely unplugged will fail to reopen
        too, and hammering VideoCapture in the tracking loop is expensive.
        """
        now = time.time()
        if now - self._last_reopen < self.REOPEN_BACKOFF_SECONDS:
            return
        self._last_reopen = now

        # Distinguish "it broke" from "we never had one", so the log of a
        # blind installation does not read like a camera that keeps dying.
        if self.cap is None:
            logger.info("Retrying camera index %s", self._camera_index)
        else:
            logger.warning("Camera unresponsive after %d reads; reopening index %s",
                           self._consecutive_failures, self._camera_index)
        try:
            if self.cap:
                self.cap.release()
        except Exception:
            logger.exception("Error releasing the camera handle")

        try:
            was_blind = self.cap is None
            self.cap = cv2.VideoCapture(self._camera_index)
            if self.cap.isOpened():
                self._consecutive_failures = 0
                if was_blind:
                    # Recovered from a camera-less start. Say so loudly and
                    # announce readiness, which start() could not do earlier.
                    logger.info("Camera acquired after starting blind")
                    self._log_camera_opened()
                    self.event_bus.emit(Event(
                        type=HandTrackingEvents.SYSTEM_READY,
                        data={"camera_index": self._camera_index},
                        timestamp=datetime.now(),
                        source="hand_tracker"
                    ))
                else:
                    logger.info("Camera reopened successfully")
            else:
                # Release the dead handle so the loop sees None and keeps
                # treating this as "blind", rather than holding a closed
                # capture object forever.
                self.cap.release()
                self.cap = None
                logger.error("Camera reopen failed; will retry in %ss",
                             self.REOPEN_BACKOFF_SECONDS)
        except Exception:
            # Leave no half-open handle behind: the loop keys off `cap is
            # None` to decide it is blind, and a stale object here would make
            # it read from a capture that can never produce a frame.
            self.cap = None
            logger.exception("Camera reopen raised")

    def _prune_gesture_state(self, live_hand_ids: set):
        """Forget gesture state for hands that are gone.

        Hand IDs increase monotonically and every hand is reissued a new ID
        after any frame with no detections, so these dicts would otherwise
        accumulate an entry per ID for the entire run.
        """
        for stale_id in [hid for hid in self.previous_gestures if hid not in live_hand_ids]:
            del self.previous_gestures[stale_id]
        for stale_id in [hid for hid in self.gesture_hold_time if hid not in live_hand_ids]:
            del self.gesture_hold_time[stale_id]
        
    def _extract_hand_data(self, hand_landmarks, frame_shape) -> Dict:
        """Extract normalized hand data from MediaPipe landmarks"""
        height, width = frame_shape[:2]
        
        landmarks = []
        for lm in hand_landmarks.landmark:
            landmarks.append({
                'x': lm.x,
                'y': lm.y,
                'z': lm.z
            })
            
        # Key landmarks
        wrist = landmarks[0]
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]
        
        # Calculate palm center
        palm_center = {
            'x': (wrist['x'] + landmarks[5]['x'] + landmarks[9]['x'] + landmarks[13]['x'] + landmarks[17]['x']) / 5,
            'y': (wrist['y'] + landmarks[5]['y'] + landmarks[9]['y'] + landmarks[13]['y'] + landmarks[17]['y']) / 5,
            'z': (wrist['z'] + landmarks[5]['z'] + landmarks[9]['z'] + landmarks[13]['z'] + landmarks[17]['z']) / 5
        }
        
        return {
            'landmarks': landmarks,
            'palm_center': palm_center,
            'wrist': wrist,
            'fingertips': {
                'thumb': thumb_tip,
                'index': index_tip,
                'middle': middle_tip,
                'ring': ring_tip,
                'pinky': pinky_tip
            }
        }
    
    def _assign_persistent_ids(self, detected_hands) -> List[Dict]:
        """Assign persistent IDs to detected hands based on position tracking"""
        if not detected_hands:
            # No hands detected, clear all tracked hands
            self.tracked_hands.clear()
            return []
        
        # Calculate distances between detected hands and previously tracked hands
        assignments = {}  # detected_idx -> persistent_id
        used_persistent_ids = set()
        
        # First pass: assign detected hands to closest tracked hands within threshold
        for det_idx, detected_hand in enumerate(detected_hands):
            best_persistent_id = None
            best_distance = float('inf')
            
            for persistent_id, tracked_hand in self.tracked_hands.items():
                if persistent_id in used_persistent_ids:
                    continue
                    
                # Calculate distance between palm centers
                dx = detected_hand['palm_center']['x'] - tracked_hand['palm_center']['x']
                dy = detected_hand['palm_center']['y'] - tracked_hand['palm_center']['y']
                distance = (dx*dx + dy*dy) ** 0.5
                
                if distance < self.max_tracking_distance and distance < best_distance:
                    best_distance = distance
                    best_persistent_id = persistent_id
            
            if best_persistent_id is not None:
                assignments[det_idx] = best_persistent_id
                used_persistent_ids.add(best_persistent_id)
        
        # Second pass: assign new IDs to unassigned detected hands
        for det_idx, detected_hand in enumerate(detected_hands):
            if det_idx not in assignments:
                # Create new persistent ID
                assignments[det_idx] = self.next_hand_id
                self.next_hand_id += 1
        
        # Update tracked hands with current frame data
        new_tracked_hands = {}
        result_hands = []
        
        for det_idx, detected_hand in enumerate(detected_hands):
            persistent_id = assignments[det_idx]
            
            # Add persistent ID to hand data
            detected_hand['hand_id'] = persistent_id
            
            # Store in tracked hands
            new_tracked_hands[persistent_id] = detected_hand.copy()
            result_hands.append(detected_hand)
        
        self.tracked_hands = new_tracked_hands
        return result_hands
    

    def _calculate_confidence(self, hand_landmarks, results, hand_idx) -> Dict:
        """Calculate confidence metrics for hand detection"""
        landmarks = hand_landmarks.landmark
        
        # 1. Landmark visibility score (average of all landmark visibility scores)
        visibility_scores = [lm.visibility for lm in landmarks if hasattr(lm, 'visibility')]
        avg_visibility = sum(visibility_scores) / len(visibility_scores) if visibility_scores else 0.95
        
        # 2. Landmark presence score (how many landmarks have reasonable coordinates)
        valid_landmarks = 0
        total_landmarks = len(landmarks)
        for lm in landmarks:
            if 0 <= lm.x <= 1 and 0 <= lm.y <= 1 and -1 <= lm.z <= 1:
                valid_landmarks += 1
        presence_score = valid_landmarks / total_landmarks if total_landmarks > 0 else 0.0
        
        # 3. MediaPipe's own handedness score. This is the only number here that
        #    is actually a model's confidence that it is looking at a hand.
        mediapipe_confidence = 0.0
        if hasattr(results, 'multi_handedness') and results.multi_handedness:
            if hand_idx < len(results.multi_handedness):
                handedness = results.multi_handedness[hand_idx]
                if hasattr(handedness, 'classification') and handedness.classification:
                    mediapipe_confidence = handedness.classification[0].score
        classification_score = mediapipe_confidence or 0.95

        # 4. Stability score (how much this hand moved since last frame).
        #
        #    Matched to the NEAREST hand in the previous frame, not to whichever
        #    hand held the same index. MediaPipe's detection order is not stable
        #    and _assign_persistent_ids reorders on top of that, so indexing by
        #    position could measure hand A against hand B's last location and
        #    report a still hand as violently unstable. Nearest-neighbour is also
        #    what the ID assignment itself does, so the two now agree.
        wrist = landmarks[0]
        palm_x = (wrist.x + landmarks[5].x + landmarks[9].x + landmarks[13].x + landmarks[17].x) / 5
        palm_y = (wrist.y + landmarks[5].y + landmarks[9].y + landmarks[13].y + landmarks[17].y) / 5

        stability_score = 1.0  # No previous frame to compare against
        nearest = None
        for prev in self.previous_hands:
            prev_palm = prev.get('palm_center') or {}
            if 'x' not in prev_palm or 'y' not in prev_palm:
                continue
            d = ((palm_x - prev_palm['x']) ** 2 + (palm_y - prev_palm['y']) ** 2) ** 0.5
            if nearest is None or d < nearest:
                nearest = d
        if nearest is not None:
            stability_score = max(0.0, 1.0 - (nearest * 8))
        
        # 5. Distance score based on hand size (closer hands appear larger)
        # Calculate hand span using key landmarks
        wrist = landmarks[0]
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        pinky_tip = landmarks[20]
        
        # Calculate hand span (diagonal distance from wrist to middle finger tip)
        hand_span = ((middle_tip.x - wrist.x)**2 + (middle_tip.y - wrist.y)**2) ** 0.5
        
        # Calculate hand width (thumb tip to pinky tip)
        hand_width = ((thumb_tip.x - pinky_tip.x)**2 + (thumb_tip.y - pinky_tip.y)**2) ** 0.5
        
        # Use average of span and width as size metric
        hand_size = (hand_span + hand_width) / 2
        
        # Convert hand size to distance score
        # Typical hand size range: 0.15 (close) to 0.05 (far)
        # Larger size = closer = higher score
        distance_score = max(0.0, min(1.0, (hand_size - 0.05) / 0.10))
        
        # 6. Overall confidence.
        #
        #    This answers one question -- is this a hand we can track -- and so it
        #    is dominated by the only term that is actually a model's opinion on
        #    that. The previous blend gave 45% of the weight to apparent hand
        #    size, which made the score largely a proximity meter, and the
        #    frontend gates interaction on it at 0.70 and idle wake at 0.75.
        #
        #    Measured at 6 feet, the working distance of the installation, with a
        #    hand plainly in view (451 and 450 samples):
        #
        #      still palm    overall p50 0.690   cleared 0.70 in 30.2% of frames
        #      moving palm   overall p50 0.677   cleared 0.70 in  8.2% of frames
        #      idle wake at 0.75                 never reached, 0 of ~1350 samples
        #
        #    MediaPipe's own score was 0.933 and 0.930 across those two -- it was
        #    certain both times. The blend was discarding a clean signal and
        #    replacing it with noise about where the person stood and whether they
        #    were moving, and it penalised movement, which is the one thing the
        #    onboarding explicitly asks for.
        #
        #    Two terms are gone from the blend rather than reweighted:
        #
        #      visibility  MediaPipe never populates it on hand landmarks, so it
        #                  was 0.000 in all 388 samples checked. It was a flat
        #                  0.05 of the scale that could never be earned.
        #      stability   a moving hand is not less likely to be a hand. This was
        #                  measuring intent, badly, inside a detection score.
        #
        #    Both are still reported below, so /calibrate can model them.
        #
        #    distance keeps a small share. It is not evidence of hand-ness, but it
        #    does discriminate the phantom detections seen at 6ft, which had a
        #    hand_size of 0.038 against a real 0.096. At 0.10 it cannot gate out a
        #    legitimate hand: a real hand too far to register any distance score
        #    still lands near 0.85.
        if mediapipe_confidence > 0:
            overall_confidence = (
                mediapipe_confidence * 0.75 +
                presence_score * 0.15 +
                distance_score * 0.10
            )
        else:
            # No handedness score to lean on, so fall back to the sanity checks.
            # Deliberately cannot reach 0.75: without MediaPipe's opinion this
            # should never be confident enough to wake the installation.
            overall_confidence = (
                presence_score * 0.45 +
                distance_score * 0.25
            )

        # No multiplicative boosts. There were two, both keyed on apparent size,
        # and with these weights the blend already reaches 1.0 on its own.

        confidence_result = {
            'overall': round(overall_confidence, 3),
            'visibility': round(avg_visibility, 3),
            'presence': round(presence_score, 3),
            'classification': round(classification_score, 3),
            'stability': round(stability_score, 3),
            'mediapipe': round(mediapipe_confidence, 3),
            'distance': round(distance_score, 3),
            'hand_size': round(hand_size, 4),
            'quality': 'high' if overall_confidence > 0.85 else 'medium' if overall_confidence > 0.7 else 'low'
        }
        
        return confidence_result
    
    def _detect_thumbs_gesture(self, hand_data) -> str:
        """Detect thumbs up/down gesture based on hand landmarks"""
        landmarks = hand_data['landmarks']
        
        # MediaPipe hand landmark indices
        # Thumb: 0(wrist) -> 1 -> 2 -> 3 -> 4(tip)
        # Index: 5 -> 6 -> 7 -> 8(tip)
        # Middle: 9 -> 10 -> 11 -> 12(tip)
        # Ring: 13 -> 14 -> 15 -> 16(tip)
        # Pinky: 17 -> 18 -> 19 -> 20(tip)
        
        thumb_tip = landmarks[4]    # Thumb tip
        thumb_mcp = landmarks[2]    # Thumb MCP joint
        
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]
        
        # Calculate if thumb is extended (tip above MCP joint)
        thumb_extended = thumb_tip['y'] < thumb_mcp['y']
        
        # Calculate average Y position of other fingertips
        other_fingers_y = (index_tip['y'] + middle_tip['y'] + ring_tip['y'] + pinky_tip['y']) / 4
        
        # Check if other fingers are curled (tips below their MCP joints)
        # Use MCP joints (landmarks 5, 9, 13, 17) instead of PIP for more reliable detection
        index_curled = index_tip['y'] > landmarks[5]['y']  # tip below MCP
        middle_curled = middle_tip['y'] > landmarks[9]['y']
        ring_curled = ring_tip['y'] > landmarks[13]['y']
        pinky_curled = pinky_tip['y'] > landmarks[17]['y']
        
        # More lenient: require only 2 out of 4 fingers to be curled
        fingers_curled = sum([index_curled, middle_curled, ring_curled, pinky_curled]) >= 2
        
        # Determine gesture
        if thumb_extended and fingers_curled:
            # Check if thumb is significantly above or below other fingers
            thumb_distance = abs(thumb_tip['y'] - other_fingers_y)
            
            if thumb_distance > 0.05:  # Threshold for significant separation (more sensitive)
                if thumb_tip['y'] < other_fingers_y:
                    return 'thumbs_up'
                else:
                    return 'thumbs_down'
        
        return 'none'
    
    def _emit_gesture_events(self, hand_id: int, current_gesture: str):
        """Emit gesture events when gesture state changes"""
        previous_gesture = self.previous_gestures.get(hand_id, 'none')
        current_time = time.time()
        
        if current_gesture in ['thumbs_up', 'thumbs_down']:
            if hand_id in self.gesture_hold_time:
                # Check if gesture has been held long enough (0.2 seconds)
                hold_duration = current_time - self.gesture_hold_time[hand_id]
                if hold_duration < 0.2:
                    return  # Not stable enough yet
                
                # Emit event only if gesture changed from previous
                if previous_gesture != current_gesture:
                    event_type = HandTrackingEvents.THUMBS_UP if current_gesture == 'thumbs_up' else HandTrackingEvents.THUMBS_DOWN
                    
                    self.event_bus.emit(Event(
                        type=event_type,
                        data={
                            "hand_id": hand_id,
                            "gesture": current_gesture,
                            "confidence": "high",
                            "hold_duration": hold_duration
                        },
                        timestamp=datetime.now(),
                        source="hand_tracker"
                    ))
                    
                    self.previous_gestures[hand_id] = current_gesture
            else:
                # Start new hold timer for this gesture
                self.gesture_hold_time[hand_id] = current_time
        else:
            # Reset timer with tolerance to prevent flickering
            if hand_id in self.gesture_hold_time:
                hold_duration = current_time - self.gesture_hold_time[hand_id]
                if hold_duration > 0.1:  # Only reset after brief delay
                    del self.gesture_hold_time[hand_id]
                    self.previous_gestures[hand_id] = current_gesture
            else:
                self.previous_gestures[hand_id] = current_gesture
        

    def _emit_hand_events(self, current_hands: List[Dict]):
        """Emit hand detection and movement events"""
        prev_count = len(self.previous_hands)
        curr_count = len(current_hands)
        
        # Hand detection/loss events
        if curr_count > prev_count:
            self.event_bus.emit(Event(
                type=HandTrackingEvents.HAND_DETECTED,
                data={
                    "hands": current_hands,
                    "new_hands": curr_count - prev_count
                },
                timestamp=datetime.now(),
                source="hand_tracker"
            ))
        elif curr_count < prev_count:
            self.event_bus.emit(Event(
                type=HandTrackingEvents.HAND_LOST,
                data={
                    "hands": current_hands,
                    "lost_hands": prev_count - curr_count
                },
                timestamp=datetime.now(),
                source="hand_tracker"
            ))
            
        # Hand movement events
        if current_hands:
            self.event_bus.emit(Event(
                type=HandTrackingEvents.HAND_MOVED,
                data={
                    "hands": current_hands,
                    "timestamp": datetime.now().isoformat()
                },
                timestamp=datetime.now(),
                source="hand_tracker"
            ))
            
    def _update_fps(self):
        """Update FPS calculation"""
        self.frame_count += 1
        current_time = time.time()
        
        if current_time - self.last_fps_time >= 1.0:
            self.fps = self.frame_count / (current_time - self.last_fps_time)
            self.frame_count = 0
            self.last_fps_time = current_time
            
