import { handleAudioUpload } from "./modules/audioUpload.js";
import { handleItemContextMenu } from "./modules/contextMenu.js";
import { handleDragStart, handleDragEnd } from "./modules/dragHandlers.js";
import { handleEditModeButtonClick, handleSettingsButtonClick, handleSettingsCloseButtonClick, handleAddItemsButtonClick, handleAddItemsCloseButtonClick, handleSaveButtonClick, handleSaveCloseButtonClick, addTagOrSetting } from "./modules/editMode.js";
import { handleSingleImageUpload, handleChangeImageUpload, handleImageUpload } from "./modules/imageUpload.js";
import { handleResizeStart } from "./modules/resizeHandlers.js";
import { handleButtonClick, handleDescriptionInput, handleDescriptionKeyDown, handleTitleInput, handleTitleKeyDown, btnOffHandler, btnOnHandler, btnBlackHandler, btnWhiteHandler } from "./modules/tooltip.js";
import { playSound, pauseSound, hideScreen, handleDownScaling, handleUpScaling, handleElementClick, addItemOnScreen, disallowDelete } from "./modules/utils.js";

// ------------------ //
//  HELPER FUNCTIONS  //
// ------------------ //
// const handleItemClick = (item) => {
//   pauseSound(collectSound);

//   if (isItemCollected[items.indexOf(item)]) return;

//   isItemCollected[items.indexOf(item)] = true;
//   remainingItems--;

//   // Game won
//   if (remainingItems === 0) {
//     winSound.play();
//     btn.style.display = itemsLeftNumber.style.display = itemsLeft.style.display = "none";
//   }

//   // Game not won yet
//   else collectSound.play();

//   itemsLeftNumber.innerHTML = remainingItems;

//   // Animate the decrease in opacity of the item
//   for (let j = 0; j <= 100; j++) {
//     setTimeout(() => {
//       item.style.opacity = 1 - j / 100;

//       // After opacity reaches 0, set display to none
//       if (j === 100) {
//         item.style.display = "none";
//       }
//     }, j * 3);
//   }
// };

// ---------------- //
// Arrange Word Items//
// ---------------- //
function arrangeWordItems() {
  const container = document.getElementById("words-container");
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // Filter itemDivs to only include word items
  const wordItemDivs = itemDivs.filter(div => div.id.startsWith("wordscontainerdivItem") && div.style.display !== "none");

  const columns = Math.floor(containerWidth / 250);
  const rows = Math.ceil(wordItemDivs.length / columns);

  const usedCells = new Set();

  for (let i = 0; i < wordItemDivs.length; i++) {
    let row, col, cellIndex;

    do {
      col = Math.floor(Math.random() * columns);
      row = Math.floor(Math.random() * rows);
      cellIndex = row * columns + col;
    } while (usedCells.has(cellIndex));

    usedCells.add(cellIndex);

    const cellWidth = 250;
    const cellHeight = 100;

    const x = col * (cellWidth + 16);
    const y = row * (cellHeight + 20);

    wordItemDivs[i].style.position = "absolute";
    wordItemDivs[i].style.left = `${x}px`;
    wordItemDivs[i].style.top = `${y}px`;
  }
}

// ---------------- //
// ALPHABETS GENERATION //
// ---------------- //
const generateAlphabetItems = (items, itemDivs, isItemCollected) => {
  if (!Array.isArray(items)) items = [document.getElementById("btn")].filter(Boolean);
  if (!Array.isArray(itemDivs)) itemDivs = [document.getElementById("btnDiv")].filter(Boolean);
  if (!Array.isArray(isItemCollected)) isItemCollected = [];

  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const alphabetContainer = document.getElementById("alphabet-container");

  if (!alphabetContainer) {
    console.error("Alphabet container not found. Ensure <div id='alphabet-container'> exists in the HTML.");
    return;
  }

  const startX = 20;
  const startY = 20;
  const xSpacing = 80;
  const ySpacing = 80;
  const maxPerRow = 10;
  const lettersInLastRow = 6;
  const fullRowWidth = maxPerRow * xSpacing;
  const lastRowWidth = (lettersInLastRow - 1) * xSpacing + 56;
  const leftOffset = (fullRowWidth - lastRowWidth) / 2;

  alphabet.forEach((letter, index) => {
    let xPos = startX + (index % maxPerRow) * xSpacing;
    const yPos = startY + Math.floor(index / maxPerRow) * ySpacing;
    if (index >= 20) xPos += leftOffset;

    const itemDiv = document.createElement("span");
    itemDiv.id = `alphabetcontainerdivItem${index + 1}`;
    itemDiv.style.cssText = `
      position: absolute;
      left: ${xPos}px;
      top: ${yPos}px;
      display: inline-block;
    `;

    // Create all 4 resize boxes
    const corners = [
      { id: 'TL', style: 'left: -6px; top: -6px; cursor: nwse-resize;' },
      { id: 'TR', style: 'right: -6px; top: -6px; cursor: nesw-resize;' },
      { id: 'BL', style: 'left: -6px; bottom: -6px; cursor: nesw-resize;' },
      { id: 'BR', style: 'right: -6px; bottom: -6px; cursor: nwse-resize;' },
    ];

    corners.forEach(corner => {
      const resizeBox = document.createElement("span");
      resizeBox.id = `resizeBox${index + 1}${corner.id}`;
      resizeBox.style.cssText = `
        position: absolute;
        ${corner.style}
        width: 14px;
        height: 14px;
        visibility: hidden;
        border-radius: 100%;
        background-color: white;
        border: 1px solid red;
      `;
      itemDiv.appendChild(resizeBox);
    });

    const letterItem = document.createElement("span");
    letterItem.id = `alphabetcontaineritem${index + 1}`;
    letterItem.className = "letter";
    letterItem.setAttribute("draggable", "true");

    const letterText = document.createElement("span");
    letterText.id = `alphabetitem${index + 1}Text`;
    letterText.textContent = letter;
    letterText.style.fontFamily = "'Comfortaa'";
    
    letterItem.appendChild(letterText);
    itemDiv.appendChild(letterItem);
    alphabetContainer.appendChild(itemDiv);

    try {
      items.push(letterItem);
      itemDivs.push(itemDiv);
      isItemCollected.push(false);

      letterItem.addEventListener("dragstart", (e) => {
        if (isEditing?.value || gameWon) return;
        console.log(`Dragging started for letter: ${letter}`);
        e.dataTransfer.setData("text/plain", letter);
        letterItem.classList.add("dragging");
      });

      letterItem.addEventListener("dragend", (e) => {
        console.log(`Dragging ended for letter: ${letter}`);
        letterItem.classList.remove("dragging");
      });

    } catch (error) {
      console.error(`Error adding letter ${letter} to arrays:`, error);
    }
  });
};

// ---------------- //
// CREATE BLANKS //
// ---------------- //
const createBlanksInWords = () => {
  const blanksData = [];
  const wordSpans = document.querySelectorAll('[id^="worditem"][id$="Text"]');
  let totalBlanks = 0;

  wordSpans.forEach((wordSpan, i) => {
    if (!wordSpan) {
      console.warn(`Word span at index ${i} is null or undefined.`);
      return;
    }

    const wordContainer = wordSpan.closest('[id^="wordscontainerdivItem"]');
    if (!wordContainer || wordContainer.style.display === "none") {
      return;
    }

    const originalWord = wordSpan.textContent.trim();
    if (!originalWord) {
      console.warn(`Text content for word span at index ${i} is empty.`);
      return;
    }

    const wordChars = originalWord.split("");
    const wordLength = wordChars.length;
    if (wordLength < 2) {
      console.warn(`Word at index ${i} is too short: ${originalWord}`);
      return;
    }

    const maxBlanks = Math.min(2, wordLength); // Allow 1-2 blanks
    const numBlanks = Math.floor(Math.random() * maxBlanks) + 1;

    const blankPositions = [];
    const validPositions = wordChars
      .map((char, idx) => ({ char, idx }))
      .filter(({ char }) => /[a-zA-Z]/.test(char))
      .map(({ idx }) => idx);

    if (validPositions.length === 0) {
      console.warn(`No valid letters in word at index ${i}: ${originalWord}`);
      return;
    }

    while (blankPositions.length < numBlanks && validPositions.length > 0) {
      const randomIdx = Math.floor(Math.random() * validPositions.length);
      const pos = validPositions.splice(randomIdx, 1)[0];
      blankPositions.push(pos);
    }

    if (blankPositions.length === 0) {
      console.warn(`Could not select blank positions for word at index ${i}: ${originalWord}`);
      return;
    }

    blankPositions.sort((a, b) => a - b);

    const expectedLetters = blankPositions.map(pos => wordChars[pos].toUpperCase());
    blankPositions.forEach(pos => {
      wordChars[pos] = "_";
    });

    const newText = wordChars.join("");
    wordSpan.textContent = newText;

    blanksData.push({
      wordId: wordSpan.id,
      originalWord: originalWord,
      blankPositions: blankPositions,
      expectedLetters: expectedLetters
    });

    totalBlanks += blankPositions.length;

    console.log(`Updated word: ${originalWord} -> ${newText}`);
    console.log(`Blank positions: ${blankPositions}, Expected letters: ${expectedLetters}`);
  });

  remainingItems = totalBlanks;
  itemsLeftNumber.innerHTML = remainingItems;
  console.log(`Total blanks set: ${remainingItems}`);

  return blanksData;
};

// ---------------- //
// CLEAR   BLANKS //
// ---------------- //
const clearBlanksInWords = () => {
  const wordSpans = document.querySelectorAll('[id^="worditem"][id$="Text"]');
  wordSpans.forEach((wordSpan, i) => {
    if (!wordSpan) {
      console.warn(`Word span at index ${i} is null or undefined.`);
      return;
    }

    const wordContainer = wordSpan.closest('[id^="wordscontainerdivItem"]');
    if (!wordContainer || wordContainer.style.display === "none") {
      return;
    }

    const originalWord = wordSpan.textContent.replace(/_/g, ''); // Remove existing blanks
    if (!originalWord) {
      console.warn(`Text content for word span at index ${i} is empty.`);
      return;
    }

    wordSpan.textContent = originalWord;
    console.log(`Cleared blanks for word: ${originalWord}`);
  });

  console.log(wordSpans) ;
};

// ---------------- //
// HANDLE DRAG AND DROP FOR LETTERS //
// ---------------- //
const setupDragAndDrop = (items, blanksData) => {
  const wordsContainer = document.getElementById("words-container");

  wordsContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  wordsContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    if (isEditing?.value || gameWon) return;

    const letter = e.dataTransfer.getData("text/plain");
    const dropX = e.clientX;
    const dropY = e.clientY;

    // Get all word spans
    const wordSpans = document.querySelectorAll('[id^="worditem"][id$="Text"]');
    let closestSpan = null;
    let minDistance = Infinity;

    // Find the closest word span based on drop coordinates
    wordSpans.forEach(span => {
      const rect = span.getBoundingClientRect();
      // Expand the hit area by adding a tolerance (e.g., 20px)
      const tolerance = 20;
      const expandedRect = {
        left: rect.left - tolerance,
        right: rect.right + tolerance,
        top: rect.top - tolerance,
        bottom: rect.bottom + tolerance
      };

      // Check if drop is within the expanded rectangle
      if (
        dropX >= expandedRect.left &&
        dropX <= expandedRect.right &&
        dropY >= expandedRect.top &&
        dropY <= expandedRect.bottom
      ) {
        // Calculate distance to span center for closest match
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(dropX - centerX, 2) + Math.pow(dropY - centerY, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestSpan = span;
        }
      }
    });

    if (!closestSpan) {
      playSound(wrongSound);
      showFeedback(false);
      return;
    }

    const wordData = blanksData.find(data => data.wordId === closestSpan.id);
    if (!wordData) {
      playSound(wrongSound);
      showFeedback(false);
      return;
    }

    const wordText = closestSpan.textContent;
    const wordChars = wordText.split("");
    const blankPositions = wordData.blankPositions;
    let filled = false;

    for (let i = 0; i < blankPositions.length; i++) {
      const pos = blankPositions[i];
      if (wordChars[pos] !== "_") continue;

      const expectedLetter = wordData.expectedLetters[i];
      if (letter === expectedLetter) {
        wordChars[pos] = letter.toLowerCase();
        closestSpan.textContent = wordChars.join("");
        remainingItems--;
        itemsLeftNumber.innerHTML = remainingItems;
        console.log(`Remaining items: ${remainingItems}`);
        playSound(collectSound);
        showFeedback(true);

        if (remainingItems === 0) {
          winSound.play();
          btn.style.display = itemsLeftNumber.style.display = itemsLeft.style.display = "none";
          gameWon = true;
        }

        filled = true;
        break;
      }
    }

    if (!filled) {
      playSound(wrongSound);
      showFeedback(false);
    }
  });
};

// Helper: Show feedback
function showFeedback(isCorrect) {
  const feedback = document.createElement("div");
  feedback.className = `feedback ${isCorrect ? "correct" : "wrong"}`;
  feedback.textContent = isCorrect ? "✓ Right Answer" : "✗ Wrong Answer";

  // Fixed positioning
  feedback.style.position = "fixed";
  feedback.style.top = "165px";
  feedback.style.left = "575px";
  feedback.style.zIndex = "9999";

  document.body.appendChild(feedback);
  setTimeout(() => feedback.remove(), 2000);
}

// ---------------- //
//  ITEMS ADDITION  //
// ---------------- //
const handleAddItems = async (existingImg, imgScale) => {
  await addItemOnScreen({ items, itemDivs, isAddingItems, itemsAdditionScreen, type: "item", addableImg: existingImg ? existingImg : addableImg, resizeBoxes, allowItemMove, allowItemResize, lastScales, isInitializing: existingImg ? true : false });

  // Add all event listeners now
  let x = itemDivs.length - 1;

  // Update the remaining items count
  if (!existingImg) {
    remainingItems += 1;
    itemsLeftNumber.innerHTML = remainingItems;
  }

  // Update the scale of the image
  else if (imgScale) {
    lastScales[x] = imgScale;
    itemDivs[x].style.transformOrigin = "0 0";
    itemDivs[x].style.transform = `scale(${lastScales[x]})`;
  }

  isItemCollected.push(false);

  itemDivs[x].addEventListener("mousedown", (e) => {
    if (isTooltipOpen.value || !isEditing.value) return;
    handleDragStart(e, { i: x, targetDiv: itemDivs[x], isDragging, isResizing, gameWon, savedX, savedY, allowItemMove, teleporationFix, deltaX, deltaY, isEditing, type: "item", placeBack: true, btnLastX, btnLastY });
  });

  itemDivs[x].addEventListener("mouseup", (e) => {
    if (isTooltipOpen.value || !isEditing.value) return;
    handleDragEnd(e, { i: x, targetDiv: itemDivs[x], isDragging, isResizing, gameWon, savedX, savedY, allowItemMove, teleporationFix, deltaX, deltaY, isEditing, type: "item", placeBack: true, btnLastX, btnLastY });
  });

  itemDivs[x].addEventListener("click", () => handleElementClick({ currSelectedElement, element: itemDivs[x], isEditing, isTooltipOpen }));

  items[x].addEventListener("click", () => {
    if (isEditing.value) return;
    handleItemClick(items[x]);
  });

  resizeBoxes[x * 4].addEventListener("mousedown", (e) => handleResizeStart(e, { i: x, direction: "TL", isResizing, lastScales, allowItemResize, resizeLastX, item: items[x], itemDiv: itemDivs[x], lastDirection, resizeScale }));
  resizeBoxes[x * 4 + 1].addEventListener("mousedown", (e) => handleResizeStart(e, { i: x, direction: "TR", isResizing, lastScales, allowItemResize, resizeLastX, item: items[x], itemDiv: itemDivs[x], lastDirection, resizeScale }));
  resizeBoxes[x * 4 + 2].addEventListener("mousedown", (e) => handleResizeStart(e, { i: x, direction: "BL", isResizing, lastScales, allowItemResize, resizeLastX, item: items[x], itemDiv: itemDivs[x], lastDirection, resizeScale }));
  resizeBoxes[x * 4 + 3].addEventListener("mousedown", (e) => handleResizeStart(e, { i: x, direction: "BR", isResizing, lastScales, allowItemResize, resizeLastX, item: items[x], itemDiv: itemDivs[x], lastDirection, resizeScale }));
};

export const addWordItemOnScreen = (params) => {
  return new Promise((resolve) => {
    let latestItem = params.items.length;
    params.isAddingItems.value = false;
    hideScreen(params.itemsAdditionScreen);

    // Create a container div for word item
    const div = document.createElement("div");
    div.id = `wordscontainerdivItem${latestItem}`;
    div.style.position = "absolute";
    div.style.left = "100px";
    div.style.top = "100px";
    div.style.display = "inline-block";
    div.style.zIndex = "99999999";

    // Create inner word item div
    const wordItemDiv = document.createElement("div");
    wordItemDiv.id = `wordscontaineritem${latestItem}`;
    wordItemDiv.className = "word-item";

    // Create image element
    const img = document.createElement("img");
    img.id = `worditem${latestItem}Image`;
    img.src = params.addableImg.src;

    // Create text element
    const wordText = document.createElement("span");
    wordText.id = `worditem${latestItem}Text`;
    wordText.innerText = params.wordName;

    // Append image and text to word item div
    wordItemDiv.appendChild(img);
    wordItemDiv.appendChild(wordText);

    // Add resize boxes
    const corners = [
      { id: 'TL', style: 'left: -6px; top: -6px; cursor: nwse-resize;' },
      { id: 'TR', style: 'right: -6px; top: -6px; cursor: nesw-resize;' },
      { id: 'BL', style: 'left: -6px; bottom: -6px; cursor: nesw-resize;' },
      { id: 'BR', style: 'right: -6px; bottom: -6px; cursor: nwse-resize;' },
    ];

    corners.forEach(corner => {
      const resizeBox = document.createElement("div");
      resizeBox.id = `resizeBox${latestItem}${corner.id}`;
      resizeBox.style.cssText = `
        position: absolute;
        ${corner.style}
        width: 14px;
        height: 14px;
        visibility: hidden;
        border-radius: 100%;
        background-color: white;
        border: 1px solid red;
      `;
      div.appendChild(resizeBox);
      params.resizeBoxes.push(resizeBox);
    });

    // Append word item div to container div
    div.appendChild(wordItemDiv);

    // Append to the word container
    const wordContainer = document.getElementById("words-container");
    if (!wordContainer) {
      console.error("Word container not found.");
      resolve();
      return;
    }
    wordContainer.appendChild(div);

    // Push to items and itemDivs
    params.items.push(wordItemDiv);
    params.itemDivs.push(div);
    params.isItemCollected.push(false);

    // Add event listeners
    div.addEventListener("mousedown", (e) => {
      if (params.isTooltipOpen.value || !params.isEditing.value) return;
      handleDragStart(e, { i: latestItem, targetDiv: div, isDragging: params.isDragging, isResizing: params.isResizing, gameWon, savedX: params.savedX, savedY: params.savedY, allowItemMove: params.allowItemMove, teleporationFix: params.teleporationFix, deltaX: params.deltaX, deltaY: params.deltaY, isEditing: params.isEditing, type: "item", placeBack: true, btnLastX: params.btnLastX, btnLastY: params.btnLastY });
    });

    div.addEventListener("mouseup", (e) => {
      if (params.isTooltipOpen.value || !params.isEditing.value) return;
      handleDragEnd(e, { i: latestItem, targetDiv: div, isDragging: params.isDragging, isResizing: params.isResizing, gameWon, savedX: params.savedX, savedY: params.savedY, allowItemMove: params.allowItemMove, teleporationFix: params.teleporationFix, deltaX: params.deltaX, deltaY: params.deltaY, isEditing: params.isEditing, type: "item", placeBack: true, btnLastX: params.btnLastX, btnLastY: params.btnLastY });
    });

    div.addEventListener("click", () => handleElementClick({ currSelectedElement, element: div, isEditing: params.isEditing, isTooltipOpen: params.isTooltipOpen }));

    wordItemDiv.addEventListener("contextmenu", (e) => {
      currentItemCM = latestItem;
      handleItemContextMenu(e, { isEditing: params.isEditing, contextMenu, changeImageBtn });
    });

    resolve();
  });
};



// ---------------- //
//  ITEMS DELETION  //
// ---------------- //
const deleteItem = (index) => {
  delItemCount++;
  delItems.push(itemDivs[index]);

  itemDivs[index].style.display = "none";

  for (let i = 0; i < 4; i++) {
    resizeBoxes[index * 4 + i].style.display = "none";
  }
};

const getDraggedItemIndex = () => {
  // Get the item being dragged
  for (let i = 0; i < allowItemMove.length; i++) {
    if (allowItemMove[i]) {
      allowItemMove[i] = false;
      isDragging.value = false;

      return i;
    }
  }

  return null;
};

const handleDeleteBtnMouseUp = () => {
  // Nothing is being dragged || Something is being resized || The tooltip button is being moved || Only one item is left
  if (!isDragging.value || isResizing.value || allowItemMove[0] || remainingItems === 1) {
    playSound(wrongSound);

    // The bin was just simply clicked
    if (!isDragging.value) {
      binTooltip.style.display = binTooltipRectangle.style.display = "block";

      setTimeout(() => {
        binTooltip.style.display = binTooltipRectangle.style.display = "none";
      }, 5000);
    }

    // The game tooltip btn was being moved
    else if (allowItemMove[0]) {
      disallowDelete({ targetDiv: btnDiv, lastX: btnLastX, lastY: btnLastY, i: 0, type: "button", isDragging, savedX, savedY, allowItemMove });
    }

    // Only one item is left
    else if (remainingItems === 1) {
      let itemIndex = getDraggedItemIndex();
      disallowDelete({ targetDiv: itemDivs[itemIndex], lastX: savedX, lastY: savedY, i: itemIndex, type: "item", isDragging, savedX, savedY, allowItemMove });
    }

    return;
  }

  // Get the item being dragged
  let targetIndex = getDraggedItemIndex();

  // Delete it now
  playSound(deleteSound);
  deleteItem(targetIndex);

  remainingItems -= 1;
  itemsLeftNumber.innerHTML = remainingItems;
};

// ----------- //
//  SAVE GAME  //
// ----------- //
const toggleSaveChangesBtn = (isDisabled = false, cursorType = "pointer", opacity = 1) => {
  saveChangesBtn.disabled = isDisabled;
  saveChangesBtn.style.cursor = cursorType;
  saveChangesBtn.style.opacity = opacity;
};

const saveGame = (e, type) => {
  if (e) e.preventDefault();

  // Disable the save changes button
  if (type === "game data") toggleSaveChangesBtn(true, "not-allowed", 0.7);

  // Generic Elements
  gameData = {
    tooltip: {
      title: title.innerText,
      description: description.innerText,
      btnX: btnLastX.value,
      btnY: btnLastY.value,
      showTooltip: showTooltip.value,
      btnScale: lastScales[0],
    },

    elements: [],

    // Unique Elements
    uncommon: {
      remainingItems,
      delItemCount,
    },

    base64Strings: [bgImg.src, btn.src, collectSound.src, winSound.src, wrongSound.src, clickSound.src, deleteSound.src],
  };

  // Item Divs
  for (let i = 1; i < items.length; i++) {
    gameData.elements.push({
      x: itemDivs[i].style.left,
      y: itemDivs[i].style.top,
      scale: lastScales[i],
      width: items[i].offsetWidth,
      height: items[i].offsetHeight,
    });

    gameData.base64Strings.push(items[i].src);
  }

  window.parent.postMessage({ type, gameData, gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
  if (type === "game data") areChangesSaved.value = true;
};

const initializeGame = (recievedData) => {
  // Check if the game has been saved before
  if (!recievedData) return;

  // Background
  if (recievedData.assetUrls && recievedData.assetUrls.length > 0) {
    background.src = bgImg.src = recievedData.assetUrls[0];
    btn.src = btnSrc.value = recievedData.assetUrls[1];

    collectSound.src = recievedData.assetUrls[2];
    winSound.src = recievedData.assetUrls[3];
    wrongSound.src = recievedData.assetUrls[4];
    clickSound.src = recievedData.assetUrls[5];
    deleteSound.src = recievedData.assetUrls[6];
  }

  // Game Tooltip
  if (recievedData.tootlip) {
    title.innerText = recievedData.tooltip.title;
    description.innerText = recievedData.tooltip.description;

    btnLastX.value = recievedData.tooltip.btnX;
    btnLastY.value = recievedData.tooltip.btnY;

    btnDiv.style.left = `${btnLastX.value}px`;
    btnDiv.style.top = `${btnLastY.value}px`;

    lastScales[0] = recievedData.tooltip.btnScale;
    btnDiv.style.transform = `scale(${lastScales[0]})`;

    showTooltip.value = recievedData.tooltip.showTooltip;
    if (!showTooltip.value) btnOffHandler({ showTooltip, btnOff, btnOn, btnDiv, resizeBoxes });
  }

  // Elements
  if (recievedData.elements.length > 0) {
    for (let i = 1; i < items.length; i++) {
      // URL
      items[i].src = recievedData.assetUrls[i + 6];

      // Position
      itemDivs[i].style.left = recievedData.elements[i - 1].x;
      itemDivs[i].style.top = recievedData.elements[i - 1].y;

      // Dimensions
      items[i].width = recievedData.elements[i - 1].width;
      items[i].height = recievedData.elements[i - 1].height;

      // Scale
      lastScales[i] = recievedData.elements[i - 1].scale;
      itemDivs[i].style.transform = `scale(${lastScales[i]})`;
    }

    // Now, we have to create all the elements that were added to the game through game UI
    for (let i = items.length; i <= recievedData.elements.length; i++) {
      const theImg = new Image();

      // Give the image an src, width & height when it is loaded
      theImg.onload = () => {
        theImg.style.width = recievedData.elements[i - 1].width;
        theImg.style.height = recievedData.elements[i - 1].height;

        theImg.style.left = recievedData.elements[i - 1].x;
        theImg.style.top = recievedData.elements[i - 1].y;

        handleAddItems(theImg, recievedData.elements[i - 1].scale);

        // Hide the new resize boxes
        for (let j = resizeBoxes.length - 4; j < resizeBoxes.length; j++) {
          resizeBoxes[j].style.visibility = "hidden";
          resizeBoxes[j].style.visibility = "hidden";
          resizeBoxes[j].style.visibility = "hidden";
          resizeBoxes[j].style.visibility = "hidden";
        }

        // Hide the new border
        items[items.length - 1].style.border = "1px solid transparent";
        items[items.length - 1].style.cursor = "default";
      };

      theImg.src = recievedData.assetUrls[i + 6];
    }
  }

  // Set the unique elements
  if (recievedData.uncommon) {
    remainingItems = recievedData.uncommon.remainingItems;
    delItemCount = recievedData.uncommon.delItemCount;
  }

  itemsLeftNumber.innerHTML = remainingItems;
};

// --------- //
//  GENERAL  //
// --------- //
let currSelectedElement = { value: null };
let gameWon = false;

// Elements
let items = [document.getElementById("btn")];
let itemDivs = [document.getElementById("btnDiv")];
let resizeBoxes = [];
let isItemCollected = [];

let delItems = [];
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
let btnLastY = { value: 125 };
let showTooltip = { value: true };
let btnSrc = { value: "./assets/infoDark.webp" };

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

const collectSound = document.getElementById("collectSound");
const winSound = document.getElementById("winSound");
const wrongSound = document.getElementById("wrongSound");
const clickSound = document.getElementById("clickSound");
const deleteSound = document.getElementById("deleteSound");

// ----------- //
//  SAVE GAME  //
// ----------- //
let areChangesSaved = { value: true };

let gameData = {};

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

  // Adding Items
  // for (let i = 1; i <= 4; i++) {
  //   items.push(document.getElementById(`wordscontaineritem${i}`));
  //   itemDivs.push(document.getElementById(`wordscontainerdivItem${i}`));
  //   isItemCollected.push(false);
  // }

  //Adding Word items
  // Assume there are 8 total items (you can adjust this number)
  const totalItems = 8;
  const selectedIndices = [];

  // Randomly select 4 unique indices
  while (selectedIndices.length < 4) {
    const randomIndex = Math.floor(Math.random() * totalItems) + 1;
    if (!selectedIndices.includes(randomIndex)) {
      selectedIndices.push(randomIndex);
    }
  }

  //Push randomly selected items
  for (let i = 0; i < selectedIndices.length; i++) {
    const index = selectedIndices[i];
    document.getElementById(`wordscontainerdivItem${index}`).style.display = "inline-block";
    items.push(document.getElementById(`wordscontaineritem${index}`));
    itemDivs.push(document.getElementById(`wordscontainerdivItem${index}`));
    isItemCollected.push(false);
    console.log(`wordscontaineritem${index}`);
  }

  arrangeWordItems();

  // Resize Boxes
  for (let i = 0; i < items.length; i++) {
    resizeBoxes.push(document.getElementById(`resizeBox${i}TL`));
    resizeBoxes.push(document.getElementById(`resizeBox${i}TR`));
    resizeBoxes.push(document.getElementById(`resizeBox${i}BL`));
    resizeBoxes.push(document.getElementById(`resizeBox${i}BR`));
  }

  generateAlphabetItems(items, itemDivs, isItemCollected);

  // Add blanks to words
  const blanksData = createBlanksInWords();

  // Setup drag-and-drop for letters
  setupDragAndDrop(items, blanksData);

  // Add event listeners to all items
  // for (let i = 1; i < items.length; i++) {
  //   items[i].addEventListener("click", () => {
  //     if (isEditing.value) return;
  //     handleItemClick(items[i]);
  //   });
  // }

  // Items Addition
  addableImgInput.addEventListener("change", (e) => handleImageUpload(e, { targetImg: addableImg }));

  // addItemBtn.addEventListener("click", () => {
  //   if (areChangesSaved.value) {
  //     window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
  //     areChangesSaved.value = false;
  //     toggleSaveChangesBtn();
  //   }

  //   handleAddItems();
  // });

  addItemBtn.addEventListener("click", () => {
    const wordName = document.getElementById("wordInput").value;
    if (!wordName) {
      console.error("Word name is empty.");
      return;
    }
  
    addWordItemOnScreen({
      items,
      itemDivs,
      isAddingItems,
      itemsAdditionScreen,
      addableImg,
      wordName,
      isItemCollected,
      resizeBoxes,
      isDragging,
      isResizing,
      savedX,
      savedY,
      allowItemMove,
      teleporationFix,
      deltaX,
      deltaY,
      isEditing,
      isTooltipOpen,
      btnLastX,
      btnLastY
    }).then(() => {
      arrangeWordItems();
      const blanksData = createBlanksInWords();
      setupDragAndDrop(items, blanksData);
    });
  });

  // Audios
  playableAudios.push(clickSound);
  playableAudios.push(collectSound);
  playableAudios.push(winSound);
  playableAudios.push(deleteSound);

  for (let i = 1; i <= 4; i++) {
    audioInputs.push(document.getElementById(`audioInput${i}`));
    audioElements.push(document.getElementById(`audioElement${i}`));
  }

  // for (let i = 0; i < itemDivs.length; i++) {
  //   itemDivs[i].addEventListener("mousedown", (e) => {
  //     if (isTooltipOpen.value || !isEditing.value) return;

  //     if (areChangesSaved.value) {
  //       window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
  //       areChangesSaved.value = false;
  //       toggleSaveChangesBtn();
  //     }

  //     handleDragStart(e, { i, targetDiv: itemDivs[i], isDragging, isResizing, gameWon, savedX, savedY, allowItemMove, teleporationFix, deltaX, deltaY, isEditing, type: i === 0 ? "button" : "item", placeBack: true, btnLastX, btnLastY });
  //   });

  //   itemDivs[i].addEventListener("mouseup", (e) => {
  //     if (isTooltipOpen.value || !isEditing.value) return;
  //     handleDragEnd(e, { i, targetDiv: itemDivs[i], isDragging, isResizing, gameWon, savedX, savedY, allowItemMove, teleporationFix, deltaX, deltaY, isEditing, type: i === 0 ? "button" : i === 1 ? "targetObject" : "item", placeBack: true, btnLastX, btnLastY });
  //   });

  //   itemDivs[i].addEventListener("click", () => handleElementClick({ currSelectedElement, element: itemDivs[i], isEditing, isTooltipOpen }));
  // }

  // Edit Mode
  
  let cursorType = { value: "default" };

  editModeBtns.push(addItemsBtn);
  editModeBtns.push(settingsBtn);
  editModeBtns.push(saveBtn);
  editModeBtns.push(deleteBtn);

  //editModeBtn.addEventListener("click", () => handleEditModeButtonClick({ clickSound, isEditing, items, resizeBoxes, showTooltip, isTooltipOpen, btnDiv, editModeBtns, currSelectedElement, settingsScreen, btnClicks, binTooltip, binTooltipRectangle }));

  // editModeBtn.addEventListener("click", () => {
  //   const itemsLeftNumber = document.getElementById("itemsLeftNumber");

  //   remainingItems = items.length - 1 - delItemCount;
  //   itemsLeftNumber.innerHTML = remainingItems;

  //   // Make all items visible again
  //   // for (let i = 1; i < items.length; i++) {
  //   //   items[i].style.opacity = 1;
  //   //   items[i].style.display = "block";
  //   // }

  //   // if (isItemCollected) {
  //   //   // Reset collection state of all items
  //   //   for (let i = 1; i < items.length; i++) {
  //   //     isItemCollected[i] = false;
  //   //   }
  //   // }

  //   btnDiv.style.display = btn.style.display = itemsLeft.style.display = itemsLeftNumber.style.display = "block";

  //   hideScreen(settingsScreen);
  //   hideScreen(itemsAdditionScreen);
  //   handleEditModeButtonClick({ game: "wrh", cursorType, clickSound, isEditing, items, resizeBoxes, isItemCollected, remainingItems, showTooltip, isTooltipOpen, btnDiv, editModeBtns, currSelectedElement, settingsScreen, btnClicks, binTooltip, binTooltipRectangle, refreshBtn });
  // });

  editModeBtn.addEventListener("click", () => {
    const itemsLeftNumber = document.getElementById("itemsLeftNumber");
  
    // Reset game state
    const blanksData = createBlanksInWords(); // Recompute blanks and set remainingItems
    itemsLeftNumber.innerHTML = remainingItems;
  
    // Reset visibility and collection state
    for (let i = 1; i < items.length; i++) {
      items[i].style.opacity = 1;
      items[i].style.display = "block";
      if (isItemCollected[i]) {
        isItemCollected[i] = false;
      }
    }
  
    btnDiv.style.display = btn.style.display = itemsLeft.style.display = itemsLeftNumber.style.display = "block";
  
    hideScreen(settingsScreen);
    hideScreen(itemsAdditionScreen);
    handleEditModeButtonClick({ game: "wrh", cursorType, clickSound, isEditing, items, resizeBoxes, isItemCollected, remainingItems, showTooltip, isTooltipOpen, btnDiv, editModeBtns, currSelectedElement, settingsScreen, btnClicks, binTooltip, binTooltipRectangle, refreshBtn });
  
    // Re-arrange word items and setup drag-and-drop
    arrangeWordItems();
    setupDragAndDrop(items, blanksData);
  });

  // refreshBtn.addEventListener("click", () => {
  //   const itemsLeftNumber = document.getElementById("itemsLeftNumber");

  //   remainingItems = items.length - 1 - delItemCount;
  //   itemsLeftNumber.innerHTML = remainingItems;

  //   // Make all items visible again
  //   for (let i = 1; i < items.length; i++) {
  //     items[i].style.opacity = 1;
  //     items[i].style.display = "block";
  //   }
  //   if (isItemCollected) {
  //     // Reset collection state of all items
  //     for (let i = 1; i < items.length; i++) {
  //       isItemCollected[i] = false;
  //     }
  //   }
  // });

  // Add Items screen
  
  refreshBtn.addEventListener("click", () => {
    const itemsLeftNumber = document.getElementById("itemsLeftNumber");
  
    clearBlanksInWords(); // Clear existing blanks first
    const blanksData = createBlanksInWords(); // Then create new blanks
    itemsLeftNumber.innerHTML = remainingItems;
  
    for (let i = 1; i < items.length; i++) {
      items[i].style.opacity = 1;
      items[i].style.display = "block";
      if (isItemCollected[i]) {
        isItemCollected[i] = false;
      }
    }
  
    arrangeWordItems();
    setupDragAndDrop(items, blanksData);
  });

  addItemsBtn.addEventListener("click", () => handleAddItemsButtonClick({ isAddingItems, itemsAdditionScreen, cleanUp: false, clickSound, settingsScreen, saveScreen }));
  itemsAdditionCloseBtn.addEventListener("click", () => handleAddItemsCloseButtonClick({ clickSound, isAddingItems, itemsAdditionScreen }));

  // Game Settings
  bgImgInput.addEventListener("change", (e) => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
    }

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
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
    }

    btnOnHandler({ showTooltip, btnOn, btnOff, btnDiv, resizeBoxes });
  });

  btnOff.addEventListener("click", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
    }

    btnOffHandler({ showTooltip, btnOff, btnOn, btnDiv, resizeBoxes });
  });

  btnBlack.addEventListener("click", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
    }

    btnBlackHandler({ btnWhite, btnBlack, btnSrc, btn });
  });

  btnWhite.addEventListener("click", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
    }

    btnWhiteHandler({ btnWhite, btnBlack, btnSrc, btn });
  });

  // Audio Upload
  for (let i = 0; i < 4; i++) {
    audioInputs[i].addEventListener("change", (e) => {
      if (areChangesSaved.value) {
        window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
        areChangesSaved.value = false;
        toggleSaveChangesBtn();
      }

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
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
    }

    handleTitleInput();
  });

  title.addEventListener("keydown", (e) => handleTitleKeyDown(e));

  description.addEventListener("input", () => {
    if (areChangesSaved.value) {
      window.parent.postMessage({ type: "unsaved changes", gameId: urlParams.get("gameid"), url: window.location.origin }, parentUrl);
      areChangesSaved.value = false;
      toggleSaveChangesBtn();
    }

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
      if (event.data.type === "game data") {
        initializeGame(event.data.gameData);
      } else if (event.data.type === "game data request") {
        saveGame(null, "game data request");
      } else if (event.data.type === "enable button") {
        areChangesSaved.value = false;
        toggleSaveChangesBtn();
      }
    } else {
      console.error("Untrusted origin:", event.origin);
    }
  });

  // Initialize the game
  // initializeGame();

  if (urlParams.get("isediting") === "true") {
    editModeBtn.click();
  }

  // Hide the edit mode button if the game is not being edited
  if (urlParams.get("isediting") === "false") editModeBtn.style.display = "none";
  else saveBtn.style.left = saveBtn.style.top = "-1000px";
}
