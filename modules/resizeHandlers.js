// ---------- //
//  RESIZING  //
// ---------- //
export const handleResizeStart = (e, params) => {
  e.preventDefault();

  console.log("Resizing started");
  // Update all Variables
  params.isResizing.value = params.allowItemResize[params.i] = true;

  for (let j = 0; j < params.allowItemResize.length; j++) {
    if (params.i !== j) params.allowItemResize[j] = false;
  }

  // Save the last mouse position
  params.resizeLastX.value = e.clientX * (1024 / targetWidth);

  // Set the cursor to the resize cursor
  document.body.style.cursor = params.direction === "TL" || params.direction === "BR" ? "nwse-resize" : "nesw-resize";

  // Update the cursor's style
  params.item.style.cursor = params.direction === "TL" || params.direction === "BR" ? "nwse-resize" : "nesw-resize";
  handleResizeDrag(e, params);

  // To avoid the image transportation bug: The image position fluctuates at the start.
  if (params.lastDirection.value === "TL") {
    if (params.direction === "BL" || params.direction === "BR") {
      params.itemDiv.style.top = `${parseFloat(params.itemDiv.style.top) - (params.item.offsetHeight + 4) * (params.resizeScale.value - 1)}px`;
    }

    if (params.direction === "TR" || params.direction === "BR") {
      params.itemDiv.style.left = `${parseFloat(params.itemDiv.style.left) - params.item.offsetWidth * (params.resizeScale.value - 1)}px`;
    }
  } else if (params.lastDirection.value === "TR") {
    if (params.direction === "TL" || params.direction === "BL") {
      params.itemDiv.style.left = `${parseFloat(params.itemDiv.style.left) + params.item.offsetWidth * (params.resizeScale.value - 1)}px`;
    }

    if (params.direction === "BL" || params.direction === "BR") {
      params.itemDiv.style.top = `${parseFloat(params.itemDiv.style.top) - (params.item.offsetHeight + 4) * (params.resizeScale.value - 1)}px`;
    }
  } else if (params.lastDirection.value === "BL") {
    if (params.direction === "TL" || params.direction === "TR") {
      params.itemDiv.style.top = `${parseFloat(params.itemDiv.style.top) + (params.item.offsetHeight + 4) * (params.resizeScale.value - 1)}px`;
    }

    if (params.direction === "TR" || params.direction === "BR") {
      params.itemDiv.style.left = `${parseFloat(params.itemDiv.style.left) - params.item.offsetWidth * (params.resizeScale.value - 1)}px`;
    }
  } else {
    if (params.direction === "TL" || params.direction === "BL") {
      params.itemDiv.style.left = `${parseFloat(params.itemDiv.style.left) + params.item.offsetWidth * (params.resizeScale.value - 1)}px`;
    }

    if (params.direction === "TL" || params.direction === "TR") {
      params.itemDiv.style.top = `${parseFloat(params.itemDiv.style.top) + (params.item.offsetHeight + 4) * (params.resizeScale.value - 1)}px`;
    }
  }

  // Add the move event listener
  document.addEventListener("mousemove", (e) => handleResizeDrag(e, params));
  document.addEventListener("mouseup", (e) => handleResizeEnd(e, params));

  params.lastDirection.value = params.direction;
};

// export const handleResizeStart = (e, params) => {
//   e.preventDefault();

//   // Log the entire params object to inspect its values
//   console.log("handleResizeStart called with params:", {
//     i: params.i,
//     direction: params.direction,
//     itemId: params.item?.id,
//     itemDivId: params.itemDiv?.id,
//     isResizing: params.isResizing.value,
//     resizeScale: params.resizeScale.value,
//     lastDirection: params.lastDirection.value
//   });

//   // Check if item and itemDiv are defined
//   if (!params.item || !params.itemDiv) {
//     console.error(`Error: item or itemDiv is undefined for index ${params.i}`);
//     return;
//   }

//   // Update all Variables
//   params.isResizing.value = params.allowItemResize[params.i] = true;

//   // Log to confirm allowItemResize updates
//   console.log(`Updated allowItemResize:`, params.allowItemResize);

//   for (let j = 0; j < params.allowItemResize.length; j++) {
//     if (params.i !== j) params.allowItemResize[j] = false;
//   }

//   // Save the last mouse position
//   params.resizeLastX.value = e.clientX * (1024 / targetWidth);

//   // Log mouse position
//   console.log(`resizeLastX set to: ${params.resizeLastX.value}`);

//   // Set the cursor to the resize cursor
//   document.body.style.cursor = params.direction === "TL" || params.direction === "BR" ? "nwse-resize" : "nesw-resize";

//   // Update the cursor's style
//   params.item.style.cursor = params.direction === "TL" || params.direction === "BR" ? "nwse-resize" : "nesw-resize";

//   // Log to confirm cursor changes
//   console.log(`Cursor set to: ${params.item.style.cursor}`);

//   handleResizeDrag(e, params);

//   // To avoid the image transportation bug: The image position fluctuates at the start.
//   if (params.lastDirection.value === "TL") {
//     console.log(`Adjusting position for lastDirection TL, direction: ${params.direction}`);
//     if (params.direction === "BL" || params.direction === "BR") {
//       params.itemDiv.style.top = `${parseFloat(params.itemDiv.style.top) - (params.item.offsetHeight + 4) * (params.resizeScale.value - 1)}px`;
//       console.log(`Updated top: ${params.itemDiv.style.top}`);
//     }
//     if (params.direction === "TR" || params.direction === "BR") {
//       params.itemDiv.style.left = `${parseFloat(params.itemDiv.style.left) - params.item.offsetWidth * (params.resizeScale.value - 1)}px`;
//       console.log(`Updated left: ${params.itemDiv.style.left}`);
//     }
//   } else if (params.lastDirection.value === "TR") {
//     console.log(`Adjusting position for lastDirection TR, direction: ${params.direction}`);
//     if (params.direction === "TL" || params.direction === "BL") {
//       params.itemDiv.style.left = `${parseFloat(params.itemDiv.style.left) + params.item.offsetWidth * (params.resizeScale.value - 1)}px`;
//       console.log(`Updated left: ${params.itemDiv.style.left}`);
//     }
//     if (params.direction === "BL" || params.direction === "BR") {
//       params.itemDiv.style.top = `${parseFloat(params.itemDiv.style.top) - (params.item.offsetHeight + 4) * (params.resizeScale.value - 1)}px`;
//       console.log(`Updated top: ${params.itemDiv.style.top}`);
//     }
//   } else if (params.lastDirection.value === "BL") {
//     console.log(`Adjusting position for lastDirection BL, direction: ${params.direction}`);
//     if (params.direction === "TL" || params.direction === "TR") {
//       params.itemDiv.style.top = `${parseFloat(params.itemDiv.style.top) + (params.item.offsetHeight + 4) * (params.resizeScale.value - 1)}px`;
//       console.log(`Updated top: ${params.itemDiv.style.top}`);
//     }
//     if (params.direction === "TR" || params.direction === "BR") {
//       params.itemDiv.style.left = `${parseFloat(params.itemDiv.style.left) - params.item.offsetWidth * (params.resizeScale.value - 1)}px`;
//       console.log(`Updated left: ${params.itemDiv.style.left}`);
//     }
//   } else {
//     console.log(`Adjusting position for lastDirection BR or undefined, direction: ${params.direction}`);
//     if (params.direction === "TL" || params.direction === "BL") {
//       params.itemDiv.style.left = `${parseFloat(params.itemDiv.style.left) + params.item.offsetWidth * (params.resizeScale.value - 1)}px`;
//       console.log(`Updated left: ${params.itemDiv.style.left}`);
//     }
//     if (params.direction === "TL" || params.direction === "TR") {
//       params.itemDiv.style.top = `${parseFloat(params.itemDiv.style.top) + (params.item.offsetHeight + 4) * (params.resizeScale.value - 1)}px`;
//       console.log(`Updated top: ${params.itemDiv.style.top}`);
//     }
//   }

//   // Add the move event listener
//   document.addEventListener("mousemove", (e) => {
//     console.log(`mousemove triggered for item ${params.item.id}`);
//     handleResizeDrag(e, params);
//   });
//   document.addEventListener("mouseup", (e) => {
//     console.log(`mouseup triggered for item ${params.item.id}`);
//     handleResizeEnd(e, params);
//   });

//   params.lastDirection.value = params.direction;

//   // Log to confirm lastDirection update
//   console.log(`lastDirection updated to: ${params.lastDirection.value}`);
// };

export const handleResizeDrag = (e, params) => {
  if (!params.allowItemResize[params.i]) return;
  e.preventDefault();

  // Mouse Coordinates
  const convertedX = e.clientX * (1024 / targetWidth);
  const convertedY = e.clientY * (1024 / targetHeight);

  // Check if the item is out of bounds
  if (convertedX < 0 || convertedX > 1024 || convertedY < 0 || convertedY > 1024) {
    handleResizeEnd(e, params);
    return;
  }

  // Calculate the new scale
  if (params.lastScales[params.i] === 1.0) params.resizeScale.value = (params.resizeLastX.value - convertedX + 100) / 100;

  if (params.direction === "TL" || params.direction === "BL") params.resizeScale.value = params.lastScales[params.i] + (params.resizeLastX.value - convertedX) / 100;
  else params.resizeScale.value = params.lastScales[params.i] - (params.resizeLastX.value - convertedX) / 100;

  // Don't allow the image to be too small
  if (params.resizeScale.value < 0.3) params.resizeScale.value = 0.3;

  // Now scale the image
  if (params.direction === "TL") params.itemDiv.style.transformOrigin = "bottom right";
  else if (params.direction === "TR") params.itemDiv.style.transformOrigin = "bottom left";
  else if (params.direction === "BL") params.itemDiv.style.transformOrigin = "top right";
  else if (params.direction === "BR") params.itemDiv.style.transformOrigin = "top left";

  params.itemDiv.style.transform = `scale(${params.resizeScale.value})`;
};

export const handleResizeEnd = (e, params) => {
  if (!params.allowItemResize[params.i]) return;
  e.preventDefault();

  // Update all variables
  params.isResizing.value = params.allowItemResize[params.i] = false;
  params.lastScales[params.i] = params.resizeScale.value;

  // Update the cursor's style
  document.body.style.cursor = "default";
  params.item.style.cursor = "move";

  // Remove the move event listener
  document.removeEventListener("mousemove", (e) => handleResizeDrag(e, params));
  document.removeEventListener("mouseup", (e) => handleResizeEnd(e, params));
};
