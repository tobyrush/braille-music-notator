/* global shiftKeyDown, metaKeyDown, cursor, whichKeyboard, score, clearSelection, cellIsEmpty, deleteScore, hScrollUnits, isMacOS, focusClipboard, firstCharPosInRow, hScroll, vScroll, deleteRowAtCursor, insertRowAtCursor, setScore, scoreWidth, scoreHeight, interpretBraille, updateScreenreader, drawAllDots, downloadFile, currentBeatUnit, parseOnImport, showPageBreaks, setPageSize, pageWidth, pageHeight, confirm, clearDocument, resetCursorAndScroll, fileUploader, rotateSelection, convertSelectionToText, useBrailleDisplay, doRedo, doUndo, setCellHeight, gridHeight, saveToUndo, suspendUndo, scrollToCursor, characterName, drawNotation, drawControls, getScore: true */
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
	if (passThrough) {
		return true;
	} else {
		e.preventDefault();
		return false;
	}
}

function interpretKeyCode(keyCode) {
  	var x=cursor.x;
	var y=cursor.y;
	var k=whichKeyboard;
	var i, adv=1;
	var passThrough=false;
	var thisRow, insertChars=shiftKeyDown;
	if (shiftKeyDown) {
		if (typeof score[y]!=="undefined") {
			thisRow = score[y].clone(); // capture the row to displace it to the right
		}
	}
	var readerMessage = "";
	var dontScroll = false;
    var prefix = "";
	switch (keyCode) {
		case 8: // bksp
			if ((cursor.width>1) || (cursor.height>1)) {
				clearSelection();
				adv=0;
			} else {
				if (!cellIsEmpty(x,y)) {
					deleteScore(x,y); adv=0;
					readerMessage = "Cleared cell at line "+y+" character "+x;
				} else if (x>=0) {
					deleteScore(x-1,y); adv=-1;
					readerMessage = "Cleared cell at line "+y+" character "+x;
				}
			}
			break;
		case 32: // space
			if (shiftKeyDown) {
				if (whichKeyboard>1) {
					whichKeyboard -= 1;
				} else {
					whichKeyboard=6;
				}
			} else {
				if (whichKeyboard<6) {
					whichKeyboard += 1;
				} else {
					whichKeyboard=1;
				}
			}
			dontScroll=true;
			readerMessage = "Keyboard "+whichKeyboard;
			adv=0;
			break;
		case 45: // insert
			insertChars=true;
			var butPutTheCursorBack=true;
			adv=0;
			readerMessage = "Inserted empty cell";
			break;
		case 46: // delete
			clearSelection();
			for (i=cursor.y;i<cursor.y+cursor.height;i++) {
				if (typeof score[i]!=="undefined") {
					score[i].splice(cursor.x+hScrollUnits,cursor.width);
				}
			}
			readerMessage = "Deleted cell at line "+(cursor.y)+" character "+(cursor.x);
			adv=0;
			break;
		case 16: // shift
			shiftKeyDown = true;
			passThrough = true;
			adv=0;
			dontScroll=true;
			readerMessage = "*";
			break;
		case 17: // control
            metaKeyDown = true;
            focusClipboard();
			adv=0;
			dontScroll=true;
			readerMessage = "*";
			passThrough = true;
            break;
		case 91: // left command (Safari/Chrome/Opera)
		case 93: // right command (Safari/Chrome/Opera)
		case 224: // command (Firefox)
			if (isMacOS()) {
				metaKeyDown = true;
				focusClipboard();
				//populateClipboard();
			}
			adv=0;
			dontScroll=true;
			passThrough = true;
			readerMessage = "*";
			break;
		case 18: // alt/option
			adv=0;
			dontScroll=true;
			readerMessage = "*";
			break;
		case 13: // enter
			cursor.y += 1;
			adv=0;
			readerMessage = "_";
			if (shiftKeyDown) {
				cursor.x = firstCharPosInRow(cursor.y-1);
			} else {
				cursor.x = 0;
			}
			break;
		case 36: // home
			cursor.x=0;
			cursor.y=0;
			hScroll=0;
			vScroll=0;
			adv=0;
			dontScroll=true;
			readerMessage = "_";
			break; 
		case 37: // left arrow
			if (shiftKeyDown) {
				if ((cursor.width==1 || !cursor.pinnedLeft) && cursor.x>0) {
					cursor.x -= 1;
					cursor.width +=1;
					cursor.pinnedLeft = false;
				} else if (cursor.width>1 && cursor.pinnedLeft) {
					cursor.width -= 1;
				}
			} else {
				cursor.width = 1;
				cursor.height = 1;
				if (cursor.x>0) { cursor.x -= 1; }
			}
			adv=0;
			readerMessage = "_";
			break;
		case 38: // up arrow
			if (shiftKeyDown) {
				if ((cursor.height==1 || !cursor.pinnedTop) && cursor.y>0) {
					cursor.y -= 1;
					cursor.height +=1;
					cursor.pinnedTop = false;
				} else if (cursor.height>1 && cursor.pinnedTop) {
					cursor.height -= 1;
				}
			} else if (metaKeyDown) {
				deleteRowAtCursor();
			} else {
				cursor.width = 1;
				cursor.height = 1;
				if (cursor.y>0) { cursor.y -= 1; }
			}
			adv=0;
			readerMessage = "_";
			break;
		case 39: // right arrow
			if (shiftKeyDown) {
				if (cursor.width==1 || cursor.pinnedLeft) {
					cursor.width += 1;
					cursor.pinnedLeft = true;
				} else {
					cursor.width -= 1;
					cursor.x += 1;
				}
			} else {
				cursor.x += cursor.width;
				cursor.width = 1;
				cursor.height = 1;
			}
			adv=0;
			readerMessage = "_";
			break;
		case 40: // down arrow
			if (shiftKeyDown) {
				if (cursor.height==1 || cursor.pinnedTop) {
					cursor.height += 1;
					cursor.pinnedTop = true;
				} else {
					cursor.height -= 1;
					cursor.y += 1;
				}
			} else if (metaKeyDown) {
				insertRowAtCursor();
			} else {
				cursor.y += cursor.height;
				cursor.width = 1;
				cursor.height = 1;
			}
			adv=0;
			readerMessage = "_";
			break;
		case 48: // 0
			if (k==1) {
				setScore(x,y,77);
			} else if (k==2) {
				setScore(x,y,177);
			} else if (k==3) {
				setScore(x,y,174);
			} else if (k==6) {
				setScore(x,y,674);
			}
			break;
		case 49: // 1
			if (k==1) {
				setScore(x,y,89);
			} else if (k==2) {
				setScore(x,y,189);
			} else if (k==3) {
				setScore(x,y,165);
			} else if (k==4) {
				setScore(x,y,356);
			} else if (k==6) {
				setScore(x,y,665);
			}
			break;
		case 50: // 2
			if (k==1) {
				setScore(x,y,90);
			} else if (k==2) {
				setScore(x,y,190);
			} else if (k==3) {
				setScore(x,y,166);
			} else if (k==4) {
				setScore(x,y,395); setScore(x+1,y,156); adv=2; readerMessage = "Tenuto";
			} else if (k==6) {
				setScore(x,y,666);
			}
			break;
		case 51: // 3
			if (k==1) {
				setScore(x,y,38);
			} else if (k==2) {
				setScore(x,y,138);
			} else if (k==3) {
				setScore(x,y,167);
			} else if (k==4) {
				setScore(x,y,346); setScore(x+1,y,156); adv=2; readerMessage = "Accent";
			} else if (k==6) {
				setScore(x,y,667);
			}
			break;
		case 52: // 4
			if (k==1) {
				setScore(x,y,61);
			} else if (k==2) {
				setScore(x,y,161);
			} else if (k==3) {
				setScore(x,y,168);
			} else if (k==4) {
				setScore(x,y,159); setScore(x+1,y,156); adv=2; readerMessage = "Marcato";
			} else if (k==6) {
				setScore(x,y,668);
			}
			break;
		case 53: // 5
			if (k==1) {
				setScore(x,y,40);
			} else if (k==2) {
				setScore(x,y,140);
			} else if (k==3) {
				setScore(x,y,169);
			} else if (k==4) {
				setScore(x,y,460); setScore(x+1,y,176); adv=2; readerMessage = "Fermata";
			} else if (k==6) {
				setScore(x,y,669);
			}
			break;
		case 54: // 6
			if (k==1) {
				setScore(x,y,33);
			} else if (k==2) {
				setScore(x,y,133);
			} else if (k==3) {
				setScore(x,y,170);
			} else if (k==4) {
				setScore(x,y,362); setScore(x+1,y,149); adv=2; readerMessage = "Pause";
			} else if (k==6) {
				setScore(x,y,670);
			}
			break;
		case 55: // 7
			if (k==1) {
				setScore(x,y,41);
			} else if (k==2) {
				setScore(x,y,141);
			} else if (k==3) {
				setScore(x,y,171);
			} else if (k==4) {
				setScore(x,y,154);
			} else if (k==6) {
				setScore(x,y,671);
			}
			break;
		case 56: // 8
			if (k==1) {
				setScore(x,y,44); setScore(x+1,y,144); adv=2; readerMessage = "Eighth octave";
			} else if (k==2) {
				setScore(x,y,45);
			} else if (k==3) {
				setScore(x,y,172);
			} else if (k==4) {
				setScore(x,y,760); setScore(x+1,y,639); adv=2; readerMessage = "Up bow";
			} else if (k==6) {
				setScore(x,y,672);
			}
			break;
		case 57: // 9
			if (k==1) {
				setScore(x,y,34);
			} else if (k==2) {
				setScore(x,y,135);
			} else if (k==3) {
				setScore(x,y,173);
			} else if (k==4) {
				setScore(x,y,760); setScore(x+1,y,66); adv=2; readerMessage = "Down bow";
			} else if (k==6) {
				setScore(x,y,673);
			}
			break;
		case 65: // A
			if (metaKeyDown) { // select all symbols
				adv=0;
				cursor.x=0;
				cursor.y=0;
				cursor.width=scoreWidth();
				cursor.height=scoreHeight();
				dontScroll=true;
				passThrough = false;
			} else {
				if (k==1) {
					setScore(x,y,63);
				} else if (k==2) {
					setScore(x,y,163);
				} else if (k==3) {
					setScore(x,y,249);
				} else if (k==4) {
					setScore(x,y,462); setScore(x+1,y,570); setScore(x+2,y,570); adv=3; readerMessage = "Fortissimo";
				} else if (k==6) {
					setScore(x,y,565);
				}
			}
			break;
		case 66: // B
			if (metaKeyDown) { // toggle braille translation
				adv=0;
				if (interpretBraille) {
					interpretBraille=false;
					updateScreenreader("Visual braille interpretation disabled.");
				} else {
					interpretBraille=true;
					updateScreenreader("Visual braille interpretation enabled.");
				}
				dontScroll=true;
				passThrough = false;
			} else {
				if (k==1) {
					setScore(x,y,72);
				} else if (k==2) {
					setScore(x,y,372);
				} else if (k==3) {
					setScore(x,y,394); setScore(x+1,y,350); adv=2; readerMessage = "End bracket slur";
				} else if (k==4) {
					setScore(x,y,452);
				} else if (k==5) {
					setScore(x,y,143);
				} else if (k==6) {
					setScore(x,y,566);
				}
			}
			break;
		case 67: // C
			if (metaKeyDown) { // copy
				adv=0;
				passThrough = true;
			} else {
				if (k==1) {
					setScore(x,y,70);
				} else if (k==2) {
					setScore(x,y,370);
				} else if (k==3) {
					setScore(x,y,67);
				} else if (k==4) {
					setScore(x,y,462); setScore(x+1,y,568); setScore(x+2,y,573); setScore(x+3,y,577); setScore(x+4,y,239); adv=5; readerMessage = "Diminuendo";
				} else if (k==5) {
					setScore(x,y,260); setScore(x+1,y,175); adv=2; readerMessage = "Final bar line";
				} else if (k==6) {
					setScore(x,y,567);
				}
			}
			break;
		case 68: // D
			if (metaKeyDown) { // toggle small braille dots
				adv=0;
				if (drawAllDots) {
					drawAllDots=false;
					updateScreenreader("Small braille dots disabled.");
				} else {
					drawAllDots=true;
					updateScreenreader("Small braille dots enabled.");
				}
				dontScroll=true;
				passThrough = false;
			} else {
				if (k==1) {
					setScore(x,y,36);
				} else if (k==2) {
					setScore(x,y,136);
				} else if (k==3) {
					setScore(x,y,251);
				} else if (k==4) {
				setScore(x,y,462); setScore(x+1,y,577); setScore(x+2,y,570); adv=3; readerMessage = "Mezzo Forte";
			} else if (k==6) {
					setScore(x,y,568);
				}
			}
			break;
		case 69: // E
			if (metaKeyDown) { // export file
				adv=0;
				downloadFile(true);
				dontScroll=true;
				updateScreenreader("File exported in embosser-ready format.");
			} else {
				if (k==1) {
					setScore(x,y,80);
				} else if (k==2) {
					setScore(x,y,180);
				} else if (k==3) {
					setScore(x,y,51);
					currentBeatUnit = 32;
				} else if (k==4) {
				setScore(x,y,476);
			} else if (k==5) {
					setScore(x,y,194); setScore(x+1,y,660); setScore(x+2,y,349); adv=3; readerMessage = "Read as larger note values";
				} else if (k==6) {
					setScore(x,y,569);
				}
			}
			break;
		case 70: // F
			if (k==1) {
				setScore(x,y,93);
			} else if (k==2) {
				setScore(x,y,193);
			} else if (k==3) {
				setScore(x,y,252);
			} else if (k==4) {
				setScore(x,y,462); setScore(x+1,y,577); setScore(x+2,y,580); adv=3; readerMessage = "Mezzo Piano";
			} else if (k==6) {
				setScore(x,y,570);
			}
			break;
		case 71: // G
			if (k==1) {
				setScore(x,y,92);
			} else if (k==2) {
				setScore(x,y,192);
			} else if (k==3) {
				setScore(x,y,253);
			} else if (k==4) {
				setScore(x,y,462); setScore(x+1,y,580); adv=2; readerMessage = "Piano";
			} else if (k==6) {
				setScore(x,y,571);
			}
			break;
		case 72: // H
			if (metaKeyDown) { // toggle parse imported files
				adv=0;
				if (parseOnImport) {
					parseOnImport=false;
					updateScreenreader("Parsing of imported documents disabled.");
				} else {
					parseOnImport=true;
					updateScreenreader("Parsing of imported documents enabled.");
				}
				dontScroll=true;
				passThrough = false;
			} else {
				if (k==1) {
					setScore(x,y,91);
				} else if (k==2) {
					setScore(x,y,191);
				} else if (k==3) {
					setScore(x,y,254);
				} else if (k==4) {
					setScore(x,y,462); setScore(x+1,y,580); setScore(x+2,y,580); adv=3; readerMessage = "Pianissimo";
				} else if (k==6) {
					setScore(x,y,572);
				}
			}
			break;
		case 73: // I
			if (metaKeyDown) { // decrease page height by 1
				adv=0;
				if (!showPageBreaks) {
					showPageBreaks=true;
					prefix = "Page boundaries visible. ";
				}
				setPageSize(pageWidth,Math.max(1,pageHeight-1));
				updateScreenreader(prefix+"Page height reduced. Height "+pageHeight+", width "+pageWidth);
				dontScroll=true;
				passThrough=false;
			} else {
				if (k==1) {
					setScore(x,y,44);
				} else if (k==2) {
					setScore(x,y,151);
				} else if (k==3) {
					setScore(x,y,56);
					currentBeatUnit = 8; // if you're writing x/128 then you are a bad person and you should feel bad
				} else if (k==5) {
					setScore(x,y,646); setScore(x+1,y,675); adv=2; readerMessage = "In-accord measure division";
				} else if (k==6) {
					setScore(x,y,573);
				}
			}
			break;
		case 74: // J
			if (metaKeyDown) { // decrease page width by 1
				adv=0;
				if (!showPageBreaks) {
					showPageBreaks=true;
					prefix = "Page boundaries visible. ";
				}
				setPageSize(Math.max(1,pageWidth-1),pageHeight);
				updateScreenreader(prefix+"Page width reduced. Height "+pageHeight+", width "+pageWidth);
				dontScroll=true;
				passThrough=false;
			} else {
				if (k==1) {
					setScore(x,y,87);
				} else if (k==2) {
					setScore(x,y,187);
				} else if (k==3) {
					setScore(x,y,255);
				} else if (k==6) {
					setScore(x,y,574);
				}
			}
			break;
		case 75: // K
			if (metaKeyDown) { // increase page height by 1
				adv=0;
				if (!showPageBreaks) {
					showPageBreaks=true;
					prefix = "Page boundaries visible. ";
				}
				setPageSize(pageWidth,pageHeight+1);
				updateScreenreader(prefix+"Page height increased. Height "+pageHeight+", width "+pageWidth);
				dontScroll=true;
				passThrough=false;
			} else {
				if (k==1) {
					setScore(x,y,59);
				} else if (k==2) {
					setScore(x,y,148);
				} else if (k==3) {
					setScore(x,y,256);
				} else if (k==4) {
					setScore(x,y,162); setScore(x+1,y,567); adv=2; readerMessage = "Begin crescendo";
				} else if (k==6) {
					setScore(x,y,575);
				}
			}
			break;
		case 76: // L
			if (metaKeyDown) { // increase page width by 1
				adv=0;
				if (!showPageBreaks) {
					showPageBreaks=true;
					prefix = "Page boundaries visible. ";
				}
				setPageSize(pageWidth+1,pageHeight);
				updateScreenreader(prefix+"Page width increased. Height "+pageHeight+", width "+pageWidth);
				dontScroll=true;
				passThrough=false;
			} else {
				if (k==1) {
					setScore(x,y,94);
				} else if (k==2) {
					setScore(x,y,47);
				} else if (k==3) {
					setScore(x,y,257);
				} else if (k==4) {
					setScore(x,y,162); setScore(x+1,y,551); adv=2; readerMessage = "End crescendo";
				} else if (k==6) {
					setScore(x,y,576);
				}
			}
			break;
		case 77: // M
			if (k==1) {
				setScore(x,y,74);
			} else if (k==2) {
				setScore(x,y,374);
			} else if (k==3) {
				setScore(x,y,268);
			} else if (k==4) {
				setScore(x,y,448);
			} else if (k==5) {
				setScore(x,y,134); setScore(x+1,y,243); adv=2; readerMessage = "Play section indicator";
			} else if (k==6) {
				setScore(x,y,577);
			}
			break;
		case 78: // N
			if (metaKeyDown) { // new file
				adv=0;
				updateScreenreader("New document.");
				if (confirm("Any unsaved changes will be lost. Are you sure you want to continue?")) {
					clearDocument();
					resetCursorAndScroll();
					dontScroll=true;
				}
			} else {
				if (k==1) {
					setScore(x,y,73);
				} else if (k==2) {
					setScore(x,y,373);
				} else if (k==3) {
					setScore(x,y,235);
				} else if (k==4) {
                    setScore(x,y,452); setScore(x+1,y,849); adv=2; readerMessage = "Half diminished";
                } else if (k==5) {
					setScore(x,y,242);
				} else if (k==6) {
					setScore(x,y,578);
				}
			}
			break;
		case 79: // O
			if (metaKeyDown) { // open file
				adv=0;
				updateScreenreader("Open existing document.");
				if (confirm("Any unsaved changes will be lost. Are you sure you want to continue?")) {
					fileUploader.click();
					resetCursorAndScroll();
					dontScroll=true;
				}
			} else {
				if (k==1) {
					setScore(x,y,95);
				} else if (k==2) {
					setScore(x,y,43);
				} else if (k==3) {
					setScore(x,y,57); // no
				} else if (k==5) {
					setScore(x,y,334); setScore(x+1,y,749); adv=2; readerMessage = "Partial measure in-accord";
				} else if (k==6) {
					setScore(x,y,579);
				}
			}
			break;
		case 80: // P
			if (metaKeyDown) { // toggle page boundaries
				adv=0;
				if (showPageBreaks) {
					showPageBreaks=false;
					updateScreenreader("Page boundaries hidden.");
				} else {
					showPageBreaks=true;
					updateScreenreader("Page boundaries visible.");
				}
				dontScroll=true;
				passThrough = false;
			} else {
				if (k==1) {
					setScore(x,y,85);
				} else if (k==2) {
					setScore(x,y,185);
				} else if (k==3) {
					setScore(x,y,48); // WHY DO YOU HATE AMERICA
				} else if (k==4) {
					setScore(x,y,662); setScore(x+1,y,747); setScore(x+2,y,676); adv=3; readerMessage = "Treble clef";
				} else if (k==6) {
					setScore(x,y,580);
				}
			}
			break;
		case 81: // Q
			if (k==1) {
				setScore(x,y,78);
			} else if (k==2) {
				setScore(x,y,178);
			} else if (k==3) {
				setScore(x,y,49);
				currentBeatUnit = 1; // if it's 16, the 6 will set it (if it's 128, you shouldn't be writing music)
			} else if (k==4) {
				setScore(x,y,465);
			} else if (k==5) {
				setScore(x,y,344); setScore(x+1,y,339); adv=2; readerMessage = "Music prefix";
			} else if (k==6) {
				setScore(x,y,581);
			}
			break;
		case 82: // R
			if (metaKeyDown) { // rotate symbols (cycle through symbol meanings)
				adv=0;
				rotateSelection();
				passThrough=false;
			} else {
				if (k==1) {
					setScore(x,y,81);
				} else if (k==2) {
					setScore(x,y,181);
				} else if (k==3) {
					setScore(x,y,52);
					if (currentBeatUnit != 64) {
						currentBeatUnit = 4;
					}
				} else if (k==4) {
				setScore(x,y,449);
			} else if (k==5) {
					setScore(x,y,244); setScore(x+1,y,660); setScore(x+2,y,349); adv=3; readerMessage = "Read as smaller note values";
				} else if (k==6) {
					setScore(x,y,582);
				}
			}
			break;
		case 83: // S
			if (metaKeyDown) { // save file
				adv=0;
				downloadFile(false);
				dontScroll=true;
				updateScreenreader("File saved.");
			} else {
				if (k==1) {
					setScore(x,y,58);
				} else if (k==2) {
					setScore(x,y,158);
				} else if (k==3) {
					setScore(x,y,250);
				} else if (k==4) {
					setScore(x,y,462); setScore(x+1,y,570); adv=2; readerMessage = "Forte";
				} else if (k==6) {
					setScore(x,y,583);
				}
			}
			break;
		case 84: // T
			if (metaKeyDown) { // convert selection to text
				adv=0;
				convertSelectionToText();
				passThrough=false;
			} else {
				if (k==1) {
					setScore(x,y,82);
				} else if (k==2) {
					setScore(x,y,182);
				} else if (k==3) {
					setScore(x,y,53); // why are you using this? ಠ_ಠ
				} else if (k==4) {
					setScore(x,y,475);
				} else if (k==5) {
					setScore(x,y,446); setScore(x+1,y,262); adv=2; readerMessage = "Right hand";
				} else if (k==6) {
					setScore(x,y,584);
				}
			}
			break;
		case 85: // U
			if (metaKeyDown) { // toggle reader mode
				adv=0;
				if (useBrailleDisplay) {
					useBrailleDisplay=false;
					updateScreenreader("Accessible output set to screen reader mode.");
				} else {
					useBrailleDisplay=true;
					updateScreenreader("Accessible output set to refreshable braille display mode.");
				}
				dontScroll=true;
				passThrough = false;
			} else {
				if (k==1) {
					setScore(x,y,84);
				} else if (k==2) {
					setScore(x,y,184);
				} else if (k==3) {
					setScore(x,y,55); // why are you using this? ಠ_ಠ
				} else if (k==5) {
					setScore(x,y,860); setScore(x+1,y,762); adv=2; readerMessage = "Full measure in-accord";
				} else if (k==6) {
					setScore(x,y,585);
				}
			}
			break;
		case 86: // V
			if (metaKeyDown) { // paste
				adv=0;
				passThrough = true;
			} else {
				if (k==1) {
					setScore(x,y,71);
				} else if (k==2) {
					setScore(x,y,371);
				} else if (k==3) {
					setScore(x,y,359); setScore(x+1,y,366); adv=2; readerMessage = "Begin bracket slur";
				} else if (k==4) {
					setScore(x,y,343);
				} else if (k==5) {
					setScore(x,y,155);
				} else if (k==6) {
					setScore(x,y,586);
				}
			}
			break;
		case 87: // W
			if (k==1) {
				setScore(x,y,79);
			} else if (k==2) {
				setScore(x,y,179);
			} else if (k==3) {
				setScore(x,y,50);
				if (currentBeatUnit != 32) {
					currentBeatUnit = 2;
				}
			} else if (k==4) {
				setScore(x,y,466);
			} else if (k==5) {
				setScore(x,y,62);
			} else if (k==6) {
				setScore(x,y,587);
			}
			break;
		case 88: // X
			if (metaKeyDown) { // cut
				adv=0;
				passThrough = true;
			} else {
				if (k==1) {
					setScore(x,y,69);
				} else if (k==2) {
					setScore(x,y,369);
				} else if (k==3) {
					setScore(x,y,439);
				} else if (k==4) {
					setScore(x,y,462); setScore(x+1,y,568); setScore(x+2,y,569); setScore(x+3,y,567); setScore(x+4,y,582); setScore(x+5,y,239); adv=6; readerMessage = "Decrescendo";
				} else if (k==5) {
					setScore(x,y,260); setScore(x+1,y,175); setScore(x+2,y,139); adv=3; readerMessage = "Double bar line";
				} else if (k==6) {
					setScore(x,y,588);
				}
			}
			break;
		case 89: // Y
			if (metaKeyDown) { // redo
				doRedo();
				dontScroll=true;
				adv=0;
			} else {
				if (k==1) {
					setScore(x,y,83);
				} else if (k==2) {
					setScore(x,y,183);
				} else if (k==3) {
					setScore(x,y,54);
					currentBeatUnit = 64;
				} else if (k==4) {
					setScore(x,y,767);
				} else if (k==5) {
					setScore(x,y,495); setScore(x+1,y,262); adv=2; readerMessage = "Left hand";
				} else if (k==6) {
					setScore(x,y,589);
				}
			}
			break;
		case 90: // Z
			if (metaKeyDown) { // undo
				doUndo();
				dontScroll=true;
				adv=0;
			} else {
				if (k==1) {
					setScore(x,y,68);
				} else if (k==2) {
					setScore(x,y,368);
				} else if (k==3) {
					setScore(x,y,295);
				} else if (k==4) {
					setScore(x,y,462); setScore(x+1,y,567); setScore(x+2,y,582); setScore(x+3,y,239); adv=4; readerMessage = "Crescendo";
				} else if (k==5) {
					setScore(x,y,76);
				} else if (k==6) {
					setScore(x,y,590);
				}
			}
			break;
		case 186: // ;
			if (k==1) {
				setScore(x,y,86);
			} else if (k==2) {
				setScore(x,y,186);
			} else if (k==3) {
				setScore(x,y,248);
			} else if (k==4) {
				setScore(x,y,162); setScore(x+1,y,568); adv=2; readerMessage = "Begin diminuendo";
			} else if (k==6) {
				setScore(x,y,550);
			}
			break;
		case 187: // =
			if (metaKeyDown) { // increase magnification by 10
				adv=0;
				setCellHeight(gridHeight+10);
				updateScreenreader("Magnification increased to "+gridHeight);
				dontScroll=true;
				passThrough=false;
			} else {
				if (k==1) {
					if (isAfterDynamic(x,y)) {
						setScore(x,y,239); setScore(x+1,y,37); setScore(x+2,y,337); adv=3; readerMessage = "Double sharp";
					} else {
						setScore(x,y,37); setScore(x+1,y,337); adv=3; readerMessage = "Double sharp";
					}
				} else if (k==2) {
					if (isAfterDynamic(x,y)) {
						setScore(x,y,239); setScore(x+1,y,37); setScore(x+2,y,337); adv=3; readerMessage = "Double sharp";
					} else {
						setScore(x,y,37); setScore(x+1,y,337); adv=3; readerMessage = "Double sharp";
					}
				} else if (k==3) {
					setScore(x,y,195); setScore(x+1,y,467); adv=2; readerMessage = "Cut time";
				} else if (k==4) {
					setScore(x,y,377);
				} else if (k==5) {
					setScore(x,y,455); setScore(x+1,y,435); adv=2; readerMessage = "Metronome marking equals";
				} else if (k==6) {
					setScore(x,y,535);
				}
			}
			break;
		case 188: // ,
			if (k==1) {
				setScore(x,y,46);
			} else if (k==2) {
				setScore(x,y,157);
			} else if (k==3) {
				setScore(x,y,269);
			} else if (k==5) {
				setScore(x,y,335);
			} else if (k==6) {
				setScore(x,y,549);
			}
			break;
		case 189: // -
			if (metaKeyDown) { // decrease magnification by 10
				adv=0;
				setCellHeight(Math.max(10,gridHeight-10));
				updateScreenreader("Magnification decreased to "+gridHeight);
				dontScroll=true;
				passThrough=false;
			} else {
				if (k==1) {
					if (isAfterDynamic(x,y)) {
						setScore(x,y,239); setScore(x+1,y,60); setScore(x+2,y,360); adv=3; readerMessage = "Double flat";
					} else {
						setScore(x,y,60); setScore(x+1,y,360); adv=2; readerMessage = "Double flat";
					}
				} else if (k==2) {
					if (isAfterDynamic(x,y)) {
						setScore(x,y,239); setScore(x+1,y,60); setScore(x+2,y,360); adv=3; readerMessage = "Double flat";
					} else {
						setScore(x,y,60); setScore(x+1,y,360); adv=2; readerMessage = "Double flat";
					}
				} else if (k==3) {
					setScore(x,y,146); setScore(x+1,y,467); adv=2; readerMessage = "Common time";
				} else if (k==4) {
					setScore(x,y,735);
				} else if (k==6) {
					setScore(x,y,545);
				}
			}
			break;
		case 190: // .
			if (k==1) {
				setScore(x,y,64);
			} else if (k==2) {
				setScore(x,y,364); setScore(x+1,y,367); adv=2; readerMessage = "Tie";
			} else if (k==3) {
				setScore(x,y,270);
			} else if (k==5) {
				setScore(x,y,234);
			} else if (k==6) {
				setScore(x,y,552);
			}
			break;
		case 191: // /
			if (k==1) {
				setScore(x,y,64); setScore(x+1,y,164); adv=2; readerMessage = "Octave zero";
			} else if (k==2) {
				setScore(x,y,153);
			} else if (k==3) {
				setScore(x,y,271);
			} else if (k==5) {
				setScore(x,y,660); setScore(x+1,y,349); adv=2; readerMessage = "Braille music comma";
			} else if (k==6) {
				setScore(x,y,556);
			}
			break;
		case 192: // `
			if (k==1) {
				setScore(x,y,39);
			} else if (k==2) {
				setScore(x,y,39);
			} else if (k==3) {
				setScore(x,y,35);
			} else if (k==6) {
				setScore(x,y,554);
			}
			break;
		case 219: // [
			if (k==1) {
				if (isAfterDynamic(x,y)) {
					setScore(x,y,239); setScore(x+1,y,60); adv=2;
				} else {
					setScore(x,y,60);
				}
			} else if (k==2) {
				if (isAfterDynamic(x,y)) {
					setScore(x,y,239); setScore(x+1,y,60); adv=2;
				} else {
					setScore(x,y,60);
				}
			} else if (k==3) {
				setScore(x,y,160);
			} else if (k==4) {
				setScore(x,y,662); setScore(x+1,y,643); setScore(x+2,y,676); adv=3; readerMessage = "Alto clef";
			} else if (k==6) {
				setScore(x,y,555);
			}
			break;
		case 220: // \
			if (k==1) {
				if (isAfterDynamic(x,y)) {
					setScore(x,y,239); setScore(x+1,y,42); adv=2;
				} else {
					setScore(x,y,42);
				}
			} else if (k==2) {
				if (isAfterDynamic(x,y)) {
					setScore(x,y,239); setScore(x+1,y,42); adv=2;
				} else {
					setScore(x,y,42);
				}
			} else if (k==3) {
				setScore(x,y,142);
			} else if (k==4) {
				setScore(x,y,662); setScore(x+1,y,635); setScore(x+2,y,676); adv=3; readerMessage = "Bass clef";
			} else if (k==6) {
				setScore(x,y,551);
			}
			break;
		case 221: // ]
			if (k==1) {
				if (isAfterDynamic(x,y)) {
					setScore(x,y,239); setScore(x+1,y,37); adv=2;
				} else {
					setScore(x,y,37);
				}
			} else if (k==2) {
				if (isAfterDynamic(x,y)) {
					setScore(x,y,239); setScore(x+1,y,37); adv=2;
				} else {
					setScore(x,y,37);
				}
			} else if (k==3) {
				setScore(x,y,137);
			} else if (k==4) {
				setScore(x,y,662); setScore(x+1,y,643); setScore(x+2,y,634); setScore(x+3,y,676); adv=4; readerMessage = "Tenor clef";
			} else if (k==6) {
				setScore(x,y,655);
			}
			break;
		case 222: // '
			if (k==1) {
				setScore(x,y,88);
			} else if (k==2) {
				setScore(x,y,188);
			} else if (k==3) {
				setScore(x,y,150);
			} else if (k==4) {
				setScore(x,y,162); setScore(x+1,y,552); adv=2; readerMessage = "End diminuendo";
			} else if (k==6) {
				setScore(x,y,539);
			}
			break;
		
	}
	if (insertChars && (typeof thisRow!=="undefined")) {
		thisRow.splice(0,x+hScrollUnits);
		saveToUndo();
		suspendUndo = true;
		for (i=0;i<thisRow.length;i++) {
			setScore(x+adv+i,y,thisRow[i]);
		}
		if (butPutTheCursorBack) {
			cursor.x -= 1;
		}
		suspendUndo = false;
	}
	cursor.x += adv;
	if (!dontScroll) {
		scrollToCursor();
	}
	switch (readerMessage) {
		case "*":
			break; // no reader update
		case "_":
			updateScreenreader("");
			break;
		case "":
			if ((typeof score[y]!=="undefined") && (score[y]!==null) && (typeof score[y][x]!=="undefined")) {
				updateScreenreader(characterName(score[y][x],-1,-1)); // note that x still has previous value (before cursor.x += adv)
			}
			break;
		default:
			updateScreenreader(readerMessage);
	}
	drawNotation();
	drawControls();
	
	return passThrough;
}

function isAfterDynamic(x,y) {
	var prevChar = 0;
	var result = false;
	if (x>1) {
		prevChar = getScore(x-1,y);
	}
	if ((prevChar == 567) || (prevChar == 551) || (prevChar == 568) || (prevChar == 552) || (prevChar == 570) || (prevChar == 580)) {
		result = true;
	}
	return result;
}

//function interpretEditFieldKeypress(e) {
//	if (e.keyCode==9 || e.keyCode==13) { // tab(9) or enter(13)
//		editFieldCallback.call();
//		hideEditField();
//		e.preventDefault();
//		return true;
//	} else {
//		return false;
//	}
//}
