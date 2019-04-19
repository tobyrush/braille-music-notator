/* global document, cursor, score, useBrailleDisplay, checkContiguousCells, checkPreviousCell, ctx, formFill, kScreenReaderTemplate, getCellContext, kCharNames, kDotsPrefix, brailleDots: true */

function updateScreenreader(msg) {
	if (useBrailleDisplay) {
		document.getElementById("screenreader").innerHTML=getScoreLine(+cursor.y);
	} else {
		document.getElementById("screenreader").innerHTML=formFill(kScreenReaderTemplate,[msg,(+cursor.y),(+cursor.x),getScoreDescriptor(cursor.x,cursor.y)]);
	}
}

function getScoreDescriptor(x,y) {
	
	var val=0;
    if ((typeof score[y]!=="undefined") && (score[y]!==null) && (typeof score[y][x]!=="undefined")) {
		val=score[y][x];
	}
	
	return characterName(val,x,y);
	
}
	
function getScoreLine(row,lowASCII=true) {
	
	var lineString = "";
    var modValue = Infinity;

    if (lowASCII) { modValue = 100; }
	
	if (typeof score[row]!=='undefined') {
        for (var col=0; col<=score[row].length; col+=1) {
            if ((typeof score[row][col]!=='undefined') && (score[row][col]>0)) {
                lineString=lineString+String.fromCharCode(score[row][col] % modValue);
            } else {
                lineString=lineString+" ";
            }
        }
    }
	
	return lineString;
}

function characterName(val,x,y) {
	
	var context;
    if (x == -1) {
        context = "   "+String.fromCharCode(val)+"   ";
    } else {
        context = getCellContext(x,y);
    }
    var found = kCharNames.find(function(e) {
      return RegExp(e[0]).test(context);
    });
    if (typeof found==="undefined") {
        return getDotsDescription(val);
    } else {
        return found[1];
    }
}

function getDotsDescription(val) {
    var r = kDotsPrefix;
    var code = brailleDots[(val % 100)-32];
    if (code & 1) { // dot 1
        r=r+" 1";
    }
    if (code & 2) { // dot 2
        r=r+" 2";
    }
    if (code & 4) { // dot 3
        r=r+" 3";
    }
    if (code & 8) { // dot 4
        r=r+" 4";
    }
    if (code & 16) { // dot 5
        r=r+" 5";
    }
    if (code & 32) { // dot 6
        r=r+" 6";
    }
    return r;
}
