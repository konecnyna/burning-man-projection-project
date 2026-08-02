const { SceneManager } = require("./scene-manager");
const { exec } = require('child_process');


// Function to execute shell commands
function executeCommand(command, silent = false) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error && !silent) {
        console.trace(error)
      }
      resolve(stdout.trim());
    });
  });
}



module.exports = class EventManager {
  constructor(stateManager, io) {
    this.stateManager = stateManager;
    this.io = io;
    this.sceneManager = new SceneManager(stateManager)
  }

  socketConnection(socket) {
    socket.on('face_detect', (data) => {      
      this.stateManager.faceDetected(data)
    });


    socket.on('object_detected', (data) => {
      if (this.stateManager.state.detectionMode === "passive") {
        this.safeBroadcast("object_detected", data)
      }      
    });
    

    socket.on('hand_detect_new', (data) => {
      this.safeBroadcast("hand_detect_new", data.map(it => {
        it["handDebugging"] = this.stateManager.state.handDebugging
        return it
      }))

      //this.stateManager.faceDetected(data)
    });

    socket.on('admin_event', (data) => {
      const payload = data.payload
      switch(data.event) {
        case "change_scene":
          if (payload.id) {
            this.stateManager.nextScene(payload.id)
          } else  {
            this.stateManager.nextActiveScene()
          }
          break;
        case "reset_screen_time":
          this.stateManager.resetNextSceneTime();
          break;

        case "set_detection_mode":
          payload.mode === "active"
            ? this.stateManager.setActiveMode()
            : this.stateManager.setPassiveMode()
          break;
        case "reset_server":
          executeCommand("/opt/homebrew/bin/pm2 restart all")
          break;
      }
    });
  }

  safeBroadcast(event, payloadObject) {
    try {
      this.io.emit(event, JSON.stringify(payloadObject))
    } catch (error) {
      console.trace(error)
      console.error("Error emitting event!")
    }
  }
}