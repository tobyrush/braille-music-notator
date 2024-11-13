/* global dropzone, drawNotation, window, reader, fileUploader, saveToUndo, suspendUndo, score, hScroll, vScroll, setScrollVars, parseFiles, isLowASCII, setScore, cursor, scoreWidth, showPageBreaks, pageWidth, pageHeight, document, MouseEvent, currentBeatUnit, kFileNameBRF, kFileNameBRM, kPrefixAbbreviations, kWordAbbreviations, kTextAbbreviations, kCommonWords, currentFileName, shiftKeyDown, confirm, kUnsavedChangesDialogMessage, clearDocument, resetCursorAndScroll, removeExtension, DOMParser, sendHTTPPostRequest, XMLSerializer, FormData, Blob, scoreIsEmpty, fileLoading, ipaBrailleMap: true */
/* jshint esversion: 6 */
/* jshint -W020 */
/* jshint -W100 */

function importMusicXML(doc) {
	let importObject = {};
	let root = doc.children[0]; // the score-partwise object
	let header = {};
	header.workTitle = getXMLTagData(root, 'work-title');
	header.workNumber = getXMLTagData(root, 'work-number');
	header.movementTitle = getXMLTagData(root, 'movement-title');
	header.movementNumber = getXMLTagData(root, 'movement-number');
	header.creators = {};
	[...root.getElementsByTagName('creator')].forEach( tag => {
		header.creators[tag.getAttribute('type') ?? 'creator'] = tag.innerHTML;
	});
	header.rights = {};
	[...root.getElementsByTagName('rights')].forEach( tag => {
		header.rights[tag.getAttribute('type') ?? 'rights'] = tag.innerHTML;
	});
	// we're going to ignore the <encoding> information
	header.source = getXMLTagData(root, 'source');
	// we're also going to ignore any <miscellaneous> information
	
	importObject.currentKey = null; // {fifths: null, mode: null};
	importObject.currentMeter = null; // {beats: null, beatType: null};
	importObject.currentDivisions = 1;
	
	importObject.header = header;
	importObject.parts = [];
	
	[...root.getElementsByTagName('part-list')[0].getElementsByTagName('score-part')].forEach( scorePart => {
		let part = {};
		part.id = scorePart.getAttribute('id')
		part.partName = getXMLTagData(scorePart, 'part-name');
		part.partAbbreviation = getXMLTagData(scorePart, 'part-abbreviation');
		importObject.parts.push(part);
	});
	
	[...root.getElementsByTagName('part')].forEach( partBlock => {
		let partObject = importObject.parts.find((e) => e.id == partBlock.getAttribute('id'));
		partObject.measures = [];
		[...partBlock.getElementsByTagName('measure')].forEach( measureBlock => {
			let m = new MXMeasure(measureBlock, importObject.currentDivisions);
			importObject.currentDivisions = m.divisions;
			if (importObject.currentKey) {
				if (m.key && importObject.currentKey.fifths == m.key.fifths && importObject.currentKey.mode == m.key.mode) {
					m.key = null;
				} else {
					importObject.currentKey = m.key;
				}
			} else {
				importObject.currentKey = m.key;
				m.key = null;
			}
			partObject.measures.push(m);
		});
	});
	let x = 0;
	
}

class MXMeasure {
	constructor(obj, divisions = 1) {
		this.obj = obj;
		this.chords = [];
		this.parseAttributes();
		this.parseEntries();
	}
	parseAttributes() {
		if (this.obj.getElementsByTagName('time').length) { // if this measure contains a meter change
			this.meter = { beats: getXMLTagData(this.obj, 'beats'), beatType: getXMLTagData(this.obj, 'beat-type')};
		} else {
			this.meter = null;
		}
		if (this.obj.getElementsByTagName('key').length) { // if this measure contains a key change
			this.key = { fifths: getXMLTagData(this.obj, 'fifths'), mode: getXMLTagData(this.obj, 'mode')};
		} else {
			this.key = null;
		}
		if (this.obj.getElementsByTagName('divisions').length) { // if this measure changes the divisions value
			this.divisions = this.obj.getElementsByTagName('divisions')[0].innerHTML * 1;
		} else {
			this.divisions = divisions;
		}
		this.measureNumber = getXMLTagData(this.obj, 'number');
	}
	parseEntries() {
		let currentChord = null;
		let currentLocation = 0;
		for (const entry of this.obj.childNodes) {
			let e;
			switch (entry.tagName) {
				case 'note':
					e = new MXNote(entry);
					if (e.chord) {
						// if file is well-formed then currentChord should be instantiated
						currentChord.addNote(e);
					} else {
						if (currentChord) {
							this.chords.push(currentChord);
							currentLocation += currentChord.duration;
						}
						currentChord = new MXChord(e,currentLocation);
					}
					break;
				case 'backup':
					
					break;
				case 'forward':
					
					break;
				case 'direction':
					
					break;
				case 'attributes':
					
					break;
				case 'harmony':
					
					break;
				case 'figured-bass':
					
					break;
				case 'print':
					
					break;
				case 'sound':
					
					break;
				case 'listening':
					
					break;
				case 'barline':
					
					break;
				case 'grouping':
					
					break;
				case 'link':
					
					break;
				case 'bookmark':
					
					break;
			}
		}
	}
}

class MXChord {
	constructor(note) {
		this.grace = note.grace;
		this.cue = note.cue;
		this.staff = note.staff;
		this.duration = note.duration;
		this.dots = note.dots;
		this.type = note.type;
		this.tie = note.tie;
		this.notes = [note];
	}
	addNote(note) {
		this.notes.push(note);
	}
	getChars(includeOctave, spellDownward = true) {
		if (this.notes.length>1) {
			this.notes.sort((a,b) => { 
				return spellDownward ? b.midiValue() - a.midiValue() : a.midiValue() - b.midiValue();
			});
		}
		let r = [];
		r.push(...this.notes[0].getChars(includeOctave));
		let i = 1;
		while (this.notes.length > i) {
			r.push(...this.notes[i].getChordChars(this.notes[0],spellDownward));
		}
		return r;
	}
}

class MXNote {
	constructor(obj) {
		this.obj = obj;
		this.chord = obj.getElementsByTagName('chord').length > 0;
		this.rest = obj.getElementsByTagName('rest').length > 0;
		this.grace = obj.getElementsByTagName('grace').length > 0;
		this.cue = obj.getElementsByTagName('cue').length > 0;
		this.voice = (getXMLTagData(obj, 'voice') ?? 0) * 1;
		this.staff = (getXMLTagData(obj, 'staff') ?? 0) * 1;
		this.duration = (getXMLTagData(obj, 'duration') ?? 0) * 1;
		this.dots = obj.getElementsByTagName('dot').length;
		this.accidental = getXMLTagData(obj, 'accidental');
		this.type = getXMLTagData(obj, 'type');
		if (this.rest) {
			this.type = (obj.getElementsByTagName('rest')[0].getAttribute('measure') == 'yes') ? 'measure' : this.type;
		} else if (obj.getElementsByTagName('unpitched').length) {
			this.type = 'unmeasured';
		} else {
			this.step = getXMLTagData(obj, 'step').toUpperCase();
			this.alter = getXMLTagData(obj, 'alter');
			this.octave = getXMLTagData(obj, 'octave');
			this.tie = obj.getElementsByTagName('cue').length > 0;
		}
	}
	midiValue() {
		if (this.rest) {
			return null;
		} else {
			return ((this.octave+1)*12) + {'C':0, 'D':2, 'E':4, 'F':5, 'G':7, 'A':9, 'B':11}[this.step.toUpperCase()] + this.alter;
		}
	}
	getChordChars(refNote, downwardDirection) {
		let r = [];
		r.push(this.getAccidentalChars());
		let dpcVals = {'C':0, 'D':1, 'E':2, 'F':3, 'G':4, 'A':5, 'B':6}
		let base = (refNote.octave*7)+dpcVals[refNote.step];
		let target = (this.octave*7)+dpcVals[this.step];
		let diff = downwardDirection ? (base-target) : (target-base);
		let interval = (diff-1)%7; // interval value is offset by 2 (second = 0, third = 1, fourth = 2, etc.)
		if (diff > 7) {
			r.push(this.getOctaveChars());
		}
		r.push(['intervalSecond','intervalThird','intervalFourth','intervalFifth','intervalSixth','intervalSeventh'][interval]);
		return r;
	}
	getAccidentalChars() {
		let r = [];
		if (this.accidental) {
			r.push(...{
				'':[],
				'sharp':['accidentalSharp'],
				'natural':['accidentalNatural'],
				'flat':['accidentalFlat'],
				'double-sharp':['accidentalDoubleSharp'],
				'sharp-sharp':['accidentalSharp','accidentalSharp'],
				'flat-flat':['accidentalDoubleFlat'],
				'natural-sharp':['accidentalNatural','accidentalSharp'],
				'natural-flat':['accidentalNatural','accidentalFlat'],
				'quarter-flat':['accidentalOneQuarterFlat'],
				'quarter-sharp':['accidentalOneQuarterSharp'],
				'three-quarters-flat':['accidentalThreeQuartersFlat'],
				'three-quarters-sharp':['accidentalThreeQuartersSharp'],
				'sharp-down':['accidentalOneQuarterSharp'],
				'sharp-up':['accidentalThreeQuartersSharp'],
				'natural-down':['accidentalOneQuarterFlat'],
				'natural-up':['accidentalOneQuarterSharp'],
				'flat-down':['accidentalThreeQuartersFlat'],
				'flat-up':['accidentalOneQuarterFlat'],
				'double-sharp-down':['accidentalThreeQuartersSharp'],
				'double-sharp-up':['accidentalDoubleSharp','accidentalOneQuarterSharp'],
				'flat-flat-down':['accidentalDoubleFlat','accidentalOneQuarterFlat'],
				'flat-flat-up':['accidentalThreeQuartersFlat'],
				'arrow-down':['accidentalOneQuarterFlat'],
				'arrow-up':['accidentalOneQuarterSharp'],
				'triple-sharp':['accidentalDoubleSharp','accidentalSharp'],
				'triple-flat':['accidentalDoubleFlat','accidentalFlat'],
				'slash-quarter-sharp':['accidentalFiveCommasSharp'],
				'slash-sharp':['accidentalThreeQuartersSharp'],
				'slash-flat':['accidentalFourCommasFlat'],
				'double-slash-flat':['accidentalThreeQuartersFlat'],
				'sharp-1':['accidentalOneQuarterSharp'],
				'sharp-2':['accidentalSharp'],
				'sharp-3':['accidentalThreeQuartersSharp'],
				'sharp-5':['accidentalFiveCommasSharp'],
				'flat-1':['accidentalOneQuarterFlat'],
				'flat-2':['accidentalFlat'],
				'flat-3':['accidentalThreeQuartersFlat'],
				'flat-4':['accidentalFourCommasFlat'],
				'sori':['accidentalOneQuarterSharp'],
				'koron':['accidentalOneQuarterFlat']
			}[this.accidental]);
		}
		return r;
	}
	getOctaveChars() {
		return ['octave0','octave1','octave2','octave3','octave4','octave5','octave6','octave7','octave8'][this.octave+1];
	}
	getChars(includeOctave) {
		let r = [];
		r.push(...this.getAccidentalChars());
		if (includeOctave) {
			r.push(this.getOctaveChars());
		}
		if (this.rest) {
			r.push(...{
				'1024th':['restOneHundredTwentyFourth'],
				'512th':['restFiveHundredTwelfth'],
				'256th':['restTwoHundredFiftySixth'],
				'128th':['restOneHundredTwentyEighth'],
				'64th':['restSixtyFourth'],
				'32nd':['restThirtySecond'],
				'16th':['restSixteenth'],
				'eighth':['restEighth'],
				'quarter':['restQuarter'],
				'half':['restHalf'],
				'whole':['restWhole'],
				'breve':['restDoubleWhole'],
				'long':['restLong'],
				'maxima':['restMaxima']
			}[this.type]);
		} else if (this.type == 'unpitched') {
			r.push(...{ // change with stemless
				'1024th':['restOneHundredTwentyFourth'],
				'512th':['restFiveHundredTwelfth'],
				'256th':['restTwoHundredFiftySixth'],
				'128th':['restOneHundredTwentyEighth'],
				'64th':['restSixtyFourth'],
				'32nd':['restThirtySecond'],
				'16th':['restSixteenth'],
				'eighth':['restEighth'],
				'quarter':['restQuarter'],
				'half':['restHalf'],
				'whole':['restWhole'],
				'breve':['restDoubleWhole'],
				'long':['restLong'],
				'maxima':['restMaxima']
			}[this.type]);
		} else {
			let n = this.step;
			r.push(...{
				'1024th':['noteOneHundredTwentyFourth'+n],
				'512th':['noteFiveHundredTwelfth'+n],
				'256th':['noteTwoHundredFiftySixth'+n],
				'128th':['noteOneHundredTwentyEighth'+n],
				'64th':['noteSixtyFourth'+n],
				'32nd':['noteThirtySecond'+n],
				'16th':['noteSixteenth'+n],
				'eighth':['noteEighth'+n],
				'quarter':['noteQuarter'+n],
				'half':['noteHalf'+n],
				'whole':['noteWhole'+n],
				'breve':['noteDoubleWhole'+n],
				'long':['noteLong'+n],
				'maxima':['noteMaxima']
			}[this.type]);
		}
		return r;
	}
}