/* global dropzone, drawNotation, window, reader, fileUploader, saveToUndo, suspendUndo, score, hScroll, vScroll, setScrollVars, parseFiles, isLowASCII, setScore, cursor, scoreWidth, showPageBreaks, pageWidth, pageHeight, document, MouseEvent, currentBeatUnit, kFileNameBRF, kFileNameBRM, kPrefixAbbreviations, kWordAbbreviations, kTextAbbreviations, kCommonWords, currentFileName, shiftKeyDown, confirm, kUnsavedChangesDialogMessage, clearDocument, resetCursorAndScroll, removeExtension, DOMParser, sendHTTPPostRequest, XMLSerializer, FormData, Blob, scoreIsEmpty, fileLoading, ipaBrailleMap: true */
/* jshint esversion: 6 */
/* jshint -W020 */
/* jshint -W100 */

function importMusicXML(xmlDoc) {
	
	// import file into importObject
	
	let importObject = {};
	let doc = new MXNode(xmlDoc).child('score-partwise');
	
	let header = {};
	header.workTitle = doc.child('work-title').data; // getXMLTagData(root, 'work-title');
	header.workNumber = doc.child('work-number').data; // getXMLTagData(root, 'work-number');
	header.movementTitle = doc.child('movement-title').data; // getXMLTagData(root, 'movement-title');
	header.movementNumber = doc.child('movement-number').data; // getXMLTagData(root, 'movement-number');
	header.creators = {};
	doc.children('creator').forEach( c => {
		header.creators[c.attr('type') ?? 'creator'] = c.data;
	});
	
	header.rights = {};
	doc.children('rights').forEach( r => {
		header.rights[r.attr('type') ?? 'rights'] = r.data;
	});
	
	// we're going to ignore the <encoding> information
	
	header.source = doc.child('source').data; // getXMLTagData(root, 'source');
	
	// we're also going to ignore any <miscellaneous> information
	
	// importObject.currentKey = null; // {fifths: null, mode: null};
	importObject.firstKey = null;
	// importObject.currentMeter = null; // {beats: null, beatType: null};
	importObject.firstMeter = null;
	importObject.currentDivisions = 1;
	
	importObject.header = header;
	importObject.parts = [];
	
	doc.child('part-list').children('score-part').forEach( scorePart => {
		let part = {};
		part.id = scorePart.attr('id');
		part.partName = scorePart.child('part-name').data; // getXMLTagData(scorePart, 'part-name');
		part.partAbbreviation = scorePart.child('part-abbreviation').data; // getXMLTagData(scorePart, 'part-abbreviation');
		importObject.parts.push(part);
	});
	
	doc.children('part').forEach( partNode => {
		let partObject = importObject.parts.find((e) => e.id == partNode.attr('id'));
		partObject.measures = [];
		partNode.children('measure').forEach( measureNode => {
			let m = new MXMeasure(measureNode, importObject.currentDivisions);
			importObject.currentDivisions = m.divisions;
			if (!importObject.firstKey) {
				if (m.key) {
					importObject.firstKey = {fifths: m.key.fifths, mode: m.key.mode};
				} else {
					importObject.firstKey = {fifths: null, mode: null};
				}
			}
			// if (importObject.currentKey) {
			// 	if (m.key && importObject.currentKey.fifths == m.key.fifths && importObject.currentKey.mode == m.key.mode) {
			// 		m.key = null;
			// 	} else {
			// 		importObject.currentKey = m.key;
			// 	}
			// } else {
			// 	importObject.currentKey = m.key;
			// 	m.key = null;
			// }
			if (!importObject.firstMeter) {
				if (m.meter) {
					importObject.firstMeter = {beats: m.meter.beats, beatType: m.meter.beatType};
				} else {
					importObject.firstMeter = {beats: null, beatType: null};
				}
			}
			partObject.measures.push(m);
		});
	});
	
	// generate BRM file
	// we're given pageWidth and pageHeight as global variables
	
	// generate title information
	
	let titleArea = new MXScoreArea(currentCellFont,pageWidth,0);
	
	if (header.workTitle) {
		let t = header.workTitle;
		if (header.workNumber) {
			t = t + ', ' + header.workNumber;
		}
		titleArea.setLiteraryTextLine(t, 'center');
	}
	if (header.movementTitle) {
		t = header.movementTitle;
		if (header.movementNumber) {
			t = header.movementNumber + ': ' + t;
		}
		titleArea.setLiteraryTextLine(t, 'center');
	}
	
	let timeKeyLine = new MXScoreArea(currentCellFont,pageWidth,0);
	let c = [];
	if (importObject.firstKey.fifths) {
		// t = t + timeKeyLine.charStringToText(getKeyChars(importObject.firstKey));
		c.push(...getKeyChars(importObject.firstKey));
	}
	if (importObject.firstMeter.beats) {
		// t = t + timeKeyLine.charStringToText(getMeterChars(importObject.firstMeter));
		c.push(...getMeterChars(importObject.firstMeter));
	}
	timeKeyLine.setTextLine(c, 'center');
	
	
	// write to score
	let currentY = 0;
	titleArea.writeToScore(0,currentY);
	currentY += titleArea.height+1;
	timeKeyLine.writeToScore(0,currentY);
	currentY += timeKeyLine.height+1;
	
}

function getKeyChars(key) {
	let r = [];
	if (key) {
		if (key.fifths>0) {
			if (key.fifths>3) {
				r.push('keySignaturePrefix');
				r.push('keySignatureMultiplier'+key.fifths);
				r.push('keySignatureSharp');
			} else {
				for (let i=1; i<=key.fifths; i++) {
					r.push('keySignatureSharp');
				}
			}
		} else if (key.fifths<0) {
			if (key.fifths<-3) {
				r.push('keySignaturePrefix');
				r.push('keySignatureMultiplier'+key.fifths);
				r.push('keySignatureFlat');
			} else {
				for (let i=-1; i>=key.fifths; i--) {
					r.push('keySignatureFlat');
				}
			}
		}
	}
	return r;
}

function getMeterChars(meter) {
	let r=[];
	if (meter) {
		r.push('timeSignaturePrefix');
		r.push('timeSignatureTop'+meter.beats);
		r.push('timeSignatureBottom'+meter.beatType);
	}
	return r;
}

class MXScoreArea {
	constructor(font,width,height) {
		// char = string describing a brm xml unit (e.g., 'noteQuarterC') - convert to cell with this.font.getCellByName(char)
		// cell = brm xml unit as a cell JS object, which may contain multiple codes (e.g., 'noteQuarterC')
		// code = single braille character, which may be a portion of a cell
		// text = a js string of unicode characters
		// charString = array of chars
		// cellString = array of cells
		// codeString = array of codes
		this.font = font;
		this.width = width;
		this.height = height;
		this.cursor = {x: 0, y: 0};
		this.codes = [[]];
		this.cells = [[]];
	}
	setTextLine(charString, alignment='left') {
		// set characters on line where cursor is, then set cursor at beginning of following line
		let row = this.getCodes(charString);
		switch (alignment) {
			case 'left':
				this.setCodeString(0, this.cursor.y, row);
				break;
			case 'center':
				this.setCodeString(Math.floor((this.width/2)-(row.length/2)), this.cursor.y, row);
				break;
			case 'right':
				this.setCodeString(this.width-row.length, this.cursor.y, row);
				break;
		}
		this.cursor.y++;
		this.cursor.x = 0;
	}
	setLiteraryTextLine(charString, alignment='left') {
		// set text on line where cursor is, wrapping if necessary, then set cursor at beginning of following line
		let tr = new MXTextTranslator();
		let rows = this.wrapCodeString(this.getCodes(tr.convert(charString)));
		rows.forEach(row => { // each row is a codeString
			switch (alignment) {
				case 'left':
					this.setCodeString(0, this.cursor.y, row);
					break;
				case 'center':
					this.setCodeString(Math.floor((this.width/2)-(row.length/2)), this.cursor.y, row);
					break;
				case 'right':
					this.setCodeString(this.width-row.length, this.cursor.y, row);
					break;
			}
			this.cursor.y++;
		});
		this.cursor.x = 0;
	}
	writeToScore(x,y) {
		for (let yy=0; yy<=this.height; yy++) {
			for (let xx=0; xx<=this.width; xx++) {
				setScore(x+xx,y+yy,this.getCode(xx,yy));
			}
		}
	}
	setCodeString(x,y,codeString) {
		let xx = x;
		codeString.forEach(code => {
			this.setCode(xx, y, code);
			xx++;
		});
	}
	charStringToText(charString) {
		let r = [];
		charString.forEach(char => {
			r.push(...this.font.getCellByName(char).codes);
		});
		return String.fromCharCode(...r);
	}
	codeStringToText(codeString) {
		let s = codeString.map(x => {
			return (x<33 ? 32 : x);
		});
		return String.fromCharCode(...s);
	}
	textToCodeString(text) {
		let cs = text.split('');
		return cs.map(x => {
			return x.charCodeAt(0);
		});
	}
	wrapCodeString(codeString, rowLength = this.width) {
		let rows = [];
		let cs = this.codeStringToText(codeString).split(' ');
		let currentRow = '';
		cs.forEach(text => {
			if (currentRow.length>0) {
				currentRow = currentRow + ' '; // if this isn't the first word on the line, add a space
			}
			if (currentRow.length + text.length < rowLength) {
				currentRow = currentRow + text;
			} else {
				rows.push(this.textToCodeString(currentRow));
				currentRow = '';
			}
		});
		rows.push(this.textToCodeString(currentRow));
		return rows;
	}
	getCodes(charString) {
		let r = [];
		charString.forEach(char => {
			if (char) {
				this.font.getCellByName(char).codes.forEach(code => {
					r.push(code);
				});
			} else {
				r.push(0);
			}
		});
		return r;
	}
	getCode(x,y) {
		if ((x === null) || (y === null) ||
			(typeof this.codes[y]==='undefined') || (this.codes[y]===null) ||
			(typeof this.codes[y][x]==='undefined')) {
			return 0;
		} else {
			return this.codes[y][x];
		}
	}
	setCode(x,y,code) {
		if (x>this.width) {
			this.width = x;
		}
		if (y>this.height) {
			this.height = y;
		}
		if (!(arrayHasOwnIndex(this.codes,y)) || this.codes[y]===null) {
			this.codes[y] = [];
		}
		this.codes[y][x] = code;
	}
	// setCell(x,y,cell,setCursor=true) {
	// 	if (x>this.width) {
	// 		this.width = x;
	// 	}
	// 	if (y>this.height) {
	// 		this.height = y;
	// 	}
	// 	if (!(arrayHasOwnIndex(this.codes,y)) || this.codes[y]===null) {
	// 		this.codes[y] = [];
	// 		this.cells[y] = [];
	// 	}
	// 	this.cells[y][x] = cell.name;
	// 	cell.codes.forEach((code,index) => {
	// 		this.codes[y][x+index] = String(code);
	// 		this.cursor = {x: x+index+1, y: y};
	// 	});
	// }
	// lineFeed() {
	// 	cursor = {x:0, y:cursor.y+1};
	// }
	// deleteCell(x,y) {
	// 	if (!this.score[y] || !arrayHasOwnIndex(this.score,y)) {
	// 		this.score[y] = [];
	// 	}
	// 	delete this.score[y][x];
	// }
}

class MXTextTranslator {
	constructor() {
		this.basicChars = {'0':['text0'], '1':['text1'], '2':['text2'], '3':['text3'], '4':['text4'], '5':['text5'], '6':['text6'], '7':['text7'], '8':['text8'], '9':['text9'], '':['textApostrophe'], ' =':['textEquals'], '-':['textHyphen'], '–':['textEnDash'], '—':['textEmDash'], ',':['textComma'], ';':['textSemicolon'], ':[':['textColon'], '!':['textExclamationPoint'], '¡':['textExclamationPointInverted'], '?':['textQuestionMark'], '¿':['textQuestionMarkInverted'], '.':['textDecimalPoint'], '.':['textPeriod'], '‘':['textSingleQuotationMarkOpen'], '’':['textSingleQuotationMarkClose'], '"':['textDoubleQuotationMark'], '“':['textDoubleQuotationMarkClose'], '“':['textDoubleQuotationMarkOpen'], '(':['textParenthesisOpen'], '{':['textCurvedBracketOpen'], '}':['textCurvedBracketClose'], '}':['textParenthesisClose'], '§':['textSection'], '¶':['textParagraph'], '@':['textAt'], '*':['textAsterisk'], '/':['textSlash'], '\\':['textBackslash'], '&':['textAmpersand'], '#':['textOctothorpe'], '%':['textPercent'], '†':['textDagger'], '‡':['textDaggerDouble'], '•':['textBullet'], '^':['textCaret'], '°':['textDegree'], '©':['textCopyright'], '®':['textRegistered'], '+':['textPlus'], '÷':['textDivision'], '×':['textMultiplication'], '<':['textLessThan'], '>':['textGreaterThan'], '|':['textBar'], '~':['textTilde'], '¢':['textCent'], '$':['textDollar'], '£':['textPoundSterling'], '¥':['textYen'], '₣':['textFranc'], '€':['textEuro'], 'a':['textA'], 'A':['textCapitalizeLetter','textA'], 'æ':['textAe'], 'Æ':['textCapitalizeLetter','textAe'], 'b':['textB'], 'B':['textCapitalizeLetter','textB'], 'c':['textC'], 'C':['textCapitalizeLetter','textC'], 'd':['textD'], 'D':['textCapitalizeLetter','textD'], 'e':['textE'], 'E':['textCapitalizeLetter','textE'], 'f':['textF'], 'F':['textCapitalizeLetter','textF'], 'g':['textG'], 'G':['textCapitalizeLetter','textG'], 'h':['textH'], 'H':['textCapitalizeLetter','textH'], 'i':['textI'], 'I':['textCapitalizeLetter','textI'], 'j':['textJ'], 'J':['textCapitalizeLetter','textJ'], 'k':['textK'], 'K':['textCapitalizeLetter','textK'], 'l':['textL'], 'L':['textCapitalizeLetter','textL'], 'm':['textM'], 'M':['textCapitalizeLetter','textM'], 'n':['textN'], 'N':['textCapitalizeLetter','textN'], 'o':['textO'], 'O':['textCapitalizeLetter','textO'], 'œ':['textOe'], 'Œ':['textCapitalizeLetter','textOe'], 'p':['textP'], 'P':['textCapitalizeLetter','textP'], 'q':['textQ'], 'Q':['textCapitalizeLetter','textQ'], 'r':['textR'], 'R':['textCapitalizeLetter','textR'], 's':['textS'], 'S':['textCapitalizeLetter','textS'], 't':['textT'], 'T':['textCapitalizeLetter','textT'], '™':['textTrademark'], 'u':['textU'], 'U':['textCapitalizeLetter','textU'], 'v':['textV'], 'V':['textCapitalizeLetter','textV'], 'w':['textW'], 'W':['textCapitalizeLetter','textW'], 'x':['textX'], 'X':['textCapitalizeLetter','textX'], 'y':['textY'], 'Y':['textCapitalizeLetter','textY'], 'z':['textZ'], 'Z':['textCapitalizeLetter','textZ']};
		this.prefixes = [['con','textContractionCon'], ['dis','textContractionDis'], ['be','textContractionBe']];
		this.suffixes = [['self','textContractionSelf']];
		this.contractions = [['altogether','textContractionAltogether'], ['themselves','textContractionThemselves'], ['yourselves','textContractionYourselves'], ['knowledge','textContractionKnowledge'], ['according','textContractionAccording'], ['afternoon','textContractionAfternoon'], ['afterward','textContractionAfterward'], ['althought','textContractionAlthough'], ['character','textContractionCharacter'], ['declaring','textContractionDeclaring'], ['immediate','textContractionImmediate'], ['necessary','textContractionNecessary'], ['ourselves','textContractionOurselves'], ['receiving','textContractionReceiving'], ['rejoicing','textContractionRejoicing'], ['children','textContractionChildren'], ['question','textContractionQuestion'], ['together','textContractionTogether'], ['tomorrow','textContractionTomorrow'], ['yourself','textContractionYourself'], ['against','textContractionAgainst'], ['already','textContractionAlready'], ['because','textContractionBecause'], ['beneath','textContractionBeneath'], ['braille','textContractionBraille'], ['ceiling','textContractionCeiving'], ['declare','textContractionDeclare'], ['herself','textContractionHerself'], ['himself','textContractionHimself'], ['neither','textContractionNeither'], ['perhaps','textContractionPerhaps'], ['receive','textContractionReceive'], ['rejoice','textContractionRejoice'], ['through','textContractionThrough'], ['tonight','textContractionTonight'], ['enough','textContractionEnough'], ['people','textContractionPeople'], ['rather','textContractionRather'], ['across','textContractionAcross'], ['almost','textContractionAlmost'], ['always','textContractionAlways'], ['before','textContractionBefore'], ['behind','textContractionBehind'], ['beside','textContractionBeside'], ['betwen','textContractionBetween'], ['beyond','textContractionBeyond'], ['cannot','textContractionCannot'], ['either','textContractionEither'], ['father','textContractionFather'], ['friend','textContractionFriend'], ['itself','textContractionItself'], ['letter','textContractionLetter'], ['little','textContractionLittle'], ['mother','textContractionMother'], ['myself','textContractionMyself'], ['oclock','textContractionOClock'], ['should','textContractionShould'], ['spirit','textContractionSpirit'], ['child','textContractionChild'], ['every','textContractionEvery'], ['quite','textContractionQuite'], ['shall','textContractionShall'], ['still','textContractionStill'], ['which','textContractionWhich'], ['about','textContractionAbout'], ['above','textContractionAbove'], ['after','textContractionAfter'], ['again','textContractionAgain'], ['ation','textContractionAtion'], ['below','textContractionBelow'], ['blind','textContractionBlind'], ['ceive','textContractionCeive'], ['could','textContractionCould'], ['first','textContractionFirst'], ['great','textContractionGreat'], ['ought','textContractionOught'], ['quick','textContractionQuick'], ['right','textContractionRight'], ['their','textContractionTheir'], ['there','textContractionThere'], ['these','textContractionThese'], ['those','textContractionThose'], ['today','textContractionToday'], ['under','textContractionUnder'], ['where','textContractionWhere'], ['whose','textContractionWhose'], ['world','textContractionWorld'], ['would','textContractionWould'], ['young','textContractionYoung'], ['from','textContractionFrom'], ['have','textContractionHave'], ['just','textContractionJust'], ['like','textContractionLike'], ['more','textContractionMore'], ['that','textContractionThat'], ['this','textContractionThis'], ['very','textContractionVery'], ['were','textContractionWere'], ['will','textContractionWill'], ['ally','textContractionAlly'], ['also','textContractionAlso'], ['ance','textContractionAnce'], ['ence','textContractionEnce'], ['ever','textContractionEver'], ['good','textContractionGood'], ['here','textContractionHere'], ['know','textContractionKnow'], ['less','textContractionLess'], ['lord','textContractionLord'], ['many','textContractionMany'], ['ment','textContractionMent'], ['much','textContractionMuch'], ['must','textContractionMust'], ['name','textContractionName'], ['ness','textContractionNess'], ['ound','textContractionOund'], ['paid','textContractionPaid'], ['part','textContractionPart'], ['said','textContractionSaid'], ['sion','textContractionSion'], ['some','textContractionSome'], ['such','textContractionSuch'], ['time','textContractionTime'], ['tion','textContractionTion'], ['upon','textContractionUpon'], ['with','textContractionWith'], ['word','textContractionWord'], ['work','textContractionWork'], ['your','textContractionYour'], ['self','textContractionSelf'], ['but','textContractionBut'], ['can','textContractionCan'], ['his','textContractionHis'], ['not','textContractionNot'], ['out','textContractionOut'], ['was','textContractionWas'], ['you','textContractionYou'], ['and','textContractionAnd'], ['ble','textContractionBle'], ['day','textContractionDay'], ['for','textContractionFor'], ['ful','textContractionFul'], ['had','textContractionHad'], ['him','textContractionHim'], ['ing','textContractionIng'], ['its','textContractionIts'], ['ity','textContractionIty'], ['one','textContractionOne'], ['ong','textContractionOng'], ['out','textContractionOunt'], ['the','textContractionThe'], ['as','textContractionAs'], ['do','textContractionDo'], ['go','textContractionGo'], ['in','textContractionIn'], ['it','textContractionIt'], ['so','textContractionSo'], ['us','textContractionUs'], ['ar','textContractionAr'], ['bb','textContractionBb'], ['cc','textContractionCc'], ['ch','textContractionCh'], ['dd','textContractionDd'], ['ea','textContractionEa'], ['ed','textContractionEd'], ['en','textContractionEn'], ['er','textContractionEr'], ['ff','textContractionFf'], ['gg','textContractionGg'], ['gh','textContractionGh'], ['of','textContractionOf'], ['ou','textContractionOu'], ['ow','textContractionOw'], ['sh','textContractionSh'], ['st','textContractionSt'], ['th','textContractionTh'], ['wh','textContractionWh'], ['be','textContractionBe']]; // this is order from long to short
	}
	convert(text, gradeTwo=false) {
		let r = [];
		let words = text.split(' ');
		words.forEach( word => {
			let w = word;
			let numberSigned = false;
			// if w is a number, then add a number sign
			if (this.isNumber(w)) {
				r.push('textNumberSign');
				numberSigned = true;
			} else if (this.isAllCaps(w)) {
				r.push('textCapitalizeWord');
				w = w.toLowerCase();
			}
			
			let wc = this.getContractedWord(w);
			if (gradeTwo && wc) {
				if (this.isAllCaps(w.charAt(0))) {
					r.push('textCapitalizeLetter');
				}
				r.push(wc);
			} else {
				wc = this.getContractedPrefix(w);
				if (gradeTwo && wc.charLength) {
					if (this.isAllCaps(w.charAt(0))) {
						r.push('textCapitalizeLetter');
					}
					r.push(wc.symbol);
					w = w.substring(wc.charLength);
				}
				while (w.length>0) {
					wc = this.getContractedSegmentOrSuffix(w);
					if (gradeTwo && wc.charLength) {
						if (this.isAllCaps(w.charAt(0))) {
							r.push('textCapitalizeLetter');
						}
						r.push(wc.symbol);
						w = w.substring(wc.charLength);
					} else {
						r.push(...this.convertChar(w.charAt(0),numberSigned));
						w = w.substring(1);
					}
				}
			}
			r.push('');
		});
		return r;
	}
	getContractedWord(s) {
		if (this.contractions.includes(s)) {
			return this.contractions[s];
		} else {
			return null;
		}
	}
	getContractedPrefix(s) {
		let p;
		for (let i=0; i<this.prefixes.count; i++) {
			p = this.prefixes[i];
			if (s.startsWith(p[0])) {
				return {symbol: p[1], charLength: p[0].length};
			}
		}
		return {symbol: '', charLength: 0};
	}
	getContractedSegmentOrSuffix(s) {
		let p;
		for (let i=0; i<this.contractions.length; i++) {
			p = this.contractions[i];
			if (s.startsWith(p[0])) {
				return {symbol: p[1], charLength: p[0].length};
			}
		}
		return {symbol: '', charLength: 0};
	}
	convertChar(s,suppressNumberSign) {
		if (this.isNumber(s) && !suppressNumberSign) {
			return ['textNumberSign',this.basicChars[s]];
		}
		if (s in this.basicChars) {
			return this.basicChars[s];
		} else {
			return [];
		}
	}
	isNumber(s) {
		return !Number.isNaN(Number(s));
	}
	isAllCaps(s) {
		return s.toUpperCase() === s;
	}
}

class MXSymbol {
	constructor(font, name, row=null, col=null) {
		this.font = font;
		this.name = name;
		this.cell = font.getCellByName(name);
		this.col = col;
		this.row = row;
		this.length = this.cell?.length();
	}
}

class MXMeasure {
	constructor(obj, divisions = 1) {
		this.obj = obj;
		this.entries = [];
		this.parseAttributes();
		this.parseEntries();
	}
	parseAttributes() {
		if (this.obj.children('time').length) { // if this measure contains a meter change
			this.meter = { beats: this.obj.child('beats').data, beatType: this.obj.child('beat-type').data};
		} else {
			this.meter = null;
		}
		if (this.obj.children('key').length) { // if this measure contains a key change
			this.key = { fifths: this.obj.child('fifths').data, mode: this.obj.child('mode').data};
		} else {
			this.key = null;
		}
		if (this.obj.children('divisions').length) { // if this measure changes the divisions value
			this.divisions = this.obj.child('divisions').data * 1;
			// this.divisions = this.obj.getElementsByTagName('divisions')[0].innerHTML * 1;
		} else {
			this.divisions = divisions;
		}
		this.measureNumber = this.obj.child('number').data * 1;
	}
	parseEntries() {
		let currentChord = null;
		let currentLocation = 0;
		let previousNote = null;
		const spellDownward = true;
		this.obj.children().forEach( entry => {
		// for (const entry of this.obj.childNodes) {
			let e;
			switch (entry.tagName) {
				case 'note':
					e = new MXNote(entry);
					if (e.chord) {
						// if file is well-formed then currentChord should be instantiated
						currentChord.addNote(e);
					} else {
						if (currentChord) {
							currentChord.previousNote = previousNote;
							this.entries.push(currentChord);
							currentLocation += currentChord.duration;
							previousNote = currentChord.getAnchorNote(spellDownward);
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
		});
		this.entries.push(currentChord);
	}
	getChars(showKeyAndMeter = true) {
		let r = [];
		if (showKeyAndMeter) {
			r.push(...getKeyChars(this.key));
			r.push(...getMeterChars(this.meter));
		}
		this.entries.forEach( e => {
			r.push(...e.getEntryChars());
		});
		return r;
	}
	// getKeyChars() {
	// 	let k = this.key;
	// 	let r = [];
	// 	if (k) {
	// 		if (k.fifths>0) {
	// 			if (k.fifths>3) {
	// 				r.push('keySignaturePrefix');
	// 				r.push('keySignatureMultiplier'+k.fifths);
	// 				r.push('keySignatureSharp');
	// 			} else {
	// 				for (let i=1; i<=k.fifths; i++) {
	// 					r.push('keySignatureSharp');
	// 				}
	// 			}
	// 		} else if (k.fifths<0) {
	// 			if (k.fifths<-3) {
	// 				r.push('keySignaturePrefix');
	// 				r.push('keySignatureMultiplier'+k.fifths);
	// 				r.push('keySignatureFlat');
	// 			} else {
	// 				for (let i=-1; i>=k.fifths; i--) {
	// 					r.push('keySignatureFlat');
	// 				}
	// 			}
	// 		}
	// 	}
	// 	return r;
	// }
	// getMeterChars() {
	// 	let r=[];
	// 	if (this.meter) {
	// 		r.push('timeSignaturePrefix');
	// 		r.push('timeSignatureTop'+this.meter.beats);
	// 		r.push('timeSignatureBottom'+this.meter.beatType);
	// 	}
	// 	return r;
	// }
}

class MXEntry {
	constructor(entryType, location, duration, previousNote = null) {
		this.entryType = entryType;
		this.location = location;
		this.duration = duration;
		this.previousNote = previousNote;
	}
	getEntryChars(spellDownward = true) {
		switch (this.entryType) {
			case 'chord':
				return this.getChars(this.previousNote, spellDownward)
		}
	}
}

class MXChord extends MXEntry {
	constructor(note, location = 0) {
		super('chord', location, note.duration);
		this.grace = note.grace;
		this.cue = note.cue;
		this.staff = note.staff;
		this.dots = note.dots;
		this.type = note.type;
		this.tie = note.tie;
		this.notes = [note];
	}
	addNote(note) {
		this.notes.push(note);
	}
	getAnchorNote(spellDownward = true) {
		if (this.notes.length>1) {
			this.notes.sort((a,b) => { 
				return spellDownward ? b.midiValue() - a.midiValue() : a.midiValue() - b.midiValue();
			});
		}
		return this.notes[0];
	}
	getChars(previousNote = null, spellDownward = true) { // if previousNote = null then show octave symbol
		if (this.notes.length>1) {
			this.notes.sort((a,b) => { 
				return spellDownward ? b.midiValue() - a.midiValue() : a.midiValue() - b.midiValue();
			});
		}
		let r = [];
		let includeOctave = (!previousNote || this.noteNeedsOctaveSign(previousNote,this.notes[0]));
		r.push(...this.notes[0].getChars(includeOctave));
		let i = 1;
		while (this.notes.length > i) {
			r.push(...this.notes[i].getChordChars(this.notes[0],spellDownward));
		}
		return r;
	}
	noteNeedsOctaveSign(baseNote,targetNote) {
		return (((baseNote.octave == targetNote.octave) && Math.abs(targetNote.dpc()-baseNote.dpc())>5) ||
	            ((baseNote.octave != targetNote.octave) && Math.abs(targetNote.dp()-baseNote.dp())>2));
	}
}

class MXNote {
	constructor(obj) {
		this.obj = obj;
		this.downwardDirection = obj.downwardDirection;
		this.chord = obj.children('chord').length > 0;
		this.rest = obj.children('rest').length > 0;
		this.grace = obj.children('grace').length > 0;
		this.cue = obj.children('cue').length > 0;
		this.voice = (obj.child('voice').data ?? 0) * 1;
		this.staff = (obj.child('staff').data ?? 0) * 1;
		this.duration = (obj.child('duration').data ?? 0) * 1;
		this.dots = obj.children('dot').length;
		this.accidental = obj.child('accidental').data;
		this.type = obj.child('type').data;
		if (this.rest) {
			this.type = (obj.child('rest').attr('measure') == 'yes') ? 'measure' : this.type;
		} else if (obj.children('unpitched').length) {
			this.type = 'unmeasured';
		} else {
			this.step = obj.child('step').data.toUpperCase();
			this.alter = obj.child('alter').data * 1;
			this.octave = obj.child('octave').data * 1;
			this.tie = obj.children('cue').length > 0;
		}
	}
	midiValue() {
		if (this.rest) {
			return null;
		} else {
			return ((this.octave+1)*12) + {'C':0, 'D':2, 'E':4, 'F':5, 'G':7, 'A':9, 'B':11}[this.step.toUpperCase()] + this.alter;
		}
	}
	dpc(val = this.step) {
		return {'C':0, 'D':1, 'E':2, 'F':3, 'G':4, 'A':5, 'B':6}[val];
	}
	dp(note = this) {
		return (note.octave*7)+this.dpc(note.step);
	} 
	getChordChars(refNote, spellDownward) {
		let r = [];
		r.push(this.getAccidentalChars());
		// let dpcVals = {'C':0, 'D':1, 'E':2, 'F':3, 'G':4, 'A':5, 'B':6}
		// let base = (refNote.octave*7)+dpcVals[refNote.step];
		// let target = (this.octave*7)+dpcVals[this.step];
		let base = dp(refNote); //(refNote.octave*7)+this.dpc(refNote.step);
		let target = dp(); // (this.octave*7)+this.dpc();
		let diff = spellDownward ? (base-target) : (target-base);
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
				'1024th':['restOneThousandTwentyFourth'],
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
				'long':['restLonga'],
				'maxima':['restMaxima']
			}[this.type]);
		} else if (this.type == 'unpitched') {
			r.push(...{ // change with stemless
				'1024th':['noteOneThousandTwentyFourthC'],
				'512th':['noteFiveHundredTwelfthC'],
				'256th':['noteTwoHundredFiftySixthC'],
				'128th':['noteOneHundredTwentyEighthC'],
				'64th':['noteSixtyFourthC'],
				'32nd':['noteThirtySecondC'],
				'16th':['noteSixteenthC'],
				'eighth':['noteEighthC'],
				'quarter':['noteQuarterC'],
				'half':['noteHalfC'],
				'whole':['noteWholeC'],
				'breve':['noteDoubleWholeC'],
				'long':['noteLongaC'],
				'maxima':['noteMaximaC']
			}[this.type]);
		} else {
			let n = this.step;
			r.push(...{
				'1024th':['noteOneThousandTwentyFourth'+n],
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
				'long':['noteLonga'+n],
				'maxima':['noteMaxima'+n]
			}[this.type]);
		}
		return r;
	}
}

class MXNode {
	constructor(element) {
		this.el = element;
	}
	child(s = null) {
		if (s) {
			if (this.el.getElementsByTagName(s).length) {
				return new MXNode(this.el.getElementsByTagName(s)[0]);
			} else {
				return new MXNode(null);
			}
		} else {
			return new MXNode(this.el.firstChild);
		}
	}
	children(s = null) {
		let r = [];
		if (s) {
			[...this.el.getElementsByTagName(s)].forEach( e => {
				r.push(new MXNode(e));
			});
		} else {
			[...this.el.children].forEach( e => {
				r.push(new MXNode(e));
			});
		}
		return r;
	}
	get data() {
		if (this.el) {
			return this.el.innerHTML;
		} else {
			return null;
		}
	}
	attr(a) {
		if (this.el) {
			return this.el.getAttribute(a);
		} else {
			return null;
		}
	}
	get tagName() {
		if (this.el) {
			return this.el.tagName;
		} else {
			return null;
		}
	}
}