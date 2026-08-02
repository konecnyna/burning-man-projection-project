let intervalId = false;

const constructHud = (currentScene, nextSceneTime) => {
  // Create the HUD container
  const hud = document.getElementById('hud');
  hud.innerHTML = '';

  // Helper function to create a divider
  const createDivider = () => {
    const divider = document.createElement('div');
    divider.className = 'w-px h-6 bg-white bg-opacity-75';
    return divider;
  };

  let elementsAdded = false;

  // Add the scene name if it exists
  if (currentScene?.name) {
    const sceneDiv = document.createElement('div');
    sceneDiv.id = 'scene';
    sceneDiv.textContent = `🖼️ ${currentScene.name}`;
    hud.appendChild(sceneDiv);
    elementsAdded = true;
  }

  // Add player count if supported_people exists
  if (currentScene?.meta?.supported_people) {
    if (elementsAdded) hud.appendChild(createDivider());
    const playerCountDiv = document.createElement('div');
    playerCountDiv.id = 'player-count';
    const playerCount = currentScene.meta.supported_people;
    playerCountDiv.textContent = `Players: ${playerCount}`;
    hud.appendChild(playerCountDiv);
    elementsAdded = true;
  }

  // Add the time remaining if nextSceneTime exists
  if (nextSceneTime) {
    if (elementsAdded) hud.appendChild(createDivider());
    const timeRemainingDiv = document.createElement('div');
    timeRemainingDiv.id = 'time-remaining';
    hud.appendChild(timeRemainingDiv);

    let lastTimeRemaining = null;  // Keep track of the last time remaining

    const updateTimeRemaining = () => {
      const now = new Date();
      const timeRemaining = new Date(nextSceneTime) - now;

      if (timeRemaining > 0) {
        const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
        const seconds = Math.floor((timeRemaining / 1000) % 60);
        timeRemainingDiv.textContent = `⏰ ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

          hud.classList.remove('slide-up');
          hud.classList.add('slide-down');
        } else if (lastTimeRemaining !== null && lastTimeRemaining < 30000 && timeRemaining > 30000) {
          // Handle case where timer is reset from below 30s to above 2m30s
          hud.classList.remove('slide-up');
          hud.classList.add('slide-down');
        } else {
          hud.classList.remove('slide-down');
          hud.classList.add('slide-up');
        }


        lastTimeRemaining = timeRemaining;
      } else {
        timeRemainingDiv.textContent = `⏰ 00:00`;
        hud.classList.remove('slide-down');
        hud.classList.add('slide-up');
      }
    };

    updateTimeRemaining();
    clearInterval(intervalId);
    // Continuously update the time and visibility, accounting for timer resets
    intervalId = setInterval(() => {
      updateTimeRemaining();

      // Recalculate time remaining in case nextSceneTime is reset
      const updatedTimeRemaining = new Date(nextSceneTime) - new Date();
      if (updatedTimeRemaining <= 0) {
        clearInterval(intervalId); // Stop the interval if the time runs out
      }
    }, 1000);

    elementsAdded = true;
  }

  // Add additional instructions if they exist
  let instructions = currentScene?.meta?.additional_instructions || [];
  if (!instructions.length) {
    instructions = ["ℹ️ Move your hand, palms out, slowly to interect"];
  }

  if (elementsAdded) hud.appendChild(createDivider());
  const additionalInstructionsDiv = document.createElement('div');
  additionalInstructionsDiv.id = 'additional-instructions';
  additionalInstructionsDiv.className = 'text-sm';
  additionalInstructionsDiv.textContent = instructions.join(' ');
  hud.appendChild(additionalInstructionsDiv);

  // Clear the existing HUD if it exists and add the new one
  const existingHud = document.getElementById('hud');
  if (existingHud) {
    existingHud.remove();
  }

  document.body.appendChild(hud);
};

// CSS for sliding up and down
const style = document.createElement('style');
style.innerHTML = `
  #hud {
    transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
  }
  .slide-up {
    transform: translateY(-100%);
    opacity: 0;
  }
  .slide-down {
    transform: translateY(0);
    opacity: 1;
  }
`;
document.head.appendChild(style);

// Example usage with the stateChanged function
const stateChanged = async (state) => {
  try {
    console.log("state", JSON.stringify(state));
    const currentScene = state.currentScene;
    if (currentScene) {
      await loadPage(currentScene);
      constructHud(currentScene, state.nextSceneTime);
    }
  } catch (e) {
    console.trace(e);
  }
};