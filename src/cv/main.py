import cv2
import argparse

from shared.util.web_socket_client import WebsocketClient
from shared.hands.simple_hand_tracking import SimpleHandTracking
from shared.util.threaded_camera import ThreadedCamera
from shared.face.simple_face_detection import SimpleFaceDetection
from shared.motion_detector import MotionDetector


def main(args):
    # Export a single instance of WebsocketClient
    ws_client = WebsocketClient(ws_url='http://localhost:3000', local=args.local)    
    
    simple_hand_tracking = SimpleHandTracking(drawLandmarks=args.debug, ws_client=ws_client)
    simple_face_detection = SimpleFaceDetection(drawLandmarks=args.debug, ws_client=ws_client)
    motion_detector = MotionDetector(debug=args.debug, ws_client=ws_client)
   
    camera_address = args.url if args.url is not None else 0
    camera = ThreadedCamera(camera_address)
        
    frame_count = 0
    while camera.capture.isOpened():
        frame = camera.frame
        if frame is None:
            continue
    
        # Flip the frame horizontally for a mirror-like effect
        frame = cv2.flip(frame, 1)
        simple_hand_tracking.subscribe(img=frame)
        
        
        # Less important tasks
        if frame_count % 15 == 0:
            simple_face_detection.subscribe(img=frame)

        if frame_count % 60 == 0:
            motion_detector.subscribe(img=frame)
            frame_count = 0
               
 
        if args.show_cv:
            cv2.imshow("Image", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--show-cv', action='store_true', help='Show open cv image')
    parser.add_argument('--debug', action='store_true', help='Verbose logging')
    parser.add_argument('--local', action='store_true', help='No websocket.')
    parser.add_argument('--mock-mode', action='store_true', help='Enable mock mode')
    parser.add_argument('--url', type=str, help='URL for the camera feed')
    args = parser.parse_args()
    
    print("🐍 Running opencv with:")
    print(args)
    main(args)
