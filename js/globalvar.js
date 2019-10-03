/* global FileReader, importData, arrayHasOwnIndex, drawNotation, createCookie, eraseCookie, readCookie, convertScoreToString, convertStringToScore, eraseAllCookies, padLeft, document, kDefaultFilename, setCellHeight, setControlModule, checkFileType, window, speechSynthesizer: true */

// global variables

var useWordWrap = true;
var spellChordsDownward = true;
var notationArea,controlArea,titleArea,fileUploader,clipboardArea;
var notationCellWidth,notationCellHeight; // these can have fractional values
var ctx, nwu, nhu, nu, chu;
var resizeBarHeight;
var resizeBarPosition = 0.7;
var closeButtonCenterX, closeButtonCenterY;
var dialogFieldFocus = false;
var gridHeight = 60, gridWidth = 40, savedGridHeight;
var hScroll = 0, vScroll = 0; // these values are in pixels
var hScrollOffset, vScrollOffset; // these are in pixels too (but are automatically calculated in drawNotation() from hScroll and vScroll)
var hScrollUnits, vScrollUnits; // these are in cells (but are also automatically calculated in drawNotation() )
var showPageBreaks = true, pageHeight = 25, pageWidth = 40;
var insertOctaveSymbols = true;
var cursor = {};
var startDragX, startDragY, mouseIsDown, resizeBarDrag, resizeBarDragOrigin;
var showSmallDots = true;
var useBrailleDisplay = false;
var controlHelp=0;
var reader = new FileReader(); reader.onload = function () { checkFileType(reader.result); };
var dropzone = false, fileLoading = false;
var undoStack = [];
var suspendUndo = false;
var undoCursor = -1;
var metaKeyDown = false, shiftKeyDown = false;
var pasted = false;
var fileDialogOpen = false, optionsDialogOpen = false, helpDialogOpen = false;
var dialogTop,dialogButtonLeft,dialogButtonRight,dialogTop,dialogButtonHeight,dialogButtonWidth,dialogButtonTop = [];
var autoScroller, autoScrollXDir, autoScrollYDir;
var helpWindow = false;
var parseFiles = true;
var currentBeatUnit = 4;
var resizeBarHeight = 8;
var currentFileName = '';
var currentLocale = 'en';
var translateBrailleDefault = true;
var observeKeySignatures = true;
var clipboardBackup = "";

var controlModules = [
    {
        id: 1,
        name: 'Classic',
        pathname: 'controls/en/classic.xml',
        locale: ''
    },
    {
        id: 2,
        name: 'MIDI',
        pathname: 'controls/en/classic-midi.xml',
        locale: ''
    },
    {
        id: 3,
        name: 'Classic',
        pathname: 'controls/tr/classic.xml',
        locale: 'tr'
    }
];
var selectedControlModule = controlModules[0];
var currentControlModule;

var cellFonts = ['cellfonts/en/classic.xml'];
var defaultCellFonts = 'cellfonts/en/classic.xml';
var currentCellFont;

var storedScore, score = [[]]; // y,x
var storedBlankCells, blankCells = [[]];
var tempGrid = false;

var midiConnected = false;
var midiNotes = [];

var speaker;

// the following array starts at 32, so values should be accessed a brailleDots[theAsciiCode-32].
var brailleDots = [0,46,16,60,43,41,47,4,55,62,33,44,32,36,40,12,52,2,6,18,50,34,22,54,38,20,49,48,35,63,28,57,8,1,3,9,25,17,11,27,19,10,26,5,7,13,29,21,15,31,23,14,30,37,39,58,45,61,53,42,51,59,24,56];

var unicodeBrailleMap = [32,65,49,66,39,75,50,76,64,67,73,70,47,77,83,80,34,69,51,72,57,79,54,82,94,68,74,71,62,78,84,81,44,42,53,60,45,85,56,86,46,37,91,36,43,88,33,38,59,58,52,92,48,90,55,40,95,63,87,93,35,89,41,61];

var diatonicNoteValues = [
    [[89,75],[90,75],[38,75],[61,75],[40,75],[33,75],[41,75]],
    [[89],[90],[38],[61],[40],[33],[41]],
    [[78],[79],[80],[81],[82],[83],[84]],
    [[63],[58],[36],[93],[92],[91],[87]],
    [[68],[69],[70],[71],[72],[73],[74]],
    [[189],[190],[138],[161],[140],[133],[141]],
    [[178],[179],[180],[181],[182],[183],[184]],
    [[163],[158],[136],[193],[192],[191],[187]],
    [[368],[369],[370],[371],[372],[373],[374]]
];

var restValues = [[77,75],[77],[85],[86],[88],[177],[185],[186],[188]];

var octaveValues = [[64,164],[64],[94],[95],[34],[46],[59],[44],[44,144]];

var intervalValues = [[45],[47],[43],[135],[157],[148],[151]];

var octaveCharValues = [];
octaveCharValues[164] = 0;
octaveCharValues[64] = 1;
octaveCharValues[94] = 2;
octaveCharValues[95] = 3;
octaveCharValues[34] = 4;
octaveCharValues[46] = 5;
octaveCharValues[59] = 6;
octaveCharValues[44] = 7;
octaveCharValues[144] = 8;

var intervalCharValues = []; // these are 0-based (0=8ve, 1=2nd)
intervalCharValues[45] = 0;
intervalCharValues[47] = 1;
intervalCharValues[43] = 2;
intervalCharValues[135] = 3;
intervalCharValues[157] = 4;
intervalCharValues[148] = 5;
intervalCharValues[151] = 6;

var pitchValues = [];
pitchValues[89] = pitchValues[78] = pitchValues[63] = pitchValues[68] = 0;
pitchValues[90] = pitchValues[79] = pitchValues[58] = pitchValues[69] = 1;
pitchValues[38] = pitchValues[80] = pitchValues[36] = pitchValues[70] = 2;
pitchValues[61] = pitchValues[81] = pitchValues[93] = pitchValues[71] = 3;
pitchValues[40] = pitchValues[82] = pitchValues[92] = pitchValues[72] = 4;
pitchValues[33] = pitchValues[83] = pitchValues[91] = pitchValues[73] = 5;
pitchValues[41] = pitchValues[84] = pitchValues[87] = pitchValues[74] = 6;
pitchValues[189] = pitchValues[178] = pitchValues[163] = pitchValues[368] = 0;
pitchValues[190] = pitchValues[179] = pitchValues[158] = pitchValues[369] = 1;
pitchValues[138] = pitchValues[180] = pitchValues[136] = pitchValues[370] = 2;
pitchValues[161] = pitchValues[181] = pitchValues[193] = pitchValues[371] = 3;
pitchValues[140] = pitchValues[182] = pitchValues[192] = pitchValues[372] = 4;
pitchValues[133] = pitchValues[183] = pitchValues[191] = pitchValues[373] = 5;
pitchValues[141] = pitchValues[184] = pitchValues[187] = pitchValues[374] = 6;

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

function lineIsEmpty(y) {
    if (score[y]) {
        var l = score[y].length;
        for (var x=0; x<l; x++) {
            if (!cellValIsEmpty(score[y][x])) {
                return false;
            }
        }
    }
    return true;
}

function scoreIsEmpty() {
    var h = score.length;
    for (var y=0; y<h; y++) {
        if (!lineIsEmpty(y)) {
            return false;
        }
    }
    return true;
}

function removeLastWordOfLine(y) {
    var v,word = [];
    // trim any ending whitespace
    while (cellValIsEmpty(score[y][score[y].length-1])) {
        v = score[y].pop();
    }
    // collect cells from end until we hit a space
    while (!cellValIsEmpty(score[y][score[y].length-1])) {
        word.unshift(score[y].pop());
    }
    return word;
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
        savePreferences();
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

function isAccidental(val) {
    return (val==42 ||
            val==60 ||
            val==37 ||
            val==360 ||
            val==337 ||
            val==695 ||
            val==664 ||
            val==694
           );
}

function savePreferences() {
    var tab = String.fromCharCode(9);
    var ps = (currentCellFont.translateBraille ? "1" : "0") + tab;
    ps += (showSmallDots ? "1" : "0") + tab;
    ps += gridHeight + tab;
    ps += (showPageBreaks ? "1" : "0") + tab;
    ps += (useBrailleDisplay ? "1" : "0") + tab;
    ps += pageWidth + tab + pageHeight + tab;
    ps += "0" + tab; // unused
    ps += (useWordWrap ? "1" : "0") + tab;
    ps += (parseFiles ? "1" : "0") + tab;
    ps += currentLocale + tab;
    ps += selectedControlModule.id + tab;
    ps += cursor.x + tab + cursor.y + tab + cursor.width + tab + cursor.height + tab;
    ps += currentFileName + tab;
    ps += (insertOctaveSymbols ? "1" : "0") + tab;
    ps += (observeKeySignatures ? "1" : "0") + tab;
    ps += (spellChordsDownward ? "1" : "0");

    eraseCookie('bmnpref');
    createCookie('bmnpref',ps);
}

function loadPreferences() {
    var ps = [];
    var prefString = readCookie('bmnpref');
    if (prefString) {
        ps = prefString.split(String.fromCharCode(9));
    }

    if (ps.length>16) {
        translateBrailleDefault = (ps[0]=="1");
        showSmallDots = (ps[1]=="1");
        setCellHeight(ps[2]*1,false);
        showPageBreaks = (ps[3]=="1");
        useBrailleDisplay = (ps[4]=="1");
        pageWidth = ps[5]*1;
        pageHeight = ps[6]*1;
        // unused = (ps[7]=="1");
        useWordWrap = (ps[8]=="1");
        parseFiles = (ps[9]=="1");
        currentLocale = ps[10];
        setControlModule(ps[11]*1);
        if (Math.abs(score.length-ps[13])<5) {
            cursor.x = ps[12]*1;
            cursor.y = ps[13]*1;
            cursor.width = ps[14]*1;
            cursor.height = ps[15]*1;
            currentFileName = ps[16];
        }
        insertOctaveSymbols = (ps[17]=="1");
        observeKeySignatures = (ps[18]=="1");
        spellChordsDownward = (ps[19]=="1");
    }
}
