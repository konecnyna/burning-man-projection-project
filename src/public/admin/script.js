const socket = io();
const logElement = document.getElementById('log');
const opencvStatus = document.getElementById('opencvStatus');
const modeStatus = document.getElementById('modeStatus');
const currentScene = document.getElementById('currentScene');
const toggleLogButton = document.getElementById('toggleLogButton');
const sceneButtonsContainer = document.getElementById('sceneButtons');
const sceneChangeTimer = document.getElementById('sceneChangeTimer');
const resetTimerBtn = document.getElementById('reset_timer');
const nextSceneBtn = document.getElementById('next_scene');
const setModePassiveBtn = document.getElementById("set_mode_passive");
const resetBtn = document.getElementById('reset_computer_btn');

const connectionBanner = document.getElementById('connectionBanner');
socket.on('connect', () => {
    connectionBanner.classList.add('hidden');
});

socket.on('disconnect', () => {
    connectionBanner.classList.remove('hidden');
});

document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  fetchAppState();
});

function initializeEventListeners() {
  toggleLogButton.addEventListener('click', toggleLogVisibility);
  resetTimerBtn.addEventListener("click", () => {
    socket.emit('admin_event', { event: "reset_screen_time", payload: {} });
  })
  nextSceneBtn.addEventListener("click", () => {
    socket.emit('admin_event', { event: "change_scene", payload: {} });
  })

  resetBtn.addEventListener("click", () => {
    socket.emit('admin_event', { event: "reset_server", payload: {} });
  })
  socket.on('state_changed', (data) => {
    updateState(JSON.parse(data));
  });
}

function fetchAppState() {
  fetch('/api/app-state')
    .then(response => response.json())
    .then(state => {
      updateState(state);
    })
    .catch(error => {
      console.trace(error);
      addLog("error", `fetching OpenCV State:\n${error}`);
    });
}

function updateState(state) {
  addLog("state_change", JSON.stringify(state, null, 2))
  updateOpenCVStatus(state.openCvEnabled);
  updateModeStatus(state.detectionMode);
  updateCurrentScene(state.currentScene);
  generateSceneButtons(state.scenes);
  setSceneCountdown(state);
}

function updateOpenCVStatus(isEnabled) {
  opencvStatus.textContent = isEnabled ? "Running" : "Stopped";
  opencvStatus.classList.toggle('chip-running', isEnabled);
  opencvStatus.classList.toggle('chip-passive', !isEnabled);
}

function updateModeStatus(detectionMode) {
  const isActive = detectionMode === "active";
  modeStatus.textContent = isActive ? "Active" : "Passive";
  modeStatus.classList.toggle('chip-running', isActive);
  modeStatus.classList.toggle('chip-passive', !isActive);

  // Get the container for the mode toggle button
  const modeToggleContainer = document.getElementById('modeToggleContainer');
  modeToggleContainer.innerHTML = ''; // Clear existing button

  // Create the appropriate button based on the mode
  const toggleButton = document.createElement('button');
  toggleButton.className = 'bg-purple-600 hover:bg-gray-500 text-white py-2 px-4 rounded m-1';

  if (isActive) {
    toggleButton.textContent = "Switch to Passive Mode";
    toggleButton.addEventListener('click', () => {
      socket.emit('admin_event', { event: "set_detection_mode", payload: { mode: "passive" } });
    });
  } else {
    toggleButton.textContent = "Switch to Active Mode";
    toggleButton.addEventListener('click', () => {
      socket.emit('admin_event', { event: "set_detection_mode", payload: { mode: "active" } });
    });
  }

  // Append the button to the container
  modeToggleContainer.appendChild(toggleButton);

  // Additional logic to hide or show scene timer and buttons
  if (!isActive) {
    sceneChangeTimer.textContent = "Scene changes are disabled in passive mode.";
    sceneChangeTimer.classList.add('text-red-500', 'text-center');
    nextSceneBtn.style.display = 'none';
    resetTimerBtn.style.display = 'none';
  } else {
    sceneChangeTimer.classList.remove('text-red-500', 'text-center');
    nextSceneBtn.style.display = 'inline-block';
    resetTimerBtn.style.display = 'inline-block';
  }
}


function updateCurrentScene(currentSceneData) {
  try {
    if (currentSceneData.id === "passive") {
      currentScene.textContent = "Passive";
    } else {
      currentScene.textContent = currentSceneData.name;
    }
    
  } catch {
    currentScene.textContent = "Unknown";
  }
}

function generateSceneButtons(scenes) {
  sceneButtonsContainer.innerHTML = ''; // Clear existing buttons
  for (const sceneKey in scenes) {
    const scene = scenes[sceneKey];
    if (scene.isActive) {
      const button = createSceneButton(scene);
      sceneButtonsContainer.appendChild(button);
    }
  }
}

function createSceneButton(scene) {
  const button = document.createElement('button');
  button.className = 'bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 p-4 rounded m-1';
  button.textContent = scene.name;

  button.addEventListener('click', () => {
    socket.emit('admin_event', { event: "change_scene", payload: scene });
  });

  return button;
}

function setSceneCountdown(state) {
  if (state.detectionMode === "passive") {
    clearSceneCountdown();
    sceneChangeTimer.textContent = "Scene changes are disabled in passive mode.";
  } else if (state.nextSceneTime) {
    clearSceneCountdown();
    startSceneCountdown(new Date(state.nextSceneTime).getTime());
  } else {
    sceneChangeTimer.textContent = "00:00:00";
  }
}

function clearSceneCountdown() {
  if (sceneChangeTimer.interval) {
    clearInterval(sceneChangeTimer.interval);
  }
}

function startSceneCountdown(nextSceneTimestamp) {
  const updateCountdown = () => {
    const timeLeft = Math.max((nextSceneTimestamp - Date.now()) / 1000, 0);
    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);

    sceneChangeTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (timeLeft <= 0) {
      clearInterval(sceneChangeTimer.interval);
    }
  };

  updateCountdown();
  sceneChangeTimer.interval = setInterval(updateCountdown, 1000);
}

function toggleLogVisibility() {
  if (logElement.classList.contains('expanded')) {
    logElement.classList.remove('expanded');
    toggleLogButton.textContent = 'Show Debugging';
  } else {
    logElement.classList.add('expanded');
    toggleLogButton.textContent = 'Hide Debugging';
  }
}

function addLog(tag, message) {
  const timestamp = new Date().toLocaleTimeString();
  const formattedMessage = `[${timestamp}] [${tag.toUpperCase()}]:\n${message}`;

  const logLine = document.createElement('div');
  logLine.textContent = formattedMessage;

  if (tag.toLowerCase() === "error") {
    logLine.style.color = 'red';
  }

  // Append the log line to the log element
  logElement.appendChild(logLine);

  // Add a divider line
  const divider = document.createElement('hr');
  divider.style.margin = '4px 0'; // Adjust spacing around the divider if needed
  divider.style.opacity = .25;
  logElement.appendChild(divider);

  // Limit the number of log entries
  const lines = logElement.children;
  while (lines.length > 21) { // 10 logs + 10 dividers + 1 divider before the first log
    logElement.removeChild(lines[0]);
  }

  logElement.scrollTop = logElement.scrollHeight;
}