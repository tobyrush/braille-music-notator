/* global shiftKeyDown, metaKeyDown, cursor, whichKeyboard, score, clearSelection, cellIsEmpty, deleteScore, hScrollUnits, isMacOS, focusClipboard, firstCharPosInRow, hScroll, vScroll, deleteRowAtCursor, insertRowAtCursor, setScore, scoreWidth, scoreHeight, updateScreenreader, showSmallDots, downloadFile, currentBeatUnit, parseFiles, showPageBreaks, setPageSize, pageWidth, pageHeight, confirm, clearDocument, resetCursorAndScroll, fileUploader, rotateSelection, convertSelectionToText, useBrailleDisplay, doRedo, doUndo, setCellHeight, gridHeight, saveToUndo, suspendUndo, scrollToCursor, characterName, drawNotation, drawControls, getScore, currentControlModule, kUnsavedChangesDialogMessage, kKeyCommands, formFill, placeCursor, currentCellFont, useWordWrap, lineIsEmpty, removeLastWordOfLine, octaveCharValues, pitchValues, octaveValues, findPitchAtPosition, cellValIsEmpty, isAccidental, dialogFieldFocus, document, setNodeSelectedValue, insertOctaveSymbols, spellChordsDownward, rotateControlModule, observeKeySignatures, convertSelectionToMusic, speaker: true */
/* jshint esversion: 6 */
/* jshint -W020 */

function doKeyDown(e) {
	if (dialogFieldFocus || interpretKeyCode(e)) {
		return true;
	} else {
		e.preventDefault();
		return false;
	}
}

function doKeyUp(e) {
	var passThrough = false;
	switch (e.code) {
		case "ShiftLeft":
        case "ShiftRight":
			shiftKeyDown = false;
			passThrough = true;
			break;
		case "ControlLeft":
        case "ControlRight":
			metaKeyDown = false;
			passThrough = true;
			break;
		case "MetaLeft":
		case "MetaRight":
			metaKeyDown = false;
			passThrough = true;
			break;
		default:
			passThrough = true;
	}
    drawControls();
	if (dialogFieldFocus || passThrough) {
		return true;
	} else {
		e.preventDefault();
		return false;
	}
}

function doWindowBlur(e) {
    shiftKeyDown = false;
    metaKeyDown = false;
    drawControls();
    saveToUndo();
    return true;
}

function interpretKeyCode(e) {

    var i, thisRow, adv = 0;
    var readerSwitch = 0;
    var readerData = [];
    var dontScroll = false;
    var passThrough = false;
    var insertChars = false;
    if (metaKeyDown) {
        dontScroll = true;
        switch (e.keyCode) {
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
            case 49: // 1 - toggle screen reader
                if (speaker.mute) {
                    speaker.unmuteSound();
                } else {
                    speaker.muteSound();
                }
                break;
            case 50: // 2 - reduce screen reader tempo
                speaker.decreaseRate();
                break;
            case 51: // 3 - increase screen reader tempo
                speaker.increaseRate();
                break;
            case 52: // 4 - previous screen reader voice
                speaker.previousVoice();
                break;
            case 53: // 5 - next screen reader voice
                speaker.nextVoice();
                break;
            case 56: // 8 - toggle insert octave symbols
				insertOctaveSymbols = !insertOctaveSymbols;
                setNodeSelectedValue(
                    document.querySelector("#insertOctaveSymbolsCheckbox"),
                    insertOctaveSymbols
                );
                readerSwitch = insertOctaveSymbols;
				break;
            case 57: // 9 - toggle observe key signatures
				observeKeySignatures = !observeKeySignatures;
                setNodeSelectedValue(
                    document.querySelector("#observeKeySignaturesCheckbox"),
                    observeKeySignatures
                );
                readerSwitch = observeKeySignatures;
				break;
            case 48: // 0 - toggle interval direction
				spellChordsDownward = !spellChordsDownward;
                setNodeSelectedValue(
                    document.querySelector("#spellChordsDownwardCheckbox"),
                    spellChordsDownward
                );
                drawControls();
                readerSwitch = spellChordsDownward;
				break;
            case 65: // A - select all symbols
				cursor.x=0;
				cursor.y=0;
				cursor.width=scoreWidth();
				cursor.height=scoreHeight();
				break;
            case 66: // B - toggle braille translation
				currentCellFont.translateBraille = !currentCellFont.translateBraille;
                setNodeSelectedValue(
                    document.querySelector("#translateBrailleCheckbox"),
                    currentCellFont.translateBraille
                );
                readerSwitch = currentCellFont.translateBraille;
				break;
            case 67: // C - copy
				passThrough = true;
				break;
            case 68: // D - toggle small braille dots
				showSmallDots = !showSmallDots;
                setNodeSelectedValue(
                    document.querySelector("#showSmallDotsCheckbox"),
                    showSmallDots
                );
                readerSwitch = showSmallDots;
				break;
            case 69: // E - export file
				downloadFile(true);
                break;
            case 72: // H - toggle parse imported files
				parseFiles = !parseFiles;
                setNodeSelectedValue(
                    document.querySelector("#parseFilesCheckbox"),
                    parseFiles
                );
                readerSwitch = parseFiles;
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
                setNodeSelectedValue(
                    document.querySelector("#showPageBreaksCheckbox"),
                    showPageBreaks
                );
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
				if (shiftKeyDown) {
                    convertSelectionToMusic();
                } else {
                    convertSelectionToText();
                }
                break;
            case 85: // U - toggle reader mode
				useBrailleDisplay = !useBrailleDisplay;
                setNodeSelectedValue(
                    document.querySelector("#useBrailleDisplayCheckbox"),
                    useBrailleDisplay
                );
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
            case 188: // , - toggle word wrap
				useWordWrap = !useWordWrap;
                setNodeSelectedValue(
                    document.querySelector("#useWordWrap"),
                    useWordWrap
                );
                readerSwitch = useWordWrap;
				break;
            case 189: // - - decrease magnification by 10
				setCellHeight(Math.max(10,gridHeight-10));
				readerData[0]=gridHeight;
				break;
            case 192: // ` - rotate controls
				rotateControlModule();
				break;
            case 220: // \ - insert character prompt
                showInsertSymbolDialog();
                break;
        }
        if (typeof kKeyCommands[e.keyCode]!=="undefined") {
            updateScreenreader(
                formFill(
                     kKeyCommands[e.keyCode][readerSwitch*1],
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
        switch (e.code) {
            case "Backspace":
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
            case "Tab":
                if (shiftKeyDown) {
                    currentControlModule.prevPage();
                } else {
                    currentControlModule.nextPage();
                }
                passThrough = false;
                break;
            case "Insert":
                insertChars=true;
                var butPutTheCursorBack=true;
                break;
            case "Delete":
                clearSelection();
                for (i=y;i<y+h;i++) {
                    if (typeof score[i]!=="undefined") {
                        score[i].splice(x+hScrollUnits,w);
                    }
                }
                readerData[0]=y;
                readerData[1]=x;
                break;
            case "ShiftLeft":
            case "ShiftRight":
                shiftKeyDown = true;
                passThrough = true;
                dontScroll = true;
                break;
            case "ControlLeft":
            case "ControlRight":
                metaKeyDown = true;
                focusClipboard();
                passThrough = true;
                dontScroll = true;
                break;
            case "MetaLeft":
            case "MetaRight":
            case "OSLeft":
            case "OSRight":
                if (isMacOS()) {
                    metaKeyDown = true;
                    focusClipboard();
                    //populateClipboard();
                }
                passThrough = true;
                dontScroll = true;
                break;
//            case "AltLeft":
//            case "AltRight:"
//                break;
            case "Enter":
                if (shiftKeyDown) {
                    placeCursor(firstCharPosInRow(y),y+1,1,1,"");
                } else {
                    placeCursor(0,y+1,1,1,"");
                }
                scrollToCursor();
                break;
            case "PageUp":
                hScroll=0;
                vScroll=Math.max(vScroll-(pageHeight*gridHeight), 0);
                dontScroll=true;
                break;
            case "PageDown":
                hScroll=0;
                vScroll=vScroll+(pageHeight*gridHeight);
                dontScroll=true;
                break;
            case "Home":
                placeCursor(0,0,1,1,"");
                hScroll=0;
                vScroll=0;
                dontScroll=true;
                break;
            case "ArrowLeft":
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
            case "ArrowUp":
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
            case "ArrowRight":
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
            case "ArrowDown":
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
                currentControlModule.keyPress(e.code);
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
                if (o) {
                    for (i=o.length; i>0; i--) {
                        word.splice(firstPitch,0,o[i-1]);
                    }
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
        } else if (typeof(pitchValues[word[i]])==='number' ||
                   (isAccidental(word[i]) && typeof(pitchValues[word[i+1]])==='number') ||
                   (isAccidental(word[i]) && isAccidental(word[i+1]) && typeof(pitchValues[word[i+2]])==='number')
                  ) {
            return i;
        }
    }
    return -1;
}
