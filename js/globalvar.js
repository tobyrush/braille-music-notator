/* global FileReader, importData, arrayHasOwnIndex, drawNotation, createCookie, readCookie, convertScoreToString, convertStringToScore, eraseAllCookies, padLeft, document: true */

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

var longContractions = [[[565,566,586],"ABOVE"],
                        [[565,566],"ABOUT"],
                        [[565,567,582],"ACROSS"],
                        [[565,567],"ACCORDING"],
                        [[565,570,578],"AFTERNOON"],
                        [[565,570,587],"AFTERWARD"],
                        [[565,570],"AFTER"],
                        [[565,571,547],"AGAINST"],
                        [[565,571],"AGAIN"],
                        [[565,576,577],"ALMOST"],
                        [[565,576,582],"ALREADY"],
                        [[565,576,584],"ALTOGETHER"],
                        [[565,576,563],"ALTHOUGH"],
                        [[565,576,587],"ALWAYS"],
                        [[565,576],"ALSO"],
                        [[750,567],"BECAUSE"],
                        [[750,570],"BEFORE"],
                        [[750,572],"BEHIND"],
                        [[750,576],"BELOW"],
                        [[750,578],"BENEATH"],
                        [[750,583],"BESIDE"],
                        [[750,584],"BETWEEN"],
                        [[750,589],"BEYOND"],
                        [[566,576],"BLIND"],
                        [[566,582,576],"BRAILLE"],
                        [[567,568],"COULD"],
                        [[567,586,571],"CEIVING"],
                        [[567,586],"CEIVE"],
                        [[542,578],"CHILDREN"],
                        [[568,567,576,571],"DECLARING"],
                        [[568,567,576],"DECLARE"],
                        [[569,573],"EITHER"],
                        [[570,547],"FIRST"],
                        [[570,582],"FRIEND"],
                        [[571,568],"GOOD"],
                        [[571,582,584],"GREAT"],
                        [[572,593,570],"HERSELF"],
                        [[572,577,570],"HIMSELF"],
                        [[573,577,577],"IMMEDIATE"],
                        [[572,577],"HIM"],
                        [[576,576],"LITTLE"],
                        [[576,582],"LETTER"],
                        [[577,542],"MUCH"],
                        [[577,547],"MUST"],
                        [[577,589,570],"MYSELF"],
                        [[578,569,567],"NECESSARY"],
                        [[578,569,573],"NEITHER"],
                        [[579,539,567],"O'CLOCK"],
                        [[592,582,586,583],"OURSELVES"],
                        [[580,568],"PAID"],
                        [[580,593,572],"PERHAPS"],
                        [[581,575],"QUICK"],
                        [[582,574,567,571],"REJOICING"],
                        [[582,574,567],"REJOICE"],
                        [[583,542],"SUCH"],
                        [[583,568],"SAID"],
                        [[537,568],"SHOULD"],
                        [[584,568],"TODAY"],
                        [[584,571,582],"TOGETHER"],
                        [[584,577],"TOMORROW"],
                        [[584,578],"TONIGHT"],
                        [[533,577,586,583],"THEMSELVES"],
                        [[587,568],"WOULD"],
                        [[588,583],"ITS"],
                        [[588,570],"ITSELF"],
                        [[589,582,570],"YOURSELF"],
                        [[589,582],"YOUR"],
                        [[589,582,586,583],"YOURSELVES"]];

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
