/* global dropzone, drawNotation, window, reader, fileUploader, saveToUndo, suspendUndo, score, hScroll, vScroll, setScrollVars, parseFiles, isLowASCII, setScore, cursor, scoreWidth, showPageBreaks, pageWidth, pageHeight, document, MouseEvent, currentBeatUnit, kFileNameBRF, kFileNameBRM, kPrefixAbbreviations, kWordAbbreviations, kTextAbbreviations, kCommonWords, currentFileName, shiftKeyDown, confirm, kUnsavedChangesDialogMessage, clearDocument, resetCursorAndScroll, removeExtension, DOMParser, sendHTTPPostRequest, XMLSerializer, FormData, Blob, scoreIsEmpty, fileLoading, ipaBrailleMap: true */
/* jshint esversion: 6 */
/* jshint -W020 */
/* jshint -W100 */

function doNotationDragOver(e) {

	if (e.preventDefault) { e.preventDefault(); }
	
	return false;

}

function doNotationDragEnter(e) {

	if (e.preventDefault) { e.preventDefault(); }
	
	dropzone = true;
	
	drawNotation();
	
	return false;

}

function doNotationDragLeave(e) {

	if (e.preventDefault) { e.preventDefault(); }
	
	dropzone = false;
	
	drawNotation();
	
	return false;

}

function doNotationDrop(e) {
	e = e || window.event; // get window.event if e argument missing (in IE)   
	
	dropzone=false;
	if (e.preventDefault) { e.preventDefault(); } // stops the browser from redirecting off to the image.

	var dt = e.dataTransfer;
	var files = dt.files;
	var file = files[0];
	
	if (scoreIsEmpty() || confirm(kUnsavedChangesDialogMessage)) {
        currentFileName = removeExtension(file.name);
        reader.readAsText(file);
    }

  return false;
}

function doNewFile() {
    if (scoreIsEmpty() || confirm(kUnsavedChangesDialogMessage)) {
        clearDocument();
        drawNotation();
        resetCursorAndScroll();
    }
}

function doOpenFile() {
    if (scoreIsEmpty() || confirm(kUnsavedChangesDialogMessage)) {
        fileUploader.click();
        resetCursorAndScroll();
    }
}

function doSaveFile() {
    downloadBRMFile();
}

function doExportFile() {
    downloadFile(true);
}

function doFileLoad(e) {
	if (fileUploader.files.length) {
        var file = fileUploader.files[0];
        currentFileName = removeExtension(file.name);
        reader.readAsText(file);
        fileUploader.value="";
    }
}

function checkFileType(fileData) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(fileData, "application/xml");
    if (doc.getElementsByTagName("score-partwise").length || doc.getElementsByTagName("score-timewise").length) {
        // musicXML file detected
        dropzone = false;
        sendToBrailleMUSE(fileData);
        fileLoading = true;
        drawNotation();
	} else if (doc.getElementsByTagName("score-braille").length) {
		openBRMFile(fileData);
    } else {
        importData(fileData);
    }
}

function openBRMFile(fileData) {
	if (true) { // put up an "are you sure" dialog
		saveToUndo();
		suspendUndo = true;
		score=[[]]; // clear old data
		hScroll=0;
		vScroll=0;
		setScrollVars();
		
		var p = new DOMParser();
		var err = false;
		var xml = p.parseFromString(fileData, "application/xml");
		
		var root = xml.getElementsByTagName("score-braille");
		if (root.length) {
			var f = xml.getElementsByTagName("filename");
			if (f.length) {
				currentFileName = f[0].innerHTML;
			} else {
				err = true;
			}
			var e = xml.getElementsByTagName("settingentry")
			for (var i=0; i<e.length; i++) {
				if (e[i].getAttribute("app") == "braillemusicnotator") {
					parseSettingsString(e[i].innerHTML);
				}
			}
			var w = xml.getElementsByTagName("width");
			if (w.length) {
				pageWidth = w[0].innerHTML;
			} else {
				err = true;
			}
			var h = xml.getElementsByTagName("height");
			if (h.length) {
				pageHeight = h[0].innerHTML;
			} else {
				err = true;
			}
			var s = xml.getElementsByTagName("symbol");
			for (i=0; i<s.length; i++) {
				currentCellFont.addCellToScore(s[i].getAttribute("col"), s[i].getAttribute("row"), s[i].getAttribute("char"), s[i].getAttribute("val"));
			}
		} else {
			err = true;
		}
		
		if (err == true) {
			alert("Error loading “" + currentFileName + "”; file may be corrupted.");
			score = [[]];
		}
		
		suspendUndo = false;
		cursor.x=0;
		cursor.y=0;
		fileLoading = false;
		drawNotation();
	}
}

function parseSettingsString(s) {
	var a = s.split('|');
	for (var i=0; i<a.length; i++) {
		item = a[i].split('=');
		switch (item[0]) {
			case 'translate':
				currentCellFont.translateBraille = (item[1]=='1');
				break;
			case 'smalldots':
				showSmallDots = (item[1]=='1');
				break;
			case 'brailledisplay':
				useBrailleDisplay = (item[1]=='1');
				break;
			case 'scoresize':
				setCellHeight(item[1]*1,false);
				break;
			case 'pagebreaks':
				showPageBreaks = (item[1]=='1');
				break;
			case 'wordwrap':
				useWordWrap = (item[1]=='1');
				break;
			case 'octavesymbols':
				insertOctaveSymbols = (item[1]=='1');
				break;
			case 'keysignatures':
				observeKeySignatures = (item[1]=='1');
				break;
			case 'spelldownward':
				spellChordsDownward = (item[1]=='1');
				break;
		}
	}
}

function createSettingsString() {
	var s = 'translate=' + (currentCellFont.translateBraille ? '1' : '0') + '|' +
			'smalldots=' + (showSmallDots ? '1' : '0') + '|' +
			'brailledisplay=' + (useBrailleDisplay ? '1' : '0') + '|' +
			'scoresize=' + gridHeight + '|' +
			'pagebreaks=' + (showPageBreaks ? '1' : '0') + '|' +
			'wordwrap=' + (useWordWrap ? '1' : '0') + '|' +
			'octavesymbols=' + (insertOctaveSymbols ? '1' : '0') + '|' +
			'keysignatures=' + (observeKeySignatures ? '1' : '0') + '|' +
			'spelldownward=' + (spellChordsDownward ? '1' : '0');
	return s;
}

function importData(fileData) {
	if (true) { // put up an "are you sure" dialog
		saveToUndo();
		suspendUndo = true;
		score=[[]]; // clear old data
		hScroll=0;
		vScroll=0;
		setScrollVars();
		
		if (parseFiles && isLowASCII(fileData)) {
			fileData = parseData(fileData);
		}
		
		// if we're going to cleanse the input (turns CRs and CRLFs into LFs) then maybe use string.replaceAll()?
		// That's why I put it in utility.js but I don't know how it handles newlines
		var val, row=0, col=0;
		for (var i=0; i<fileData.length; i++) {
			val=fileData.charCodeAt(i);
			if (((val>96) && (val<123))) {
				val=val-32;
			}
			switch (val) {
				case 13:
					row++;
					col=0;
					if (fileData.charCodeAt(i+1) == 10) {
						i++;
					}
					break;
				case 10:
					row++;
					col=0;
					break;
				case 32:
					col++;
					break;
				default:
					setScore(col,row,val);
					col++;
			}
		}
		suspendUndo = false;
		cursor.x=0;
		cursor.y=0;
        fileLoading = false;
		drawNotation();
	}
}

function downloadBRMFile() {
	var getFileName;
	if (shiftKeyDown || (getFileName = window.prompt('Save file as:', removeExtension(currentFileName)+'.brm'))) {
		if (!shiftKeyDown) {
			currentFileName = getFileName;
		}
		var docType = document.implementation.createDocumentType("score-braille", "-//TobyRush//DTD Braille Music Score 0.9//EN", "https://tobyrush.com/braillemusic/notator/dtd/braillemusic.dtd");
		var doc = document.implementation.createDocument("","", docType);
		var rootElement = doc.createElement("score-braille");
		
		var filenameElement = doc.createElement("filename");
		filenameElement.innerHTML = currentFileName;
		rootElement.appendChild(filenameElement);
		
		var settingsElement = doc.createElement("settings");
		var settingEntryElement = doc.createElement("settingentry");
		settingEntryElement.setAttribute("app","braillemusicnotator");
		settingEntryElement.innerHTML = createSettingsString();
		settingsElement.appendChild(settingEntryElement);
		rootElement.appendChild(settingsElement);
		
		var pageElement = doc.createElement("page");
		var widthElement = doc.createElement("width");
		widthElement.innerHTML = pageWidth;
		pageElement.appendChild(widthElement);
		var heightElement = doc.createElement("height");
		heightElement.innerHTML = pageHeight;
		pageElement.appendChild(heightElement);
		rootElement.appendChild(pageElement);
		
		var scoreElement = doc.createElement("score");
		var rightMargin = scoreWidth();
		for (var row=0; row<score.length; row+=1) {
			if ((typeof score[row]!=='undefined') && (score[row]!==null)) {
				r = currentCellFont.getXMLFromScoreLine(score[row], row, doc);
				r.forEach((e) => scoreElement.appendChild(e));
			}
		}
		rootElement.appendChild(scoreElement);
		doc.appendChild(rootElement);
		
		var file=document.createElement('a');
		var s = new XMLSerializer();

		file.setAttribute('href', 'data:application/xml;charset=utf-8,' + s.serializeToString(doc));
		file.setAttribute('download', currentFileName);
		file.setAttribute('target', '_blank');

		var clickEvent = new MouseEvent("click", {"view": window, "bubbles": true, "cancelable": false});
		file.dispatchEvent(clickEvent);
	}
}

function downloadFile() {
	var getFileName;
    var ext = optionKeyDown ? '.dxb' : '.brf';
	if (shiftKeyDown || (getFileName = window.prompt('Save file as:', removeExtension(currentFileName)+ext))) {
        if (!shiftKeyDown) {
            currentFileName = getFileName;
        }
        var fileString="";
        var rightMargin=scoreWidth();
        if (showPageBreaks) {
            rightMargin=pageWidth-1;
        }
        for (var row=0; row<score.length; row+=1) {
            if ((typeof score[row]!=='undefined') && (score[row]!==null)) {
                for (var col=0; col<=Math.min(score[row].length,rightMargin); col+=1) {
                    if ((typeof score[row][col]!=='undefined') && (score[row][col]>0)) {
                        fileString=fileString+String.fromCharCode(score[row][col] % 100);
                    } else {
                        fileString=fileString+" ";
                    }
                }
                fileString=fileString+String.fromCharCode(13)+String.fromCharCode(10);
                if (showPageBreaks && ((row+1) % pageHeight) === 0) {
                    fileString=fileString+String.fromCharCode(12);
                }
            } else {
                fileString=fileString+String.fromCharCode(13)+String.fromCharCode(10);
                if (showPageBreaks && ((row+1) % pageHeight) === 0) {
                    fileString=fileString+String.fromCharCode(12);
                }
            }
        }

        if (optionKeyDown) {
			writeDXBFile(fileString);
		} else {
			var file=document.createElement('a');
	
        	file.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileString));
        	file.setAttribute('download', currentFileName);
        	file.setAttribute('target', '_blank');
	
        	var clickEvent = new MouseEvent("click", {"view": window, "bubbles": true, "cancelable": false});
        	file.dispatchEvent(clickEvent);
		}
    }


}

function writeDXBFile(fileData) {
	let b = [255,68,83,73,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,1,0,8,0,0,0,0,0,0,-1,-1,0,0,0,1,0,0,0,1,4,179,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,4,0,2,0,1,0,1,0,2,0,6,0,6,34,0,0,0,0,99,0,4,0,0,-1,-1,0,0,0,1,0,4,0,0,-1,-1,0,0,0,0,0,25,0,0,0,40,0,0,0,0,0,0,49,49,95,119,0,0,0,0,0,0,54,0,65,0,0,0,0,0,0,0,0,0,0,0,4,0,0,-1,-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	let a = [0,36,0,0,1,56,0,0,0,0,0,1,0,25,0,2,0,3,0,4,0,5,0,29,0,31,0,6,0,7,0,8,0,9,0,10,0,11,0,12,0,13,0,27,0,14,0,15,0,16,0,19,0,17,0,20,0,28,0,24,0,26,0,18,0,30,0,32,0,34,0,35,0,33,0,21,0,23,0,22,97,99,114,111,110,121,109,0,98,111,120,0,98,111,120,45,104,49,46,0,98,114,108,100,105,115,112,108,97,121,46,0,98,114,108,105,110,108,105,110,101,0,99,111,109,112,100,105,115,112,108,97,121,46,0,99,111,109,112,105,110,108,105,110,101,0,100,117,116,99,104,0,102,105,110,110,105,115,104,0,102,114,101,110,99,104,0,103,101,114,109,97,110,0,104,49,46,0,104,50,46,0,104,51,46,0,105,116,97,108,105,97,110,0,108,97,116,105,110,0,108,105,115,116,46,0,109,97,111,114,105,0,110,111,116,101,46,0,111,117,116,108,105,110,101,46,0,112,97,114,97,46,0,112,97,114,97,46,99,111,110,116,105,110,117,101,46,0,112,111,101,109,46,0,112,111,101,109,46,50,108,101,118,101,108,46,0,112,111,114,116,117,103,117,101,115,101,0,114,101,102,46,112,103,46,110,111,0,114,101,102,46,112,103,46,110,111,45,105,110,45,109,97,116,104,0,115,112,97,110,105,115,104,0,115,119,97,104,105,108,105,0,115,119,101,100,105,115,104,0,84,79,67,58,108,101,102,116,0,84,79,67,58,114,105,103,104,116,0,84,79,67,58,116,105,116,108,101,0,116,112,46,97,117,116,104,111,114,46,0,116,112,46,103,101,110,101,114,97,108,46,0,116,112,46,116,105,116,108,101,46,0,0,72,0,0,3,108,0,0,28,105,31,0,0,28,105,110,100,49,31,28,107,112,115,31,28,102,114,59,102,126,55,31,28,100,126,55,31,28,108,31,0,28,105,110,100,49,31,28,102,114,59,102,126,103,31,28,100,126,103,31,28,108,31,28,107,112,101,31,0,28,115,99,49,58,48,31,28,99,122,31,0,28,116,120,31,28,115,99,49,58,48,58,48,31,0,28,99,122,31,0,28,116,120,31,0,28,115,99,49,58,48,31,28,112,116,121,115,49,31,28,99,98,31,28,119,98,45,99,98,31,0,28,119,98,31,28,112,116,121,101,31,28,116,120,31,28,115,99,49,58,48,58,48,31,0,28,99,98,105,31,0,28,116,120,105,31,0,28,108,110,103,126,102,114,31,0,28,108,110,103,31,0,28,108,110,103,126,100,101,31,0,28,108,110,103,31,0,28,108,31,28,107,112,115,31,28,115,99,49,58,48,31,28,114,109,54,31,28,104,100,115,31,0,28,104,100,101,31,28,114,109,48,31,28,115,107,49,31,28,107,112,101,50,58,50,31,0,28,108,31,28,107,112,115,31,28,115,99,49,58,48,31,28,105,110,100,53,31,0,28,105,110,100,49,31,28,107,112,101,50,58,50,31,0,28,108,31,28,107,112,115,31,28,115,99,49,58,48,31,28,105,110,100,53,31,0,28,105,110,100,49,31,28,107,112,101,50,58,50,31,0,28,108,110,103,126,105,116,31,0,28,108,110,103,31,0,28,108,110,103,126,108,97,31,0,28,108,110,103,31,0,28,115,99,49,58,48,31,28,104,105,49,58,51,58,48,58,50,58,50,31,28,107,112,115,31,28,107,105,49,31,0,28,107,105,48,31,28,107,112,101,31,28,104,105,31,28,115,99,49,58,48,58,48,31,0,28,105,110,100,53,31,28,116,97,98,55,31,0,28,105,110,100,49,31,0,28,115,99,49,58,48,31,28,104,105,49,58,53,58,48,58,50,58,50,31,28,107,112,115,31,28,107,105,49,31,0,28,107,105,48,31,28,107,112,101,31,28,104,105,31,28,115,99,49,58,48,58,48,31,0,28,112,31,0,28,108,31,0,28,115,99,49,58,48,31,28,104,105,49,58,51,58,48,58,50,58,50,31,28,107,112,115,31,28,107,105,49,31,0,28,107,105,48,31,28,107,112,101,31,28,104,105,31,28,115,99,49,58,48,58,48,31,0,28,108,110,103,126,101,115,31,0,28,108,110,103,31,0,28,108,31,0,28,108,31,0,28,115,99,49,58,48,31,28,104,105,49,58,52,58,48,58,50,58,48,31,28,107,112,115,31,28,107,105,49,31,0,28,107,105,48,31,28,107,112,101,31,28,104,105,31,28,115,99,49,58,48,58,48,31,0,28,115,99,49,58,48,31,28,104,100,115,31,0,28,104,100,101,31,0,28,115,99,49,58,48,31,28,104,100,115,31,0,28,104,100,101,31,0,28,115,99,49,58,48,31,28,104,100,115,31,0,28,104,100,101,31,0,28,108,101,97,31,0,28,108,31,0,28,108,31,28,107,112,115,31,28,114,109,54,31,28,104,100,115,31,0,28,104,100,101,31,28,114,109,48,31,28,115,107,49,31,28,107,112,101,50,58,50,31,0,28,116,99,101,31,28,108,101,97,31,0,28,116,99,115,31,28,108,31,0,28,108,110,103,126,109,105,31,0,28,108,110,103,31,0,28,108,110,103,126,112,116,31,0,28,108,110,103,31,0,28,108,110,103,126,110,108,31,0,28,108,110,103,31,0,28,108,110,103,126,115,119,31,0,28,108,110,103,31,0,28,108,110,103,126,102,105,31,0,28,108,110,103,31,0,28,108,110,103,126,115,118,31,0,28,108,110,103,31,0,67,111,110,116,101,110,116,115,0,44,51,116,53,116,115,0,67,104,97,112,116,101,114,0,44,42,97,112,116,93,0,80,97,103,101,0,44,112,97,103,101,0,0];
	
	let val, d = [];
	for (let i=0; i<fileData.length; i++) {
	  val = fileData.charCodeAt(i);
	  switch (val) {
		case 13:
		  d.push(28);
		  d.push(60);
		  d.push(31);
		  if (fileData.charCodeAt(i+1) == 10) {
			i++;
		  }
		  break;
		case 10:
		  d.push(28);
		  d.push(60);
		  d.push(31);
		  break;
		default:
		  d.push(val);
	  }
	}
	let l = d.length;
	
	b[30] = (l >> 8) & 255;
	b[31] = l & 255;
	b[34] = (l >> 8) & 255;
	b[35] = l & 255;
	l += 1510;
	b[102] = (l >> 8) & 255;
	b[103] = l & 255;
		l++;
	b[112] = (l >> 8) & 255;
	b[113] = l & 255;
	b[157] = (l >> 8) & 255;
	b[158] = l & 255;
	
	let bindata = new Uint8Array(b.concat(d,a));
	
	var saveByteArray = (function () {
		var a = document.createElement("a");
		document.body.appendChild(a);
		a.style = "display: none";
		return function (data, name) {
			var blob = new Blob(data, {type: "octet/stream"}),
				url = window.URL.createObjectURL(blob);
			a.href = url;
			a.download = name;
			a.click();
			window.URL.revokeObjectURL(url);
		};
	}());
	
	saveByteArray([bindata], currentFileName);
  }


// function oldDownloadFile(reduceASCII) {
// 	var getFileName;
// 	var ext = reduceASCII ? '.brf' : '.brm';
// 	if (shiftKeyDown || (getFileName = window.prompt('Save file as:', removeExtension(currentFileName)+ext))) {
// 		if (!shiftKeyDown) {
// 			currentFileName = getFileName;
// 		}
// 		var fileString="";
// 		var rightMargin=scoreWidth();
// 		if (reduceASCII && showPageBreaks) {
// 			rightMargin=pageWidth-1;
// 		}
// 		for (var row=0; row<score.length; row+=1) {
// 			if ((typeof score[row]!=='undefined') && (score[row]!==null)) {
// 				for (var col=0; col<=Math.min(score[row].length,rightMargin); col+=1) {
// 					if ((typeof score[row][col]!=='undefined') && (score[row][col]>0)) {
// 						if (reduceASCII) {
// 							fileString=fileString+String.fromCharCode(score[row][col] % 100);
// 						} else {
// 							fileString=fileString+String.fromCharCode(score[row][col]);
// 						}
// 					} else {
// 						fileString=fileString+" ";
// 					}
// 				}
// 				fileString=fileString+String.fromCharCode(13)+String.fromCharCode(10);
// 				if (reduceASCII && showPageBreaks && ((row+1) % pageHeight) === 0) {
// 					fileString=fileString+String.fromCharCode(12);
// 				}
// 			} else {
// 				fileString=fileString+String.fromCharCode(13)+String.fromCharCode(10);
// 				if (reduceASCII && showPageBreaks && ((row+1) % pageHeight) === 0) {
// 					fileString=fileString+String.fromCharCode(12);
// 				}
// 			}
// 		}
// 
// 		var file=document.createElement('a');
// 
// 		file.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileString));
// 		file.setAttribute('download', currentFileName);
// 		file.setAttribute('target', '_blank');
// 
// 		var clickEvent = new MouseEvent("click", {"view": window, "bubbles": true, "cancelable": false});
// 		file.dispatchEvent(clickEvent);
// 	}
// 
// 
// }

function parseData(fileData,includeText = true) {
	
	
	fileData = fileData.replace(/[\r\n]+/g,String.fromCharCode(13));
    fileData = fileData.replace(/\s+([%<*]{1,3}|#[d-g][%<*]|)(#[A-Ia-i]+[1-9]+|[._]C)/g, convertTimeAndKeySignature); // initial time and key signature line
	fileData = fileData.replace(/[#][A-Ja-j][0-9]/g, convertTimeSignature); // isolated time signatures
    fileData = fileData.replace(/CREDIT-DUMP/g, ""); // remove "credit dump" message
    fileData = fileData.replace(/([dDnNyY?ɍɂȳȸ]'*)(7#|ȫȗ)([a-i,ʙ-ʢ,ȵ-Ⱦ]{1,3})/g, convertMetronomeMarking); // metronome marking
	if (includeText) {
        fileData = fileData.replace(/\x0D\s*(#*[A-Ja-j]+) /g, convertMeasureNumbers); // measure numbers
    }
	fileData = fileData.replace(/[7]([A-Za-z "]+)[7]/g, convertParenthesizedText); // convert isolated parentheticals to text
    fileData = fileData.replace(/[^¥¦§¨©ª«¬­®0-9](7)/g, convertMeasureRepeats); // measure repeat character
	fileData = fileData.replace(/>\/l/g, String.fromCharCode(662,647,676)); // treble clef
	fileData = fileData.replace(/>\+l/g, String.fromCharCode(662,643,676)); // alto clef
	fileData = fileData.replace(/>\+"l/g, String.fromCharCode(662,643,634,676)); // tenor clef
	fileData = fileData.replace(/>#l/g, String.fromCharCode(662,635,676)); // bass clef
	fileData = fileData.replace(/\ȗ([ȵ-Ⱦ]+)/g, convertBrailleLettersToNumbers); // change letters after number sign to numbers
	fileData = fileData.replace(/[\n]\s*[ȵ-Ⱦ]{1,3}/g, convertBrailleLettersToNumbers); // change small groups of letters at beginning of line to numbers
	fileData = fileData.replace(/((\n|\r)+\[\s\*\*\*\*.+\*\*\*\*\s\])/g, ""); // remove textual form feed signals
	fileData = fileData.replace(/[;][Bb]/g, String.fromCharCode(359,366)); // begin slur
	fileData = fileData.replace(/[^][2]/g, String.fromCharCode(394,350)); // end slur
	fileData = fileData.replace(/[@][Cc]/g, String.fromCharCode(364,367)); // tie
	fileData = fileData.replace(/[>][Ff][Ff][\']/g, String.fromCharCode(462,570,570,239)); // ff with terminator
	fileData = fileData.replace(/[>][Ff][\']/g, String.fromCharCode(462,570,239)); // f with terminator
	fileData = fileData.replace(/[>][Mm][Ff][\']/g, String.fromCharCode(462,577,570,239)); // mf with terminator
	fileData = fileData.replace(/[>][Mm][Pp][\']/g, String.fromCharCode(462,577,580,239)); // mp with terminator
	fileData = fileData.replace(/[>][Pp][\']/g, String.fromCharCode(462,580,239)); // p with terminator
	fileData = fileData.replace(/[>][Pp][Pp][\']/g, String.fromCharCode(462,580,580,239)); // pp with terminator
	fileData = fileData.replace(/[>][Ff][Ff]/g, String.fromCharCode(462,570,570)); // ff
	fileData = fileData.replace(/[>][Ff]/g, String.fromCharCode(462,570)); // f
	fileData = fileData.replace(/[>][Mm][Ff]/g, String.fromCharCode(462,577,570)); // mf
	fileData = fileData.replace(/[>][Mm][Pp]/g, String.fromCharCode(462,577,580)); // mp
	fileData = fileData.replace(/[>][Pp]/g, String.fromCharCode(462,580)); // p
	fileData = fileData.replace(/[>][Pp][Pp]/g, String.fromCharCode(462,580,580)); // pp
	fileData = fileData.replace(/[>][Cc][Rr][\']/g, String.fromCharCode(462,567,582,239)); // cresc.
	fileData = fileData.replace(/[>][Dd][Ee][Cc][Rr][\']/g, String.fromCharCode(462,568,569,567,582,239)); // decresc.
	fileData = fileData.replace(/[>][Dd][Ii][Mm][\']/g, String.fromCharCode(462,568,573,577,239)); // dim.
	fileData = fileData.replace(/[>][Cc][\']/g, String.fromCharCode(162,567,239)); // begin cresc with terminator
	fileData = fileData.replace(/[>][3][\']/g, String.fromCharCode(162,551,239)); // end cresc with terminator
	fileData = fileData.replace(/[>][Dd][\']/g, String.fromCharCode(162,568,239)); // begin dim with terminator
	fileData = fileData.replace(/[>][4][\']/g, String.fromCharCode(162,552,239)); // end dim with terminator
	fileData = fileData.replace(/[>][Cc]/g, String.fromCharCode(162,567)); // begin cresc
	fileData = fileData.replace(/[>][3]/g, String.fromCharCode(162,551)); // end cresc
	fileData = fileData.replace(/[>][Dd]/g, String.fromCharCode(162,568)); // begin dim
	fileData = fileData.replace(/[>][4]/g, String.fromCharCode(162,552)); // end dim
	fileData = fileData.replace(/\s[7]/g, String.fromCharCode(0,155)); // repeat measure
	fileData = fileData.replace(/[;][Cc]/g, String.fromCharCode(259,67)); // grace note slur
	
	fileData = fileData.replace(/[\^][<][1]/g, String.fromCharCode(194,660,349)); // read as larger notes
	fileData = fileData.replace(/[,][<][1]/g, String.fromCharCode(244,660,349)); // read as smaller notes
	fileData = fileData.replace(/["][\s]*[\n\r]/g, convertBrailleMusicHyphen); // braille music hyphen
	fileData = fileData.replace(/([<][1])/g, String.fromCharCode(660,349)); // braille music comma
    fileData = fileData.replace(/[,][']/g, String.fromCharCode(344,339)); // music prefix
	fileData = fileData.replace(/[defghijDEFGHIJnopqrstNOPQRSTyzYZ&=(!)][']*([abklABKL1][cC]?[abklABKL1]?)/g, convertFingerings); // fingering
	fileData = fileData.replace(/[5]{1,2}[defghijDEFGHIJnopqrstNOPQRSTyzYZ&=(!)*<%@^,._";]/g, convertGraceNotes); // grace notes
	
	
	fileData = fileData.replace(/#([A-J,a-j]+)[mM]/g, convertMultimeasureRest); // multimeasure rest
	if (currentBeatUnit > 2) {
		fileData = fileData.replace(/[myzMYZ&=(!)]/g, convertLargeToSmall); // whole notes
		fileData = fileData.replace(/\s([±]+)(?!\S)/g, convertSixteenthRestToWholeRest); // if 16th rests are alone in a measure, switch it back to a whole rest
	}
	fileData = fileData.replace(/[ô][ʔ][ŝ][@^_".;,]?([myzMYZ&=(!)*<%@^_".;,]+|[nopqrstuNOPQRSTU*<%@^_".;,]+|[vV?:$\]\\\[Ww*<%@^_".;,]+|[xdefghijXDEFGHIJ*<%@^_".;,]+)/g, convertLargeToSmall); // observe value signs
	fileData = fileData.replace(/[<][Kk]/g, String.fromCharCode(260,175)); // final barline
	fileData = fileData.replace(/[<][Kk][']/g, String.fromCharCode(260,175,139)); // double barline
	fileData = fileData.replace(/[myzMYZ&=(!)*<%nopqrstuNOPQRSTUvV?:$\]\\\[WwxdefghijXDEFGHIJ/\-'ů+]([#903]+)/g, convertIntervalSymbols); // interval symbols
	fileData = fileData.replace(/[_]([0-9]+)[']/g, convertTuplet); // tuplets
	fileData = fileData.replace(/[^A-Ja-j][2]/g, convertTuplet); // triplet
	fileData = fileData.replace(/[_][8]/g, String.fromCharCode(395,156)); // tenuto
	fileData = fileData.replace(/[.][8]/g, String.fromCharCode(346,156)); // accent
	fileData = fileData.replace(/[;][8]/g, String.fromCharCode(159,156)); // marcato
	fileData = fileData.replace(/[<][Ll]/g, String.fromCharCode(460,176)); // fermata
	fileData = fileData.replace(/[>][1]/g, String.fromCharCode(362,149)); // caesura
	fileData = fileData.replace(/[<][']/g, String.fromCharCode(760,639)); // up bow
	fileData = fileData.replace(/[<][Bb]/g, String.fromCharCode(760,66)); // down bow
	fileData = fileData.replace(/[^#].([6])/g, convertTrill); // trill
	fileData = fileData.replace(/[^#].([8])/g, convertStaccato); // staccato
	fileData = fileData.replace(/[\s]*([_\.][>][']?)/g, convertHandPrefix); // right/left hand
	fileData = fileData.replace(/[<][>]/g, String.fromCharCode(860,762)); // in-accord
	fileData = fileData.replace(/[.][K]/g, String.fromCharCode(646,375)); // in-accord measure division
	fileData = fileData.replace(/["][1]/g, String.fromCharCode(334,749)); // partial measure in-accord
	fileData = fileData.replace(/[^A-Ja-j]([7])/g, convertRepeatSymbols); // convert any remaining repeat symbols

    fileData = fileData.replace(/[>]([a-zA-Z]+)/g, convertPrefixedWord); // any text left flagged with the word prefix
	
    if (includeText) {
        fileData = convertTitlesToText(fileData);
        fileData = convertStrangeSequencesToText(fileData);
    }
	
	fileData = currentCellFont.parseLowASCII(fileData);

	return fileData;
	
}

function convertTitlesToText(fileData) {
    var result = "";
    var titlesDone = false;
    fileData.split(String.fromCharCode(13)).forEach(function(row) {
        if (!titlesDone && (
            row.match(/^ +([ ]{1,3}|ë[ČčĎď][ ]|)(#[¥-®1-9]+[0-9]+|[Ã]Ǔ)/g) ||
            row.match(/^[#]?[A-J]+ /g)
        )) {
            titlesDone = true;
        }
        if (titlesDone) {
            result = result + row + String.fromCharCode(13);
        } else {
            result = result + convertImportedStringToText(row) + String.fromCharCode(13);
        }
    });
    return result;
}

function convertStrangeSequencesToText(fileData) {
    var result = "";
    fileData.split(String.fromCharCode(13)).forEach(function(row) {
       row.split(" ").forEach(function(word) {
          result = result + checkForMusicSanity(word) + " ";
       });
        result = result + String.fromCharCode(13);
    });
    return result;
}

function checkForMusicSanity(s) {
    if (
        s.match(/#[^¥-­]/g) || // meter prefix not followed top meter number
        s.match(/[^¥-­][0-9]+/g) // bottom meter numbers not preceeded by top meter numbers
    ) {
        return convertImportedStringToText(s);
    } else {
        return s;
    }
}

function parseIPA(fileData) {
    // use ipaBrailleMap() to convert
    var s = fileData.split("");
    var i,n = "";
    s.forEach(function(t) {
        i = ipaBrailleMap[t.charCodeAt(0)];
        if (i) {
            i.forEach(function(u) {
                n = n + String.fromCharCode(u);
            });
        } else {
            n = n + t;
        }
    });

    return n;
}

function parseText(fileData) {

    kCommonWords.forEach(function(a) {
        fileData = fileData.replaceAll(a[0],a[1]);
    });
	fileData = fileData.replace(/#[A-J]+4*[A-J]*/g, convertBrailleLettersToNumbers); // convert letters after pound sign to numbers
	fileData = fileData.replace(/^([a-zA-Z*%:?\\257890/])(?=\s)/g, convertSingleLetterWordAbbreviation); // convert text abbreviations
	fileData = fileData.replace(/[\s,]([a-zA-Z*%:?\\257890/])(?=\s)/g, convertSingleLetterWordAbbreviation); // convert text abbreviations
	fileData = fileData.replace(/(\s|^)([-23460])[A-Za-z]/g, convertSingleLetterPrefixAbbreviation); // convert text abbreviations
    fileData = fileData.replace(/(["^_.;@]{1,2}[A-Za-z!:,\/\\*&%?567890<>\-])/g, convertTextAbbreviation); // convert text abbreviations
	fileData = fileData.replace(/(,[A-Za-z!:\\*?078])/g, convertTextAbbreviation); // convert text abbreviations
    fileData = fileData.replace(/(,?8)[A-Za-z&=(!),*<%?:$\]\\\[234567890/>"^_]/g, convertOpenQuote); // convert open quotation mark
    fileData = fileData.replace(/[A-Z />&=(!)+#*<%?:$\]\\\[.0-9](,?0)/g, convertCloseQuote); // convert close quotation mark
    fileData = fileData.replace(/[A-Za-z/>&=(!)+#*<%?:$\[\\\]0-9";._@^]([1-79])(\s|$)/g, convertEndOfWordNumbers); // numbers inside words are contractions
    fileData = fileData.replace(/([1-79])[A-Za-z/>&=(!)+#*<%?:$\[\\\]0-9";._@^]/g, convertMidWordNumbers); // numbers inside words are contractions
    fileData = fileData.replace(/[A-Za-z/>&=(!)+#*<%?:$\[\\\]0-9";._@^]([1-79])/g, convertMidWordNumbers); // numbers inside words are contractions
    fileData = fileData.replace(/,[/>+*<%?\-:$\]\\\[123456790]/g, convertCapitalizedContraction); // single-cell contractions preceded by the capital sign
    return fileData;
}

function convertOpenQuote(fullString,quote) {
    var r=quote.replaceAll("8",String.fromCharCode(456));
    r=r.replaceAll(",",String.fromCharCode(644));
    return fullString.replaceAll(quote,r);
}

function convertCloseQuote(fullString,quote) {
    var r=quote.replaceAll("0",String.fromCharCode(548));
    r=r.replaceAll(",",String.fromCharCode(644));
    return fullString.replaceAll(quote,r);
}

function convertCapitalizedContraction(fullString) {
    var t = fullString.charCodeAt(1);
    if (t == 45 || (t>47 && t<58)) {
        return String.fromCharCode(544,t+600);
    } else {
        return String.fromCharCode(544,t+500);
    }
}

function convertEndOfWordNumbers(fullString,nums) {
    var newString = "";
	for (var i=0; i<nums.length; i++) {
		newString = newString + String.fromCharCode(nums.charCodeAt(i)+500);
	}
	return fullString.replaceAll(nums,newString);
}

function convertMidWordNumbers(fullString,nums) {
    var newString = "";
	for (var i=0; i<nums.length; i++) {
		newString = newString + String.fromCharCode(nums.charCodeAt(i)+600);
	}
	return fullString.replaceAll(nums,newString);
}

function convertTextAbbreviation(fullString,str) {
    return fullString.replaceAll(str,kTextAbbreviations.getPropertyOrValue(str.toLowerCase(),str));
}

function convertMeasureRepeats(fullString,str) {
    return fullString.replaceAll(str,String.fromCharCode(155));
}

function convertSingleLetterPrefixAbbreviation(fullString,z,str) {
    return fullString.replaceAll(str,kPrefixAbbreviations.getPropertyOrValue(str.toLowerCase(),str));
}

function convertSingleLetterWordAbbreviation(fullString,str) {
    return fullString.replaceAll(str,kWordAbbreviations.getPropertyOrValue(str.toLowerCase(),str));
}

function convertTrill(fullString,trill) {
	return fullString.replaceAll("6",String.fromCharCode(154));
}

function convertGraceNotes(str) {
	return str.replaceAll("5",String.fromCharCode(153));
}

function convertRepeatSymbols(str) {
	return str.replaceAll("7",String.fromCharCode(155));
}

function convertTuplet(fullString,numberPart) {
	var newString = String.fromCharCode(295);
	var val;
	for (var i=0; i<numberPart.length; i++) {
		newString = newString + String.fromCharCode(numberPart.charCodeAt(i)+200);
	}
	newString = newString + String.fromCharCode(439);
	return newString;
}

function convertStaccato(fullString,staccato) {
	return fullString.replaceAll("8",String.fromCharCode(356));
}

function convertIntervalSymbols(fullString, intervals) {
	var newIntervals = "";
	var val;
	for (var i=0; i<intervals.length; i++) {
		newIntervals = newIntervals + String.fromCharCode(intervals.charCodeAt(i)+100);
	}
	return fullString.replaceAll(intervals,newIntervals);
}

function convertLargeToSmall(str) {
	var newStr = "";
	var val;
	for (var i=0; i<str.length; i++) {
		val=str.charCodeAt(i);
		if (((val>67) && (val<75)) || ((val>76) && (val<91)) || (val == 61) || (val == 40) || (val == 33) || (val == 38) || (val == 41) || (val == 63) || (val == 58) || (val == 36) || ((val > 90) && (val < 94))) {
			newStr = newStr + String.fromCharCode(val + 100);
		} else if (((val>99) && (val<107)) || ((val>108) && (val<123))) {
			newStr = newStr + String.fromCharCode(val + 68);
		} else {
			newStr = newStr + String.fromCharCode(val);	
		}
	}
	return newStr;
}

function convertSixteenthRestToWholeRest(fullString, rest) {
	return fullString.replaceAll("±","M");
}

function convertPrefixedWord(fullString, word) {
	return ">" + convertImportedStringToText(word);
}

function convertHandPrefix(str) {
	var newStr = "";
	var val;
	for (var i=0; i<str.length; i++) {
		val=str.charCodeAt(i);
		if ((val == 46) || (val == 95)) {
			newStr = newStr + String.fromCharCode(val + 400);
		} else if (val == 62) {
			newStr = newStr + String.fromCharCode(262);
		} else if (val == 39) {
			newStr = newStr + String.fromCharCode(239);
		} else {
			newStr = newStr + String.fromCharCode(val);	
		}
	}
	return newStr;
}

function convertMeasureNumbers(str) {
    var newStr = "";
    var val;
    for (var i=0; i<str.length; i++) {
        val=str.charCodeAt(i);
        if (val == 32) {
			newStr = newStr + " ";
		} else if (val == 34) {
			newStr = newStr + String.fromCharCode(234);
		} else if (val > 32) {
			newStr = newStr + String.fromCharCode((val % 100) + 600);
		} else {
			newStr = newStr + String.fromCharCode(val);
		}
    }
    return newStr;
}

function convertImportedStringToText(str) { 
	var newStr = "";
	var val;
    var pStr = parseText(str);
	for (var i=0; i<pStr.length; i++) {
		val=pStr.charCodeAt(i);
		if ((val>96) && (val<123)) { // convert lower case to upper case
			val=val-32;
		}
		if (val == 32) {
			newStr = newStr + " ";
		} else if (val == 34) {
			newStr = newStr + String.fromCharCode(234);
		} else if ((val > 32) && (val < 500)) {
			newStr = newStr + String.fromCharCode((val % 100) + 500);
		} else {
			newStr = newStr + String.fromCharCode(val);
		}
	}
	return newStr;
}

function convertParenthesizedText(fullString,contents) {
	return String.fromCharCode(555) + convertImportedStringToText(contents) + String.fromCharCode(655);
}

function convertFingerings(str) {
	var newStr = "";
	var val;
	for (var i=0; i<str.length; i++) {
		val=str.charCodeAt(i);
		if ((val == 49) || (val == 65) || (val == 66) || (val == 75) || (val == 76)) {
			newStr = newStr + String.fromCharCode(val + 400);
		} else if (val == 67) {
			newStr = newStr + String.fromCharCode(val + 700);
		} else {
			newStr = newStr + String.fromCharCode(val);
		}
	}
	return newStr;
}

function convertTimeSignature(str) {
	var newStr = "";
	var val;
	for (var i=0; i<str.length; i++) {
		val=str.charCodeAt(i);
		if ((val > 64) && (val < 75)) {
			newStr = newStr + String.fromCharCode(val + 100);
		} else {
			newStr = newStr + String.fromCharCode(val);
		}
	}
	return newStr;
}

function convertTimeAndKeySignature(fullMatch, keySig, timeSig) {

	var newKeySig = "";
	var newTimeSig = "";
    var i;
	var val;
	for (i=0; i<keySig.length; i++) {
		val=keySig.charCodeAt(i);
		if ((val == 42) || (val == 60) || (val == 37)) {
			newKeySig = newKeySig + String.fromCharCode((val % 100) + 100);
		} else {
			newKeySig = newKeySig + String.fromCharCode((val % 100) + 200);
		}
	}
	var tempTimeSig = timeSig;
	if (tempTimeSig == ".C") { currentBeatUnit = 4; }
	if (tempTimeSig == "_C") { currentBeatUnit = 2; }
	
	tempTimeSig = tempTimeSig.replaceAll(".C",String.fromCharCode(146,467));
	tempTimeSig = tempTimeSig.replaceAll("_C",String.fromCharCode(195,467));
	
	for (i=0; i<tempTimeSig.length; i++) {
		val=tempTimeSig.charCodeAt(i);
		if ((val > 64) && (val < 75)) {
			newTimeSig = newTimeSig + String.fromCharCode((val % 100) + 100);
		} else if ((val > 96) && (val < 107)) {
			newTimeSig = newTimeSig + String.fromCharCode(((val-32) % 100) + 100);
		} else {
			newTimeSig = newTimeSig + String.fromCharCode(val);
		}
		switch (val) {
			case 49: // 1
				currentBeatUnit = 1;
				break;
			case 50: // 2
				if (currentBeatUnit != 32) {
					currentBeatUnit = 2;
				}
                break;
			case 51: // 3
				currentBeatUnit = 32;
				break;
			case 52: // 4
				currentBeatUnit = 4;
				break;
			case 54: // 6
				currentBeatUnit = 16;
				break;
			case 56: // 8
				currentBeatUnit = 8;
				break;
		}	
	}
	
	var returnString = fullMatch.replaceAll(keySig,newKeySig);
	returnString = returnString.replaceAll(timeSig,newTimeSig);
	
	return returnString;
	
}

function convertMetronomeMarking(fullMatch,noteValue,equalsSign,metronomeSetting) {
	var newStr = "";
	var val, i;
	for (i=0; i<noteValue.length; i++) {
		val=noteValue.charCodeAt(i);
		newStr = newStr + String.fromCharCode(val % 100); // find note values that were converted to letters or numbers and change them back
	}
	newStr = newStr + String.fromCharCode(455,435); // equalsSign
	for (i=0; i<metronomeSetting.length; i++) {
		val=metronomeSetting.charCodeAt(i);
		if ((val>64) && (val<75)) { // convert capital letters to numbers
			newStr = newStr + String.fromCharCode(val + 600);
		} else if ((val > 96) && (val < 107)) {
			newStr = newStr + String.fromCharCode((val-32) + 600); // convert lowercase letters to numbers
		} else if ((val > 564) && (val < 575)) {
			newStr = newStr + String.fromCharCode(val + 100); // convert already-converted letters to numbers
		} else {
			newStr = newStr + String.fromCharCode(val); // leave the rest alone
		}
	}
	return newStr;
}

function convertMultimeasureRest(fullMatch,numberPart) {
	var newStr = String.fromCharCode(735);
	for (var i=0; i<numberPart.length; i++) {
		var val=numberPart.charCodeAt(i);
		if ((val>64) && (val<75)) { // convert capital letters to numbers
			newStr = newStr + String.fromCharCode(val + 600);
		} else if ((val > 96) && (val < 107)) {
			newStr = newStr + String.fromCharCode((val-32) + 600); // convert lowercase letters to numbers
		} else {
			newStr = newStr + String.fromCharCode(val); // leave the rest alone
		}
	}
	newStr = newStr + String.fromCharCode(377);
	return newStr;
}

function convertBrailleLettersToNumbers(str) {
	var newStr = "";
	var val, lval;
	for (var i=0; i<str.length; i++) {
		val=str.charCodeAt(i);
        lval = val % 100;
        if (lval>64 && lval<75) {
            newStr = newStr + String.fromCharCode(lval + 600);
        } else {
            if (lval == 35) {
                newStr = newStr + String.fromCharCode(535);
            } else {
                newStr = newStr + String.fromCharCode(val);
            }
        }
	}
	return newStr;
}

function convertBrailleMusicHyphen(str) {
	var newStr = "";
	var val;
	for (var i=0; i<str.length; i++) {
		val=str.charCodeAt(i);
		if (val==34) {
			newStr = newStr + String.fromCharCode(234);
		} else {
			newStr = newStr + String.fromCharCode(val);
		}
	}
	return newStr;
}

function getImportParameters() {

    var s = '<?xml version="1.0" encoding="UTF-8"?><param-braillemuse>' +
        '<LangType>Eng</LangType>' +
        '<ChordType>0</ChordType>' +
        '<num_measure_per_line>2</num_measure_per_line>' +
        '<NumMeasureLines></NumMeasureLines>' +
        '<page_length>' + pageHeight + '</page_length>' +
        '<page_width>' + pageWidth + '</page_width>' +
        '<octave_mark>2</octave_mark>' +
        '<BeamGroup>1</BeamGroup>' +
        '<TypeMelody>5</TypeMelody>' +
        '<PartialInAccord>100</PartialInAccord>' +
        '<fifthPoint>3</fifthPoint>' +
        '<accident_5th>1</accident_5th>' +
        '<measure_repeat>1</measure_repeat>' +
        '<measure_num>5</measure_num>' +
        '<abre_staccato>4</abre_staccato>' +
        '<slur_reconst>3</slur_reconst>' +
        '<MoveDirectionToRight>0</MoveDirectionToRight>' +
        '<rm_pedal>1</rm_pedal>' +
        '<ornament>1</ornament>' +
        '<expression_word>1</expression_word>' +
        '<clef_mark>0</clef_mark>' +
        '<multipart_selection>3</multipart_selection>' +
        '<partnumber_selection>1</partnumber_selection>' +
        '<print_header>0</print_header>' +
        '<lyric_selection>0</lyric_selection>' +
        '<harmony>0</harmony>' +
        '<transcription_notes>0</transcription_notes>' +
        '<select_part>0</select_part>' +
        '<chord_order>0</chord_order>' +
        '<titel_type>1</titel_type>' +
        '</param-braillemuse>';

    return s;

}

function sendToBrailleMUSE(xmlFile) {

    var formData = new FormData();

    var content = '' + getImportParameters();
    var blob3 = new Blob([content], { type: "text/xml"});
    formData.append("upload_p", blob3);

    content = xmlFile;
    var blob4 = new Blob([content], { type: "text/xml"});
    formData.append("upload_m", blob4, currentFileName);

    var request = new window.XMLHttpRequest();
    request.open("POST","https://www.braillemuse.net/BrailleMUSE/servlet/BrailleMuseForToby_c2",true);
    request.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01");
    request.setRequestHeader("Accept-Language","en-us");
    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            var fileData = hexToDec(this.response).split(String.fromCharCode(12))[2];
            importData(fileData);
        } else {
            // server error
        }
    };
    request.onerror = function() {
        // connection error
    };
    request.send(formData);
}

function hexToDec(val) {
    var str = '';
    for (var i = 0; i < val.length; i += 2) {
        str += String.fromCharCode(parseInt(val.substr(i, 2), 16));
    }
    return str;
}
