/* global shiftKeyDown, metaKeyDown, cursor, whichKeyboard, score, clearSelection, cellIsEmpty, deleteScore, hScrollUnits, isMacOS, focusClipboard, firstCharPosInRow, hScroll, vScroll, deleteRowAtCursor, insertRowAtCursor, setScore, scoreWidth, scoreHeight, updateScreenreader, drawAllDots, downloadFile, currentBeatUnit, parseOnImport, showPageBreaks, setPageSize, pageWidth, pageHeight, confirm, clearDocument, resetCursorAndScroll, fileUploader, rotateSelection, convertSelectionToText, useBrailleDisplay, doRedo, doUndo, setCellHeight, gridHeight, saveToUndo, suspendUndo, scrollToCursor, characterName, drawNotation, drawControls, getScore, currentControlModule, kUnsavedChangesDialogMessage, kKeyCommands, formFill, placeCursor, currentCellFont, useWordWrap, lineIsEmpty, removeLastWordOfLine, octaveCharValues, pitchValues, octaveValues, findPitchAtPosition, cellValIsEmpty: true */
/* jshint -W020 */

function doKeyDown(e) {
	if (interpretKeyCode(e.keyCode)) {
		return true;
	} else {
		e.preventDefault();
		return false;
	}
}

function doKeyUp(e) {
	var passThrough = false;
	switch (e.keyCode) {
		case 16: // shift
			shiftKeyDown = false;
			passThrough = true;
			break;
		case 17: // control
			metaKeyDown = false;
			passThrough = true;
			break;
		case 91: // left command (Safari/Chrome/Opera)
		case 93: // right command (Safari/Chrome/Opera)
		case 224: // command (Firefox)
			metaKeyDown = false;
			passThrough = true;
			break;
		default:
			passThrough = true;
	}
    drawControls();
	if (passThrough) {
		return true;
	} else {
		e.preventDefault();
		return false;
	}
}

function interpretKeyCode(keyCode) {

    var i, thisRow, adv = 0;
    var readerSwitch = 0;
    var readerData = [];
    var dontScroll = false;
    var passThrough = false;
    var insertChars = false;
    if (metaKeyDown) {
        dontScroll = true;
        switch (keyCode) {
            case 16: // shift
                shiftKeyDown = true;
                passThrough = true;
                break;
            case 38: // up arrow - delete row
                deleteRowAtCursor();
                break;
            case 40: // down arrow - insert row
                insertRowAtCursor();
                break;
            case 65: // A - select all symbols
				cursor.x=0;
				cursor.y=0;
				cursor.width=scoreWidth();
				cursor.height=scoreHeight();
				break;
            case 66: // B - toggle braille translation
				currentCellFont.interpretBraille = !currentCellFont.interpretBraille;
                readerSwitch = currentCellFont.interpretBraille;
				break;
            case 67: // C - copy
				passThrough = true;
				break;
            case 68: // D - toggle small braille dots
				drawAllDots = !drawAllDots;
                readerSwitch = drawAllDots;
				break;
            case 69: // E - export file
				downloadFile(true);
                break;
            case 72: // H - toggle parse imported files
				parseOnImport = !parseOnImport;
                readerSwitch = parseOnImport;
				break;
            case 73: // I - decrease page height by 1
				if (!showPageBreaks) {
					showPageBreaks=true;
					readerSwitch = 1;
				}
				setPageSize(pageWidth,Math.max(1,pageHeight-1));
				readerData[0]=pageHeight;
                readerData[1]=pageWidth;
				break;
            case 74: // J - decrease page width by 1
				if (!showPageBreaks) {
					showPageBreaks=true;
					readerSwitch = 1;
				}
				setPageSize(Math.max(1,pageWidth-1),pageHeight);
				readerData[0]=pageHeight;
                readerData[1]=pageWidth;
				break;
            case 75: // K - increase page height by 1
				if (!showPageBreaks) {
					showPageBreaks=true;
					readerSwitch = 1;
				}
				setPageSize(pageWidth,pageHeight+1);
				readerData[0]=pageHeight;
                readerData[1]=pageWidth;
                break;
            case 76: // L - increase page width by 1
				if (!showPageBreaks) {
					showPageBreaks=true;
					readerSwitch = 1;
				}
				setPageSize(pageWidth+1,pageHeight);
				readerData[0]=pageHeight;
                readerData[1]=pageWidth;
				break;
            case 78: // N - new file
				if (confirm(kUnsavedChangesDialogMessage)) {
					clearDocument();
					resetCursorAndScroll();
				}
                break;
            case 79: // O - open file
				updateScreenreader("Open existing document.");
				if (confirm(kUnsavedChangesDialogMessage)) {
					fileUploader.click();
					resetCursorAndScroll();
				}
                break;
            case 80: // P - toggle page boundaries
				showPageBreaks = !showPageBreaks;
                readerSwitch = showPageBreaks;
				break;
            case 82: // R - rotate symbols
				rotateSelection();
                drawNotation();
				break;
            case 83: // S - save file
				downloadFile(false);
                break;
            case 84: // T - convert selection to text
				convertSelectionToText();
                break;
            case 85: // U - toggle reader mode
				useBrailleDisplay = !useBrailleDisplay;
                readerSwitch = useBrailleDisplay;
				break;
            case 86: // V - paste
				passThrough = true;
				break;
            case 88: // X - cut
				passThrough = true;
				break;
            case 89: // Y - redo
				doRedo();
				break;
            case 90: // Z - undo
				doUndo();
				break;
            case 187: // = - increase magnification by 10
				setCellHeight(gridHeight+10);
				readerData[0]=gridHeight;
				break;
            case 189: // - - decrease magnification by 10
				setCellHeight(Math.max(10,gridHeight-10));
				readerData[0]=gridHeight;
				break;
        }
        if (typeof kKeyCommands[keyCode]!=="undefined") {
            updateScreenreader(
                formFill(
                     kKeyCommands[keyCode][readerSwitch],
                     readerData
                 )
            );
        }
    } else {
        var x=cursor.x;
        var y=cursor.y;
        var w=cursor.width;
        var h=cursor.height;
        var readerText="";
        switch (keyCode) {
            case 8: // bksp
                if ((w>1) || (h>1)) {
                    clearSelection();
                    readerSwitch=1;
                } else {
                    if (!cellIsEmpty(x,y)) {
                        deleteScore(x,y);
                    } else if (x>=0) {
                        deleteScore(x-1,y);
                        placeCursor(Math.max(0,x-1),y,1,1,"Character deleted");
                    }
                    readerData[0]=y;
                    readerData[1]=x;
                }
                break;
            case 9: // tab
                if (shiftKeyDown) {
                    currentControlModule.prevPage();
                } else {
                    currentControlModule.nextPage();
                }
                passThrough = false;
                break;
            case 45: // insert
                insertChars=true;
                var butPutTheCursorBack=true;
                break;
            case 46: // delete
                clearSelection();
                for (i=y;i<y+h;i++) {
                    if (typeof score[i]!=="undefined") {
                        score[i].splice(x+hScrollUnits,w);
                    }
                }
                readerData[0]=y;
                readerData[1]=x;
                break;
            case 16: // shift
                shiftKeyDown = true;
                passThrough = true;
                dontScroll = true;
                break;
            case 17: // control
                metaKeyDown = true;
                focusClipboard();
                passThrough = true;
                dontScroll = true;
                break;
            case 91: // left command (Safari/Chrome/Opera)
            case 93: // right command (Safari/Chrome/Opera)
            case 224: // command (Firefox)
                if (isMacOS()) {
                    metaKeyDown = true;
                    focusClipboard();
                    //populateClipboard();
                }
                passThrough = true;
                dontScroll = true;
                break;
//            case 18: // alt/option
//                break;
            case 13: // enter
                if (shiftKeyDown) {
                    placeCursor(firstCharPosInRow(y),y+1,1,1,"");
                } else {
                    placeCursor(0,y+1,1,1,"");
                }
                scrollToCursor();
                break;
            case 33: // page up
                hScroll=0;
                vScroll=Math.max(vScroll-(pageHeight*gridHeight), 0);
                dontScroll=true;
                break;
            case 34: // page down
                hScroll=0;
                vScroll=vScroll+(pageHeight*gridHeight);
                dontScroll=true;
                break;
            case 36: // home
                placeCursor(0,0,1,1,"");
                hScroll=0;
                vScroll=0;
                dontScroll=true;
                break;
            case 37: // left arrow
                if (shiftKeyDown) {
                    if ((w==1 || !cursor.pinnedLeft) && x>0) {
                        placeCursor(x-1,y,w+1,h,"");
                        cursor.pinnedLeft = false;
                    } else if (w>1 && cursor.pinnedLeft) {
                        placeCursor(x,y,w-1,h,"");
                    }
                } else {
                    if (x>0) {
                        placeCursor(x-1,y,1,1,"");
                    }
                }
                break;
            case 38: // up arrow
                if (shiftKeyDown) {
                    if ((h==1 || !cursor.pinnedTop) && y>0) {
                        placeCursor(x,y-1,w,h+1,"");
                        cursor.pinnedTop = false;
                    } else if (h>1 && cursor.pinnedTop) {
                        placeCursor(x,y,w,h-1,"");
                    }
                } else {
                    if (y>0) {
                        placeCursor(x,y-1,1,1,"");
                    }
                }
                break;
            case 39: // right arrow
                if (shiftKeyDown) {
                    if (w==1 || cursor.pinnedLeft) {
                        placeCursor(x,y,w+1,h,"");
                        cursor.pinnedLeft = true;
                    } else {
                        placeCursor(x+1,y,w-1,h,"");
                    }
                } else {
                    placeCursor(x+w,y,1,1,"");
                }
                break;
            case 40: // down arrow
                if (shiftKeyDown) {
                    if (h==1 || cursor.pinnedTop) {
                        placeCursor(x,y,w,h+1,"");
                        cursor.pinnedTop = true;
                    } else {
                        placeCursor(x,y+1,w,h-1,"");
                    }
                } else {
                    placeCursor(x,y+h,1,1,"");
                }
                break;
            default:
                passThrough=false;
                currentControlModule.keyPress(keyCode);
        }
    }
    if (!dontScroll) {
        scrollToCursor();
    }
    drawNotation();
    drawControls();
	return passThrough;
}

function notate(chars,readerText) {
    var x=cursor.x;
    var y=cursor.y;
    var i,thisRow;
    if (shiftKeyDown) {
        if (typeof score[y]!=="undefined") {
            thisRow = score[y].clone(); // capture the row to displace it to the right
        }
    }
    chars.forEach(function(val,i) {
        setScore(x+i,y,val);
    });
    var adv=chars.length;
    if (shiftKeyDown && (typeof thisRow!=="undefined")) {
        thisRow.splice(0,x+hScrollUnits);
        saveToUndo();
        suspendUndo = true;
        for (i=0;i<thisRow.length;i++) {
            setScore(x+adv+i,y,thisRow[i]);
        }
        suspendUndo = false;
    }

    if (showPageBreaks && useWordWrap && x+adv>pageWidth && lineIsEmpty(y+1)) {
        if (chars.length==1 && cellValIsEmpty(chars[0])) {
            placeCursor(firstCharPosInRow(y),y+1,1,1,readerText);
        } else {
            var word = removeLastWordOfLine(y);
            var firstPitch = findFirstUnoctavatedPitch(word);
            if (firstPitch >= 0) {
                var o = octaveValues[findPitchAtPosition(score[y],score[y].length).octave];
                for (i=o.length; i>0; i--) {
                    word.splice(firstPitch,0,o[i-1]);
                }
            }
            x = firstCharPosInRow(y);
            var l = word.length;
            for (i=0; i<l; i++) {
                setScore(x+i,y+1,word[i]);
            }
            placeCursor(x+word.length,y+1,1,1,readerText);
        }
    } else {
        placeCursor(x+adv,y,1,1,readerText);
    }
}

function findFirstUnoctavatedPitch(word) {
    var l = word.length;
    for (var i=0; i<l; i++) {
        if (typeof(octaveCharValues[word[i]])==='number') {
            return -1;
        } else if (typeof(pitchValues[word[i]])==='number') {
            return i;
        }
    }
    return -1;
}
