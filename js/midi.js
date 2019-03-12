/* global midiConnected, midiNotes, notate, octaveValues, restValues, sharpNoteValues, flatNoteValues, drawNotation, octaveCharValues, pitchValues, score, cursor: true */
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

function notateMIDINotes(duration,showOctave,sharp) {
    midiNotes.sort(function(a,b) {
        return b-a; // sorts high to low
    });
    var pc = -1;
    var noteArray;
    if (midiNotes.length) {
        pc = midiNotes[0] % 12;
    }

    if (pc<0) {
        notate(restValues[duration]);
    } else {

        if (sharp) {
            noteArray = sharpNoteValues[duration][pc];
        } else {
            noteArray = flatNoteValues[duration][pc];
        }

        var p = getPitch(noteArray); // return diatonic pitch # from noteArray
        var oct = getOctave(midiNotes[0]); // return octave number from MIDI pitch value

        if (showOctave || needsOctaveSign(score[cursor.y],cursor.x,p,oct)) {
            notate(octaveValues[Math.floor(midiNotes[0]/12)-1],"");
        }

        notate(noteArray);
    }

    drawNotation();
}

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

function needsOctaveSign(chars,position,pitch,octave) {

	var justChanged, curOctave = -99;
	var newPitch, curPitch = 0;
	var diff = 0;
	var i = 0;
	while (i<position) {
		if (typeof(octaveCharValues[chars[i]])==='number') {
            curOctave = octaveCharValues[chars[i]];
            justChanged = true;
        } else if (typeof(pitchValues[chars[i]])==='number') {
            newPitch = pitchValues[chars[i]];
            if (!justChanged) {
                if ((curPitch==6 && newPitch<2) || (curPitch==5 && newPitch===0)) {
                    curOctave += 1;
                } else if ((curPitch===0 && newPitch>4) || (curPitch==1 && newPitch==6)) {
                    curOctave -= 1;
                }
            }
            curPitch = newPitch;
            justChanged = false;
        }
		i++;
	}

    if ((octave==curOctave && Math.abs(curPitch-pitch)<4) ||
        (octave>curOctave && ((curPitch==6 && pitch<2) || (curPitch==5 && pitch===0))) ||
        (octave<curOctave && ((curPitch===0 && pitch>4) || (curPitch==1 && pitch==6)))
        ) {
        return false;
    } else {
        return true;
    }

}

//function findOctave(chars,position) {
//	var justChanged, curOctave = 4;
//	var newPitch, curPitch = 0;
//	var diff = 0;
//	var i = 0;
//	while (i<position) {
//		if (typeof(octaveCharValues[chars[i]])==='number') {
//            curOctave = octaveCharValues[chars[i]];
//            justChanged = true;
//        } else if (typeof(pitchValues[chars[i]])==='number') {
//            newPitch = pitchValues[chars[i]];
//            if (!justChanged) {
//                if ((curPitch==6 && newPitch<2) || (curPitch==5 && newPitch===0)) {
//                    curOctave += 1;
//                } else if ((curPitch===0 && newPitch>4) || (curPitch==1 && newPitch==6)) {
//                    curOctave -= 1;
//                }
//            }
//            curPitch = newPitch;
//            justChanged = false;
//        }
//		i++;
//	}
//    return curOctave;
//}
