import { handleAudioUpload } from "./modules/audioUpload.js";
import { handleItemContextMenu } from "./modules/contextMenu.js";
import { handleDragStart, handleDragEnd } from "./modules/dragHandlers.js";
import { handleEditModeButtonClick, handleSettingsButtonClick, handleSettingsCloseButtonClick, handleAddItemsButtonClick, handleAddItemsCloseButtonClick, handleSaveButtonClick, handleSaveCloseButtonClick, addTagOrSetting } from "./modules/editMode.js";
import { handleSingleImageUpload, handleImageUpload } from "./modules/imageUpload.js";
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

// Initial position and speed
let positionX = 0; // Starting position from your HTML
const speed = 7.5; // Speed of the spaceship (adjust as needed)
let direction = 1; // 1 for right, -1 for left
let stopspaceship = false;

// Get the boundaries of the game container
const containerWidth = gameContainer.clientWidth;
const spaceshipWidth = spaceship.clientWidth;

// Set initial image (moving right)
spaceshipImg.src = './assets/spaceship_right.webp';

// Animation loop to move the spaceship
function moveSpaceship() {

  if(!stopspaceship && !isEditing.value)
  {    
    // Update position
    positionX += speed * direction;

    // Check for collision with the right wall
    if (positionX + spaceshipWidth >= containerWidth) {
        positionX = containerWidth - spaceshipWidth; // Prevent overflow
        direction = -1; // Reverse direction to move left
        spaceshipImg.src = './assets/spaceship_left.webp'; // Change image to left-facing
    }

    // Check for collision with the left wall
    if (positionX <= 0) {
        positionX = 0; // Prevent overflow
        direction = 1; // Reverse direction to move right
        spaceshipImg.src = './assets/spaceship_right.webp'; // Change image to right-facing
    }

    // Apply the new position to the spaceship
    spaceship.style.left = positionX + 'px';

    // Continue the animation
    requestAnimationFrame(moveSpaceship);
  }
}

function handleClick() {
  if(!isEditing.value)
  {
  stopspaceship = true;

  // Get bounding rectangles for both spaceship and helipad
  const spaceshipRect = spaceship.getBoundingClientRect();
  const helipadRect = helipad.getBoundingClientRect();

  // Get center positions
  const spaceshipCenterX = spaceshipRect.left + (spaceshipRect.width / 2);
  const spaceshipCenterY = spaceshipRect.top + (spaceshipRect.height / 2);

  const helipadCenterX = helipadRect.left + (helipadRect.width / 2);
  const helipadCenterY = helipadRect.top + (helipadRect.height / 2);

  const xRange = 80;
  const yRange = 40;

  const withinX = Math.abs(spaceshipCenterX - helipadCenterX) <= xRange;
  const withinY = Math.abs(spaceshipCenterY - helipadCenterY) <= yRange;

  if (withinX && withinY) {
    console.log('win');
    playSound(winSound);
  } else {
    console.log('Missed! Press R to restart.');
    playSound(wrongSound);
  }

  document.addEventListener('keydown', handleRestart);
}
}


// Function to handle restart
function handleRestart(event) {
  if (event.key === 'r' || event.key === 'R') {
      stopspaceship = false; // Resume movement
      positionX = 0; // Reset to initial position
      direction = 1; // Reset direction to right
      spaceshipImg.src = './assets/spaceship_right.webp'; // Reset image
      spaceship.style.left = positionX + 'px'; // Reset position
      console.log('Game restarted!');
      document.removeEventListener('keydown', handleRestart); // Remove listener after restart
      moveSpaceship();
  }
}

// --------------- //
//  CREATE BLANKS  //
// --------------- //
const createBlanksInWords = () => {
  const blanksData = [];
  const wordSpans = document.querySelectorAll('[id^="worditem"][id$="Text"]');
  let totalBlanks = 0;

  wordSpans.forEach((wordSpan, i) => {
    if (!wordSpan) return;

    const wordContainer = wordSpan.closest('[id^="wordscontainerdivItem"]');
    if (!wordContainer || wordContainer.style.display === "none") return;

    const indexMatch = wordSpan.id.match(/worditem(\d+)Text/);

    if (indexMatch && indexMatch[1]) {
      const index = parseInt(indexMatch[1], 10) - 1;

      if (wordSpan.textContent.trim().includes("_")) {
        const dictIndex = wordindexs[index] !== undefined ? wordindexs[index] : index % gameDictionary.length;
        wordSpan.textContent = gameDictionary[dictIndex]?.text || "Unknown";
      }
    }
  });

  wordSpans.forEach((wordSpan, i) => {
    // Existing code...
    const originalWord = wordSpan.textContent.trim();
    const wordChars = originalWord.split("");
    const numBlanks = Math.floor(Math.random() * Math.min(2, wordChars.length)) + 1;
    const blankPositions = [];

    const validPositions = wordChars
      .map((char, idx) => ({ char, idx }))
      .filter(({ char }) => char.trim() !== "")
      .map(({ idx }) => idx);

    while (blankPositions.length < numBlanks && validPositions.length > 0) {
      const randomIdx = Math.floor(Math.random() * validPositions.length);
      blankPositions.push(validPositions.splice(randomIdx, 1)[0]);
    }

    const expectedLetters = blankPositions.map((pos) => wordChars[pos].toUpperCase());
    blankPositions.forEach((pos) => (wordChars[pos] = "_"));

    wordSpan.textContent = wordChars.join("");
    blanksData.push({ wordId: wordSpan.id, originalWord: originalWord, blankPositions: blankPositions, expectedLetters: expectedLetters });
    totalBlanks += blankPositions.length;
  });

  remainingItems = totalBlanks;
  itemsLeftNumber.innerHTML = remainingItems;

  return blanksData;
};

// ---------------------- //
//  HANDLE DRAG AND DROP  //
// ---------------------- //
const setupDragAndDrop = (blanksData) => {
  const gameContainer = document.querySelector(".game-container");
  const dragOverHandler = (e) => e.preventDefault();

  const dropHandler = (e) => {
    e.preventDefault();
    if (isEditing?.value || gameWon) return;

    let letter = e.dataTransfer.getData("text/plain");
    const { clientX: dropX, clientY: dropY } = e;

    if (letter.startsWith("lettercontainer")) {
      const letterTextElement = document.getElementById(`alphabetitem${parseInt(letter.replace("lettercontainer", ""), 10)}Text`);
      if (!letterTextElement) return playSound(wrongSound), showFeedback(false);
      letter = letterTextElement.textContent.toUpperCase();
    }

    let closestSpan = null;
    let minDistance = Infinity;

    document.querySelectorAll('[id^="worditem"][id$="Text"]').forEach((span) => {
      const rect = span.getBoundingClientRect();
      const tolerance = 20;

      if (dropX >= rect.left - tolerance && dropX <= rect.right + tolerance && dropY >= rect.top - tolerance && dropY <= rect.bottom + tolerance) {
        const distance = Math.sqrt(Math.pow(dropX - (rect.left + rect.width / 2), 2) + Math.pow(dropY - (rect.top + rect.height / 2), 2));

        if (distance < minDistance) {
          minDistance = distance;
          closestSpan = span;
        }
      }
    });

    if (!closestSpan || !blanksData.find((data) => data.wordId === closestSpan.id)) {
      playSound(wrongSound);
      showFeedback(false);
      return;
    }

    const wordData = blanksData.find((data) => data.wordId === closestSpan.id);
    const wordChars = closestSpan.textContent.split("");
    let filled = false;

    for (let i = 0; i < wordData.blankPositions.length; i++) {
      const pos = wordData.blankPositions[i];
      if (wordChars[pos] !== "_") continue;

      if (letter === wordData.expectedLetters[i]) {
        wordChars[pos] = wordData.originalWord[pos];

        closestSpan.textContent = wordChars.join("");
        remainingItems--;
        itemsLeftNumber.innerHTML = remainingItems;
        filled = true;

        playSound(collectSound);
        showFeedback(true);

        if (remainingItems === 0) {
          winSound.play();
          btn.style.display = itemsLeftNumber.style.display = itemsLeft.style.display = "none";
          gameWon = true;
        }

        return;
      }
    }

    if (!filled) playSound(wrongSound), showFeedback(false);
  };

  if (currentDragOverHandler) gameContainer.removeEventListener("dragover", currentDragOverHandler);
  if (currentDropHandler) gameContainer.removeEventListener("drop", currentDropHandler);

  gameContainer.addEventListener("dragover", dragOverHandler);
  gameContainer.addEventListener("drop", dropHandler);

  currentDragOverHandler = dragOverHandler;
  currentDropHandler = dropHandler;
};

// ---------------- //
//  SHOW FEEDBACK   //
// ---------------- //
function showFeedback(isCorrect) {
  const feedback = document.createElement("div");
  feedback.className = `feedback ${isCorrect ? "correct" : "wrong"}`;
  feedback.textContent = isCorrect ? "✓ Right Answer" : "✗ Wrong Answer";

  const gameContainer = document.querySelector(".game-container");
  feedback.style.cssText = gameContainer ? "position:absolute;top:100px;right:20px;z-index:9999;" : "position:fixed;top:160px;left:525px;z-index:9999;";
  (gameContainer || document.body).appendChild(feedback);
  setTimeout(() => feedback.remove(), 2000);
}


// ---------------- //
//  ITEMS DELETION  //
// ---------------- //
const getDraggedItemIndex = () => {
  // Get the item being dragged
  for (let i = 0; i < allowItemMove.length; i++) {
    if (allowItemMove[i]) {
      allowItemMove[i] = isDragging.value = false;
      return i;
    }
  }

  return null;
};

const deleteItem = (index) => {
  if (index < 0 || index >= items.length) return;

  const isWordItem = items[index]?.id.startsWith("wordscontaineritem");
  const isLetterItem = items[index]?.id.startsWith("alphabetcontainer");

  if (isWordItem) {
    const wordText = document.getElementById(`worditem${index}Text`)?.textContent;

    if (wordText) {
      const wordIndex = gameDictionary.findIndex((entry) => entry.text?.toUpperCase() === wordText.toUpperCase());
      if (wordIndex !== -1) gameDictionary.splice(wordIndex, 1);
    }
  } else if (isLetterItem) {
    const letterIndex = parseInt(items[index]?.id.match(/alphabetcontainer(\d+)/)?.[1], 10);

    if (letterIndex) {
      const letterText = document.getElementById(`alphabetitem${letterIndex}Text`)?.textContent?.toUpperCase();

      if (letterText && letterText === letterlist[letterIndex - 1]) {
        const letterListIndex = letterlist.indexOf(letterText);
        if (letterListIndex !== -1) letterlist.splice(letterListIndex, 1);
      }
    }
  }

  if (itemDivs[index]) itemDivs[index].style.display = "none";

  const resizeBoxIndex = index * 4;
  if (resizeBoxIndex < resizeBoxes.length) resizeBoxes.splice(resizeBoxIndex, 4);

  delItemCount++;

  if (isWordItem) {
    remainingItems = document.querySelectorAll('[id^="worditem"][id$="Text"]').length;
    itemsLeftNumber.innerHTML = remainingItems;
  }
};

const handleChangeWord = (itemIndex, params) => {
  const updateWord = () => {
    const newWord = wordTextElement.textContent.trim();
    if (!newWord) {
      // Use an in-game visual instead
      // alert("Invalid word. Restoring original word.");
      wordTextElement.textContent = oldWord;
    } else {
      const dictIndex = params.wordindexs[wordId - 1] ?? params.gameDictionary.findIndex((entry) => entry.text.toUpperCase() === oldWord.toUpperCase());

      if (dictIndex !== -1) params.gameDictionary[dictIndex].text = newWord;
      else if (wordId > 0 && !params.wordindexs.includes(wordId - 1)) {
        params.gameDictionary.push({ text: newWord, imagePath: wordItem.querySelector("img")?.src || "" });
        params.wordindexs[wordId - 1] = params.gameDictionary.length - 1;
      }
    }

    wordTextElement.contentEditable = false;
    wordTextElement.style.cssText = "";
  };

  const helper = (e, wordTextElement) => {
    if (e.key === "Enter") {
      e.preventDefault();
      wordTextElement.blur();
    }
  };

  const wordItem = params.items[itemIndex];
  const match = wordItem?.id.match(/wordscontaineritem(\d+)/);
  if (!wordItem?.id.startsWith("wordscontaineritem") || !match) return;

  const wordId = parseInt(match[1], 10);
  const wordTextElement = document.getElementById(`worditem${wordId}Text`);
  if (!wordTextElement) return;

  const oldWord = wordTextElement.textContent.trim();
  wordTextElement.contentEditable = true;
  wordTextElement.style.cssText = "border:2px solid #007bff;background:#f0f8ff;padding:2px;";
  wordTextElement.focus();

  wordTextElement.addEventListener("blur", updateWord, { once: true });
  wordTextElement.addEventListener("keydown", (e) => helper(e, wordTextElement), { once: true });
};

const handleChangeImage = (event, itemIndex, params) => {
  const wordItem = params.items[itemIndex];
  const match = wordItem?.id.match(/wordscontaineritem(\d+)/);
  if (!wordItem?.id.startsWith("wordscontaineritem") || !match) return;

  const wordId = parseInt(match[1], 10);
  const imageElement = document.getElementById(`worditem${wordId}Image`);
  const file = event.target.files?.[0];
  if (!imageElement || !file) return;

  const oldImagePath = imageElement.src;
  const reader = new FileReader();

  reader.onload = () => {
    const newImagePath = reader.result;
    imageElement.src = newImagePath;

    const wordText = document.getElementById(`worditem${wordId}Text`)?.textContent.trim();
    const dictIndex = params.wordindexs[wordId - 1] ?? params.gameDictionary.findIndex((entry) => entry.imagePath === oldImagePath || (wordText && entry.text.toUpperCase() === wordText.toUpperCase()));

    if (dictIndex !== -1) params.gameDictionary[dictIndex].imagePath = newImagePath;
    else if (wordId > 0 && !params.wordindexs.includes(wordId - 1)) {
      params.gameDictionary.push({ text: wordText || "", imagePath: newImagePath });
      params.wordindexs[wordId - 1] = params.gameDictionary.length - 1;
    }
  };

  reader.readAsDataURL(file);
};

const handleDeleteBtnMouseUp = () => {
  if (!isDragging.value || isResizing.value) {
    playSound(wrongSound);
    binTooltip.style.display = binTooltipRectangle.style.display = "block";
    setTimeout(() => (binTooltip.style.display = binTooltipRectangle.style.display = "none"), 5000);
    return;
  }

  const targetIndex = getDraggedItemIndex();

  if (targetIndex === null || targetIndex === 0) {
    playSound(wrongSound);
    disallowDelete({ targetDiv: itemDivs[targetIndex] || btnDiv, lastX: targetIndex === 0 ? btnLastX : savedX, lastY: targetIndex === 0 ? btnLastY : savedY, i: targetIndex, type: targetIndex === 0 ? "button" : "item", isDragging, savedX, savedY, allowItemMove });
    return;
  }

  const isLetterItem = items[targetIndex]?.id.startsWith("alphabetcontainer");

  if (isLetterItem) {
    const letterIndex = parseInt(items[targetIndex]?.id.match(/alphabetcontainer(\d+)/)?.[1], 10);
    const letterText = document.getElementById(`alphabetitem${letterIndex}Text`)?.textContent.toUpperCase();

    if (letterText && wordindexs.some((idx) => gameDictionary[idx]?.text.toUpperCase()?.includes(letterText))) {
      playSound(wrongSound);
      disallowDelete({ targetDiv: itemDivs[targetIndex], lastX: savedX, lastY: savedY, i: targetIndex, type: "item", isDragging, savedX, savedY, allowItemMove });
      return;
    }
  }

  playSound(deleteSound);
  deleteItem(targetIndex);

  if (!items[targetIndex].id.startsWith("alphabetcontainer")) {
    remainingItems = document.querySelectorAll('[id^="worditem"][id$="Text"]').length;
    itemsLeftNumber.innerHTML = remainingItems;
  }
};

const sendPM = () => {
  if (areChangesSaved.value) {
    window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
    areChangesSaved.value = false;
  }
};

//upadted code
function toggleButtonState(inputId, buttonId) {

  const input = document.getElementById(inputId);
  const button = document.getElementById(buttonId);

  // Initial check on page load
  if (input.value.trim() !== "") button.classList.add("enabled");
  else button.classList.remove("enabled");

  // Add event listener for input changes
  input.addEventListener("input", () => {
    if (input.value.trim() !== "") button.classList.add("enabled");
    else button.classList.remove("enabled");
  });
}

// --------- //
//  GENERAL  //
// --------- //
const gameDictionary = [
  { text: "apple", imagePath: "./assets/apple.webp" },
  { text: "juice", imagePath: "./assets/juice.webp" },
  { text: "bread", imagePath: "./assets/bread.webp" },
  { text: "cat", imagePath: "./assets/cat.webp" },
  { text: "icecream", imagePath: "./assets/icecream.webp" },
  { text: "pizza", imagePath: "./assets/pizza.webp" },
  { text: "lollipop", imagePath: "./assets/lollipop.webp" },
  { text: "noodle", imagePath: "./assets/noodle.webp" },
];

const letterlist = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

let globalZIndex = 1000;
let inEdit = false;
let wordindexs = [];
let worditemcounter = 4;
let lettercounter = 0;
let currSelectedElement = { value: null };
let gameWon = false;
let currentDragOverHandler = null;
let currentDropHandler = null;

// Elements
let items = [document.getElementById("btn"), document.getElementById("spaceship") , document.getElementById("helipad")];
let itemDivs = [document.getElementById("btnDiv"), spaceship , helipad];
let resizeBoxes = [];
let isItemCollected = [];
let remainingItems = 4;
let delItemCount = 0;

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

const editModeBtn = document.getElementById("editModeBtn");
const addItemsBtn = document.getElementById("addItemsBtn");
const refreshBtn = document.getElementById("refreshBtn");
const deleteBtn = document.getElementById("deleteBtn");

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

// ---------------- //
//  ITEMS ADDITION  //
// ---------------- //
let isAddingItems = { value: false };
const addItemBtn = document.getElementById("addItemBtn");

const itemsAdditionCloseBtn = document.getElementById("itemsAdditionCloseBtn");
const itemsAdditionScreen = document.getElementById("itemsAddition");

const addableImg = document.getElementById("addableImg");
const addableImgInput = document.getElementById("addableImgInput");

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
  gameContainer.addEventListener('click', handleClick);

  

  // Resize Boxes
  for (let i = 0; i < items.length; i++) {
    const tl = document.getElementById(`resizeBox${i}TL`);
    const tr = document.getElementById(`resizeBox${i}TR`);
    const bl = document.getElementById(`resizeBox${i}BL`);
    const br = document.getElementById(`resizeBox${i}BR`);

    if (tl && tr && bl && br) resizeBoxes.push(tl, tr, bl, br);
    else console.error(`Missing resize boxes for item ${i}:`, { tl, tr, bl, br });
  }

  


  // Add event listeners for adding items
  addItemBtn.addEventListener("click", () => addItem("wordInput", true, addWordItemOnScreen));
  addLetterBtn.addEventListener("click", () => addItem("letterInput", false, addLetterItemOnScreen));
  

  // Audios
  
  playableAudios.push(clickSound);
  playableAudios.push(winSound);
  playableAudios.push(wrongSound);

  for (let i = 1; i <= playableAudios.length; i++) {
    audioInputs.push(document.getElementById(`audioInput${i}`));
    audioElements.push(document.getElementById(`audioElement${i}`));
  }

  console.log(items);
  console.log(itemDivs);

  for (let i = 0; i < itemDivs.length; i++) {
    itemDivs[i].addEventListener("mousedown", (e) => {
      if (isTooltipOpen.value || !isEditing.value) return;
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

  editModeBtns.push(addItemsBtn);
  editModeBtns.push(settingsBtn);
  editModeBtns.push(saveBtn);
  editModeBtns.push(deleteBtn);

  // Add event listeners for edit mode buttons
  const editModeParams = { cursorType, clickSound, isEditing, items, resizeBoxes, isItemCollected, remainingItems, showTooltip, isTooltipOpen, btnDiv, editModeBtns, currSelectedElement, settingsScreen, btnClicks, binTooltip, binTooltipRectangle, refreshBtn };
  const dragParams = { isDragging, isResizing, savedX, savedY, allowItemMove, teleporationFix, deltaX, deltaY, isEditing, isTooltipOpen, btnLastX, btnLastY };

  // Handle edit mode button click
  editModeBtn.addEventListener("click", () => {
    const wasEditing = isEditing.value;
    inEdit = !inEdit;
    stopspaceship = false; 
    handleEditModeButtonClick(editModeParams);

    if (!wasEditing && isEditing.value) {
      remainingItems = 0;
      itemsLeftNumber.innerHTML = remainingItems;

      [btnDiv, btn, itemsLeft, itemsLeftNumber].forEach((el) => (el.style.display = "block"));
      [settingsScreen, itemsAdditionScreen].forEach(hideScreen);

      //addDragListenersToAllItems(itemDivs, dragParams);
    }
    else{
     isEditing.value = false;
    }
  });

  refreshBtn.addEventListener("click", () => {
    gameWon = false;
    playSound(clickSound);
    stopspaceship = false;
    isEditing.value = false;
    moveSpaceship();
  });

  addItemsBtn.addEventListener("click", () => handleAddItemsButtonClick({ isAddingItems, itemsAdditionScreen, cleanUp: false, clickSound, settingsScreen, saveScreen }));
  itemsAdditionCloseBtn.addEventListener("click", () => handleAddItemsCloseButtonClick({ clickSound, isAddingItems, itemsAdditionScreen }));

  // Game Settings
  bgImgInput.addEventListener("change", (e) => {
    sendPM();
    handleSingleImageUpload(e, { targetImg: background, newImg: bgImg });
  });

  settingsBtn.addEventListener("click", () => handleSettingsButtonClick({ isAddingItems, itemsAdditionScreen, cleanUp: false, clickSound, settingsScreen, saveScreen }));
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

  let tooltipTimeout; // Variable to store timeout reference

  // Mouse enter
  editModeBtn.addEventListener("mouseenter", () => handleUpScaling(editModeBtn));
  addItemsBtn.addEventListener("mouseenter", () => handleUpScaling(addItemsBtn));
  settingsBtn.addEventListener("mouseenter", () => handleUpScaling(settingsBtn));
  saveBtn.addEventListener("mouseenter", () => handleUpScaling(saveBtn));

  deleteBtn.addEventListener("mouseenter", () => {
    handleUpScaling(deleteBtn);
    tooltipTimeout = setTimeout(() => (binTooltip.style.display = binTooltipRectangle.style.display = "block"), 500);
  });

  refreshBtn.addEventListener("mouseenter", () => handleUpScaling(refreshBtn));

  // Mouse leave
  editModeBtn.addEventListener("mouseleave", () => handleDownScaling(editModeBtn));
  addItemsBtn.addEventListener("mouseleave", () => handleDownScaling(addItemsBtn));
  settingsBtn.addEventListener("mouseleave", () => handleDownScaling(settingsBtn));
  saveBtn.addEventListener("mouseleave", () => handleDownScaling(saveBtn));

  deleteBtn.addEventListener("mouseleave", () => {
    handleDownScaling(deleteBtn);
    clearTimeout(tooltipTimeout); // Cancel showing tooltip if mouse leaves early
    binTooltip.style.display = binTooltipRectangle.style.display = "none";
  });

  refreshBtn.addEventListener("mouseleave", () => handleDownScaling(refreshBtn));

  // Items Deletion
  deleteBtn.addEventListener("mouseup", handleDeleteBtnMouseUp);

  // On Board Images Resizing
  for (let i = 0; i < resizeBoxes.length; i++) {
    resizeBoxes[i].addEventListener("mousedown", (e) => handleResizeStart(e, { i: parseInt(i / 4), direction: i % 4 === 0 ? "TL" : i % 4 === 1 ? "TR" : i % 4 === 2 ? "BL" : "BR", isResizing, lastScales, allowItemResize, resizeLastX, item: items[parseInt(i / 4)], itemDiv: itemDivs[parseInt(i / 4)], lastDirection, resizeScale }));
  }

  // Context Menu
  for (let i = 1; i < items.length; i++) {
    if (items[i]?.id.startsWith("wordscontaineritem")) {
      items[i].addEventListener("contextmenu", (e) => {
        currentItemCM = i;
        handleItemContextMenu(e, { isEditing, contextMenu, changeImageBtn }); // Placeholder, will be updated to handleWordItemContextMenu
      });
    }
  }

  // Hide menu after click
  document.getElementById("changeImage").addEventListener("click", () => (contextMenu.style.display = "none"));

  // Image Input Listener
  changeImageInput.addEventListener("change", (e) => handleChangeImage(e, currentItemCM, { items, gameDictionary, wordindexs }));

  // Context Menu Options
  document.getElementById("changeWord").addEventListener("click", () => {
    handleChangeWord(currentItemCM, { items, gameDictionary, wordindexs, createBlanksInWords, setupDragAndDrop, remainingItems, itemsLeftNumber });
    contextMenu.style.display = "none"; // Hide menu after click
  });

  document.addEventListener("click", () => (contextMenu.style.display = "none"));

  // Disable selection for the whole document
  document.addEventListener("DOMContentLoaded", () => (document.body.style.userSelect = "none"));

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
  saveBtn.addEventListener("click", () => handleSaveButtonClick({ isAddingItems, itemsAdditionScreen, cleanUp: false, clickSound, settingsScreen, saveScreen }));
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
