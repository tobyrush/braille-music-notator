/* global devMode, cctx, controlHelpOriginX, controlHelpOriginY, controlsHeight, chu, controlsWidth, controlHelp, gridHeight, gridWidth, drawCellSimpleDynamic, drawCellHairpinDynamic, drawMultiCellBackground, gw, gh, drawCellClef, drawCellTextLabel, drawMetronomeMarkingEquals, doNotCheckContiguousCells, drawInterpretedBrailleSymbol, drawCellOctaveRange, savedGridHeight: true */
/* jshint -W020 */

function displayControlHelp() {

	if (devMode) {
	
		cctx.beginPath();
		var row=controlHelpOriginY;
		for (var i=row; i<controlsHeight; i+=(chu*10)) {
			cctx.moveTo(controlHelpOriginX,i);
			cctx.lineTo(controlsWidth,i);
		}
		var col=controlHelpOriginX;
		for (i=col; i<controlsWidth; i+=(chu*10)) {
			cctx.moveTo(i,controlHelpOriginY);
			cctx.lineTo(i,controlsHeight);
		}
		cctx.strokeStyle="#ddf";
		cctx.stroke();
		cctx.closePath();
		
	}

    var tempGridHeight = gridHeight;
	
	switch (Math.floor(controlHelp)) {
	
		case 1: // augmentation dot
			drawControlHelpTitleText("Augmentation Dot");
			drawControlHelpDescriptionText("Place dot(s) after the affected note.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*40),chu*13,chu*30,1);
			drawNote(cctx,controlHelpOriginX+(chu*15),controlHelpOriginY+(chu*40),chu*13,"noteQuarterUp",1,1);
			drawArrow(cctx,controlHelpOriginX+(chu*36),controlHelpOriginY+(chu*51),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*47),controlHelpOriginY+(chu*36),chu*20,[34,91,39],false);
			break;
		case 2: // note symbols
			drawControlHelpTitleText("Note Symbols");
			drawControlHelpDescriptionText("Each symbol specifies both pitch and length. An octave symbol must be placed\nbefore the note, except after:\n   · a leap of a fourth or fifth within the same octave, or\n   · a leap of a third or less (even if the octave changes).");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*57),chu*13,chu*45,1);
			drawNote(cctx,controlHelpOriginX+(chu*15),controlHelpOriginY+(chu*57),chu*13,"noteQuarterDown",-1,0);
			drawNote(cctx,controlHelpOriginX+(chu*26),controlHelpOriginY+(chu*57),chu*13,"noteQuarterUp",0,0);
			drawNote(cctx,controlHelpOriginX+(chu*35),controlHelpOriginY+(chu*57),chu*13,"noteQuarterUp",5,0);
			drawArrow(cctx,controlHelpOriginX+(chu*50),controlHelpOriginY+(chu*68),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*61),controlHelpOriginY+(chu*53),chu*20,[46,63,87,34,58],false);
			break;
		case 3: // octave symbols
			drawControlHelpTitleText("Octave Symbols");
			drawControlHelpDescriptionText("Octave symbols are placed before the note affected.");
			drawCellOctaveIcon(cctx,controlHelpOriginX,controlHelpOriginY+(chu*41),chu*20,(controlHelp*10)-30);
			drawArrow(cctx,controlHelpOriginX+(chu*18),controlHelpOriginY+(chu*56),chu*13);
			switch (controlHelp) {
				case 3.0:
					drawStaff(cctx,controlHelpOriginX+(chu*30),controlHelpOriginY+(chu*45),chu*13,chu*70,2);
					drawNote(cctx,controlHelpOriginX+(chu*55),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",8,0);
					drawNote(cctx,controlHelpOriginX+(chu*80),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",2,0);
					drawLine(cctx,controlHelpOriginX+(chu*63),controlHelpOriginY+(chu*64),controlHelpOriginX+(chu*77),controlHelpOriginY+(chu*57),"#929",4);
					drawMusicSymbol(cctx,"\ue514",controlHelpOriginX+(chu*47),controlHelpOriginY+(chu*80),chu*13);
					drawLine(cctx,controlHelpOriginX+(chu*57),controlHelpOriginY+(chu*77),controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*77),"#000",1);
					drawLine(cctx,controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*77),controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*72),"#000",1);
					break;
				case 3.1:
					drawStaff(cctx,controlHelpOriginX+(chu*30),controlHelpOriginY+(chu*45),chu*13,chu*70,2);
					drawNote(cctx,controlHelpOriginX+(chu*55),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",8,0);
					drawNote(cctx,controlHelpOriginX+(chu*80),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",2,0);
					drawLine(cctx,controlHelpOriginX+(chu*63),controlHelpOriginY+(chu*64),controlHelpOriginX+(chu*77),controlHelpOriginY+(chu*57),"#929",4);
					drawMusicSymbol(cctx,"\ue510",controlHelpOriginX+(chu*49),controlHelpOriginY+(chu*80),chu*13);
					drawLine(cctx,controlHelpOriginX+(chu*57),controlHelpOriginY+(chu*77),controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*77),"#000",1);
					drawLine(cctx,controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*77),controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*72),"#000",1);
					break;
				case 3.2:
					drawStaff(cctx,controlHelpOriginX+(chu*30),controlHelpOriginY+(chu*45),chu*13,chu*70,2);
					drawNote(cctx,controlHelpOriginX+(chu*55),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",8,0);
					drawNote(cctx,controlHelpOriginX+(chu*80),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",2,0);
					drawLine(cctx,controlHelpOriginX+(chu*63),controlHelpOriginY+(chu*64),controlHelpOriginX+(chu*77),controlHelpOriginY+(chu*57),"#929",4);
					break;
				case 3.3:
					drawStaff(cctx,controlHelpOriginX+(chu*30),controlHelpOriginY+(chu*45),chu*13,chu*70,2);
					drawNote(cctx,controlHelpOriginX+(chu*55),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",1,0);
					drawNote(cctx,controlHelpOriginX+(chu*80),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",-5,0);
					drawLine(cctx,controlHelpOriginX+(chu*62),controlHelpOriginY+(chu*52),controlHelpOriginX+(chu*77),controlHelpOriginY+(chu*45),"#929",4);
					break;
				case 3.4:
					drawStaff(cctx,controlHelpOriginX+(chu*30),controlHelpOriginY+(chu*45),chu*13,chu*70,1);
					drawNote(cctx,controlHelpOriginX+(chu*55),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",6,0);
					drawNote(cctx,controlHelpOriginX+(chu*80),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",0,0);
					drawLine(cctx,controlHelpOriginX+(chu*62),controlHelpOriginY+(chu*59),controlHelpOriginX+(chu*77),controlHelpOriginY+(chu*52),"#929",4);
					break;
				case 3.5:
					drawStaff(cctx,controlHelpOriginX+(chu*30),controlHelpOriginY+(chu*45),chu*13,chu*70,1);
					drawNote(cctx,controlHelpOriginX+(chu*55),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",-1,0);
					drawNote(cctx,controlHelpOriginX+(chu*80),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",-7,0);
					drawLine(cctx,controlHelpOriginX+(chu*62),controlHelpOriginY+(chu*47),controlHelpOriginX+(chu*77),controlHelpOriginY+(chu*40),"#929",4);
					break;
				case 3.6:
					drawStaff(cctx,controlHelpOriginX+(chu*30),controlHelpOriginY+(chu*45),chu*13,chu*70,1);
					drawNote(cctx,controlHelpOriginX+(chu*55),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",-1,0);
					drawNote(cctx,controlHelpOriginX+(chu*80),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",-7,0);
					drawLine(cctx,controlHelpOriginX+(chu*62),controlHelpOriginY+(chu*47),controlHelpOriginX+(chu*77),controlHelpOriginY+(chu*40),"#929",4);
					drawMusicSymbol(cctx,"\ue510",controlHelpOriginX+(chu*49),controlHelpOriginY+(chu*33),chu*13);
					drawLine(cctx,controlHelpOriginX+(chu*57),controlHelpOriginY+(chu*29),controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*29),"#000",1);
					drawLine(cctx,controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*29),controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*34),"#000",1);
					break;
				case 3.7:
					drawStaff(cctx,controlHelpOriginX+(chu*30),controlHelpOriginY+(chu*45),chu*13,chu*70,1);
					drawNote(cctx,controlHelpOriginX+(chu*55),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",-1,0);
					drawNote(cctx,controlHelpOriginX+(chu*80),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",-7,0);
					drawLine(cctx,controlHelpOriginX+(chu*62),controlHelpOriginY+(chu*47),controlHelpOriginX+(chu*77),controlHelpOriginY+(chu*40),"#929",4);
					drawMusicSymbol(cctx,"\ue514",controlHelpOriginX+(chu*47),controlHelpOriginY+(chu*33),chu*13);
					drawLine(cctx,controlHelpOriginX+(chu*57),controlHelpOriginY+(chu*29),controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*29),"#000",1);
					drawLine(cctx,controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*29),controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*34),"#000",1);
					break;
				case 3.8:
					drawStaff(cctx,controlHelpOriginX+(chu*30),controlHelpOriginY+(chu*45),chu*13,chu*70,1);
					drawNote(cctx,controlHelpOriginX+(chu*55),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",-1,0);
					drawNote(cctx,controlHelpOriginX+(chu*80),controlHelpOriginY+(chu*45),chu*13,"noteheadBlack",-7,0);
					drawLine(cctx,controlHelpOriginX+(chu*62),controlHelpOriginY+(chu*47),controlHelpOriginX+(chu*77),controlHelpOriginY+(chu*40),"#929",4);
					drawMusicSymbol(cctx,"\ue517",controlHelpOriginX+(chu*45),controlHelpOriginY+(chu*33),chu*13);
					drawLine(cctx,controlHelpOriginX+(chu*57),controlHelpOriginY+(chu*29),controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*29),"#000",1);
					drawLine(cctx,controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*29),controlHelpOriginX+(chu*90),controlHelpOriginY+(chu*34),"#000",1);
					break;
			}
			break;
		case 4: // rest symbols
			drawControlHelpTitleText("Rest Symbols");
			drawControlHelpDescriptionText("As in traditional notation, the whole rest symbol can be used\nas a measure rest in any meter.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13,chu*45,2);
			drawNote(cctx,controlHelpOriginX+(chu*16),controlHelpOriginY+(chu*45),chu*13,"restHalf",0,0);
			drawNote(cctx,controlHelpOriginX+(chu*30),controlHelpOriginY+(chu*45),chu*13,"restQuarter",0,1);
			drawArrow(cctx,controlHelpOriginX+(chu*50),controlHelpOriginY+(chu*56),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*61),controlHelpOriginY+(chu*41),chu*20,[85,86,39],false);
			break;
		case 5: // accidentals
			drawControlHelpTitleText("Accidentals");
			drawControlHelpDescriptionText("Place the accidental before the affected note.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13,chu*45,1);
			drawNote(cctx,controlHelpOriginX+(chu*18),controlHelpOriginY+(chu*45),chu*13,"noteQuarterDown",-2,0);
			drawAccidental(cctx,controlHelpOriginX+(chu*18),controlHelpOriginY+(chu*45),chu*13,-1,-2);
			drawNote(cctx,controlHelpOriginX+(chu*32),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,1);
			drawAccidental(cctx,controlHelpOriginX+(chu*32),controlHelpOriginY+(chu*45),chu*13,1,3);
			drawArrow(cctx,controlHelpOriginX+(chu*50),controlHelpOriginY+(chu*56),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*61),controlHelpOriginY+(chu*41),chu*20,[46,60,58,34,37,93,39],false);
			break;
		case 6: // interval symbols
			drawControlHelpTitleText("Interval Symbols");
			drawControlHelpDescriptionText("Place intervals after notes to create chords. For melodies, intervals are\nread downward; for bass lines, intervals are read upward. Accidentals or\noctave marks may be placed before the affected interval.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*57),chu*13,chu*45,1);
			drawNote(cctx,controlHelpOriginX+(chu*26),controlHelpOriginY+(chu*57),chu*13,"noteQuarterDown",-4,0);
			drawNote(cctx,controlHelpOriginX+(chu*26),controlHelpOriginY+(chu*57),chu*13,"noteQuarterDown",0,0);
			drawAccidental(cctx,controlHelpOriginX+(chu*26),controlHelpOriginY+(chu*57),chu*13,-1,0);
			drawNote(cctx,controlHelpOriginX+(chu*26),controlHelpOriginY+(chu*57),chu*13,"noteQuarterDown",5,0);
			drawArrow(cctx,controlHelpOriginX+(chu*50),controlHelpOriginY+(chu*68),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*61),controlHelpOriginY+(chu*53),chu*20,[46,93,60,157,34,43],false);
			break;
		case 7: // tie symbol
			drawControlHelpTitleText("Tie Symbol");
			drawControlHelpDescriptionText("Place the tie symbol between notes to be connected.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13,chu*45,1);
			drawNote(cctx,controlHelpOriginX+(chu*18),controlHelpOriginY+(chu*45),chu*13,"noteQuarterDown",-2,0);
			drawNote(cctx,controlHelpOriginX+(chu*32),controlHelpOriginY+(chu*45),chu*13,"note8thDown",-2,0);
			drawTie(cctx,controlHelpOriginX+(chu*24),controlHelpOriginX+(chu*30),controlHelpOriginY+(chu*45),chu*13,-2);
			drawArrow(cctx,controlHelpOriginX+(chu*50),controlHelpOriginY+(chu*56),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*61),controlHelpOriginY+(chu*41),chu*20,[46,58,364,0,69],true);
			break;
		case 8: // time signatures
			drawControlHelpTitleText("Time Signatures");
			drawControlHelpDescriptionText("Time signatures consist of three characters: the meter prefix, the top number,\nand the bottom number. The initial time signature and key signature should be\ncentered horizontally above the first line of music. Meter changes should be\nseparated from surrounding music with blank spaces.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*57),chu*13,chu*35,1);
			drawAccidental(cctx,controlHelpOriginX+(chu*17),controlHelpOriginY+(chu*57),chu*13,-1,0);
			drawAccidental(cctx,controlHelpOriginX+(chu*21),controlHelpOriginY+(chu*57),chu*13,-1,-3);
			drawTimeSignature(cctx,controlHelpOriginX+(chu*23),controlHelpOriginY+(chu*57),chu*13,3,4);
			drawArrow(cctx,controlHelpOriginX+(chu*40),controlHelpOriginY+(chu*68),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*51),controlHelpOriginY+(chu*53),chu*20,[160,160,35,167,52],false);
			break;
		case 9: // time signature abbreviations
			drawControlHelpTitleText("Time Signature Abbreviations");
			drawControlHelpDescriptionText("The common time and cut time abbreviations do not require the meter prefix.\nThe initial time signature and key signature should be centered horizontally above\nthe first line of music. Meter changes should be separated from surrounding\nmusic with blank spaces.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*57),chu*13,chu*45,2);
			drawAccidental(cctx,controlHelpOriginX+(chu*17),controlHelpOriginY+(chu*57),chu*13,1,-2);
			drawAccidental(cctx,controlHelpOriginX+(chu*21),controlHelpOriginY+(chu*57),chu*13,1,1);
			drawAccidental(cctx,controlHelpOriginX+(chu*25),controlHelpOriginY+(chu*57),chu*13,1,-3);
			drawAccidental(cctx,controlHelpOriginX+(chu*29),controlHelpOriginY+(chu*57),chu*13,1,0);
			drawMusicSymbol(cctx,"\ue08b",controlHelpOriginX+(chu*31),controlHelpOriginY+(chu*63.5),chu*13);
			drawArrow(cctx,controlHelpOriginX+(chu*50),controlHelpOriginY+(chu*68),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*61),controlHelpOriginY+(chu*53),chu*20,[235,268,137,195,0],true);
			break;
		case 10: // key signatures
			drawControlHelpTitleText("Key Signatures");
			drawControlHelpDescriptionText("For keys of three accidentals or fewer, simply use the appropriate number\nof accidentals. Otherwise, use the key prefix, a multiplier, and a single\naccidental. The initial time signature and key signature should be centered\nhorizontally above the first line of music.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*57),chu*13,chu*35,1);
			drawAccidental(cctx,controlHelpOriginX+(chu*17),controlHelpOriginY+(chu*57),chu*13,1,-2);
			drawAccidental(cctx,controlHelpOriginX+(chu*21),controlHelpOriginY+(chu*57),chu*13,1,1);
			drawAccidental(cctx,controlHelpOriginX+(chu*25),controlHelpOriginY+(chu*57),chu*13,1,-3);
			drawTimeSignature(cctx,controlHelpOriginX+(chu*27),controlHelpOriginY+(chu*57),chu*13,6,8);
			drawArrow(cctx,controlHelpOriginX+(chu*40),controlHelpOriginY+(chu*68),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*51),controlHelpOriginY+(chu*53),chu*20,[137,137,137,35,170,56],false);
			break;
		case 11: // tuplets
			drawControlHelpTitleText("Tuplets");
			drawControlHelpDescriptionText("Tuplet indicators are placed before the first note in the group.\nFor simple triplets, the single triplet symbol may be used.");
			switch (controlHelp) {
				case 11.1:
					drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13,chu*47,2);
					drawNote(cctx,controlHelpOriginX+(chu*14),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,0);
					drawNote(cctx,controlHelpOriginX+(chu*20),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,0);
					drawNote(cctx,controlHelpOriginX+(chu*26),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,0);
					drawNote(cctx,controlHelpOriginX+(chu*32),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,0);
					drawNote(cctx,controlHelpOriginX+(chu*38),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,0);
					drawLine(cctx,controlHelpOriginX+(chu*17.7),controlHelpOriginY+(chu*45),controlHelpOriginX+(chu*42.2),controlHelpOriginY+(chu*45),"#000",chu*1.625);
					drawMusicSymbol(cctx,"\ue885",controlHelpOriginX+(chu*27),controlHelpOriginY+(chu*42),chu*11);
					drawArrow(cctx,controlHelpOriginX+(chu*52),controlHelpOriginY+(chu*56),chu*13);
					drawBrailleIcons(cctx,controlHelpOriginX+(chu*63),controlHelpOriginY+(chu*41),chu*20,[295,253,439,94,73,73,73,73,73],false);
					break;
				case 11.2:
					drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13,chu*35,2);
					drawNote(cctx,controlHelpOriginX+(chu*14),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,0);
					drawNote(cctx,controlHelpOriginX+(chu*20),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,0);
					drawNote(cctx,controlHelpOriginX+(chu*26),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,0);
					drawLine(cctx,controlHelpOriginX+(chu*17.7),controlHelpOriginY+(chu*45),controlHelpOriginX+(chu*30.2),controlHelpOriginY+(chu*45),"#000",chu*1.625);
					drawMusicSymbol(cctx,"\ue883",controlHelpOriginX+(chu*21),controlHelpOriginY+(chu*42),chu*11);
					drawArrow(cctx,controlHelpOriginX+(chu*40),controlHelpOriginY+(chu*56),chu*13);
					drawBrailleIcons(cctx,controlHelpOriginX+(chu*51),controlHelpOriginY+(chu*41),chu*20,[150,94,73,73,73],false);
					break;
			}
			break;
		case 12: // short slur
			drawControlHelpTitleText("Short Slur");
			drawControlHelpDescriptionText("To slur two notes together, place the short slur symbol\nbetween them.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13,chu*35,1);
			drawNote(cctx,controlHelpOriginX+(chu*14),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",2,0);
			drawNote(cctx,controlHelpOriginX+(chu*26),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",1,0);
			drawSlur(cctx,controlHelpOriginX+(chu*17),controlHelpOriginY+(chu*59),controlHelpOriginX+(chu*23),controlHelpOriginY+(chu*63),controlHelpOriginX+(chu*28),controlHelpOriginY+(chu*56));
			drawArrow(cctx,controlHelpOriginX+(chu*40),controlHelpOriginY+(chu*56),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*51),controlHelpOriginY+(chu*41),chu*20,[34,92,67,91],false);
					break;
		case 13: // long slur
			drawControlHelpTitleText("Long Slur");
			drawControlHelpDescriptionText("To slur more than two notes together, place the begin slur symbol\nbefore the first note and the end slur symbol after the last note.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13,chu*47,1);
			drawNote(cctx,controlHelpOriginX+(chu*14),controlHelpOriginY+(chu*45),chu*13,"noteQuarterDown",-4,0);
			drawNote(cctx,controlHelpOriginX+(chu*22),controlHelpOriginY+(chu*45),chu*13,"noteQuarterDown",-3,0);
			drawNote(cctx,controlHelpOriginX+(chu*30),controlHelpOriginY+(chu*45),chu*13,"noteQuarterDown",-5,0);
			drawNote(cctx,controlHelpOriginX+(chu*38),controlHelpOriginY+(chu*45),chu*13,"noteQuarterDown",-4,0);
			drawSlur(cctx,controlHelpOriginX+(chu*17),controlHelpOriginY+(chu*42),controlHelpOriginX+(chu*29),controlHelpOriginY+(chu*34),controlHelpOriginX+(chu*40.5),controlHelpOriginY+(chu*42));
			drawArrow(cctx,controlHelpOriginX+(chu*52),controlHelpOriginY+(chu*56),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*63),controlHelpOriginY+(chu*41),chu*20,[46,359,0,93,36,92,93,394,0],true);
			break;
		case 14: // articulations
			drawControlHelpTitleText("Articulations");
			drawControlHelpDescriptionText("Place articulations before the note affected. Use doubled symbols to\nuse an articulation until specified otherwise.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13,chu*47,2);
			drawNote(cctx,controlHelpOriginX+(chu*14),controlHelpOriginY+(chu*45),chu*13,"noteQuarterDown",0,0);
			drawMusicSymbol(cctx,"\ue4a2",controlHelpOriginX+(chu*15.3),controlHelpOriginY+(chu*47.2),chu*13);
			drawNote(cctx,controlHelpOriginX+(chu*22),controlHelpOriginY+(chu*45),chu*13,"noteQuarterDown",-1,0);
			drawMusicSymbol(cctx,"\ue4a2",controlHelpOriginX+(chu*23.3),controlHelpOriginY+(chu*47.2),chu*13);
			drawNote(cctx,controlHelpOriginX+(chu*30),controlHelpOriginY+(chu*45),chu*13,"noteQuarterDown",0,0);
			drawMusicSymbol(cctx,"\ue4a2",controlHelpOriginX+(chu*31.3),controlHelpOriginY+(chu*47.2),chu*13);
			drawNote(cctx,controlHelpOriginX+(chu*38),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",1,0);
			drawMusicSymbol(cctx,"\ue4a2",controlHelpOriginX+(chu*39.3),controlHelpOriginY+(chu*57),chu*13);
			drawArrow(cctx,controlHelpOriginX+(chu*52),controlHelpOriginY+(chu*56),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*63),controlHelpOriginY+(chu*41),chu*20,[356,356,95,58,36,58,356,63],false);
			break;
		case 15: // music prefix
			drawControlHelpTitleText("Music Prefix");
			drawControlHelpDescriptionText("Use the music prefix symbol before music symbols\non lines which mix music and text.");
			drawBrailleIcons(cctx,controlHelpOriginX,controlHelpOriginY+(chu*41),chu*20,[544,580,576,565,589],false);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*78),controlHelpOriginY+(chu*41),chu*20,[344,0,46],true);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*118),controlHelpOriginY+(chu*41),chu*20,[89,0,62,561],false);
			cctx.fillStyle="#000"; // black
			cctx.textBaseline = "alphabetic";
			cctx.textAlign = "left";
			cctx.font = "bold "+chu*10+"px sans-serif";
			cctx.fillText("...",controlHelpOriginX+(chu*176),controlHelpOriginY+(chu*56));
			break;
		case 16: // text prefix
			drawControlHelpTitleText("Text Prefix");
			drawControlHelpDescriptionText("Use the text prefix symbol before literary braille\non lines which mix music and text.");
			drawBrailleIcons(cctx,controlHelpOriginX,controlHelpOriginY+(chu*41),chu*20,[544,580,576,565,589],false);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*78),controlHelpOriginY+(chu*41),chu*20,[344,0,46],true);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*118),controlHelpOriginY+(chu*41),chu*20,[89,0,62,561],false);
			cctx.fillStyle="#000"; // black
			cctx.textBaseline = "alphabetic";
			cctx.textAlign = "left";
			cctx.font = "bold "+chu*10+"px sans-serif";
			cctx.fillText("...",controlHelpOriginX+(chu*176),controlHelpOriginY+(chu*56));
			break;
		case 17: // dynamics
			drawControlHelpTitleText("Dynamics");
			drawControlHelpDescriptionText("Place dynamics before the first note affected.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13,chu*47,1);
			drawNote(cctx,controlHelpOriginX+(chu*18),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",4,0);
			drawMusicSymbol(cctx,"\ue52d",controlHelpOriginX+(chu*16),controlHelpOriginY+(chu*69),chu*13);
			drawNote(cctx,controlHelpOriginX+(chu*28),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,0);
			drawNote(cctx,controlHelpOriginX+(chu*38),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",2,0);
			drawArrow(cctx,controlHelpOriginX+(chu*52),controlHelpOriginY+(chu*56),chu*13);
			setTempGridSize(chu*20);
			drawCellSimpleDynamic(cctx,controlHelpOriginX+(chu*63),controlHelpOriginY+(chu*41),0,0,3);
            restoreTempGridSize();
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*63),controlHelpOriginY+(chu*41),chu*20,[0,0,0,34,36,93,92],false);
			break;
		case 18: // gradual dynamic changes
			drawControlHelpTitleText("Gradual Dynamic Changes");
			drawControlHelpDescriptionText("To indicate a gradual dynamic change, place the \"Begin\" symbol before\nthe first note affected and the \"End\" symbol after the last note affected.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*49),chu*13,chu*47,1);
			drawNote(cctx,controlHelpOriginX+(chu*18),controlHelpOriginY+(chu*49),chu*13,"noteQuarterUp",4,0);
			drawLine(cctx,controlHelpOriginX+(chu*20),controlHelpOriginY+(chu*69),controlHelpOriginX+(chu*40),controlHelpOriginY+(chu*67),"#000",chu*0.5);
			drawLine(cctx,controlHelpOriginX+(chu*20),controlHelpOriginY+(chu*69),controlHelpOriginX+(chu*40),controlHelpOriginY+(chu*71),"#000",chu*0.5);
			drawNote(cctx,controlHelpOriginX+(chu*28),controlHelpOriginY+(chu*49),chu*13,"noteQuarterUp",3,0);
			drawNote(cctx,controlHelpOriginX+(chu*38),controlHelpOriginY+(chu*49),chu*13,"noteQuarterUp",2,0);
			drawArrow(cctx,controlHelpOriginX+(chu*52),controlHelpOriginY+(chu*60),chu*13);
			setTempGridSize(chu*20);
			drawCellHairpinDynamic(cctx,controlHelpOriginX+(chu*63),controlHelpOriginY+(chu*45),0,0,1);
			drawCellHairpinDynamic(cctx,controlHelpOriginX+(chu*143),controlHelpOriginY+(chu*45),0,0,2);
            restoreTempGridSize();
            drawBrailleIcons(cctx,controlHelpOriginX+(chu*63),controlHelpOriginY+(chu*45),chu*20,[0,0,34,36,93,92],false);
			break;
		case 19: // barlines
			drawControlHelpTitleText("Barlines");
			drawControlHelpDescriptionText("Generally, measures are delineated in braille music with a space; the\n\"Single Barline\" symbol is used only when necessary for clarity.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*49),chu*13,chu*52,1);
			drawNote(cctx,controlHelpOriginX+(chu*18),controlHelpOriginY+(chu*49),chu*13,"noteWhole",0,0);
			drawLine(cctx,controlHelpOriginX+(chu*31),controlHelpOriginY+(chu*49),controlHelpOriginX+(chu*31),controlHelpOriginY+(chu*62),"#000",chu*0.5);
			drawNote(cctx,controlHelpOriginX+(chu*37),controlHelpOriginY+(chu*49),chu*13,"noteWhole",-2,0);
			drawLine(cctx,controlHelpOriginX+(chu*50),controlHelpOriginY+(chu*49),controlHelpOriginX+(chu*50),controlHelpOriginY+(chu*62),"#000",chu*0.5);
			drawLine(cctx,controlHelpOriginX+(chu*52),controlHelpOriginY+(chu*49),controlHelpOriginX+(chu*52),controlHelpOriginY+(chu*62),"#000",chu*1.25);
			drawArrow(cctx,controlHelpOriginX+(chu*57),controlHelpOriginY+(chu*60),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*68),controlHelpOriginY+(chu*45),chu*20,[34,41,0,90],false);
			setTempGridSize(chu*20);
            drawMultiCellBackground(cctx,controlHelpOriginX+(chu*121.33),controlHelpOriginY+(chu*45),0,0,"#000",2); // 2 cells black
			cctx.font = "normal "+gridHeight*0.6+"px Bravura";
			cctx.textBaseline = "alphabetic";
			cctx.fillStyle = "#FFF"; // white
			cctx.fillText("\ue032",controlHelpOriginX+(chu*121.33)+gw(1),controlHelpOriginY+(chu*45)+gh(0.8));
            restoreTempGridSize();
			break;
		case 20: // mark repeated section
			drawControlHelpTitleText("Marking Repeated Sections");
			drawControlHelpDescriptionText("Mark sections to repeat by placing the beginning repeat symbol followed\nby a number before the section, and an ending repeat symbol afterward.\nThese symbols only mark the section; use \"Play Section #\" to indicate\nwhen the section is to be repeated.");
			drawBrailleIcons(cctx,controlHelpOriginX,controlHelpOriginY+(chu*55),chu*20,[143,665,94,86,63,86,93,0,86,63,86,92,242],false);
			break;
		case 21: // measure repeat
			drawControlHelpTitleText("Measure Repeat");
			drawControlHelpDescriptionText("This repeat symbol can be used to indicate a repeat of the last full\nmeasure or partial measure.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13,chu*47,1);
			drawNote(cctx,controlHelpOriginX+(chu*14),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",4,0);
			drawNote(cctx,controlHelpOriginX+(chu*22),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,0);
			drawNote(cctx,controlHelpOriginX+(chu*30),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",4,0);
			drawNote(cctx,controlHelpOriginX+(chu*38),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,0);
			drawArrow(cctx,controlHelpOriginX+(chu*52),controlHelpOriginY+(chu*56),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*63),controlHelpOriginY+(chu*41),chu*20,[34,36,93,155],false);
			break;
		case 22: // play marked section
			drawControlHelpTitleText("Playing Marked Sections");
			drawControlHelpDescriptionText("To instruct performer to play a previously marked section, use \"Play\nSection #\" followed by the section number, then \"Number of Measures\"\nfollowed by the measure length of the section.");
			drawBrailleIcons(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*20,[134,0,665,335,666],true);
			break;
		case 23: // literary braille
			drawControlHelpTitleText("Literary Braille");
			drawControlHelpDescriptionText("To include text, use literary braille. If music and text is mixed on a single\nline, use the Text Prefix and Music Prefix to switch between systems.");
			break;
		case 24: // clefs
			drawControlHelpTitleText("Clefs");
			drawControlHelpDescriptionText("Clefs are unnecessary in braille music, which requires octave\nsymbols to indicate register, but are sometimes included to\ncorrelate with printed scores.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13,chu*37,1);
			drawNote(cctx,controlHelpOriginX+(chu*16),controlHelpOriginY+(chu*45),chu*13,"noteHalfDown",-1,0);
			drawNote(cctx,controlHelpOriginX+(chu*26),controlHelpOriginY+(chu*45),chu*13,"noteHalfDown",-2,0);
			drawArrow(cctx,controlHelpOriginX+(chu*42),controlHelpOriginY+(chu*56),chu*13);
			setTempGridSize(chu*20);
            drawCellClef(cctx,controlHelpOriginX+(chu*53),controlHelpOriginY+(chu*41),0,0,1);
            restoreTempGridSize();
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*93),controlHelpOriginY+(chu*41),chu*20,[46,78,79],false);
			break;
		case 25: // braille music comma
			drawControlHelpTitleText("Braille Music Comma");
			drawControlHelpDescriptionText("The braille music comma is generally used to show divisions\nthat are normally shown in traditional notation with\nbeamed note groups.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13,chu*67,1);
			drawTimeSignature(cctx,controlHelpOriginX+(chu*14),controlHelpOriginY+(chu*45),chu*13,3,4);
			drawNote(cctx,controlHelpOriginX+(chu*24),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,0);
			drawNote(cctx,controlHelpOriginX+(chu*30.5),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,0);
			drawNote(cctx,controlHelpOriginX+(chu*37),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",3,0);
			drawNote(cctx,controlHelpOriginX+(chu*45),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",4,0);
			drawNote(cctx,controlHelpOriginX+(chu*51.5),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",4,0);
			drawNote(cctx,controlHelpOriginX+(chu*58),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",4,0);
			drawLine(cctx,controlHelpOriginX+(chu*27.7),controlHelpOriginY+(chu*45),controlHelpOriginX+(chu*41.2),controlHelpOriginY+(chu*45),"#000",chu*1.625);
			drawLine(cctx,controlHelpOriginX+(chu*48.7),controlHelpOriginY+(chu*46.625),controlHelpOriginX+(chu*62.2),controlHelpOriginY+(chu*46.625),"#000",chu*1.625);
			drawArrow(cctx,controlHelpOriginX+(chu*72),controlHelpOriginY+(chu*56),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*83),controlHelpOriginY+(chu*41),chu*20,[34,71,71,71],false);
			setTempGridSize(chu*20);
            drawCellTextLabel(cctx,controlHelpOriginX+(chu*136.33),controlHelpOriginY+(chu*41),0,0,"MUSIC","COMMA","#000","#FFF",2);
            restoreTempGridSize();
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*163),controlHelpOriginY+(chu*41),chu*20,[70,70,70],false);
			break;
		case 26: // value signs
			drawControlHelpTitleText("Value Signs");
			drawControlHelpDescriptionText("Because 16th, 32nd, 64th and 128th notes use the same\nbraille symbols as whole, half, quarter and eighth notes,\nrespectively, these symbols are sometimes placed before\nnote groupings for clarification when the values cannot be\ndiscerned from context.");
			break;
		case 27: // metronome marking equals sign
			drawControlHelpTitleText("Metronome Marking Equals Sign");
			drawControlHelpDescriptionText("This symbol is used in metronome markings.");
			drawMusicSymbol(cctx,"\ue1d7",controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13);
			drawMusicSymbol(cctx,"\ue08f",controlHelpOriginX+(chu*10),controlHelpOriginY+(chu*45),chu*13);
			drawMusicSymbol(cctx,"\ue881\ue883\ue882",controlHelpOriginX+(chu*20),controlHelpOriginY+(chu*47),chu*13);
			drawArrow(cctx,controlHelpOriginX+(chu*38),controlHelpOriginY+(chu*48),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*49),controlHelpOriginY+(chu*33),chu*20,[68,0,0,665,667,666],false);
			setTempGridSize(chu*20);
            drawMetronomeMarkingEquals(cctx,controlHelpOriginX+(chu*62.33),controlHelpOriginY+(chu*33),0,0);
            restoreTempGridSize();
			break;
		case 28: // multimeasure rests
			drawControlHelpTitleText("Multimeasure Rests");
			drawControlHelpDescriptionText("For three or fewer measures' rest, use consecutive whole rests.\nFor rests lasting four measures or longer, surround a number\nwith beginning and ending rest signs.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*55),chu*13,chu*53,1);
			drawMusicSymbol(cctx,"\ue4ef\ue4f0\ue4f0\ue4f0\ue4f0\ue4f1",controlHelpOriginX+(chu*17),controlHelpOriginY+(chu*61.5),chu*13);
			drawMusicSymbol(cctx,"\ue087",controlHelpOriginX+(chu*28),controlHelpOriginY+(chu*53),chu*13);
			drawArrow(cctx,controlHelpOriginX+(chu*60),controlHelpOriginY+(chu*66),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*71),controlHelpOriginY+(chu*51),chu*20,[735,671,377],false);
			break;
		case 29: // braille music hyphen
			drawControlHelpTitleText("Braille Music Hyphen");
			drawControlHelpDescriptionText("The braille music hyphen indicates allows for notation to be\nbroken into multiple lines of braille characters.");
			drawBrailleIcons(cctx,controlHelpOriginX,controlHelpOriginY+(chu*40),chu*20,[86,59,72,72,72,71,72,60,72,0,86,88,234],false);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*26.66),controlHelpOriginY+(chu*60),chu*20,[60],false);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*40),controlHelpOriginY+(chu*60),chu*20,[72,364,0,72,73,72,70],true);
			break;
		case 30: // fingerings
			drawControlHelpTitleText("Fingering");
			drawControlHelpDescriptionText("Fingering symbols appear immediately after the notes they affect.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*35),chu*13,chu*37,1);
			drawNote(cctx,controlHelpOriginX+(chu*19),controlHelpOriginY+(chu*35),chu*13,"noteQuarterUp",3,0);
			drawNote(cctx,controlHelpOriginX+(chu*28),controlHelpOriginY+(chu*35),chu*13,"noteQuarterDown",0,0);
			drawMusicSymbol(cctx,"\uea55",controlHelpOriginX+(chu*29.3),controlHelpOriginY+(chu*33),chu*13);
			drawArrow(cctx,controlHelpOriginX+(chu*42),controlHelpOriginY+(chu*46),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*53),controlHelpOriginY+(chu*31),chu*20,[34,93,87,449],false);
			break;
		case 31: // right hand / left hand
			drawControlHelpTitleText("Right/Left Hand");
			drawControlHelpDescriptionText("These symbols appear at the beginning of each line for multi-hand\ninstruments (like piano) to indicate which hand should play the line.");
			drawStaff(cctx,controlHelpOriginX+(chu*3),controlHelpOriginY+(chu*45),chu*10,chu*45,1);
			drawNote(cctx,controlHelpOriginX+(chu*16),controlHelpOriginY+(chu*45),chu*10,"noteQuarterDown",0,0);
			drawNote(cctx,controlHelpOriginX+(chu*26),controlHelpOriginY+(chu*45),chu*10,"noteQuarterUp",2,0);
			drawNote(cctx,controlHelpOriginX+(chu*36),controlHelpOriginY+(chu*45),chu*10,"noteHalfDown",-1,0);
			drawStaff(cctx,controlHelpOriginX+(chu*3),controlHelpOriginY+(chu*65),chu*10,chu*45,2);
			drawNote(cctx,controlHelpOriginX+(chu*16),controlHelpOriginY+(chu*65),chu*10,"noteHalfUp",0,0);
			drawNote(cctx,controlHelpOriginX+(chu*36),controlHelpOriginY+(chu*65),chu*10,"noteHalfUp",1,0);
			drawLine(cctx,controlHelpOriginX+(chu*3),controlHelpOriginY+(chu*45),controlHelpOriginX+(chu*3),controlHelpOriginY+(chu*75),"#000",1);
			drawMusicSymbol(cctx,"\ue000",controlHelpOriginX,controlHelpOriginY+(chu*75),chu*30);
			drawArrow(cctx,controlHelpOriginX+(chu*55),controlHelpOriginY+(chu*63),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*96.66),controlHelpOriginY+(chu*40),chu*20,[34,87,92,46,78],true);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*96.66),controlHelpOriginY+(chu*60),chu*20,[95,79,78],true);
			setTempGridSize(chu*20);
            drawCellTextLabel(cctx,controlHelpOriginX+(chu*70),controlHelpOriginY+(chu*40),0,0,"RIGHT","HAND","#000","#FFF",2);
			drawCellTextLabel(cctx,controlHelpOriginX+(chu*70),controlHelpOriginY+(chu*60),0,0,"LEFT","HAND","#000","#FFF",2);
			restoreTempGridSize();
			break;
		case 32: // grace notes
			drawControlHelpTitleText("Grace Note");
			drawControlHelpDescriptionText("This symbol appears before the note to indicate a grace note.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13,chu*47,2);
			drawNote(cctx,controlHelpOriginX+(chu*14),controlHelpOriginY+(chu*45),chu*13,"noteQuarterDown",-1,0);
			drawNote(cctx,controlHelpOriginX+(chu*24),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",1,0);
			drawMusicSymbol(cctx,"\ue560",controlHelpOriginX+(chu*33),controlHelpOriginY+(chu*45),chu*13);
			drawNote(cctx,controlHelpOriginX+(chu*38),controlHelpOriginY+(chu*45),chu*13,"noteQuarterDown",-3,0);
			drawArrow(cctx,controlHelpOriginX+(chu*52),controlHelpOriginY+(chu*56),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*63),controlHelpOriginY+(chu*41),chu*20,[95,36,63,153,73,92],false);
			break;
		case 33: // in-accord
			drawControlHelpTitleText("In-Accord");
			drawControlHelpDescriptionText("This symbol is placed between two simultaneous voices in a single\nmeasure. An octave designation must occur after the symbol and\nat the beginning of the following measure.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*50),chu*13,chu*47,1);
			drawNote(cctx,controlHelpOriginX+(chu*14),controlHelpOriginY+(chu*50),chu*13,"noteQuarterUp",1,0);
			drawNote(cctx,controlHelpOriginX+(chu*24),controlHelpOriginY+(chu*50),chu*13,"noteQuarterUp",0,0);
			drawNote(cctx,controlHelpOriginX+(chu*34),controlHelpOriginY+(chu*50),chu*13,"noteHalfUp",-1,0);
			drawNote(cctx,controlHelpOriginX+(chu*14),controlHelpOriginY+(chu*50),chu*13,"noteHalfDown",3,0);
			drawNote(cctx,controlHelpOriginX+(chu*34),controlHelpOriginY+(chu*50),chu*13,"noteHalfDown",1,0);
			drawArrow(cctx,controlHelpOriginX+(chu*52),controlHelpOriginY+(chu*61),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*63),controlHelpOriginY+(chu*46),chu*20,[34,91,87,78,860,0,34,81,83],true);
			break;
		case 34: // partial measure in-accord
			drawControlHelpTitleText("Partial Measure In-Accord");
			drawControlHelpDescriptionText("These symbols indicate when only a portion of a\nmeasure has more than one simultaneous voice.");
			drawStaff(cctx,controlHelpOriginX,controlHelpOriginY+(chu*45),chu*13,chu*47,1);
			drawNote(cctx,controlHelpOriginX+(chu*14),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",1,0);
			drawNote(cctx,controlHelpOriginX+(chu*24),controlHelpOriginY+(chu*45),chu*13,"noteQuarterUp",0,0);
			drawNote(cctx,controlHelpOriginX+(chu*34),controlHelpOriginY+(chu*45),chu*13,"noteHalfUp",-1,0);
			drawNote(cctx,controlHelpOriginX+(chu*34),controlHelpOriginY+(chu*45),chu*13,"noteHalfDown",1,0);
			drawArrow(cctx,controlHelpOriginX+(chu*52),controlHelpOriginY+(chu*56),chu*13);
			drawBrailleIcons(cctx,controlHelpOriginX+(chu*63),controlHelpOriginY+(chu*41),chu*20,[34,91,87,646,0,46,78,334,0,34,83],true);
			break;
		case 35: // chord symbols
			drawControlHelpTitleText("Chord Symbols");
			drawControlHelpDescriptionText("These symbols are used with literary braille to\nindicate chords for lead sheets.");
			break;
		default:
			drawControlHelpDescriptionText("Click keys or type to add symbols to the score above.\n\nClick tabs to the left or press spacebar to switch between keyboards.\n\nMouse over the keyboard for help.");
		
	}

}

function drawControlHelpTitleText(title) {
	cctx.fillStyle="#000"; // black
	cctx.textBaseline = "alphabetic";
	cctx.textAlign = "left";
	cctx.font = "bold "+chu*10+"px sans-serif";
	cctx.fillText(title,controlHelpOriginX,controlHelpOriginY+(chu*10));
}

function drawControlHelpDescriptionText(description) {
	cctx.fillStyle="#000"; // black
	cctx.textBaseline = "alphabetic";
	cctx.textAlign = "left";
	cctx.font = "normal "+chu*6+"px sans-serif";
	fillTextMultiline(description,cctx,controlHelpOriginX,controlHelpOriginY+(chu*20),chu*8);
}
	

function fillTextMultiline(txt,context,x,y,lineHeight) {
	var lines = txt.split('\n');
	for (var i=0; i<lines.length; i++) {
		context.fillText(lines[i], x, y+(i*lineHeight));
	}
}

function drawStaff(c,x,y,height,width,clef) {
	c.strokeStyle="#000";
	c.beginPath();
	c.moveTo(x,y);
	c.lineTo(x+width,y);
	c.moveTo(x,y+(height*0.25));
	c.lineTo(x+width,y+(height*0.25));
	c.moveTo(x,y+(height*0.5));
	c.lineTo(x+width,y+(height*0.5));
	c.moveTo(x,y+(height*0.75));
	c.lineTo(x+width,y+(height*0.75));
	c.moveTo(x,y+height);
	c.lineTo(x+width,y+height);
	c.stroke(); // staff lines
	c.closePath();
	
	var clefChar, offset=0;
	switch (clef) {
		case 1: // treble
			clefChar="\ue050";
			offset=height*0.75;
			break;
		case 2: // bass
			clefChar="\ue061";
			offset=height*0.25;
			break;
		default: // no clef
			clefChar="";
	}
	
	c.fillStyle="#000"; // black
	c.textBaseline = "alphabetic";
	c.textAlign = "left";
	c.font = "normal "+height+"px Bravura";
	c.fillText(clefChar,x+(height*0.15),y+offset);
	
}

function drawNote(c,x,y,height,note,position,dots) {
	c.fillStyle="#000"; // black
	c.textBaseline = "alphabetic";
	c.textAlign = "left";
	c.font = "normal "+height+"px Bravura";
	var noteChar, yPos = y+(height*0.5)+(position*(height/8));
	switch (note) {
		case "noteWhole":
			noteChar="\ue1d2";
			break;
		case "noteHalfUp":
			noteChar="\ue1d3";
			break;
		case "noteHalfDown":
			noteChar="\ue1d4";
			break;
		case "noteQuarterUp":
			noteChar="\ue1d5";
			break;
		case "noteQuarterDown":
			noteChar="\ue1d6";
			break;
		case "note8thDown":
			noteChar="\ue1d8";
			break;
		case "noteheadBlack":
			noteChar="\ue0a4";
			break;
		case "restHalf":
			noteChar="\ue4e4";
			yPos = y+(height*0.5)+(0*(height/8));
			break;
		case "restQuarter":
			noteChar="\ue4e5";
			yPos = y+(height*0.5)+(0*(height/8));
			break;
	}
	c.fillText(noteChar,x,yPos);
	var numberOfLedgers=Math.floor(Math.abs(position/2))-2;
	c.strokeStyle="#000";
	c.beginPath();
	var i, currentY;
	for (i=1; i<=numberOfLedgers; i++) {
		currentY=y+(height*0.5)+((position/Math.abs(position))*(height*0.5+(i*(height*0.25))));
		c.moveTo(x-(height*0.15),currentY);
		c.lineTo(x+(height*0.45),currentY);
	}
	c.stroke();
	c.closePath();
	for (i=0; i<dots; i++) {
		c.fillText("\ue1e7",x+(height*0.5)+(i*(height*0.3)),yPos-((height/8)*((Math.abs(position)%2)^1)));
	}
}

function drawArrow(c,x,y,height) {
	c.fillStyle="#000"; // black
	c.textBaseline = "middle";
	c.textAlign = "left";
	c.font = "normal "+height+"px Bravura";
	c.fillText("\ueb62",x,y);
}

function drawBrailleIcons(c,x,y,height,chars,multiCell) {
	doNotCheckContiguousCells = multiCell;
	setTempGridSize(height);
	c.strokeStyle="#000";
	c.lineWidth=1;
	for (var i=0; i<chars.length; i++) {
		if (chars[i]!==0) {
			if ((chars[i]>=533 && chars[i]<=563) || (chars[i]>=565 && chars[i]<=593) || (chars[i]>=647 && chars[i]<=651) || (chars[i]>=654 && chars[i]<=656) || (chars[i]>=665 && chars[i]<=674)) { // if it's literary braille
				c.strokeRect(x+(gridWidth*i)+2,y+2,gridWidth-4,gridHeight-4);
			}
			drawInterpretedBrailleSymbol(c,chars[i],x+(gridWidth*i),y,0,0);
		}
	}
    restoreTempGridSize();
	doNotCheckContiguousCells = false;
}

function drawCellOctaveIcon(c,x,y,height,val) {
	setTempGridSize(height);
	drawCellOctaveRange(c,x,y,val);
    restoreTempGridSize();
}

function drawLine(c,x1,y1,x2,y2,color,width) {
	c.save();
	c.strokeStyle=color;
	c.lineWidth=width;
	c.beginPath();
	c.moveTo(x1,y1);
	c.lineTo(x2,y2);
	c.stroke();
	c.closePath();
	c.restore();
}

function drawMusicSymbol(c,txt,x,y,height) {
	c.textBaseline = "middle";
	c.textAlign = "left";
	c.font = "normal "+height+"px Bravura";
	c.fillText(txt,x,y);
}

function drawAccidental(c,x,y,height,accidental,position) {
	c.fillStyle="#000"; // black
	c.textBaseline = "alphabetic";
	c.textAlign = "left";
	c.font = "normal "+height+"px Bravura";
	var noteChar, yPos = y+(height*0.5)+(position*(height/8));
	switch (accidental) {
		case -2:
			noteChar="\ue264";
			break;
		case -1:
			noteChar="\ue260";
			break;
		case 0:
			noteChar="\ue261";
			break;
		case 1:
			noteChar="\ue262";
			break;
		case 2:
			noteChar="\ue263";
			break;
	}
	c.fillText(noteChar,x-(height/3),yPos);
}

function drawTie(c,x1,x2,y,height,position) {
	var yPos = y+(height*0.5)+((position-1)*(height/8));
	c.beginPath();
	var a = (x2-x1)/2;
	c.arc(x1+a,yPos+a,Math.sqrt(2*Math.pow(a,2)),1.25*Math.PI,1.75*Math.PI,false);
	c.lineWidth=2;
	c.strokeStyle = "#000"; // black
	c.stroke();
	c.closePath();
}

function drawTimeSignature(c,x,y,height,top,bottom) {
	c.textBaseline = "middle";
	c.textAlign = "left";
	c.font = "normal "+height+"px Bravura";
	var chars=["\ue080","\ue081","\ue082","\ue083","\ue084","\ue085","\ue086","\ue087","\ue088","\ue089"];
	c.fillText(chars[top],x,y+(height*0.25));
	c.fillText(chars[bottom],x,y+(height*0.75));
}

function drawSlur(c,x1,y1,x2,y2,x3,y3) {
	c.beginPath();
	c.moveTo(x1,y1);
	c.quadraticCurveTo(x2,y2,x3,y3);
	c.lineWidth=2;
	c.strokeStyle = "#000"; // black
	c.stroke();
	c.closePath();
}

function setTempGridSize(height) {
    savedGridHeight = gridHeight;
    gridHeight = height;
    gridWidth = (height*2)/3;
}

function restoreTempGridSize() {
    gridHeight = savedGridHeight;
    gridWidth = (gridHeight*2)/3;
}
