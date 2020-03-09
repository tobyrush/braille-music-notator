/* global document, cursor, score, useBrailleDisplay, checkContiguousCells, checkPreviousCell, ctx, formFill, kScreenReaderTemplate, getCellContext, kCharNames, kDotsPrefix, brailleDots, speechSynthesizer, SpeechSynthesisUtterance, speaker: true */
/* jshint esversion: 6 */

function updateScreenreader(msg) {
	if (useBrailleDisplay) {
		document.getElementById("brailledisplay").innerHTML=getScoreLine(+cursor.y);
	}
    speaker.speak(msg);
}

//function oldUpdateScreenreader(msg) {
//	if (useBrailleDisplay) {
//		document.getElementById("screenreader").innerHTML=getScoreLine(+cursor.y);
//	} else {
//		document.getElementById("screenreader").innerHTML=formFill(kScreenReaderTemplate,[msg,(+cursor.y),(+cursor.x),getScoreDescriptor(cursor.x,cursor.y)]);
//	}
//}

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
	
	if (typeof score[row]!=='undefined' && score[row]!==null) {
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

class speechSynthesizer {
    constructor(w) {
        this.synth = w.speechSynthesis;
        this.pitch = 1;
        this.rate = 2;
        this.voices = this.synth.getVoices();
        this.voice = this.voices[0];
        this.whichVoice = 0;
        this.mute = true;
    }
    speak(message) {
        if (!this.mute) {
            var u = new SpeechSynthesisUtterance(message);
            u.pitch = this.pitch;
            u.rate = this.rate;
            u.voice = this.voice;
            this.synth.speak(u);
        }
    }
    nextVoice() {
        if (!this.mute) {
            this.whichVoice++;
            if (this.whichVoice>this.voices.length-1) {
                this.whichVoice = 0;
            }
            this.voice = this.voices[this.whichVoice];
            this.speak("Voice set to "+this.voice.name);
        }
    }
    previousVoice() {
        if (!this.mute) {
            this.whichVoice--;
            if (this.whichVoice<0) {
                this.whichVoice = this.voices.length-1;
            }
            this.voice = this.voices[this.whichVoice];
            this.speak("Voice set to "+this.voice.name);
        }
    }
    increaseRate() {
        if (!this.mute) {
            this.rate++;
            this.speak("Screen reader tempo set to " + this.rate);
        }
    }
    decreaseRate() {
        if (!this.mute) {
            this.rate--;
            this.speak("Screen reader tempo set to " + this.rate);
        }
    }
    setRate(n) {
        if (!this.mute) {
            this.rate = n;
            this.speak("Screen reader tempo set to " + this.rate);
        }
    }
    increasePitch() {
        if (!this.mute) {
            this.pitch++;
            this.speak("Screen reader pitch set to " + this.pitch);
        }
    }
    decreasePitch() {
        if (!this.mute) {
            this.pitch--;
            this.speak("Screen reader pitch set to " + this.pitch);
        }
    }
    setPitch(n) {
        if (!this.mute) {
            this.pitch = n;
            this.speak("Screen reader pitch set to " + this.pitch);
        }
    }
    muteSound() {
        this.speak("Screen reader off.");
        this.mute = true;
    }
    unmuteSound() {
        this.mute = false;
        this.speak("Screen reader on.");
    }
}
