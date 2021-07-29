/* global FileReader, importData, arrayHasOwnIndex, drawNotation, createCookie, eraseCookie, readCookie, convertScoreToString, convertStringToScore, eraseAllCookies, padLeft, document, kDefaultFilename, setCellHeight, setControlModule, checkFileType, window, speechSynthesizer: true */
/* jshint esversion: 6 */

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
        name: 'IPA',
        pathname: 'controls/en/ipa.xml',
        locale: ''
    },
    {
        id: 4,
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

var ipaBrailleMap = buildIPABrailleMap();

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

function setScoreLine(x,y,vals) {
    // for console use
    for (i=0; i<vals.length; i++) {
        setScore(x+i,y,vals[i]);
    }
    drawNotation();
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

function buildIPABrailleMap() {
    var a = [];
    a[44]=[1049];
    a[45]=[1045];
    a[46]=[1039];
    a[47]=[1094,1047];
    a[91]=[1094,1040];
    a[93]=[1094,1041];
    a[97]=[1065];
    a[98]=[1066];
    a[99]=[1067];
    a[100]=[1068];
    a[101]=[1069];
    a[102]=[1070];
    a[103]=[1071];
    a[104]=[1072];
    a[105]=[1073];
    a[106]=[1074];
    a[107]=[1075];
    a[108]=[1076];
    a[109]=[1077];
    a[110]=[1078];
    a[111]=[1079];
    a[112]=[1080];
    a[113]=[1081];
    a[114]=[1082];
    a[115]=[1083];
    a[116]=[1084];
    a[117]=[1085];
    a[118]=[1086];
    a[119]=[1087];
    a[120]=[1088];
    a[121]=[1089];
    a[122]=[1090];
    a[124]=[1095,1092];
    a[230]=[1037];
    a[240]=[1040];
    a[248]=[1092];
    a[269]=[1067,1064,1056];
    a[295]=[1054,1072];
    a[331]=[1036];
    a[339]=[1091];
    a[353]=[1083,1064,1056];
    a[382]=[1090,1064,1056];
    a[448]=[1038,1063];
    a[449]=[1038,1076];
    a[450]=[1038,1058];
    a[451]=[1038,1084];
    a[496]=[1074,1064,1056];
    a[592]=[1054,1065];
    a[593]=[1042];
    a[594]=[1054,1042];
    a[595]=[1056,1066];
    a[596]=[1060];
    a[597]=[1056,1067];
    a[598]=[1052,1068];
    a[599]=[1056,1068];
    a[600]=[1054,1069];
    a[601]=[1053];
    a[603]=[1062];
    a[604]=[1054,1062];
    a[606]=[1056,1062];
    a[607]=[1057,1074];
    a[608]=[1056,1071];
    a[609]=[1071];
    a[610]=[1057,1071];
    a[611]=[1046,1071];
    a[612]=[1054,1079];
    a[613]=[1052,1072];
    a[614]=[1056,1072];
    a[615]=[1056,1036];
    a[616]=[1048,1073];
    a[618]=[1047];
    a[619]=[1054,1076];
    a[620]=[1056,1076];
    a[621]=[1052,1076];
    a[622]=[1076,1034,1033];
    a[623]=[1054,1085];
    a[624]=[1056,1077];
    a[625]=[1054,1077];
    a[626]=[1061];
    a[627]=[1052,1078];
    a[628]=[1057,1078];
    a[629]=[1048,1079];
    a[630]=[1057,1091];
    a[632]=[1046,1070];
    a[633]=[1035];
    a[634]=[1056,1035];
    a[635]=[1052,1035];
    a[637]=[1052,1082];
    a[638]=[1054,1082];
    a[640]=[1057,1082];
    a[641]=[1057,1035];
    a[642]=[1052,1083];
    a[643]=[1058];
    a[644]=[1056,1057,1052];
    a[648]=[1052,1084];
    a[649]=[1048,1085];
    a[650]=[1040];
    a[651]=[1056,1086];
    a[652]=[1043];
    a[653]=[1054,1055];
    a[654]=[1056,1089];
    a[655]=[1057,1089];
    a[656]=[1052,1090];
    a[657]=[1056,1090];
    a[658]=[1033];
    a[660]=[1050];
    a[661]=[1054,1050];
    a[664]=[1038,1080];
    a[665]=[1057,1066];
    a[667]=[1056,1057,1092];
    a[668]=[1057,1072];
    a[669]=[1056,1074];
    a[671]=[1057,1076];
    a[673]=[1056,1050];
    a[674]=[1057,1050];
    a[675]=[1068,1034,1090];
    a[676]=[1068,1034,1033];
    a[677]=[1068,1034,1056,1090];
    a[678]=[1084,1034,1083];
    a[679]=[1084,1034,1058];
    a[680]=[1084,1034,1056,1067];
    a[688]=[1064,1072];
    a[690]=[1064,1074];
    a[695]=[1064,1055];
    a[700]=[1034,1039];
    a[712]=[1095,1066];
    a[716]=[1044,1050];
    a[716]=[1095,1050];
    a[717]=[1039,1045];
    a[720]=[1051];
    a[721]=[1034,1049];
    a[724]=[1044,1062];
    a[725]=[1044,1060];
    a[726]=[1044,1043];
    a[734]=[1034,1082];
    a[735]=[1064,1088];
    a[736]=[1064,1046,1092];
    a[737]=[1064,1076];
    a[740]=[1064,1054,1050];
    a[741]=[1095,1064,1067];
    a[742]=[1095,1067];
    a[743]=[1095,1051];
    a[744]=[1095,1045];
    a[745]=[1095,1044,1045];
    a[748]=[1044,1056];
    a[755]=[1044,1036];
    a[759]=[1044,1093];
    a[762]=[1064,1068];
    a[765]=[1044,1054,1062];
    a[768]=[1064,1042];
    a[769]=[1064,1047];
    a[770]=[1064,1037];
    a[771]=[1064,1093];
    a[772]=[1064,1067];
    a[774]=[1064,1040];
    a[776]=[1064,1051];
    a[779]=[1064,1044,1047];
    a[780]=[1064,1056];
    a[783]=[1064,1044,1042];
    a[792]=[1044,1058];
    a[793]=[1044,1083];
    a[796]=[1044,1091];
    a[797]=[1044,1062];
    a[798]=[1044,1060];
    a[799]=[1044,1043];
    a[800]=[1039,1045];
    a[804]=[1044,1051];
    a[805]=[1044,1036];
    a[807]=[1054,1067];
    a[809]=[1044,1050];
    a[810]=[1044,1063];
    a[812]=[1044,1056];
    a[815]=[1044,1041];
    a[816]=[1044,1093];
    a[820]=[1034,1093];
    a[825]=[1044,1079];
    a[826]=[1044,1054,1062];
    a[828]=[1044,1038];
    a[829]=[1064,1088];
    a[865]=[1034];
    a[946]=[1046,1066];
    a[952]=[1046,1063];
    a[967]=[1046,1038];
    a[7620]=[1064,1073];
    a[7621]=[1064,1057];
    a[7624]=[1064,1052];
    a[8214]=[1095,1061];
    a[8255]=[1095,1076];
    a[8319]=[1064,1078];
    a[8593]=[1095,1036];
    a[8594]=[1095,1079];
    a[8595]=[1095,1033];
    a[8599]=[1095,1068];
    a[8600]=[1095,1048];
    a[11377]=[1054,1086];

    return a;
}
