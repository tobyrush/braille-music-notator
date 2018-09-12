/* global navigator, saveToUndo, suspendUndo, cursor, deleteScore, whichKeyboard, parseOnImport, parseData, setScore, drawNotation, clipboardArea, score, rotateChar, convertToText, document, gridWidth, gridHeight, unicodeBrailleMap: true */
/* jshint -W020, -W084 */

function findPos(obj) { // from http://www.quirksmode.org/js/findpos.html
	var curLeft = 0, curTop = 0;
	if (obj.offsetParent) {
		do {
			curLeft += obj.offsetLeft;
			curTop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return { x: curLeft, y: curTop};
}

function arrayHasOwnIndex(array, prop) { // by T.J. Crowder, from http://stackoverflow.com/questions/9329446/for-each-in-an-array-how-to-do-that-in-javascript
    return array.hasOwnProperty(prop) && /^0$|^[1-9]\d*$/.test(prop) && prop <= 4294967294; // 2^32 - 2
}

function debug(msg) {
	//document.getElementById("debug").innerHTML=msg;
}

function isMacOS() {
	return (navigator.appVersion.indexOf("Mac") != -1);
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	/**
	 * Draws a rounded rectangle using the current state of the canvas. 
	 * If you omit the last three params, it will draw a rectangle 
	 * outline with a 5 pixel border radius 
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Number} x The top left x coordinate
	 * @param {Number} y The top left y coordinate 
	 * @param {Number} width The width of the rectangle 
	 * @param {Number} height The height of the rectangle
	 * @param {Number} radius The corner radius. Defaults to 5;
	 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
	 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
	 */
	 
	 /* by Juan Mendes: http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas */
	 
	if (typeof stroke == "undefined" ) {
		stroke = true;
	}
	if (typeof radius === "undefined") {
		radius = 5;
	}
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
	if (stroke) {
		ctx.stroke();
	}
	if (fill) {
		ctx.fill();
	}        
}

String.prototype.replaceAll = function(str1, str2, ignore) // by "qwerty" on http://dumpsite.com/forum/index.php?topic=4.msg8#msg8
{
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};

Array.prototype.clone = function() { // by "meouw" and "michael667" on http://stackoverflow.com/questions/2294703/multidimensional-array-cloning-using-javascript
    var arr = this.slice(0);
    for( var i = 0; i < this.length; i++ ) {
        if( this[i] && this[i].clone ) {
            //recursion
            arr[i] = this[i].clone();
        }
    }
    return arr;
};

function clearSelection() {
	saveToUndo();
	suspendUndo = true;
	for (var row=cursor.y;row<cursor.y+cursor.height;row++) {
		for (var col=cursor.x;col<cursor.x+cursor.width;col++) {
			deleteScore(col,row);
		}
	}
	suspendUndo = false;
}

function handleClipboard(e) {
	switch (e.type) {
		case "copy":
			e.clipboardData.setData('text',getCurrentSelection());
			e.preventDefault();
			break;
		case "cut":
			e.clipboardData.setData('text',getCurrentSelection());
			clearSelection();
			e.preventDefault();
			break;
		case "paste":
			saveToUndo();
			suspendUndo = true;
			// if we're going to cleanse the input (turns CRs and CRLFs into LFs) then maybe use string.replaceAll()?
			// That's why I put it in utility.js but I don't know how it handles newlines
			var i,val;
            var col=cursor.x;
			var row=cursor.y;
			var clipboardData=e.clipboardData.getData('text/plain');
			var convertToText = (whichKeyboard==6);
			if (clipboardData==="") {
				clearSelection();
			} else {
				var newString="";
				for (i=0; i<clipboardData.length; i++) {
					val=clipboardData.charCodeAt(i);
					if ((val>=10240) && (val<=10303)) { // unicode braille
						val=UnicodeBrailleToASCIIBraille(val);
					}
					newString = newString + String.fromCharCode(val);
				}
				
				clipboardData = newString;
				
				if ((!convertToText) && (parseOnImport) && isLowASCII(clipboardData)) {
					clipboardData = parseData(clipboardData);
				}
				
				for (i=0; i<clipboardData.length; i++) {
					val=clipboardData.charCodeAt(i);
					switch (val) {
						case 13:
							row++;
							col=cursor.x;
							if (clipboardData.charCodeAt(i+1) == 10) {
								i++;
							}
							break;
						case 10:
							row++;
							col=cursor.x;
							break;
						case 32:
							deleteScore(col,row);
							col++;
							break;
						default:
							if (convertToText && val<100) {
								setScore(col,row,val+500);
							} else {
								setScore(col,row,val);
							}
							col++;
					}
				}
			}
			suspendUndo = false;
			break;
	}
	drawNotation();
}

function focusClipboard() {
	clipboardArea.value=" ";
	clipboardArea.focus();
	clipboardArea.select();
}

function getCurrentSelection() {
	var clipping="";
	for (var row=cursor.y;row<cursor.y+cursor.height;row++) {
		for (var col=cursor.x;col<cursor.x+cursor.width;col++) {
			if ((typeof score[row]==='undefined') || (typeof score[row][col]==='undefined')) {
				clipping=clipping+" ";
			} else {
				clipping=clipping+String.fromCharCode(score[row][col]);
			}
		}
		clipping=clipping+String.fromCharCode(13)+String.fromCharCode(10);
	}
	return clipping;
}

function rotateSelection() {
	for (var row=cursor.y;row<cursor.y+cursor.height;row++) {
		for (var col=cursor.x;col<cursor.x+cursor.width;col++) {
			rotateChar(col,row);
		}
	}
}

function convertSelectionToText() {
	for (var row=cursor.y;row<cursor.y+cursor.height;row++) {
		for (var col=cursor.x;col<cursor.x+cursor.width;col++) {
			convertToText(col,row);
		}
	}
}

function createCookie(name,value,days) { // from http://www.quirksmode.org/js/cookies.html
	var expires;
    if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		expires = "; expires="+date.toGMTString();
	}
	else expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) { // from http://www.quirksmode.org/js/cookies.html
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) { // from http://www.quirksmode.org/js/cookies.html
	createCookie(name,"",-1);
}

function clearClipboard() {
	clipboardArea.value = "";
	clipboardArea.blur();
}

function gw(val) {
	return gridWidth*val;
}

function gh(val) {
	return gridHeight*val;
}

function convertScoreToString(data) {
	// takes two-dimensional array as parameter
	
	return JSON.stringify(data);
	
	//var result="";
//	if (!(typeof data==='undefined')) {
//		for (var i=0;i<data.length;i++) {
//			result += "[";
//			if (!(typeof data[i]==='undefined')) {
//				for (var j=0;j<(data[i].length)-1;j++) {
//					if (typeof data[i][j]==='undefined') {
//						result += ",";
//					} else {
//						result += data[i][j] + ",";
//					}
//				}
//				if (typeof data[i][j]==='undefined') {
//					result += "],";
//				} else {
//					result += data[i][j] + "],";
//				}
//			} else {
//				result += "],";
//			}
//		}
//		if (result.length>0) {
//			result.slice(0,-1) // lop off last comma
//		}
//	}
//	return result
}

function convertStringToScore(data) {
	if (data==="" || data===null) {
		return null;
	} else {
		return JSON.parse(data);
	}
}

function UnicodeBrailleToASCIIBraille(val) {
	return unicodeBrailleMap[val-10240];
}

// if ((whiteSpaceToCharacterRatio(str) > 0.10) && (vowelToConsonantRatio(str) > 0.20)) {
	
function vowelToConsonantRatio(str) {
	var vowels = 0;
	var val;
	for (var i=0; i<str.length; i++) {
		val=str.charCodeAt(i);
		if ((val == 65) || (val == 69) || (val == 73) || (val == 79) || (val == 85)) {
			vowels += 1;
		}
	}
	
	return vowels/str.length;
}

function whiteSpaceToCharacterRatio(str) {
	var spaces = 0;
	var val;
	for (var i=0; i<str.length; i++) {
		val=str.charCodeAt(i);
		if ((val === 0) || (val == 32)) {
			spaces += 1;
		}
	}
	
	return spaces/str.length;
}

function isLowASCII(str) {
	var highASCIIFound = false;
	for (var i=0; i<str.length; i++) {
		if (str.toUpperCase().charCodeAt(i) > 99) {
			highASCIIFound = true;
			break;
		}
	}
	return !highASCIIFound;
}