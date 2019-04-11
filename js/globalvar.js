/* global FileReader, importData, arrayHasOwnIndex, drawNotation, createCookie, eraseCookie, readCookie, convertScoreToString, convertStringToScore, eraseAllCookies, padLeft, document, kDefaultFilename, setCellHeight, setControlModule: true */

// global variables

var useLaunchpad = false;
var useWordWrap = true;
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
var resizeBarHeight = 8;
var currentFileName = '';
var currentLocale = 'en';
var interpretBrailleDefault = true;

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

// the following array starts at 32, so values should be accessed a brailleDots[theAsciiCode-32].
var brailleDots = [0,46,16,60,43,41,47,4,55,62,33,44,32,36,40,12,52,2,6,18,50,34,22,54,38,20,49,48,35,63,28,57,8,1,3,9,25,17,11,27,19,10,26,5,7,13,29,21,15,31,23,14,30,37,39,58,45,61,53,42,51,59,24,56];

var unicodeBrailleMap = [32,65,49,66,39,75,50,76,64,67,73,70,47,77,83,80,34,69,51,72,57,79,54,82,94,68,74,71,62,78,84,81,44,42,53,60,45,85,56,86,46,37,91,36,43,88,33,38,59,58,52,92,48,90,55,40,95,63,87,93,35,89,41,61];

var sharpNoteValues = [
    [[89,75],[37,89,75],[90,75],[37,90,75],[38,75],[61,75],[37,61,75],[40,75],[37,40,75],[33,75],[37,33,75],[41,75]],
    [[89],[37,89],[90],[37,90],[38],[61],[37,61],[40],[37,40],[33],[37,33],[41]],
    [[78],[37,78],[79],[37,79],[80],[81],[37,81],[82],[37,82],[83],[37,83],[84]],
    [[63],[37,63],[58],[37,58],[36],[93],[37,93],[92],[37,92],[91],[37,91],[87]],
    [[68],[37,68],[69],[37,69],[70],[71],[37,71],[72],[37,72],[73],[37,73],[74]],
    [[189],[37,189],[190],[37,190],[138],[161],[37,161],[140],[37,140],[133],[37,133],[141]],
    [[178],[37,178],[179],[37,179],[180],[181],[37,181],[182],[37,182],[183],[37,183],[184]],
    [[163],[37,163],[158],[37,158],[136],[193],[37,193],[192],[37,192],[191],[37,191],[187]],
    [[168],[37,168],[169],[37,169],[170],[171],[37,171],[172],[37,172],[173],[37,173],[174]]
];

var flatNoteValues = [
    [[89,75],[60,90,75],[90,75],[60,38,75],[38,75],[61,75],[60,40,75],[40,75],[60,33,75],[33,75],[60,41,75],[41,75]],
    [[89],[60,90],[90],[60,38],[38],[61],[60,40],[40],[60,33],[33],[60,41],[41]],
    [[78],[60,79],[79],[60,80],[80],[81],[60,82],[82],[60,83],[83],[60,84],[84]],
    [[63],[60,58],[58],[60,36],[36],[93],[60,92],[92],[60,91],[91],[60,87],[87]],
    [[68],[60,69],[69],[60,70],[70],[71],[60,72],[72],[60,73],[73],[60,74],[74]],
    [[189],[60,190],[190],[60,138],[138],[161],[60,140],[140],[60,133],[133],[60,141],[141]],
    [[178],[60,179],[179],[60,180],[180],[181],[60,182],[182],[60,183],[183],[60,184],[184]],
    [[163],[60,158],[158],[60,136],[136],[193],[60,192],[192],[60,191],[191],[60,187],[187]],
    [[168],[60,169],[169],[60,170],[170],[171],[60,172],[172],[60,173],[173],[60,174],[174]]
];

var restValues = [[77,75],[77],[85],[86],[88],[177],[185],[186],[188]];

var octaveValues = [[64,164],[64],[94],[95],[34],[46],[59],[44],[44,144]];

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

var pitchValues = [];
pitchValues[89] = pitchValues[78] = pitchValues[63] = pitchValues[68] = 0;
pitchValues[90] = pitchValues[79] = pitchValues[58] = pitchValues[69] = 1;
pitchValues[38] = pitchValues[80] = pitchValues[36] = pitchValues[70] = 2;
pitchValues[61] = pitchValues[81] = pitchValues[93] = pitchValues[71] = 3;
pitchValues[40] = pitchValues[82] = pitchValues[92] = pitchValues[72] = 4;
pitchValues[33] = pitchValues[83] = pitchValues[91] = pitchValues[73] = 5;
pitchValues[41] = pitchValues[84] = pitchValues[87] = pitchValues[74] = 6;
pitchValues[189] = pitchValues[178] = pitchValues[163] = pitchValues[168] = 0;
pitchValues[190] = pitchValues[179] = pitchValues[158] = pitchValues[169] = 1;
pitchValues[138] = pitchValues[180] = pitchValues[136] = pitchValues[170] = 2;
pitchValues[161] = pitchValues[181] = pitchValues[193] = pitchValues[171] = 3;
pitchValues[140] = pitchValues[182] = pitchValues[192] = pitchValues[172] = 4;
pitchValues[133] = pitchValues[183] = pitchValues[191] = pitchValues[173] = 5;
pitchValues[141] = pitchValues[184] = pitchValues[187] = pitchValues[174] = 6;

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
    var ps = (currentCellFont.interpretBraille ? "1" : "0") + tab;
    ps += (drawAllDots ? "1" : "0") + tab;
    ps += gridHeight + tab;
    ps += (showPageBreaks ? "1" : "0") + tab;
    ps += (useBrailleDisplay ? "1" : "0") + tab;
    ps += pageWidth + tab + pageHeight + tab;
    ps += (useLaunchpad ? "1" : "0") + tab;
    ps += (useWordWrap ? "1" : "0") + tab;
    ps += (parseOnImport ? "1" : "0") + tab;
    ps += currentLocale + tab;
    ps += selectedControlModule.id + tab;
    ps += cursor.x + tab + cursor.y + tab + cursor.width + tab + cursor.height + tab;
    ps += currentFileName;

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
        interpretBrailleDefault = (ps[0]=="1");
        drawAllDots = (ps[1]=="1");
        setCellHeight(ps[2]*1,false);
        showPageBreaks = (ps[3]=="1");
        useBrailleDisplay = (ps[4]=="1");
        pageWidth = ps[5]*1;
        pageHeight = ps[6]*1;
        useLaunchpad = (ps[7]=="1");
        useWordWrap = (ps[8]=="1");
        parseOnImport = (ps[9]=="1");
        currentLocale = ps[10];
        setControlModule(ps[11]*1);
        if (Math.abs(score.length-ps[13])<5) {
            cursor.x = ps[12]*1;
            cursor.y = ps[13]*1;
            cursor.width = ps[14]*1;
            cursor.height = ps[15]*1;
            currentFileName = ps[16];
        }
    }
}
