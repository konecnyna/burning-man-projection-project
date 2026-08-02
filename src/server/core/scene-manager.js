const scenes = {
  loading: {
    id: "loading", url: '/app/scenes/loading/index.html', instructions: ["Start up scene"], name: "Loading", isActive: false,
  },
  whipe: {
    id: "whipe", url: '/app/scenes/whipe/index.html', instructions: [], name: null, isActive: false,
  },
  passive: {
    id: "passive", url: '/app/scenes/passive/index.html', instructions: [], name: null, isActive: false,
  },
  fluidSim: {
    id: "fluid_sim", url: '/app/scenes/fluid-sim/index.html', instructions: ["Wave you hand slowly  (palms out) to move the particles around."], name: "Fluid waves", isActive: true, meta: {
      "supported_people": "💁‍♂️💁‍♀️💁‍♀️",
      "additional_instructions": []
    },
  },
  orbits: {
    id: "orbits", url: '/app/scenes/orbits/index.html', instructions: ["Move your hand slowly (palms out) to navigate the universe"], name: "Tripping through Space", isActive: true, meta: {
      "supported_people": "💁‍♂️",
      "additional_instructions": []
    },    
  },
  puddle: {
    id: "puddle", url: '/app/scenes/puddle/index.html', instructions: ["Wave hand slowly (palms out) to make waves"], name: "Iridescent Puddle", isActive: true, meta: {
      "supported_people": "💁‍♂️💁‍♀️💁‍♀️",
      "additional_instructions": []
    },
  },
  cosmicSymbolism: {
    id: "cosmic_symbolism", url: '/app/scenes/cosmic-symbolism/index.html', instructions: ["Move hand (palms out) slowly  up and down to travel the cosmos faster"], name: "Cosmic Symbolism", isActive: true, meta: {
      "supported_people": "💁‍♂️",
      "additional_instructions": []
    },
  }
  // tieDye: {
  //   id: "tie_dye", url: '/app/scenes/tie-dye/index.html', instructions: ["Move your hands slowly (palms out) to make tie dye"], name: "Tie Dye", isActive: true, meta: {
  //     "supported_people": "💁‍♂️",
  //     "additional_instructions": []
  //   }
  // },
  // neonPaint: {
  //   id: "neon_pain", url: '/app/scenes/neon-white-board/index.html', instructions: ["Move your hands slowly (palms out) to make tie dye"], name: "Neon Paint", isActive: true, meta: {
  //     "supported_people": "💁‍♂️",
  //     "additional_instructions": ["Make a fist to paint"]
  //   },
  //   handCursors: true,
  // },
  // psychedelicWaves: {
  //   id: "psychedelic_waves", url: '/app/scenes/psychedelic-waves/index.html', instructions: ["Move your hands slowly (palms out) to make waves"], name: "Psychedelic Waves", isActive: true, meta: {
  //     "supported_people": "💁‍♂️",
  //     "additional_instructions": []
  //   },
  //   handCursors: false,
  // }
};

class SceneManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.activeScenes = Object.values(scenes).filter(scene => scene.isActive);
    this.currentSceneIndex = 0;
  }
}

module.exports = { SceneManager, scenes };