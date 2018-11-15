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
var interpretBraille = true;
var useBrailleDisplay = false;
var whichKeyboard = 1;
var kbu, keyboardOriginX, keyboardOriginY, controlHelpOriginX, controlHelpOriginY, controlsHeight, controlsWidth;
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
var doNotCheckContiguousCells = false;
var helpWindow = false;
var parseOnImport = true;
var currentBeatUnit = 4;
//var dialogField, editFieldVisible, editFieldCallback;
//var flashIsPresent = false;

var score = [[]]; // y,x
var blankCells = [[]];

// the following array starts at 32, so values should be accessed a brailleDots[theAsciiCode-32].
var brailleDots = [0,46,16,60,43,41,47,4,55,62,33,44,32,36,40,12,52,2,6,18,50,34,22,54,38,20,49,48,35,63,28,57,8,1,3,9,25,17,11,27,19,10,26,5,7,13,29,21,15,31,23,14,30,37,39,58,45,61,53,42,51,59,24,56];

var keyCodes = [192,49,50,51,52,53,54,55,56,57,48,189,187,81,87,69,82,84,89,85,73,79,80,219,221,220,65,83,68,70,71,72,74,75,76,186,222,90,88,67,86,66,78,77,188,190,191];

var keyHelp = [];
keyHelp[1] = [1,2,2,2,2,2,2,2,3.8,3.4,4,5,5,2,2,2,2,2,2,2,3.7,3.3,4,5,5,5,2,2,2,2,2,2,2,3.6,3.2,4,4,2,2,2,2,2,2,2,3.5,3.1,3.0];
keyHelp[2] = [1,2,2,2,2,2,2,2,6,6,4,5,5,2,2,2,2,2,2,2,6,6,4,5,5,5,2,2,2,2,2,2,2,6,6,4,4,2,2,2,2,2,2,2,6,7,32];
keyHelp[3] = [0,8,8,8,8,8,8,8,8,8,8,9,9,8,8,8,8,8,8,8,8,8,8,10,10,10,11.1,11.1,11.1,11.1,11.1,11.1,11.1,11.1,11.1,11.1,11.2,11.1,11.1,12,13,13,10,10,10,10,10];
keyHelp[4] = [0,14,14,14,14,14,14,14,14,14,0,28,28,30,30,30,30,30,30,0,0,0,24,24,24,24,17,17,17,17,17,17,0,18,18,18,18,17,17,17,35,35,35,35,0,0,0];
keyHelp[5] = [0,0,0,0,0,0,0,0,0,0,0,0,27,15,16,26,26,31,31,33,34,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,19,19,19,21,20,20,22,22,29,25];


var keyboardCoordinates = [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],[1.5,1],[2.5,1],[3.5,1],[4.5,1],[5.5,1],[6.5,1],[7.5,1],[8.5,1],[9.5,1],[10.5,1],[11.5,1],[12.5,1],[13.5,1],[1.8,2],[2.8,2],[3.8,2],[4.8,2],[5.8,2],[6.8,2],[7.8,2],[8.8,2],[9.8,2],[10.8,2],[11.8,2],[2.2,3],[3.2,3],[4.2,3],[5.2,3],[6.2,3],[7.2,3],[8.2,3],[9.2,3],[10.2,3],[11.2,3]]; // how this will work: choose a keyboardWidthUnit (maybe chu*16?). Multiply the coordinates above by keyboardWidthUnit and add originOffset.

var keycaps = ['`','1','2','3','4','5','6','7','8','9','0','-','=','Q','W','E','R','T','Y','U','I','O','P','[',']','\\','A','S','D','F','G','H','J','K','L',';','\'','Z','X','C','V','B','N','M',',','.','/'];

var keymap = [];

keymap[1] = [[5],[1,"C",1],[1,"D",1],[1,"E",1],[1,"F",1],[1,"G",1],[1,"A",1],[1,"B",1],[2,8],[2,4],[10,1],[4,-2],[4,2],[1,"C",2],[1,"D",2],[1,"E",2],[1,"F",2],[1,"G",2],[1,"A",2],[1,"B",2],[2,7],[2,3],[10,2],[4,-1],[4,1],[4,0],[1,"C",4],[1,"D",4],[1,"E",4],[1,"F",4],[1,"G",4],[1,"A",4],[1,"B",4],[2,6],[2,2],[10,4],[10,8],[1,"C",8],[1,"D",8],[1,"E",8],[1,"F",8],[1,"G",8],[1,"A",8],[1,"B",8],[2,5],[2,1],[2,0]];

keymap[2] = [[5],[1,"C",16],[1,"D",16],[1,"E",16],[1,"F",16],[1,"G",16],[1,"A",16],[1,"B",16],[6,"8ve"],[6,"4th"],[10,16],[4,-2],[4,2],[1,"C",32],[1,"D",32],[1,"E",32],[1,"F",32],[1,"G",32],[1,"A",32],[1,"B",32],[6,"7th"],[6,"3rd"],[10,32],[4,-1],[4,1],[4,0],[1,"C",64],[1,"D",64],[1,"E",64],[1,"F",64],[1,"G",64],[1,"A",64],[1,"B",64],[6,"6th"],[6,"2nd"],[10,64],[10,128],[1,"C",128],[1,"D",128],[1,"E",128],[1,"F",128],[1,"G",128],[1,"A",128],[1,"B",128],[6,"5th"],[3,1],[17]];

keymap[3] = [[7,0],[7,1,1],[7,1,2],[7,1,3],[7,1,4],[7,1,5],[7,1,6],[7,1,7],[7,1,8],[7,1,9],[7,1,0],[7,3],[7,4],[7,2,1],[7,2,2],[7,2,3],[7,2,4],[7,2,5],[7,2,6],[7,2,7],[7,2,8],[7,2,9],[7,2,0],[8,0,-1],[8,0,1],[8,0,0],[11,1],[11,2],[11,3],[11,4],[11,5],[11,6],[11,7],[11,8],[11,9],[11,0],[11,-3],[11,-1],[11,-2],[3,2],[3,3],[3,4],[8,2],[8,1,4],[8,1,5],[8,1,6],[8,1,7]];

keymap[4] = [[0],[14,1],[14,2],[14,3],[14,4],[14,5],[14,6],[14,7],[14,8],[14,9],[0],[10,901],[10,902],[14,11],[14,12],[14,13],[14,14],[14,15],[14,10],[0],[0],[0],[16,1],[16,2],[16,3],[16,4],[13,5],[13,6],[13,7],[13,8],[13,9],[13,10],[0],[13,1],[13,2],[13,3],[13,4],[13,11],[13,12],[13,13],[19,1],[19,2],[19,3],[19,4],[0],[0],[0]];

keymap[5] = [[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[15,6],[15,1],[15,2],[15,4],[15,5],[15,8],[15,9],[18,1],[18,2],[18,3],[0],[0],[0],[0],[0],[0],[0],[9,8],[9,9],[9,10],[9,11],[9,12],[9,13],[0],[0],[9,0],[9,1],[9,2],[9,5],[9,3],[9,4],[9,6],[9,7],[15,7],[15,3]];

keymap[6] = [[12,33],[12,49],[12,50],[12,51],[12,52],[12,53],[12,54],[12,55],[12,56],[12,57],[12,48],[12,45],[12,35],[12,81],[12,87],[12,69],[12,82],[12,84],[12,89],[12,85],[12,73],[12,79],[12,80],[12,40],[12,34],[12,58],[12,65],[12,83],[12,68],[12,70],[12,71],[12,72],[12,74],[12,75],[12,76],[12,59],[12,39],[12,90],[12,88],[12,67],[12,86],[12,66],[12,78],[12,77],[12,44],[12,46],[12,63]];

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
                        [[580,593,570],"PERHAPS"],
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
	if ((x === null) || (y === null) || (typeof score[y]==='undefined') || (typeof score[y][x]==='undefined')) {
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
		score[y][x] = val;
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
		drawNotation();
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
