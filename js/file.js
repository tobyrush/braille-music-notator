/* global dropzone, drawNotation, window, reader, fileUploader, saveToUndo, suspendUndo, score, hScroll, vScroll, setScrollVars, parseOnImport, isLowASCII, setScore, cursor, scoreWidth, showPageBreaks, pageWidth, pageHeight, document, MouseEvent, currentBeatUnit, kFileNameBRF, kFileNameBRM, kPrefixAbbreviations, kWordAbbreviations, kTextAbbreviations, kCommonWords, currentFileName, shiftKeyDown: true */
/* jshint -W020 */

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
	
	// attach event handlers here...
   
	reader.readAsText(file);
	
  return false;
}

function doFileOpen(e) {
	var file = fileUploader.files[0];
    currentFileName = file.name;
	reader.readAsText(file);
}

function importData(fileData) {
	if (true) { // put up an "are you sure" dialog
		saveToUndo();
		suspendUndo = true;
		score=[[]]; // clear old data
		hScroll=0;
		vScroll=0;
		setScrollVars();
		
		if (parseOnImport && isLowASCII(fileData)) {
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
		drawNotation();
	}
}

function downloadFile(reduceASCII) {
	var getFileName;
    if (shiftKeyDown || (getFileName = window.prompt('Save file as:', currentFileName))) {
        if (!shiftKeyDown) {
            currentFileName = getFileName;
        }
        var fileString="";
        var rightMargin=scoreWidth();
        if (reduceASCII && showPageBreaks) {
            rightMargin=pageWidth-1;
        }
        for (var row=0; row<score.length; row+=1) {
            if ((typeof score[row]!=='undefined') && (score[row]!==null)) {
                for (var col=0; col<=Math.min(score[row].length,rightMargin); col+=1) {
                    if ((typeof score[row][col]!=='undefined') && (score[row][col]>0)) {
                        if (reduceASCII) {
                            fileString=fileString+String.fromCharCode(score[row][col] % 100);
                        } else {
                            fileString=fileString+String.fromCharCode(score[row][col]);
                        }
                    } else {
                        fileString=fileString+" ";
                    }
                }
                fileString=fileString+String.fromCharCode(13)+String.fromCharCode(10);
                if (reduceASCII && showPageBreaks && ((row+1) % pageHeight) === 0) {
                    fileString=fileString+String.fromCharCode(12);
                }
            } else {
                fileString=fileString+String.fromCharCode(13)+String.fromCharCode(10);
                if (reduceASCII && showPageBreaks && ((row+1) % pageHeight) === 0) {
                    fileString=fileString+String.fromCharCode(12);
                }
            }
        }

        var file=document.createElement('a');
        if (reduceASCII) {
            file.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileString));
            file.setAttribute('download', currentFileName+".brf");
        } else {
            file.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileString));
            file.setAttribute('download', currentFileName+".brm");
        }
        file.setAttribute('target', '_blank');

        var clickEvent = new MouseEvent("click", {"view": window, "bubbles": true, "cancelable": false});
        file.dispatchEvent(clickEvent);
    }


}

function parseData(fileData) {
	
	
	fileData = fileData.replace(/\s+([%<*]{1,3}|#[d-g][%<*]|)(#[A-Ia-i]+[1-9]+|[._]C)/g, convertTimeAndKeySignature); // initial time and key signature line
	fileData = fileData.replace(/[#][A-Ja-j][0-9]/g, convertTimeSignature); // isolated time signatures
	fileData = fileData.replace(/[^\n] {4,}([,;#][ -~]+)/g, convertImportedStringToText); // if line starts with more than one space then convert the line to text
	fileData = fileData.replace(/([dDnNyY?ɍɂȳȸ]'*)(7#|ȫȗ)([a-i,ʙ-ʢ,ȵ-Ⱦ]{1,3})/g, convertMetronomeMarking); // metronome marking
	fileData = fileData.replace(/[\n]\s*#*[A-Ja-j]+\b/g, convertImportedStringToText); // measure numbers
	fileData = fileData.replace(/[7]([A-Za-z "]+)[7]/g, convertParenthesizedText); // convert isolated parentheticals to text
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
	fileData = fileData.replace(/["][\s]*[\n]/g, convertBrailleMusicHyphen); // braille music hyphen
	fileData = fileData.replace(/([<][1])/g, String.fromCharCode(660,349)); // braille music comma
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
	fileData = fileData.replace(/[myzMYZ&=(!)nopqrstuNOPQRSTUvV?:$\]\\\[WwxdefghijXDEFGHIJ/\-'ů+]([#903]+)/g, convertIntervalSymbols); // interval symbols
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
	
	return fileData;
	
}

function parseText(fileData) {

    kCommonWords.forEach(function(a) {
        fileData = fileData.replaceAll(a[0],a[1]);
    });
	fileData = fileData.replace(/#[A-J]+4*[A-J]*/g, convertBrailleLettersToNumbers); // convert letters after pound sign to numbers
	fileData = fileData.replace(/[\s,]([a-zA-Z*%:?\\257890/])\s/g, convertSingleLetterWordAbbreviation); // convert text abbreviations
	fileData = fileData.replace(/(\s|^)([-23460])[A-Za-z]/g, convertSingleLetterPrefixAbbreviation); // convert text abbreviations
    fileData = fileData.replace(/(["^_.;][A-Za-z!:\\*?])/g, convertTextAbbreviation); // convert text abbreviations
	fileData = fileData.replace(/\s(,[A-Za-z!:\\*?])/g, convertTextAbbreviation); // convert text abbreviations
    fileData = fileData.replace(/\s(,[A-Za-z!:\\*?])/g, convertTextAbbreviation); // convert text abbreviations
    fileData = fileData.replace(/\s(,[A-Za-z!:\\*?])/g, convertTextAbbreviation); // convert text abbreviations
    fileData = fileData.replace(/[A-Za-z]([1-790])[A-Za-z]/g, convertMidWordNumbers); // numbers inside words are contractions
    return fileData;
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

function convertImportedStringToText(str) { 
	var newStr = "";
	var val;
	for (var i=0; i<str.length; i++) {
		val=str.charCodeAt(i);
		if ((val>96) && (val<123)) { // convert lower case to upper case
			val=val-32;
		}
		if (val == 32) {
			newStr = newStr + " ";
		} else if (val == 34) {
			newStr = newStr + String.fromCharCode(234);
		} else if (val > 32) {
			newStr = newStr + String.fromCharCode((val % 100) + 500);
		} else {
			newStr = newStr + String.fromCharCode(val);
		}
	}
	return newStr;
}

//function convertImportedStringToTextJudgily(str) { // same as convertImportedStringToText() except it refuses if it doesn't look like text
//	var newStr = convertImportedStringToText(str);
//	var numberUnrecognized = 0;
//	for (var i=0; i<newStr.length; i++) {
//		val=newStr.charCodeAt(i);
//		if ((val<65) || (val>74)) {
//			numberUnrognized += 1;
//		}
//	}
//	return newStr;
//}
//
function convertParenthesizedText(fullString,contents) {
	//return " " + String.fromCharCode(555) + convertImportedStringToText(contents) + String.fromCharCode(655) + " ";
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
