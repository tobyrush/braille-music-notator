/* global midiConnected, midiNotes, notate, octaveValues, restValues, sharpNoteValues, flatNoteValues, drawNotation, octaveCharValues, pitchValues, score, cursor, insertOctaveSymbols, getScoreLine, diatonicNoteValues, observeKeySignatures, spellChordsDownward, intervalValues, intervalCharValues: true */
/* jshint -W020 */

function onMIDISuccess(midiAccess) {

	midiConnected = true;
    for (var input of midiAccess.inputs.values())
        input.onmidimessage = getMIDIMessage;

}

function onMIDIFailure() {

	midiConnected = false;

}

function getMIDIMessage(midiMessage) {
    var command = midiMessage.data[0];
    var note = midiMessage.data[1];
    var velocity = midiMessage.data[2];
    switch (command) {
        case 144:
            if (velocity>0) {
                midiNoteOn(note);
            } else {
                midiNoteOff(note);
            }
            break;
        case 128:
            midiNoteOff(note);
            break;
    }
}

function midiNoteOff(note) {
    midiNotes = midiNotes.filter(function(item) {
        return item !== note;
    });
}

function midiNoteOn(note) {
    midiNoteOff(note);
    midiNotes.push(note);
}

function translateMIDIChord(midiNoteSet,topDown=true) {
    if (midiNoteSet.length) {
        midiNoteSet.sort(function(a,b) {
            if (topDown) {
                return b-a; // sorts high to low
            } else {
                return a-b; // sorts low to high
            }
        });
        var noteArray = [];
        midiNoteSet.forEach( function(note) {
            noteArray.push([note % 12, getOctave(note)]);
        });
        return noteArray;
    } else {
        return [];
    }
}

function getMIDINotes(duration,octaveFlag,key,topDown=spellChordsDownward) {
    var noteArray = [],
        p = translateMIDIChord(midiNotes,topDown);
    if (p.length) {
        if (octaveFlag == 1 || ( octaveFlag === 0 && needsOctaveSign(score[cursor.y],cursor.x,key.getDiatonicPitch(p[0][0]),p[0][1]))) {
            noteArray.push(...octaveValues[p[0][1]]);
        }
        noteArray.push(...key.notateInKey(p[0][0],duration));
        if (p.length>1) {
            for (var i=1; i<p.length; i++) {
                noteArray.push(...key.notateIntervalInKey(
                    p[i][0],
                    p[i][1],
                    p[0][0],
                    p[0][1],
                    p[i-1][0],
                    p[i-1][1]
                ));
            }
        }
        return noteArray;
    } else {
        return restValues[duration];
    }
}

function notateMIDINotes(duration,forceShowOctave) {

    var k;
    if (observeKeySignatures) {
        k=findKeySignatureAtPosition(cursor.x,cursor.y);
    } else {
        k=findKeySignatureAtPosition(0,0);
    }

    var oct = 0;
    if (!insertOctaveSymbols) {oct = -1; }
    if (forceShowOctave) {oct = 1; }

    notate(getMIDINotes(duration,oct,k,spellChordsDownward));

    drawNotation();
}

//function oldNotateMIDINotes(duration,forceShowOctave) {
//    midiNotes.sort(function(a,b) {
//        return b-a; // sorts high to low
//    });
//    var pc = -1;
//    var noteArray;
//    if (midiNotes.length) {
//        pc = midiNotes[0] % 12;
//    }
//
//    if (pc<0) {
//        notate(restValues[duration]);
//    } else {
//
//        var k;
//        if (observeKeySignatures) {
//            k=findKeySignatureAtPosition(cursor.x,cursor.y);
//        } else {
//            k=findKeySignatureAtPosition(0,0);
//        }
//        noteArray = k.notateInKey(pc,duration);
//
//        var p = getPitch(noteArray); // return diatonic pitch # from noteArray
//        var oct = getOctave(midiNotes[0]); // return octave number from MIDI pitch value
//
//        if (forceShowOctave || needsOctaveSign(score[cursor.y],cursor.x,p,oct)) {
//            notate(octaveValues[oct],"");
//        }
//
//        notate(noteArray);
//    }
//
//    drawNotation();
//}

function getPitch(noteArray) {
    if (noteArray.length>1) {
        return pitchValues[noteArray[1]];
    } else {
        return pitchValues[noteArray[0]];
    }
}

function getOctave(midiPitch) {
    return Math.floor(midiPitch/12)-1;
}

function findIntervalAtPosition(chars,position,interval,descending) {
    var p = findPitchAtPosition(chars,position);
    var int = interval * (descending ? -1 : 1);
    p.pitch += int;
    while (p.pitch<0) {
        p.pitch += 7;
        p.octave -= 1;
    }
    while (p.pitch>6) {
        p.pitch -= 7;
        p.octave += 1;
    }
    return p;
}

function findPitchAtPosition(chars,position) {
    var result = {};
    var newPitch, justChanged, i = 0;
    result.pitch = 0;
    result.octave = -99;
    if (chars) {
        while (i<position) {
            if (typeof(octaveCharValues[chars[i]])==='number') {
                if (chars.length<i || typeof(intervalCharValues[chars[i+1]]) !== "number") {
                    result.octave = octaveCharValues[chars[i]];
                    justChanged = true;
                }
            } else if (typeof(pitchValues[chars[i]])==='number') {
                newPitch = pitchValues[chars[i]];
                if (!justChanged) {
                    if ((result.pitch==6 && newPitch<2) || (result.pitch==5 && newPitch===0)) {
                        result.octave += 1;
                    } else if ((result.pitch===0 && newPitch>4) || (result.pitch==1 && newPitch==6)) {
                        result.octave -= 1;
                    }
                }
                result.pitch = newPitch;
                justChanged = false;
            }
            i++;
        }
    }
    return result;
}

function findKeySignatureAtPosition(xPos,yPos) {
    var currentRow;
    var kFlat = String.fromCharCode(160);
    var kSharp = String.fromCharCode(137);
    for (var row=yPos; row>-1; row--) {
        currentRow = getScoreLine(row,false);
        if (row==yPos) {
            currentRow = currentRow.slice(0,xPos);
        }
        var r = new RegExp('ë?[ČčĎď]?['+kFlat+kSharp+']{1,3}','g');
        if (r.test(currentRow)) {
            var m=currentRow.match(r);
            return new keySignature(m[m.length-1]);
        }
    }
    return new keySignature("");
}

function needsOctaveSign(chars,position,pitch,octave) {

	if (insertOctaveSymbols) {
        var c = findPitchAtPosition(chars,position);
        return !((octave==c.octave && Math.abs(c.pitch-pitch)<5) ||
                (octave>c.octave && ((c.pitch==6 && pitch<2) || (c.pitch==5 && pitch===0))) ||
                (octave<c.octave && ((c.pitch===0 && pitch>4) || (c.pitch==1 && pitch==6)))
                );
    } else {
        return false;
    }
}

class keySignature {
    constructor(chars) {
        if (chars==="") {
            this.keyNum = 0;
        } else {
            var kFlat = String.fromCharCode(160);
            var kSharp = String.fromCharCode(137);
            if (/ëČ/.test(chars)) { this.keyNum=4; }
            else if (/ëč/.test(chars)) { this.keyNum=5; }
            else if (/ëĎ/.test(chars)) { this.keyNum=6; }
            else if (/ëď/.test(chars)) { this.keyNum=7; }
            else { this.keyNum = chars.match(new RegExp('['+kFlat+kSharp+']','g')).length; }
            if (chars.indexOf(kFlat) > -1) { this.keyNum = this.keyNum * -1; }
        }
        let C=0, D=1, E=2, F=3, G=4, A=5, B=6;
        let L=-0, l=1, n=2, s=3, S=4;
        this.keyMap = [];
        this.keyMap[-7]=[[C,n],[D  ],[E,L],[E  ],[F  ],[F,n],[G  ],[G,n],[A  ],[B,L],[B  ],[C  ]];
        this.keyMap[-6]=[[C,n],[D  ],[D,n],[E  ],[F,l],[F  ],[G  ],[G,n],[A  ],[B,L],[B  ],[C  ]];
        this.keyMap[-5]=[[C  ],[D  ],[D,n],[E  ],[F,l],[F  ],[G  ],[G,n],[A  ],[A,n],[B  ],[C,l]];
        this.keyMap[-4]=[[C  ],[D  ],[D,n],[E  ],[E,n],[F  ],[G,l],[G  ],[A  ],[A,n],[B  ],[C,l]];
        this.keyMap[-3]=[[C  ],[D,l],[D  ],[E  ],[E,n],[F  ],[G,l],[G  ],[A  ],[A,n],[B  ],[B,n]];
        this.keyMap[-2]=[[C  ],[D,l],[D  ],[E  ],[E,n],[F  ],[F,s],[G  ],[A,l],[A  ],[B  ],[B,n]];
        this.keyMap[-1]=[[C  ],[C,s],[D  ],[E,l],[E  ],[F  ],[F,s],[G  ],[A,l],[A  ],[B  ],[B,n]];
        this.keyMap[ 0]=[[C  ],[C,s],[D  ],[E,l],[E  ],[F  ],[F,s],[G  ],[G,s],[A  ],[B,l],[B  ]];
        this.keyMap[ 1]=[[C  ],[C,s],[D  ],[D,s],[E  ],[F,n],[F  ],[G  ],[G,s],[A  ],[B,l],[B  ]];
        this.keyMap[ 2]=[[C,n],[C  ],[D  ],[D,s],[E  ],[F,n],[F  ],[G  ],[G,s],[A  ],[A,s],[B  ]];
        this.keyMap[ 3]=[[C,n],[C  ],[D  ],[D,s],[E  ],[E,s],[F  ],[G,n],[G  ],[A  ],[A,s],[B  ]];
        this.keyMap[ 4]=[[B,s],[C  ],[D,n],[D  ],[E  ],[E,s],[F  ],[G,n],[G  ],[A  ],[A,s],[B  ]];
        this.keyMap[ 5]=[[B,s],[C  ],[D,n],[D  ],[E  ],[E,s],[F  ],[F,S],[G  ],[A,n],[A  ],[B  ]];
        this.keyMap[ 6]=[[B,s],[C  ],[C,S],[D  ],[E,n],[E  ],[F  ],[F,S],[G  ],[A,n],[A  ],[B  ]];
        this.keyMap[ 7]=[[B  ],[C  ],[C,S],[D  ],[E,n],[E  ],[F  ],[F,S],[G  ],[G,S],[A  ],[B,n]];
    }
    getDiatonicPitch(pc) {
        return this.keyMap[this.keyNum][pc][0];
    }
    notateInKey(pc,duration) {
        var r = [],
            n = this.keyMap[this.keyNum][pc],
            acc = [[60,60],[60],[42],[37],[37,37]];
        if (n.length>1) {
            r.push(...acc[n[1]]);
        }
        r.push(...diatonicNoteValues[duration][n[0]]);
        return r;
    }
    getIntervalInKey(pc,oct,basePC,baseOct) {
        // this is 0-based (0=unison, 1=2nd, etc.)
        return Math.abs(this.keyMap[this.keyNum][pc][0]-this.keyMap[this.keyNum][basePC][0]+((oct-baseOct)*7));
    }
    intervalNeedsOctaveSign(pc,oct,basePC,baseOct) {
        var int = this.getIntervalInKey(pc,oct,basePC,baseOct);
        return ((int === 0) || (int > 7));
    }
    notateIntervalInKey(pc,oct,basePC,baseOct,lastPC=basePC,lastOct=baseOct) {
        var r = [],
            n = this.keyMap[this.keyNum][pc],
            acc = [[60,60],[60],[42],[37],[37,37]];
        if (this.intervalNeedsOctaveSign(pc,oct,lastPC,lastOct)) {
            r.push(...octaveValues[oct]);
        }
        if (n.length>1) {
            r.push(...acc[n[1]]);
        }
        r.push(...intervalValues[this.getIntervalInKey(pc,oct,basePC,baseOct) % 7]);
        return r;
    }
}
