/* global FileReader, importData, arrayHasOwnIndex, drawNotation, createCookie, readCookie, convertScoreToString, convertStringToScore, eraseAllCookies, padLeft, document, kDefaultFilename: true */

// global variables

var notationArea,controlArea,titleArea,fileUploader,clipboardArea;
var notationCellWidth,notationCellHeight; // these can have fractional values
var ctx, nwu, nhu, nu, chu;
var resizeBarHeight;
var resizeBarPosition = 0.7;
var closeButtonCenterX, closeButtonCenterY;
var notationGridHeight = 60, notationGridWidth = 40, gridHeight, gridWidth, savedGridHeight;
var hScroll = 0, vScroll = 0; // these values are in pixels
var hScrollOffset, vScrollOffset; // these are in pixels too (but are automatically calculated in drawNotation() from hScroll and vScroll)
var hScrollUnits, vScrollUnits; // these are in cells (but are also automatically calculated in drawNotation() )
var showPageBreaks = true, pageHeight = 25, pageWidth = 40;
var cursor = {};
var startDragX, startDragY, mouseIsDown, resizeBarDrag, resizeBarDragOrigin;
var drawAllDots = true;
var useBrailleDisplay = false;
var controlHelp=0;
var reader = new FileReader(); reader.onload = function () { importData(reader.result); };
var dropzone = false;
var undoStack = [];
var suspendUndo = false;
var undoCursor = -1;
var metaKeyDown = false, shiftKeyDown = false;
var pasted = false;
var fileDialogOpen = false, optionsDialogOpen = false, helpDialogOpen = false;
var dialogTop,dialogButtonLeft,dialogButtonRight,dialogTop,dialogButtonHeight,dialogButtonWidth,dialogButtonTop = [];
var autoScroller, autoScrollXDir, autoScrollYDir;
var helpWindow = false;
var parseOnImport = true;
var currentBeatUnit = 4;
var resizeBarHeight = 10;
var currentFileName = '';

var controlModules = ['controls/en/classic.xml'];
var defaultControlModule = 'controls/en/classic.html';
var currentControlModule;

var cellFonts = ['cellfonts/en/classic.xml'];
var defaultCellFonts = 'cellfonts/en/classic.xml';
var currentCellFont;

var storedScore, score = [[]]; // y,x
var storedBlankCells, blankCells = [[]];
var tempGrid = false;

// the following array starts at 32, so values should be accessed a brailleDots[theAsciiCode-32].
var brailleDots = [0,46,16,60,43,41,47,4,55,62,33,44,32,36,40,12,52,2,6,18,50,34,22,54,38,20,49,48,35,63,28,57,8,1,3,9,25,17,11,27,19,10,26,5,7,13,29,21,15,31,23,14,30,37,39,58,45,61,53,42,51,59,24,56];

var unicodeBrailleMap = [32,65,49,66,39,75,50,76,64,67,73,70,47,77,83,80,34,69,51,72,57,79,54,82,94,68,74,71,62,78,84,81,44,42,53,60,45,85,56,86,46,37,91,36,43,88,33,38,59,58,52,92,48,90,55,40,95,63,87,93,35,89,41,61];

function clearDocument() {
	saveToUndo();
	score=[[]];
}

function getScore(x,y) {
	if ((x === null) || (y === null) ||
        (typeof score[y]==='undefined') || (score[y]===null) ||
        (typeof score[y][x]==='undefined')) {
		return 0;
	} else {
		return score[y][x];
	}
}

function setScore(x,y,val) {
	if (typeof val!=="undefined") {
		saveToUndo();
		if (!(arrayHasOwnIndex(score,y)) || score[y]===null) {
			score[y] = [];
		}
		score[y][x] = String(val);
	} else {
		deleteScore(x,y);
	}
}

function deleteScore(x,y) {
	saveToUndo();
	if (!score[y] || !arrayHasOwnIndex(score,y)) {
		score[y] = [];
	}
	delete score[y][x];
}

function cellIsEmpty(x,y) {
	return (typeof score[y]==='undefined') || (typeof score[y][x]==='undefined') || (score[y][x]<=0);
}

function cellValIsEmpty(val) {
    return !(
        typeof(val) !== 'undefined' &&
        val !== null &&
        val !== "0" &&
        val != "32" &&
        val !== 0 &&
        val != 32
    );
}

function getCellContext(x,y) {
    // returns a string containing the character and the three cells before and after
    var r="";
    for (var i=(x-3); i<=(x+3); i++) {
        if (
            typeof score[y]==="undefined" ||
            score[y]===null ||
            typeof score[y][i]==="undefined" ||
            score[y][i]===null ||
            score[y][i]===0 ||
            score[y][i]==32
        ) {
            r=r+" ";
        } else {
            r=r+String.fromCharCode(score[y][i]);
        }
    }

    return r;
}

function saveToUndo() {
	if (!suspendUndo) {
		if (undoCursor < undoStack.length-2) {
			undoStack.splice(undoCursor+1);
		}
		undoStack.push(score.clone());
		undoCursor = undoStack.length-1;
		updateCookie();
	}
}

function doUndo() {
	if (undoCursor == undoStack.length-1) { // if we're at the last undo
		saveToUndo();
		undoCursor -=1;
	}
	if (undoCursor > -1) {
		score = undoStack[undoCursor].clone();
		undoCursor -= 1;
		drawNotation();
	}
}

function doRedo() {
	if (undoCursor < undoStack.length-2) {
		score = undoStack[undoCursor+2].clone();
		undoCursor += 1;
		drawNotation();
	}
}

function updateCookie() { // save last five undos to cookie
	// delete old cookies
    eraseAllCookies(/bmn[\d]+/);

    // write
    var i=undoCursor;
    var j=0;
    var totalLength=0;
    var s;
    do {
        s=convertScoreToString(undoStack[i]);
        totalLength=totalLength+s.length;
        if (totalLength<4097) {
            createCookie("bmn"+padLeft(j,4),s,7);
        }
        j++;
        i--;
    }
    while (i>0 && totalLength<4097);
}

function loadCookie() {
	var storedUndos = getCookieArray();
    var len = storedUndos.length;
    for (var i=0; i<len; i++) {
        undoStack[(len-1)-i] = convertStringToScore(storedUndos[i]);
    }

    undoCursor = undoStack.length-1;
	if (undoCursor>-1) {
		score = undoStack[undoCursor].clone();
//		drawNotation();
	}
}

function getCookieArray() {
    var cookies = document.cookie.split(";");
    var result = [];

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie;
        if (/bmn[\d]+/.test(name)) {
            result[name.substr(3)*1] = cookie.substr(eqPos+1);
        }
    }

    return result;
}

function scoreWidth() { // returns the length of the longest line in the score
	var maxLength=0;
	for (var i in score) {
		if ((score[i]) && (score[i].length>maxLength)) {
			maxLength = score[i].length;
		}
	}
	return maxLength;
}

function scoreHeight() { // returns the number of rows in the current score
	return score.length;
}

function firstCharPosInRow(y) { // returns position of first nonempty character in row y
	var pos = 0;
	for (var x=0; x<score[y].length; x++) {
		if (!cellIsEmpty(x,y)) {
			pos = x;
			break;
		}
	}
	return pos;
}

function createTemporaryGrid(height) {
    savedGridHeight = gridHeight;
    gridHeight = height;
    gridWidth = (height*2)/3;
    storedScore = score.slice(0);
    score = [[]];
    score[0] = [];
    storedBlankCells = blankCells.slice(0);
    blankCells = [[]];
    tempGrid = true;
}

function releaseTemporaryGrid() {
    gridHeight = savedGridHeight;
    gridWidth = (gridHeight*2)/3;
    score = storedScore.slice(0);
    blankCells = storedBlankCells.slice(0);
    tempGrid = false;
}
