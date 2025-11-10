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
	if (doc.getElementsByTagName("score-braille").length) {
		openBRMFile(fileData);
	} else if (doc.getElementsByTagName("score-partwise").length) {
		dropzone = false;
		importMusicXML(doc);
	    // fileLoading = true;
	    drawNotation();
	} else if (doc.getElementsByTagName("score-timewise").length) {
		dropzone = false;
		importMusicXML(convertMusicXMLToPartwise(doc));
	    // fileLoading = true;
	    drawNotation();
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
		var docType = document.implementation.createDocumentType("score-braille", "-//TobyRush//DTD Braille Music Score 1.0//EN", "https://tobyrush.com/braillemusic/notator/dtd/braillemusic.dtd");
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

function parseData(fileData,includeText = true) {
	
	fileData = fileData.replace(/\r\n/g, "\n");  // normalize CRLF to LF
	fileData = fileData.toUpperCase();           // convert lowercase to uppercase
	
	const replacements = [
		
		// music translation
		{ regex: /\s*(?:([%<*]{1,3}|#[D-G][%<*])\s*)?((?:#[A-J][0-9])|[._]C)\b\s*$/gm, fn: convertTimeAndKeySignature, label: "initial time and key signature line" },
		{ regex: /(?<=\s)(>)([^\x27\n\r]+)(')/g, fn: convertWordPrefixPair, label: "convert prefixed & terminated words" },
		{ regex: /(?<=\s|^)(#[A-Ja-j][0-9])(?=\s|$)/g, fn: convertTimeSignature, label: "isolated time signatures" },
		{ regex: /([dDnNyY?\u024D\u0242\u0233\u0238]'*)(7#|\u022B\u0217)([a-i,\u0299-\u02A2,\u0235-\u023E]{1,3})/g, fn: convertMetronomeMarking, label: "metronome marking" },
		{ regex: /\x0D\s*(#*[A-Ja-j]+) /g, fn: convertMeasureNumbers, label: "measure numbers" },
		{ regex: /(?<=[^¥¦§¨©ª«¬­®0-9])7/g, fn: () => String.fromCharCode(155), label: "measure repeat character (preserve preceding space)" },
		{ regex: />\/l/g, chars: [662,647,676], label: "treble clef" },
		{ regex: />\+l/g, chars: [662,643,676], label: "alto clef" },
		{ regex: />\+"l/g, chars: [662,643,634,676], label: "tenor clef" },
		{ regex: />#l/g, chars: [662,635,676], label: "bass clef" },
		{ regex: /[;][Bb]/g, chars: [359,366], label: "begin slur" },
		{ regex: /[\^][2]/g, chars: [394,350], label: "end slur" },
		{ regex: /[@][Cc]/g, chars: [364,367], label: "tie" },
		{ regex: /[>][Ff][Ff][\']/g, chars: [462,570,570,239], label: "ff with terminator" },
		{ regex: /[>][Ff][\']/g, chars: [462,570,239], label: "f with terminator" },
		{ regex: /[>][Mm][Ff][\']/g, chars: [462,577,570,239], label: "mf with terminator" },
		{ regex: /[>][Mm][Pp][\']/g, chars: [462,577,580,239], label: "mp with terminator" },
		{ regex: /[>][Pp][\']/g, chars: [462,580,239], label: "p with terminator" },
		{ regex: /[>][Pp][Pp][\']/g, chars: [462,580,580,239], label: "pp with terminator" },
		{ regex: /[>][Ff][Ff]/g, chars: [462,570,570], label: "ff" },
		{ regex: /[>][Ff]/g, chars: [462,570], label: "f" },
		{ regex: /[>][Mm][Ff]/g, chars: [462,577,570], label: "mf" },
		{ regex: /[>][Mm][Pp]/g, chars: [462,577,580], label: "mp" },
		{ regex: /[>][Pp]/g, chars: [462,580], label: "p" },
		{ regex: /[>][Pp][Pp]/g, chars: [462,580,580], label: "pp" },
		{ regex: /[>][Cc][Rr][\']/g, chars: [462,567,582,239], label: "cresc." },
		{ regex: /[>][Dd][Ee][Cc][Rr][\']/g, chars: [462,568,569,567,582,239], label: "decresc." },
		{ regex: /[>][Dd][Ii][Mm][\']/g, chars: [462,568,573,577,239], label: "dim." },
		{ regex: /[>][Cc][\']/g, chars: [162,567,239], label: "begin cresc with terminator" },
		{ regex: /[>][3][\']/g, chars: [162,551,239], label: "end cresc with terminator" },
		{ regex: /[>][Dd][\']/g, chars: [162,568,239], label: "begin dim with terminator" },
		{ regex: /[>][4][\']/g, chars: [162,552,239], label: "end dim with terminator" },
		{ regex: /[>][Cc]/g, chars: [162,567], label: "begin cresc" },
		{ regex: /[>][3]/g, chars: [162,551], label: "end cresc" },
		{ regex: /[>][Dd]/g, chars: [162,568], label: "begin dim" },
		{ regex: /[>][4]/g, chars: [162,552], label: "end dim" },
		{ regex: /(?<=\s)7/g, fn: () => String.fromCharCode(155), label: "repeat measure (context-sensitive)" },
		{ regex: /[;][Cc]/g, chars: [259,67], label: "grace note slur" },
		{ regex: /[\^][<][1]/g, chars: [194,660,349], label: "read as larger notes" },
		{ regex: /[,][<][1]/g, chars: [244,660,349], label: "read as smaller notes" },
		{ regex: /["][\s]*[\n\r]/g, fn: convertBrailleMusicHyphen, label: "braille music hyphen" },
		{ regex: /([<][1])/g, chars: [660,349], label: "braille music comma" },
		{ regex: /[,][']/g, chars: [344,339], label: "music prefix" },
		// { regex: /[defghijDEFGHIJnopqrstNOPQRSTyzYZ&=(!)][']*([abklABKL1][cC]?[abklABKL1]?)/g, fn: convertFingerings, label: "fingering" },
		{ regex: /5{1,2}(?=[defghijDEFGHIJnopqrstNOPQRSTyzYZ&=(!)*<%@^,._";])/g, fn: match => String.fromCharCode(153).repeat(match.length), label: "grace note" },
		{ regex: /#([A-J,a-j]+)[mM]/g, fn: convertMultimeasureRest, label: "multimeasure rest" },
		{ regex: /[\u00F4][\u0294][\u015D][@^_".;,]?([myzMYZ&=(!)*<%@^_".;,]+|[nopqrstuNOPQRSTU*<%@^_".;,]+|[vV?:$\]\\\[Ww*<%@^_".;,]+|[xdefghijXDEFGHIJ*<%@^_".;,]+)/g, fn: convertLargeToSmall, label: "observe value signs" },
		{ regex: /[<][Kk]/g, chars: [260,175], label: "final barline" },
		{ regex: /[<][Kk][']/g, chars: [260,175,139], label: "double barline" },
		{ regex: /[myzMYZ&=(!)*<%nopqrstuNOPQRSTUvV?:$\]\\\[WwxdefghijXDEFGHIJ/\-'ů+]([#903]+)/g, fn: convertIntervalSymbols, label: "interval symbols" },
		{ regex: /[_]([0-9]+)[']/g, fn: convertTuplet, label: "tuplets" },
		// { regex: /[^A-Ja-j][2]/g, fn: convertTuplet, label: "triplet" },
		{ regex: /[_][8]/g, chars: [395,156], label: "tenuto" },
		{ regex: /[.][8]/g, chars: [346,156], label: "accent" },
		{ regex: /[;][8]/g, chars: [159,156], label: "marcato" },
		{ regex: /[<][Ll]/g, chars: [460,176], label: "fermata" },
		{ regex: /[>][1]/g, chars: [362,149], label: "caesura" },
		{ regex: /[<][']/g, chars: [760,639], label: "up bow" },
		{ regex: /[<][Bb]/g, chars: [760,66], label: "downbow" },
		{ regex: /(?<!#)6/g, fn: () => String.fromCharCode(154), label: "trill" },
		{ regex: /(?<!#)8/g, fn: match => String.fromCharCode(356), label: "staccato" },
		{ regex: /[\s]*([_\.][>][']?)/g, fn: convertHandPrefix, label: "right/left hand" },
		{ regex: /[<][>]/g, chars: [860,762], label: "in-accord" },
		{ regex: /[.][K]/g, chars: [646,375], label: "in-accord measure division" },
		{ regex: /["][1]/g, chars: [334,749], label: "partial measure in-accord" },
		{ regex: /'{3,}/g, fn: match => "ӗ".repeat(match.length), label: "leading dots" },
		{ regex: /(?<=\s);2/g, fn: () => String.fromCharCode(559, 850), label: "music suffix" },
		{ regex: /[^A-Ja-j]([7])/g, fn: convertRepeatSymbols, label: "convert any remaining repeat symbols" },
		
		// text translation
		{ regex: /#([A-Ja-j]+)/g, fn: convertBrailleLettersToNumbers, label: "convert braille numbers" },
		{ regex: /((\n|\r)+\[\s\*\*\*\*.+\*\*\*\*\s\])/g, chars: [], label: "remove textual form feed signals" },
		{ regex: /[7]([A-Za-z "]+)[7]/g, fn: convertParenthesizedText, label: "convert isolated parentheticals to text" },
		{ regex: /CREDIT-DUMP/g, chars: [], label: "remove 'credit dump' message"},
		{ regex: /[>]([a-zA-Z]+)/g, fn: convertPrefixedWord, label: "any text left flagged with the word prefix" },
	];
	
	let step = 0;
	for (const rule of replacements) {
		if (!rule.regex) continue;
		step++;
	
		// --- Apply the regex rule ---
		if (rule.fn && typeof rule.fn === "function") {
			fileData = fileData.replace(rule.regex, rule.fn);
			// if this is the time/key signature rule, record the first music line index
			if (rule.fn === convertTimeAndKeySignature && typeof window.firstMusicLineIndex === "undefined") {
				const lines = fileData.split("\n");
				for (let i = 0; i < lines.length; i++) {
					if (lines[i].match(/((?:#[A-J][0-9])|[._]C)/)) {
						window.firstMusicLineIndex = i;
						break;
					}
				}
			}
			updateScoreDisplay(fileData, rule.label);
		} else if (Array.isArray(rule.chars)) {
			const replacementString = rule.chars.length
				? String.fromCharCode(...rule.chars)
				: "";
			fileData = fileData.replace(rule.regex, replacementString);
			updateScoreDisplay(fileData, rule.label);
		}
	}
	
	if (currentBeatUnit > 2) {
		fileData = fileData.replace(/[myzMYZ&=(!)]/g, convertLargeToSmall);
		updateScoreDisplay(fileData, "whole notes");
		fileData = fileData.replace(/\s±+(?!\S)/g, match => match.replace(/±/g, "M"));
		updateScoreDisplay(fileData, "if 16th rests are alone in a measure, switch it back to a whole rest");
	}
	
    if (includeText) {
        fileData = convertTitlesToText(fileData);
		updateScoreDisplay(fileData, "titles");
        fileData = convertStrangeSequencesToText(fileData);
		updateScoreDisplay(fileData, "strange sequences");
    }
	
	fileData = fileData.replace(/Ȳ([^\n\r]*?)ț(?=\s|$)/g, '>$1ï'); // convert word prefix/terminator delimited text
	
	fileData = currentCellFont.parseLowASCII(fileData);

	delete window.firstMusicLineIndex;
	
	return fileData;
	
}

function updateScoreDisplay(fileData, label) {
	console.log(label);
	score = [[]];
	let val, row = 0, col = 0;
	for (let i = 0; i < fileData.length; i++) {
		val = fileData.charCodeAt(i);
		if (val === 13 || val === 10) {
			row++;
			col = 0;
		} else if (val === 32) {
			col++;
		} else {
			setScore(col, row, val);
			col++;
		}
	}
	drawNotation();
	//
}

function convertWordPrefixPair(fullMatch, prefix, content, terminator) {
	return String.fromCharCode(62) + convertImportedStringToText(content) + String.fromCharCode(239);
}
function convertTitlesToText(fileData) {
	let result = "";
	let titlesDone = false;
	const lines = fileData.split(String.fromCharCode(10));

	const cutoff = typeof window.firstMusicLineIndex !== "undefined"
		? window.firstMusicLineIndex
		: Infinity;

	lines.forEach(function(row, i) {
		// if we've reached or passed the detected music start line, stop converting
		if (i >= cutoff) {
			titlesDone = true;
		}

		if (!titlesDone && (
			row.match(/^ +([\u00A0\u0089\u008E]{1,3}|\u00EB[\u010C-\u010F][\u00A0\u0089\u008E]|)(#[\u00A5-\u00AE1-9]+[0-9]+|[\u0092\u00C3]\u01D3)/gu) ||
			row.match(/^[#]?[A-J]+ /g)
		)) {
			titlesDone = true;
		}

		if (titlesDone) {
			result += row + String.fromCharCode(13);
		} else {
			result += convertImportedStringToText(row) + String.fromCharCode(13);
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

	fileData = fileData.replace(/#[A-J]+4*[A-J]*/g, convertBrailleLettersToNumbers); // convert letters after pound sign to numbers
    fileData = fileData.replace(/(,?8)[A-Za-z&=(!),*<%?:$\]\\\[234567890/>"^_]/g, convertOpenQuote); // convert open quotation mark
    fileData = fileData.replace(/[A-Z />&=(!)+#*<%?:$\]\\\[.0-9](,?0)/g, convertCloseQuote); // convert close quotation mark
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

// function convertMeasureRepeats(fullString,str) {
    // return fullString.replaceAll(str,String.fromCharCode(155));
// }

// function convertTrill(fullString,trill) {
	// return fullString.replaceAll("6",String.fromCharCode(154));
// }

// function convertGraceNotes(str) {
	// return str.replaceAll("5",String.fromCharCode(153));
// }

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

// function convertStaccato(fullString,staccato) {
	// return fullString.replaceAll("8",String.fromCharCode(356));
// }

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

// function convertSixteenthRestToWholeRest(fullString, rest) {
	// return fullString.replaceAll("±","M");
// }

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
	let newKeySig = "";
	let newTimeSig = "";
	let i, val;

	// --- KEY SIGNATURE ---
	if (!keySig || keySig.length === 0) {
		newKeySig = ""; // no key signature (C major / A minor)
	} 
	else if (keySig.startsWith("#")) {
		// prefixed form: # + (D–G) + (% or < or *)
		const prefix = keySig.charCodeAt(0); // '#'
		const multiplier = keySig.charCodeAt(1); // D/E/F/G
		const accidental = keySig.charCodeAt(2); // %, <, or *

		// translate prefix (# → 235)
		newKeySig += String.fromCharCode(235);

		// translate multiplier (D–G → 268–271)
		if (multiplier >= 68 && multiplier <= 71) {
			newKeySig += String.fromCharCode(multiplier + 200);
		}

		// translate accidental
		switch (accidental) {
			case 37: // %
				newKeySig += String.fromCharCode(137); // flat
				break;
			case 60: // <
				newKeySig += String.fromCharCode(160); // sharp
				break;
			case 42: // *
				newKeySig += String.fromCharCode(142); // natural
				break;
		}
	} 
	else {
		// accidental-only form: 1–3 chars (% or < or *)
		for (i = 0; i < keySig.length; i++) {
			val = keySig.charCodeAt(i);
			if (val === 37) newKeySig += String.fromCharCode(137); // flat
			else if (val === 60) newKeySig += String.fromCharCode(160); // sharp
			else if (val === 42) newKeySig += String.fromCharCode(142); // natural
		}
	}

	// --- TIME SIGNATURE ---
	if (!timeSig || timeSig.length === 0) {
		newTimeSig = "";
	} 
	else if (timeSig.startsWith("#")) {
		// prefixed time signature: # + (A–J) + (0–9)
		const prefix = timeSig.charCodeAt(0); // #
		const upper = timeSig.charCodeAt(1);  // A–J
		const lower = timeSig.charCodeAt(2);  // 0–9

		newTimeSig += String.fromCharCode(prefix); // prefix stays #
		
		// translate upper (A–J → 165–174)
		if (upper >= 65 && upper <= 74) {
			newTimeSig += String.fromCharCode(upper + 100);
		} else {
			newTimeSig += String.fromCharCode(upper);
		}

		// lower (0–9) stays as is
		newTimeSig += String.fromCharCode(lower);

		// set beat unit based on lower number
		switch (lower) {
			case 49: currentBeatUnit = 1; break; // 1
			case 50: if (currentBeatUnit !== 32) currentBeatUnit = 2; break; // 2
			case 51: currentBeatUnit = 32; break; // 3
			case 52: currentBeatUnit = 4; break; // 4
			case 54: currentBeatUnit = 16; break; // 6
			case 56: currentBeatUnit = 8; break; // 8
		}
	} 
	else if (timeSig === ".C") { // common time
		newTimeSig = String.fromCharCode(146, 467);
		currentBeatUnit = 4;
	} 
	else if (timeSig === "_C") { // cut time
		newTimeSig = String.fromCharCode(195, 467);
		currentBeatUnit = 2;
	}

	// --- REASSEMBLE ---
	let returnString = fullMatch.replace(keySig, newKeySig).replace(timeSig, newTimeSig);
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
	let newStr = "";
	let val, lval;
	let afterNumberSign = false;

	for (let i = 0; i < str.length; i++) {
		val = str.charCodeAt(i);
		lval = val % 100;

		if (lval === 35) { // '#'
			newStr += String.fromCharCode(535);
			afterNumberSign = true;
			continue;
		}

		if (afterNumberSign) {
			// handle both internal high ASCII and plain ASCII A–J
			if ((lval > 64 && lval < 75) || (val >= 65 && val <= 74) || (val >= 97 && val <= 106)) {
				// A–J or a–j → 665–674
				const offset = (val >= 97) ? val - 32 : val; // normalize lowercase to uppercase
				newStr += String.fromCharCode(offset + 600);
				continue;
			}
		}

		newStr += String.fromCharCode(val);
		afterNumberSign = false;
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
