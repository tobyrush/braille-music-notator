/* global helpDialogOpen, optionsDialogOpen, fileDialogOpen, findPos, notationArea, hScrollOffset, gridWidth, hScrollUnits, vScrollOffset, gridHeight, vScrollUnits, shiftKeyDown, cursor, mouseIsDown, closeButtonCenterX, closeButtonCenterY, dialogButtonLeft, dialogButtonRight, dialogButtonTop, dialogButtonHeight, showSmallDots, setCellHeight, showPageBreaks, setPageSize, pageWidth, pageHeight, confirm, clearDocument, resetCursorAndScroll, fileUploader, downloadFile, parseFiles, drawTitle, drawNotation, updateScreenreader, window, autoScroller, autoScrollXDir, autoScrollYDir, notationWidth, notationHeight, startDragX, startDragY, vScroll, hScroll, chu, controlArea, resizeBarHeight, resizeBarDrag, resizeBarDragOrigin, container, whichKeyboard, keyboardOriginX, keyboardOriginY, keyboardCoordinates, interpretKeyCode, keyCodes, drawControls, controlHelp, keyHelp, resizeBarPosition, initializeCanvases, titleArea, titleWidth, titleHeight, toggleHelpDialog, toggleOptionsDialog, toggleFileDialog, thu, kbu, nu, kUnsavedChangesDialogMessage, currentControlModule, currentCellFont, kTitleAreaHeight, kDialogWidth: true */
/* jshint esversion: 6 */
/* jshint -W020 */


function doNotationMouseDown(e) {
  	
	var x = e.clientX-findPos(notationArea).x;
    var y = e.clientY-findPos(notationArea).y-kTitleAreaHeight;

    if (y > 0) {

        //y = y + kTitleAreaHeight+4;

        if ((!optionsDialogOpen && !fileDialogOpen) || x < kDialogWidth) {

            startDragX = Math.floor((x+hScrollOffset)/gridWidth)+hScrollUnits;
            startDragY = Math.floor((y+vScrollOffset)/gridHeight)+vScrollUnits;
            if (shiftKeyDown) {

                var currentX = startDragX;
                var currentY = startDragY;
                var prevCursorX = cursor.x;
                var prevCursorY = cursor.y;

                if (currentX<=cursor.x) {
                    cursor.x=currentX;
                    cursor.width=prevCursorX-currentX+1;
                    cursor.pinnedLeft=false;
                } else {
                        cursor.width = currentX-prevCursorX+1;
                        cursor.pinnedLeft=true;
                }

                if (currentY<=cursor.y) {
                    cursor.y=currentY;
                    cursor.height=prevCursorY-currentY+1;
                    cursor.pinnedTop=false;
                } else {
                    cursor.height = currentY-prevCursorY+1;
                    cursor.pinnedTop=true;
                }
            } else {
                cursor.x = startDragX;
                cursor.y = startDragY;
                cursor.width = 1;
                cursor.height = 1;
            }

            mouseIsDown = true;

            drawNotation();
            updateScreenreader("");

        }
    }
}

function doNotationMouseUp(e) {
	mouseIsDown = false;
	window.clearInterval(autoScroller);
	
}

function doNotationMouseMove(e) {
	if (mouseIsDown) {
		doNotationMouseDrag(e);
	}
}

function doNotationMouseDrag(e) {

	var localX = e.clientX-findPos(notationArea).x;
	var localY = e.clientY-findPos(notationArea).y-kTitleAreaHeight;
	
	var onEdge = false;
	if (localX<20) {
		autoScrollXDir = -1; // west
		onEdge = true;
	} else {
        if (localX>notationArea.clientWidth-20) {
            autoScrollXDir = 1; // east
            onEdge = true;
        } else {
            autoScrollXDir = 0;
        }
    }
	if (localY<20) {
		autoScrollYDir = -1; // north
		onEdge = true;
	} else {
        if (localY>notationArea.clientHeight-20) {
            autoScrollYDir = 1; // south
            onEdge = true;
        } else {
            autoScrollYDir = 0;
        }
    }
	
	if (onEdge) {
		autoScroller = window.setInterval(function() { autoScroll(); },1000);
	} else {
	
		var currentX = Math.floor((localX+hScrollOffset)/gridWidth)+hScrollUnits;
		var currentY = Math.floor((localY+vScrollOffset)/gridHeight)+vScrollUnits;
		
		if (currentX<=startDragX) {
			cursor.x=currentX;
			cursor.width=startDragX-currentX+1;
		} else {
			cursor.width = currentX-startDragX+1;
		}
		
		if (currentY<=startDragY) {
			cursor.y=currentY;
			cursor.height=startDragY-currentY+1;
		} else {
			cursor.height = currentY-startDragY+1;
		}
	}

	drawNotation();	
}

function doNotationMouseWheel(e) {
	var deltaX=0;
	var deltaY=0;
	var resolution=1;
	switch (e.axis) {
		case 1: // horizontal (Firefox only)
			deltaX = e.detail * resolution;
			break;
		case 2: // vertical (Firefox only)
			deltaY = e.detail * resolution;
			break;
		default: // not Firefox
			deltaX = -e.wheelDeltaX * resolution;
			deltaY = -e.wheelDeltaY * resolution;
	}
				
	vScroll = Math.max(0,vScroll + deltaY);
	hScroll = Math.max(0,hScroll + deltaX);
	
	e.preventDefault();
	
	drawNotation();
	
	return false;
}

function doControlMouseDown(e) {
	
	chu = controlArea.height/100; // controls height unit
	
	startDragY = e.clientY-findPos(controlArea).y;
	
	var x = e.clientX-findPos(controlArea).x;
	var y = e.clientY-findPos(controlArea).y-10;
	
	if (y<0) {
		resizeBarDrag = true;
		resizeBarDragOrigin = (e.clientY-findPos(container).y)-controlArea.offsetTop;
	} else {
        currentControlModule.click(x,y);
    }

    drawControls();
	
}

function doControlMouseMove(e) {
	if (e.clientY-findPos(controlArea).y<=10) {
		controlArea.style.cursor="row-resize";
	} else {
		controlArea.style.cursor="default";

		var x = e.clientX-findPos(controlArea).x;
		var y = e.clientY-findPos(controlArea).y-10;
		controlHelp = 0;

        currentControlModule.mouseOver(x,y);

		//drawControls();
	}
}
	
function doControlMouseOut(e) {
	controlArea.style.cursor="default";
}

function doWindowMouseUp(e) {
	resizeBarDrag = false;
}

function doWindowMouseMove(e) {
	if (resizeBarDrag) {
		var newY = (e.clientY-findPos(container).y)-resizeBarDragOrigin;
		var totalHeight=window.innerHeight;
		
		if (newY<(totalHeight/2)) {
			newY = totalHeight/2;
		} else if (newY>(totalHeight*0.9)) {
			newY = totalHeight*0.9;
		}
		
		notationArea.height=newY;
		controlArea.style.top=newY+"px";
		controlArea.height=totalHeight-newY-8;
		
		resizeBarPosition = newY/totalHeight;
		initializeCanvases();
        currentControlModule.updateSizes();
		drawNotation();
		drawControls();
	}
}

function autoScroll() {
	
	switch (autoScrollXDir) {
		case -1: // west
			hScroll = Math.max(0,hScroll-gridWidth);
			if (cursor.x>0) {
				cursor.x -= 1;
				cursor.width += 1;
			}
			break;
		case 1: // east
			hScroll += gridWidth;
			cursor.width += 1;
			break;
		default:
			// do nothing
	}
	switch (autoScrollYDir) {
		case -1: // north
			vScroll = Math.max(0,vScroll-gridHeight);
			if (cursor.y>0) {
				cursor.y -= 1;
				cursor.height += 1;
			}
			break;
		case 1: // south
			vScroll += gridHeight;
			cursor.height += 1;
			break;
	}
	
	drawNotation();
}
