const { scenes } = require("./scene-manager");

const CAMERA_URL = 0;
const DEFAULT_SCENE_TIME = 1;


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


module.exports = class StateManager {
  constructor(io, { openCvState = {} } = {}) {

    this.io = io;
    const defaultOpenCvState = {
      debugging: false,
      handDebugging: false,
      openCvPythonRunning: false,
      showVideo: false,
      isMockMode: false,
      rtspUrl: CAMERA_URL,
      detectionMode: "active",
      currentScene: scenes.cosmicSymbolism,
      nextSceneTime: this.getFutureDate(),
      scenes: scenes,
    };

    this.activeScenes = Object.values(scenes).filter(scene => scene.isActive);
    this.currentSceneIndex = 0;

    this.state = { ...defaultOpenCvState, ...openCvState };
    this.startSceneCheckInterval();
    //this.resetPassiveModeTimer();  // Initialize the passive mode timer


    this.showingTransition = false;
  }

  resetPassiveModeTimer() {
    if (this.passiveModeTimer) {
      clearTimeout(this.passiveModeTimer);
    }

    this.passiveModeTimer = setTimeout(() => {
      this.updateStateAndBroadcast({ detectionMode: "passive", currentScene: scenes.passive });
    }, 45 * 1000);
  }

  isInActiveMode() {
    return this.state.detectionMode.toLowerCase() === "active";
  }

  updateStateAndBroadcast(newState) {
    if (!newState) {
      throw Error("no state provided!")
    }

    this.state = { ...this.state, ...newState };
    this.broadcastState();
  }

  broadcastState() {
    try {
      this.io.emit("state_changed", JSON.stringify(this.state));
    } catch (error) {
      console.trace(error);
      console.error("Error emitting event!");
    }
  }

  getFutureDate(minutes = DEFAULT_SCENE_TIME) {
    const futureDate = new Date();
    futureDate.setMinutes(futureDate.getMinutes() + minutes);
    return futureDate;
  }

  startSceneCheckInterval() {
    setInterval(() => {
      const now = new Date();
      if (now >= this.state.nextSceneTime && this.isInActiveMode()) {
        this.nextActiveScene();
      }
    }, 1000);
  }

  nextActiveScene() {
    this.currentSceneIndex = (this.currentSceneIndex + 1) % this.activeScenes.length;
    const nextScene = this.activeScenes[this.currentSceneIndex];
    this.updateStateAndBroadcast({ currentScene: nextScene, nextSceneTime: this.getFutureDate() });
  }

  nextScene(id) {
    let nextScene = Object.values(scenes).find(scene => scene.id === id);
    this.updateStateAndBroadcast({ currentScene: nextScene, nextSceneTime: this.getFutureDate() });
  }

  async faceDetected(data) {
    // console.log(data.every(item => item.distance < 2))
    // if (data.every(item => item.distance < 2)) {
    //   // check this.
    //   // return;
    //   console.log("NOPE")
    // }

    // if (this.showingTransition) {
    //   return;
    // }

    // if (this.state.detectionMode == "active") {
    //   this.resetPassiveModeTimer();
    //   return;
    // }

    // try {
    //   this.showingTransition = true
    //   await this.setActiveMode()
    // } catch (e) {
    //   console.trace(e)
    // } finally {
    //   this.showingTransition = false
    // }    
  }

  resetNextSceneTime(minutes = DEFAULT_SCENE_TIME) {
    this.updateStateAndBroadcast({ nextSceneTime: this.getFutureDate(minutes) });
  }

  setPassiveMode() {
    this.updateStateAndBroadcast({ detectionMode: "passive", currentScene: scenes.passive, nextSceneTime });
  }

  async setActiveMode() {
    this.updateStateAndBroadcast({ detectionMode: "active" })
    this.nextScene(scenes.whipe.id)
    console.log("showing next scene")
    await sleep(15000)
    console.log("showing kewl scne! scene")
    this.nextActiveScene();
  }

};