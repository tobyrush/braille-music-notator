/* global midiConnected, midiNotes, notate, octaveValues, restValues, sharpNoteValues, flatNoteValues, drawNotation, octaveCharValues, pitchValues, score, cursor, useLaunchpad, insertOctaveSymbols: true */
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

function notateMIDINotes(duration,forceShowOctave,sharp) {
    midiNotes.sort(function(a,b) {
        return b-a; // sorts high to low
    });
    var pc = -1;
    var noteArray;
    if (midiNotes.length) {
        if (useLaunchpad) {
            pc = translateLaunchpad(midiNotes[0]).pitchClass;
        } else {
            pc = midiNotes[0] % 12;
        }
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

        if (useLaunchpad) {
            oct = translateLaunchpad(midiNotes[0]).octave;
        }

        if (forceShowOctave || needsOctaveSign(score[cursor.y],cursor.x,p,oct)) {
            notate(octaveValues[oct],"");
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

function findPitchAtPosition(chars,position) {
    var result = {};
    var newPitch, justChanged, i = 0;
    result.pitch = 0;
    result.octave = -99;
    if (chars) {
        while (i<position) {
            if (typeof(octaveCharValues[chars[i]])==='number') {
                result.octave = octaveCharValues[chars[i]];
                justChanged = true;
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

function translateLaunchpad(value) {
    var result = {};

    result.pitchClass = [-1,0,2,4,5,7,9,11,-1,-1][value % 10];
    result.octave = Math.floor(value/10);

    return result;
}
