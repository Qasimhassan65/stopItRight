import { handleAudioUpload } from "./modules/audioUpload.js";
import { handleItemContextMenu } from "./modules/contextMenu.js";
import { handleDragStart, handleDragEnd } from "./modules/dragHandlers.js";
import { handleEditModeButtonClick, handleSettingsButtonClick, handleSettingsCloseButtonClick, handleAddItemsButtonClick, handleAddItemsCloseButtonClick, handleSaveButtonClick, handleSaveCloseButtonClick, addTagOrSetting } from "./modules/editMode.js";
import { handleSingleImageUpload, handleChangeImageUpload } from "./modules/imageUpload.js";
import { handleResizeStart } from "./modules/resizeHandlers.js";
import { handleButtonClick, handleDescriptionInput, handleDescriptionKeyDown, handleTitleInput, handleTitleKeyDown, btnOffHandler, btnOnHandler, btnBlackHandler, btnWhiteHandler } from "./modules/tooltip.js";
import { playSound, hideScreen, handleDownScaling, handleUpScaling, handleElementClick, disallowDelete } from "./modules/utils.js";

// ------------------ //
//  HELPER FUNCTIONS  //
// ------------------ //
const spaceship = document.getElementById('spaceshipdiv');
const spaceshipImg = spaceship.querySelector('img'); // Select the img element inside the spaceship div
const gameContainer = document.querySelector('.game-container');
const helipad = document.getElementById('helipaddiv');
const winbackground = document.getElementById('winbackground');
let bgimagesrc = background.src;

// Initial position and speed
let positionX = 0; // Starting position from your HTML\
let positionY = 427; // Starting Y position from your HTML
let speed = 7.5; // Speed of the spaceship (adjust as needed)
let direction = 1; // 1 for right, -1 for left
let stopspaceship = false;

// Get the boundaries of the game container
const containerWidth = gameContainer.clientWidth;
const spaceshipWidth = spaceship.clientWidth;
const containerHeight = gameContainer.clientHeight;
const spaceshipHeight = spaceship.clientHeight;


// Animation loop to move the spaceship
function moveSpaceship() {
  if (!stopspaceship && !isEditing.value) {
    // Convert angle to radians for trigonometric calculations
    const angleRad = currentAngle * (Math.PI / 180);
    // Update position based on angle and speed
    positionX += speed * Math.cos(angleRad);
    positionY += speed * Math.sin(angleRad);

  
    // Wrap around when crossing any edge
    if (positionX > containerWidth) {
      positionX -= (containerWidth + spaceshipWidth); // Reappear on left
      // Adjust Y to maintain trajectory
      positionY -= (containerWidth + spaceshipWidth) * Math.tan(angleRad);
    } else if (positionX < -spaceshipWidth) {
      positionX += (containerWidth + spaceshipWidth); // Reappear on right
      positionY += (containerWidth + spaceshipWidth) * Math.tan(angleRad);
    }

  if (positionY > containerHeight) {
    positionY -= (containerHeight + spaceshipHeight); // Reappear on top
    // Adjust X to maintain trajectory
    positionX -= (containerHeight + spaceshipHeight) / Math.tan(angleRad || 0.0001); // Avoid division by zero
  } else if (positionY < -spaceshipHeight) {
    positionY += (containerHeight + spaceshipHeight); // Reappear on bottom
    positionX += (containerHeight + spaceshipHeight) / Math.tan(angleRad || 0.0001);
  }

    // Ensure positions stay within reasonable bounds to prevent drift
    positionX = Math.max(-spaceshipWidth, Math.min(positionX, containerWidth));
    positionY = Math.max(-spaceshipHeight, Math.min(positionY, containerHeight));

    // Apply the new position to the spaceship
    if (!isEditingGame) {
      spaceship.style.left = positionX + 'px';
      spaceship.style.top = positionY + 'px';
    } else {
      spaceship.style.left = positionX + 'px';
      spaceship.style.top = positionY + 'px';
    }


    // Continue the animation
    requestAnimationFrame(moveSpaceship);
  }
}

function handleClick() {
  if (!isEditing.value) {
    stopspaceship = true;

    // Get bounding rectangles for both spaceship and helipad
    const spaceshipRect = spaceship.getBoundingClientRect();
    const helipadRect = helipad.getBoundingClientRect();

    // Get center positions
    const spaceshipCenterX = spaceshipRect.left + (spaceshipRect.width / 2);
    const spaceshipCenterY = spaceshipRect.top + (spaceshipRect.height / 2);

    const helipadCenterX = helipadRect.left + (helipadRect.width / 2);
    const helipadCenterY = helipadRect.top + (helipadRect.height / 2);

    const xRange = 40;
    const yRange = 40;

    const withinX = Math.abs(spaceshipCenterX - helipadCenterX) <= xRange;
    const withinY = Math.abs(spaceshipCenterY - helipadCenterY) <= yRange;

    if (withinX && withinY) {
      console.log('win');
      playSound(winSound);
      //Update background to show win screen
      winbackground.style.zIndex = globalZIndex + 1;
      winbackground.style.display = "block"
      
      btnDiv.style.display = 'none';
      gameWon = true;
      
    } else {
      console.log('Missed!');
      playSound(wrongSound);
      setTimeout(() => {
        stopspaceship = false;
        moveSpaceship();
      }, 500);
    }
  }
}

function initColorChange() {

  if (stopButton && stopButtonColorPicker) {
    stopButtonColorPicker.addEventListener('input', (event) => {
      const color = event.target.value;
      stopButton.style.backgroundColor = color;
    });
  }

  if (stopButton && stopButtonTextColorPicker) {
    stopButtonTextColorPicker.addEventListener('input', (event) => {
      const textColor = event.target.value;
      stopButton.style.color = textColor;
    });
  }
}




const speedInput = document.getElementById('speedInput');
const decreaseSpeedBtn = document.getElementById('decreaseSpeedBtn');
const increaseSpeedBtn = document.getElementById('increaseSpeedBtn');

// Initialize speed value
let currentSpeed = parseFloat(speedInput.value);

const sendPM = () => {
  if (areChangesSaved.value) {
    window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
    areChangesSaved.value = false;
  }
};

// --------- //
//  GENERAL  //
// --------- //

let globalZIndex = 1000;
let inEdit = false;
let currSelectedElement = { value: null };
let gameWon = false;

const stopButtonColorPicker = document.getElementById('stopButtonColor');
const stopButtonTextColorPicker = document.getElementById('stopButtonTextColor');
const stopButton = document.getElementById('stopSpaceship');
const rotateBtn = document.getElementById('rotateBtn');
let stopspaceshipbtn = document.getElementById('stopButtonDiv');

// Elements
let items = [document.getElementById("btn"), document.getElementById("spaceship") , document.getElementById("helipad") , document.getElementById('stopSpaceship')];
let itemDivs = [document.getElementById("btnDiv"), spaceship , helipad , stopspaceshipbtn];
let resizeBoxes = [];
let isItemCollected = [];


// ------ //
//  DRAG  //
// ------ //
let isDragging = { value: false };
let allowItemMove = [false, false, false, false, false];
let savedX = { value: null };
let savedY = { value: null };
let deltaX = { value: null };
let deltaY = { value: null };
let teleporationFix = { value: 0 };

// -------- //
//  RESIZE  //
// -------- //
let allowItemResize = [null, null, null, null, null];
let resizeLastX = { value: 0 };
let lastScales = [1.0, 1.0, 1.0, 1.0, 1.0];
let resizeScale = { value: null };
let isResizing = { value: false };
let lastDirection = { value: null };

// --------- //
//  TOOLTIP  //
// --------- //
let isTooltipOpen = { value: false };
let btnLastX = { value: 60 };
let btnLastY = { value: 50 };
let showTooltip = { value: true };
let btnSrc = { value: "./assets/info.webp" };

const gameTooltip = document.getElementById("gameTooltip");

const btnDiv = document.getElementById("btnDiv");
const btn = document.getElementById("btn");

const btnOn = document.getElementById("btnOn");
const btnOff = document.getElementById("btnOff");

const btnWhite = document.getElementById("btnWhite");
const btnBlack = document.getElementById("btnBlack");

// ----------- //
//  EDIT MODE  //
// ----------- //
let isEditing = { value: false };
let btnClicks = { value: 1 };
let editModeBtns = [];
let isRotating = false;
let currentAngle = 0;
let centerX = 0;
let centerY = 0;
let previousAngle = 0; 


const editModeBtn = document.getElementById("editModeBtn");
const refreshBtn = document.getElementById("refreshBtn");

const binTooltip = document.getElementById("binTooltip");
const binTooltipRectangle = document.getElementById("binTooltipRectangle");

// --------------- //
//  GAME SETTINGS  //
// --------------- //
const settingsBtn = document.getElementById("settingsBtn");
const settingsCloseBtn = document.getElementById("settingsCloseBtn");
const settingsScreen = document.getElementById("settingsScreen");

const bgImg = document.getElementById("bgImage");
const bgImgInput = document.getElementById("bgImgInput");


// -------------- //
//  CONTEXT MENU  //
// -------------- //
let currentItemCM = null;

const contextMenu = document.getElementById("contextMenu");
const changeImageBtn = document.getElementById("changeImage");
const changeImageInput = document.getElementById("changeImageInput");

// -------- //
//  AUDIOS  //
// -------- //
let audioInputs = [];
let audioElements = [];
let playableAudios = [];

const winSound = document.getElementById("winSound");
const wrongSound = document.getElementById("wrongSound");
const clickSound = document.getElementById("clickSound");

// ----------- //
//  SAVE GAME  //
// ----------- //
let areChangesSaved = { value: true };
let tags = [];
let configurableSettings = [];

const saveBtn = document.getElementById("saveBtn");
const saveChangesBtn = document.getElementById("saveChangesBtn");
const saveGameBtn = document.getElementById("saveGameBtn");
const saveScreen = document.getElementById("saveScreen");
const saveCloseBtn = document.getElementById("saveCloseBtn");

const addTagBtn = document.getElementById("addTagBtn");
const tagInput = document.getElementById("tagsInput");
const tagsDiv = document.getElementById("tags");

const addSettingBtn = document.getElementById("addSettingBtn");
const settingInput = document.getElementById("settingsInput");
const settingsDiv = document.getElementById("configSettings");

if (snapshot !== "true" && snapshot !== true) {
  // ------------------- //
  //  DOCUMENT ELEMENTS  //
  // ------------------- //

  moveSpaceship();
  stopspaceshipbtn.addEventListener('click', handleClick);


  

  // Resize Boxes
  for (let i = 0; i < items.length; i++) {
    const tl = document.getElementById(`resizeBox${i}TL`);
    const tr = document.getElementById(`resizeBox${i}TR`);
    const bl = document.getElementById(`resizeBox${i}BL`);
    const br = document.getElementById(`resizeBox${i}BR`);

    if (tl && tr && bl && br) resizeBoxes.push(tl, tr, bl, br);
    else console.error(`Missing resize boxes for item ${i}:`, { tl, tr, bl, br });
  }

  // Audios
  playableAudios.push(clickSound);
  playableAudios.push(winSound);
  playableAudios.push(wrongSound);

  for (let i = 1; i <= playableAudios.length; i++) {
    audioInputs.push(document.getElementById(`audioInput${i}`));
    audioElements.push(document.getElementById(`audioElement${i}`));
  }


  for (let i = 0; i < itemDivs.length; i++) {
    itemDivs[i].addEventListener("mousedown", (e) => {
      if (isTooltipOpen.value || !isEditing.value || isRotating) return;
      sendPM();

      handleDragStart(e, { i, targetDiv: itemDivs[i], isDragging, isResizing, gameWon, savedX, savedY, allowItemMove, teleporationFix, deltaX, deltaY, isEditing, type: i === 0 ? "button" : "item", placeBack: true, btnLastX, btnLastY });
    });

    itemDivs[i].addEventListener("mouseup", (e) => {
      if (isTooltipOpen.value || !isEditing.value) return;
      handleDragEnd(e, { i, targetDiv: itemDivs[i], isDragging, isResizing, gameWon, savedX, savedY, allowItemMove, teleporationFix, deltaX, deltaY, isEditing, type: i === 0 ? "button" : i === 1 ? "targetObject" : "item", placeBack: true, btnLastX, btnLastY });
    });

    itemDivs[i].addEventListener("click", () => handleElementClick({ currSelectedElement, element: itemDivs[i], isEditing, isTooltipOpen }));
  }

  // Edit Mode
  let cursorType = { value: "default" };

  editModeBtns.push(settingsBtn);
  editModeBtns.push(saveBtn);

  // Add event listeners for edit mode buttons
  const editModeParams = { cursorType, clickSound, isEditing, items, resizeBoxes, isItemCollected, showTooltip, isTooltipOpen, btnDiv, editModeBtns, currSelectedElement, settingsScreen, btnClicks, binTooltip, binTooltipRectangle, refreshBtn };

  // Handle edit mode button click
  editModeBtn.addEventListener("click", () => {
    const wasEditing = isEditing.value;
    inEdit = !inEdit;
    stopspaceship = false; 
    handleEditModeButtonClick(editModeParams);

    if (!wasEditing && isEditing.value) {
      [settingsScreen].forEach(hideScreen);
      rotateBtn.style.visibility = 'visible';
    }
    else{
     isEditing.value = false;
     rotateBtn.style.visibility = 'hidden';
    }
  });
  
  // Get the center point of the spaceship element
  function updateCenter() {
    const rect = spaceship.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
  }

  // Calculate angle between two points in degrees (0-360)
  function getAngleDegrees(x, y) {
    // Calculate angle in radians, then convert to degrees
    let angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
    
    // Convert to 0-360 range
    angle = (angle + 360) % 360;
    
    return angle;
  }

  rotateBtn.addEventListener('mousedown', (e) => {
    if (isEditing.value) {
      isRotating = true;
      updateCenter(); // Get current center of the spaceship
      previousAngle = getAngleDegrees(e.clientX, e.clientY);
      
      // Store the starting mouse position
      startX = e.clientX;
      startY = e.clientY;
      
      e.preventDefault(); // Prevent default behaviors
      
      // Add a class to indicate rotation mode (optional - for visual feedback)
      spaceship.classList.add('rotating');
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isRotating && isEditing.value) {
      // Get current angle of the mouse relative to the center
      const currentMouseAngle = getAngleDegrees(e.clientX, e.clientY);
      
      // Calculate the difference between current and previous angle
      let angleDelta = currentMouseAngle - previousAngle;
      
      // Handle the case when crossing the 0/360 boundary
      if (angleDelta > 180) angleDelta -= 360;
      if (angleDelta < -180) angleDelta += 360;
      
      // Update the total rotation angle
      currentAngle = (currentAngle + angleDelta) % 360;
      if (currentAngle < 0) currentAngle += 360;
      
      // Apply the rotation - use only rotation, not translation
      spaceship.style.transform = `rotate(${currentAngle}deg)`;
      
      // Save current angle for next movement
      previousAngle = currentMouseAngle;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isRotating) {
      isRotating = false;

      spaceship.classList.remove('rotating');
      
      spaceship.dataset.rotation = currentAngle;
    }
  });

  // Update center when window resizes or element changes
  window.addEventListener('resize', updateCenter);


  refreshBtn.addEventListener("click", () => {
    gameWon = false;

    positionX = parseInt(spaceship.style.left); // removes 'px'
    positionY = parseInt(spaceship.style.top);  // removes 'px'


    console.log(positionX);
    console.log(positionY);

    playSound(clickSound);
    winbackground.style.display ="none";
    btnDiv.style.display = "block";
    stopspaceship = false;
    isEditing.value = false;
    speed = currentSpeed;
    moveSpaceship();
  });

  document.addEventListener('DOMContentLoaded', () => {
    initColorChange();
  });
  

  // Game Settings
  bgImgInput.addEventListener("change", (e) => {
    sendPM();
    handleSingleImageUpload(e, { targetImg: background, newImg: bgImg, bgimagesrc });
  });

  settingsBtn.addEventListener("click", () => handleSettingsButtonClick({ cleanUp: false, clickSound, settingsScreen, saveScreen }));
  settingsCloseBtn.addEventListener("click", () => handleSettingsCloseButtonClick({ clickSound, settingsScreen }));

  // Button
  btn.addEventListener("click", () => handleButtonClick({ clickSound, isTooltipOpen, btn, btnDiv, btnLastX, btnLastY, gameTooltip, title, description, isEditing, lastScales, btnSrc }));

  // Mouse enter
  btn.addEventListener("mouseenter", () => {
    if (isEditing.value) return;

    // Scale up the image
    btn.style.transition = "transform 0.3s ease-in-out";
    btn.style.transform = "scale(1.1)";
  });

  // Mouse leave
  btn.addEventListener("mouseleave", () => {
    if (isEditing.value) return;

    // Scale down the image
    btn.style.transform = "scale(1)";
  });

  // Game Tooltip
  btnOn.addEventListener("click", () => {
    sendPM();
    btnOnHandler({ showTooltip, btnOn, btnOff, btnDiv, resizeBoxes });
  });

  btnOff.addEventListener("click", () => {
    sendPM();
    btnOffHandler({ showTooltip, btnOff, btnOn, btnDiv, resizeBoxes });
  });

  btnBlack.addEventListener("click", () => {
    sendPM();
    btnBlackHandler({ btnWhite, btnBlack, btnSrc, btn });
  });

  btnWhite.addEventListener("click", () => {
    sendPM();
    btnWhiteHandler({ btnWhite, btnBlack, btnSrc, btn });
  });

  // Audio Upload
  for (let i = 0; i < audioInputs.length; i++) {
    audioInputs[i].addEventListener("change", (e) => {
      sendPM();
      handleAudioUpload(e, { audioElement: audioElements[i], playableAudio: playableAudios[i] });
    });
  }


  // Mouse enter
  editModeBtn.addEventListener("mouseenter", () => handleUpScaling(editModeBtn));
  settingsBtn.addEventListener("mouseenter", () => handleUpScaling(settingsBtn));
  saveBtn.addEventListener("mouseenter", () => handleUpScaling(saveBtn));

  refreshBtn.addEventListener("mouseenter", () => handleUpScaling(refreshBtn));

  // Mouse leave
  editModeBtn.addEventListener("mouseleave", () => handleDownScaling(editModeBtn));
  settingsBtn.addEventListener("mouseleave", () => handleDownScaling(settingsBtn));
  saveBtn.addEventListener("mouseleave", () => handleDownScaling(saveBtn));

  
  // Update speed on button clicks
  decreaseSpeedBtn.addEventListener('click', () => {
    if (currentSpeed > 1) {
        currentSpeed -= 0.5;
        speedInput.value = currentSpeed.toFixed(1);
        speed = currentSpeed;
    }
  });

  increaseSpeedBtn.addEventListener('click', () => {
    if (currentSpeed < 12) {
        currentSpeed += 0.5;
        speedInput.value = currentSpeed.toFixed(1);
        speed = currentSpeed;
    }
  });

  refreshBtn.addEventListener("mouseleave", () => handleDownScaling(refreshBtn));

  // On Board Images Resizing
  for (let i = 0; i < resizeBoxes.length; i++) {
    resizeBoxes[i].addEventListener("mousedown", (e) => handleResizeStart(e, { i: parseInt(i / 4), direction: i % 4 === 0 ? "TL" : i % 4 === 1 ? "TR" : i % 4 === 2 ? "BL" : "BR", isResizing, lastScales, allowItemResize, resizeLastX, item: items[parseInt(i / 4)], itemDiv: itemDivs[parseInt(i / 4)], lastDirection, resizeScale }));
  }

  // Context Menu
    for (let i = 1; i < items.length; i++) {
      items[i].addEventListener("contextmenu", (e) => {
        currentItemCM = i;
        handleItemContextMenu(e, { isEditing, contextMenu, changeImageBtn });
      });
    }
  
    changeImageInput.addEventListener("change", (e) => handleChangeImageUpload(e, items[currentItemCM]));
  
    document.addEventListener("click", function () {
      contextMenu.style.display = "none";
    });
  
    document.addEventListener("DOMContentLoaded", () => {
      document.body.style.userSelect = "none"; // Disable selection for the whole document
    });
  
    changeImageBtn.addEventListener("click", () => changeImageInput.click());

  // Game Tooltip
  title.addEventListener("input", () => {
    sendPM();
    handleTitleInput();
  });

  title.addEventListener("keydown", (e) => handleTitleKeyDown(e));

  description.addEventListener("input", () => {
    sendPM();
    handleDescriptionInput;
  });

  description.addEventListener("keydown", (e) => handleDescriptionKeyDown(e));

  // Save Game
  saveBtn.addEventListener("click", () => handleSaveButtonClick({ cleanUp: false, clickSound, settingsScreen, saveScreen }));
  saveChangesBtn.addEventListener("click", (e) => saveGame(e, "game data"));

  saveCloseBtn.addEventListener("click", () => handleSaveCloseButtonClick({ clickSound, saveScreen }));
  saveGameBtn.addEventListener("click", (e) => saveGame(e, "game data"));

  addTagBtn.addEventListener("click", () => addTagOrSetting({ targetDiv: tagsDiv, targetInput: tagInput, arr: tags }));
  addSettingBtn.addEventListener("click", () => addTagOrSetting({ targetDiv: settingsDiv, targetInput: settingInput, arr: configurableSettings }));

  window.addEventListener("message", function (event) {
    // Always check the origin of the message for security purposes
    if (event.origin === parentUrl) {
      if (event.data.type === "game data") initializeGame(event.data.gameData);
      else if (event.data.type === "game data request") saveGame(null, "game data request");
      else if (event.data.type === "enable button") {
        areChangesSaved.value = false;
        toggleSaveChangesBtn();
      }
    } else console.error("Untrusted origin:", event.origin);
  });

  if (urlParams.get("isediting") === "true") editModeBtn.click();

  // Hide the edit mode button if the game is not being edited
  if (urlParams.get("isediting") === "false") editModeBtn.style.display = "none";
  else saveBtn.style.left = saveBtn.style.top = "-1000px";
}
