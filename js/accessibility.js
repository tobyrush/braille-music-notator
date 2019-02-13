/* global document, cursor, score, useBrailleDisplay, checkContiguousCells, checkPreviousCell, ctx: true */

function updateScreenreader(msg) {
	if (useBrailleDisplay) {
		document.getElementById("screenreader").innerHTML=getScoreLine(+cursor.y);
	} else {
		document.getElementById("screenreader").innerHTML=msg+". line "+(+cursor.y)+" character "+(+cursor.x)+". "+getScoreDescriptor(cursor.x,cursor.y);
	}
}

function getScoreDescriptor(x,y) {
	
	var val=0;
    if ((typeof score[y]!=="undefined") && (score[y]!==null) && (typeof score[y][x]!=="undefined")) {
		val=score[y][x];
	}
	
	return characterName(val,x,y);
	
}
	
function getScoreLine(row) {
	
	var lineString = "";
	
	for (var col=0; col<=score[row].length; col+=1) {
		if ((typeof score[row][col]!=='undefined') && (score[row][col]>0)) {
			lineString=lineString+String.fromCharCode(score[row][col] % 100);
		} else {
			lineString=lineString+" ";
		}
	}
	
	return lineString;
}

function characterName(val,x,y) {
	
	var chars, s, fromScore = true;

    if (x == -1) {
		fromScore = false;
	}
	
	if (val==33) { // A whole note
		if (fromScore && checkContiguousCells(x,y,[33,75])) {
			s="first character of A double whole note";
		} else {
			s="A whole note";
        }
		
	} else if (val==34) { // octave 4
		s="fourth octave";
		
	} else if (val==35) { // time sig prefix
		s="time signature prefix";
	
	} else if (val==36) { // E quarter note
		s="E quarter note";
		
	} else if (val==37) { // sharp
		if (fromScore && checkContiguousCells(x,y,[37,337])) {
			s="first character of double sharp";
		} else {
			s="sharp";
		}

	} else if (val==38) { // E whole note
		if (fromScore && checkContiguousCells(x,y,[38,75])) {
			s="first character of E double whole note";
		} else {
			s="E whole note";
        }
		
	} else if (val==39) { // augmentation dot
		s="dot";
		
	} else if (val==40) { // G whole note
		if (fromScore && checkContiguousCells(x,y,[40,75])) {
			s="first character of G double whole note";
		} else {
			s="G whole note";
        }
		
	} else if (val==41) { // B whole note
		if (fromScore && checkContiguousCells(x,y,[41,75])) {
			s="first character of B double whole note";
		} else {
			s="B whole note";
        }
		
	} else if (val==42) { // natural
		s="natural";
		
	} else if (val==43) { // interval 3rd
		s="added note at the third";
		
	} else if (val==44) { // octave 7
		if (fromScore && checkContiguousCells(x,y,[44,144])) { // octave 8
			s="first character of eighth octave";
		} else {
			s="seventh octave";
		}
		
	} else if (val==45) { // interval 8ve
		s="added note at the octave";
		
	} else if (val==46) { // octave 5
		s="fifth octave";
		
	} else if (val==47) { // interval 2nd
		s="added note at the second";
		
	} else if (val==48) { // time signature bottom 0
		s="time signature lower number 0";
		
	} else if (val>=49 && val<=57) { // time signature bottom numbers
		s="time signature lower number "+(val-48);
		
	} else if (val==58) { // D quarter note
		s="d quarter note";
		
	} else if (val==59) { // octave 6
		s="sixth octave";
		
	} else if (val==60) { // flat
		if (fromScore && checkContiguousCells(x,y,[60,360])) {
			s="first character of double flat";
		} else {
			s="flat";
		}
		
	} else if (val==61) { // F whole note
		if (fromScore && checkContiguousCells(x,y,[61,75])) {
			s="first character of F double whole note";
		} else {
			s="F whole note";
        }
		
	} else if (val==62) { // word prefix
		s="word prefix";
		
	} else if (val==63) { // C quarter note
		s="C quarter note";
		
	} else if (val==64) { // octave 1
		if (fromScore && checkContiguousCells(x,y,[64,164])) { // octave 0
			s="first character of octave 0";
		} else {
			s="first octave";
		}
		
	} else if (val==66) { // down bow (second symbol)
		s="second character of down bow";
		
	} else if (val==67) { // short slur
		s="short slur";
		
	} else if (val>=68 && val<=74) { // eighth notes
		chars=['C','D','E','F','G','A','B'];
		s=chars[val-68]+" eighth note";
		
	} else if (val==75) { // double whole note or rest (second symbol)
		if (checkPreviousCell(x,y,77)) {
            s="last character of double whole rest symbol";
        } else {
            s="last character of double whole note symbol";
        }

	} else if (val==76) { // forced barline
		s="bar line";
		
	} else if (val==77) { // whole rest
		s="whole rest";
		
	} else if (val>=78 && val<=84) { // half notes
		chars=['C','D','E','F','G','A','B'];
		s=chars[val-78]+" half note";
		
	} else if (val==85) { // half rest
		s="half rest";
		
	} else if (val==86) { // quarter rest
		s="quarter rest";
		
	} else if (val==87) { // B quarter note
		s="B quarter note";
		
	} else if (val==88) { // eighth rest
		s="eighth rest";
		
	} else if (val>=89 && val<=90) { // C and D whole notes
		chars=['C','D'];
		if (fromScore && checkContiguousCells(x,y,[val,75])) {
			s="first character of "+chars[val-89]+" double whole note";
		} else {
			s=chars[val-89]+" whole note";
        }
		
	} else if (val==91) { // A quarter note
		s="A quarter note";
		
	} else if (val==92) { // G quarter note
		s="G quarter note";
		
	} else if (val==93) { // F quarter note
		s="F quarter note";
		
	} else if (val==94) { // octave 2
		s="second octave";
		
	} else if (val==95) { // octave 3
		s="third octave";
		
	} else if (val==133) { // A 16th note
		s="A sixteenth note";
		
	} else if (val==134) { // play section #
		s="first character of play section number";
		
	} else if (val==135) { // interval 4th
		s="fourth interval";
		
	} else if (val==136) { // E 64th note
		s="E sixty-fourth note";
		
	} else if (val==137) { // key signature sharp
		s="key signature sharp";
		
	} else if (val==138) { // E 16th note
		s="E sixteenth note";
		
	} else if (val==139) { // final/double barline (second symbol)
		s="second character of final or double bar line";
		
	} else if (val==140) { // G 16th note
		s="G sixteenth note";
		
	} else if (val==141) { // B 16th note
		s="B sixteenth note";
		
	} else if (val==142) { // key signature natural
		s="key signature natural";
		
	} else if (val==143) { // begin repeated section
		s="begin repeated section";
		
	} else if (val==144) { // octave 8
		s="second character of eighth octave";
		
	} else if (val==146) { // common time
		s="first character of common time symbol";
		
	} else if (val==148) { // interval 6th
		s="added note at the sixth";
		
	} else if (val==149) { // pause (second symbol)
		s="second character of pause";
		
	} else if (val==150) { // triplet
		s="triplet symbol";
		
	} else if (val==151) { // interval 7th
		s="added note at the seventh";
		
	} else if (val==153) { // grace note
		s="grace note";
		
	} else if (val==154) { // trill
		s="trill";
		
	} else if (val==155) { // measure repeat
		s="measure repeat";
		
	} else if (val==156) { // tenuto, accent or marcato (second symbol)
		s="second character of tenuto, accent or marcato";
		
	} else if (val==157) { // interval 5th
		s="added note at the fifth";
		
	} else if (val==158) { // D 64th note
		s="D sixty-fourth note";
		
	} else if (val==159) { // marcato (first character)
		s="first character of marcato";
		
	} else if (val==160) { // key signature flat
		s="key signature flat";
		
	} else if (val==161) { // F 16th note
		s="F sixteenth note";
		
	} else if (val==162) { // hairpin dynamic (first character)
		s="first character of gradual crescendo or diminuendo";
		
	} else if (val==163) { // C 64th note
		s="C sixty-fourth note";
		
	} else if (val==164) { // octave 0
		s="second character of octave 0";
		
	} else if (val>=165 && val<=173) { // time signature top numbers 1-9
		s="time signature top number "+(val-164);
		
	} else if (val==174) { // time signature top 0
		s="time signature top number 0";
		
	} else if (val==175) { // part of barline symbol
		s="second character of final or double bar line symbol";
		
	} else if (val==176) { // fermata (second symbol)
		s="second character of fermata";
		
	} else if (val==177) { // 16th rest
		s="sixteenth rest";
		
	} else if (val>=178 && val<=184) { // 32nd notes
		chars=['C','D','E','F','G','A','B'];
		s=chars[val-178]+" thirty-second note";
		
	} else if (val==185) { // 32nd rest
		s="thirty-second rest";
		
	} else if (val==186) { // 64th rest
		s="sixty-fourth rest";
		
	} else if (val==187) { // B 64th note
		s="B sixty-fourth note";
		
	} else if (val==188) { // 128th rest
		s="one hundred twenty-eighth rest";
		
	} else if (val>=189 && val<=190) { // C and D 16th notes
		chars=['C','D'];
		s=chars[val-189]+" sixteenth note";
		
	} else if (val==191) { // A 64th note
		s="A sixty-fourth note";
		
	} else if (val==192) { // G 64th note
		s="G sixty-fourth note";
		
	} else if (val==193) { // F 64th note
		s="F sixty-fourth note";
		
	} else if (val==194) { // prefer larger note values
		s="first character of large note value sign";
		
	} else if (val==195) { // cut time
		s="first character of cut time symbol";
		
	} else if (val==234) { // braille music hyphen
		s="braille music hyphen";
	
	} else if (val==235) { // key sig prefix
		s="key signature prefix";
	
	} else if (val==239) { // hairpin dynamic (third symbol) or text dynamic (last symbol) or hand sign (last symbol)
		s="last symbol of gradual dynamic, text dynamic, or hand sign";
	
	} else if (val==242) { // end repeated section
		s="end repeated section";
		
	} else if (val==243) { // play section # (second symbol)
		s="second character of play section number";
		
	} else if (val==244) { // prefer smaller note values (first symbol)
		s="first character of small note value sign";
		
	} else if (val==248) { // tuplet number 0
		s="tuplet number zero";
		
	} else if (val>=249 && val<=257) { // tuplet numbers
		s="tuplet number "+(val-248);
		
	} else if (val==259) { // grace note slur
		s="grace note slur";
		
	} else if (val==260) { // final or double barline
		ctx.font = "normal 36px Bravura";
		ctx.textBaseline = "alphabetic";
		if (fromScore && checkContiguousCells(x,y,[260,175,139])) { // double barline
			s="first character of double bar line";
		} else if (fromScore && checkContiguousCells(x,y,[260,175])) { // final barline
			s="first character of final bar line";
		} else if (fromScore && checkContiguousCells(x,y,[260,355])) { // forward repeat
			s="first character of forward repeat";
		} else if (fromScore && checkContiguousCells(x,y,[260,350])) { // backward repeat
			s="first character of backward repeat";
		} else {
			s="first character of bar line symbol";
		}
	
	} else if (val==262) { // right hand / left hand (second symbol)
		s="second character of hand sign";
		
	} else if (val>=265 && val<=271) { // key signature accidental multipliers
		s="key signature "+(val-264)+" accidentals";
	
	} else if (val==275) { // approximate pitch notehead (second symbol)
		s="second character of approximate pitch notehead symbol";

	} else if (val==276) { // diamond notehead (second symbol)
		s="second character of diamond notehead symbol";

	} else if (val==295) { // tuplet prefix
		s="tuplet prefix";
		
	} else if (val==334) { // partial measure in-accord (first character)
		s="first character of partial measure in-accord symbol";
		
	} else if (val==335) { // number of measures to repeat
		s="number of measures";
		
	} else if (val==337) { // double sharp
		s="second character of double sharp symbol";
		
	} else if (val==339) { // music prefix (second symbol)
		s="second character of music prefix";
		
	} else if (val==343) { // plus
		s="plus";
		
	} else if (val==344) { // music prefix (first symbol)
		s="first character of music prefix";
		
	} else if (val==346) { // accent (first symbol)
		s="first character of accent";
		
	} else if (val==349) { // braille music comma (second symbol) or large note values symbol (last symbol)
		s="second character of braille music comma or last character of large note values symbol";
		
	} else if (val==350) { // end bracket slur (second symbol)
		s="second character of end bracket slur";
		
	} else if (val==353) { // special noteheads (first symbol)
		s="first character of special notehead";

	} else if (val==356) { // staccato
		s="staccato";
		
	} else if (val==359) { // begin bracket slur (first symbol)
		s="first character of begin bracket slur";
		
	} else if (val==360) { // double flat
		s="second character of double flat";
		
	} else if (val==362) { // pause (first symbol)
		s="first character of pause";
		
	} else if (val==364) { // tie
		s="first character of tie";
		
	} else if (val==366) { // begin bracket slur (second symbol)
		s="second character of begin bracket slur";
		
	} else if (val==367) { // tie (second character)
		s="second character of tie";
		
	} else if (val>=368 && val<=374) { // 128th notes
		chars=['C','D','E','F','G','A','B'];
		s=chars[val-368]+" one hundred twenty-eighth note";
	
	} else if (val==375) { // in-accord measure division (second symbol)
		s="second character of measure division for in-accord";

	} else if (val==376) { // clef (second symbol)
		s="second character of clef symbol";

	} else if (val==377) { // multi-meaure rest suffix
		s="multi-measure rest suffix";
		
	} else if (val==394) { // end bracket slur (first symbol)
		s="first character of end bracket slur";
		
	} else if (val==395) { // tenuto (first symbol)
		s="first character of tenuto";
		
	} else if (val==435) { // metronome marking equals (second symbol)
		s="second character of equals sign for metronome markings";
		
	} else if (val==439) { // tuplet suffix
		s="tuplet suffix";
		
	} else if (val==446) { // right hand (first symbol)
		s="first symbol for right hand sign";
		
	} else if (val==448) { // major
		s="major";
		
	} else if (val==449) { // fingering 4
		s="fourth finger";
		
	} else if (val==452) { // diminished
		s="diminished";
		
	} else if (val==455) { // metronome marking equals (first symbol)
		s="first character of equals sign for metronome markings";
		
	} else if (val==460) { // fermata (first symbol)
		s="first character of fermata";
		
	} else if (val==462) { // simple/text dynamics (first symbol)
		s="first character of dynamic symbol";
		
	} else if (val==465) { // fingering 1
		s="thumb";
		
	} else if (val==466) { // fingering 2
		s="index finger";
		
	} else if (val==467) { // common time/cut time (second symbol)
		s="second character of common time or cut time";
		
	} else if (val==475) { // fingering 5
		s="fifth finger";
		
	} else if (val==476) { // fingering 3
		s="third finger";
		
	} else if (val==495) { // left hand (first symbol)
		s="first character of left hand sign";
		
	} else if (val>=533 && val<=563) { // punctuation and contractions
		chars=['the','text contraction symbol','number sign','e d','s h','and',"apostrophe",'of','with','c h','i n g','capital sign','hyphen','decimal point','s t','','comma','semicolon','colon','full stop','e n','exclamation point','parenthesis','question mark','in','w h','text sign','g h','for','a r','t h'];
        s="text "+chars[val-533];
	
	} else if (val>=565 && val<=590) { // text letters
		s="text "+String.fromCharCode(val-500);
	
	} else if (val>=591 && val<=593) { // contractions
		chars=['o w','o u','e r'];
		s="text "+chars[val-591];

    } else if (val==594 || val==595) { // contractions
		s="text contraction symbol";
	
	} else if (val==633) {
		if (checkPreviousCell(x,y,534)) { // contraction THERE (last symbol)
            s="last character of text contraction there";
        } else if (checkPreviousCell(x,y,594)) { // contraction THESE (last symbol)
            s="last character of text contraction these";
        } else if (checkPreviousCell(x,y,595)) { // contraction THEIR (last symbol)
            s="last character of text contraction their";
        }

	} else if (val==634) { // tenor clef (third symbol)
		s="third character of tenor clef";
		
	} else if (val==635) { // bass clef (second symbol)
		s="second character of bass clef";
		
	} else if (val==637) { // contraction SHALL
		s="text contraction shall";

	} else if (val==638) { // contraction SPIRIT (last symbol)
		s="last character of text contraction spirit";

	} else if (val==639) { // up bow (second symbol)
		s="second character of up bow";
		
	} else if (val==642) { // contraction CHILD
		s="text contraction child";

	} else if (val==643) { // alto/tenor clef (second symbol)
		s="second character of alto or tenor clef";
		
	} else if (val==644) { // contractions
		if (checkContiguousCells(x,y,[644,789])) { // ally
			s="first character of contraction a l l y";
		} else if (checkContiguousCells(x,y,[644,678])) { // ation
			s="first character of contraction a t i o n";
		}

	} else if (val==645) { // contraction COM
		s="text contraction com";

	} else if (val==646) { // in-accord measure division (first character)
		s="first character of measure division symbol for in-accord";
		
	} else if (val>=647 && val<=657) { // punctuation and contractions
		chars=['slash','close quotation marks','e a','b b','c c','d d','','f f','g g','open quotation marks','by'];
		s="text "+chars[val-647];
	
	} else if (val==658) { // contraction WHICH
		s="text contraction which";

	} else if (val==659) { // contraction
		s="text contraction symbol";

	} else if (val==660) { // braille music comma (first symbol) or large note values symbol (second symbol)
		s="first character of braille music comma or second character of large note values symbol";
		
	} else if (val==662) { // clef (first symbol)
		s="first character of clef symbol";
		
	} else if (val==663) { // contraction THIS
		s="text contraction this";

	} else if (val>=665 && val<=673) { // numbers 1-9
		s="text "+String.fromCharCode(val-616);
	
	} else if (val==674) { // numbers 0
		s="text 0";

	} else if (val==675) { // contraction KNOW (last symbol)
		s="last character of text contraction know";

	} else if (val==676) {
		if (checkPreviousCell(x,y,534)) { // contraction LORD (last symbol)
            s="last character of text contraction lord";
        } else if (checkPreviousCell(x,y,659)) { // contraction FUL (last symbol)
            s="last character of text contraction f u l";
        }

	} else if (val==677) {
		if (checkPreviousCell(x,y,534)) { // contraction MOTHER (last symbol)
            s="last character of text contraction mother";
        } else if (checkPreviousCell(x,y,595)) { // contraction MANY (last symbol)
            s="last character of text contraction many";
        }

	} else if (val==678) {
		if (checkPreviousCell(x,y,534)) { // contraction NAME (last symbol)
            s="last character of text contraction name";
        } else if (checkPreviousCell(x,y,644)) { // contraction ATION (last symbol)
            s="last character of text contraction a t i o n";
        } else if (checkPreviousCell(x,y,659)) { // contraction TION (last symbol)
            s="last character of text contraction t i o n";
        } else if (checkPreviousCell(x,y,746)) { // contraction SION (last symbol)
            s="last character of text contraction s i o n";
        }

	} else if (val==679) { // contraction ONE (last symbol)
		s="last character of text contraction one";

	} else if (val==680) { // contraction PART (last symbol)
		s="last character of text contraction part";

	} else if (val==681) { // contraction QUESTION (last symbol)
		s="last character of text contraction question";

	} else if (val==682) { // contraction RIGHT (last symbol)
		s="last character of text contraction right";

	} else if (val==683) {
		if (checkPreviousCell(x,y,534)) { // contraction SOME (last symbol)
            s="last character of text contraction some";
        } else if (checkPreviousCell(x,y,659)) { // contraction NESS (last symbol)
            s="last character of text contraction ness";
        } else if (checkPreviousCell(x,y,746)) { // contraction LESS (last symbol)
            s="last character of text contraction less";
        }

	} else if (val==684) {
		if (checkPreviousCell(x,y,534)) { // contraction TIME (last symbol)
            s="last character of text contraction time";
        } else if (checkPreviousCell(x,y,659)) { // contraction MENT (last symbol)
            s="last character of text contraction m e n t";
        } else if (checkPreviousCell(x,y,746)) { // contraction OUNT (last symbol)
            s="last character of text contraction o u n t";
        }

	} else if (val>=685 && val<=692) { // punctuation and contractions
		chars=['us','very','will','it','you','as','','out'];
		s="text contraction "+chars[val-685];

	} else if (val==735) { // left H-bar rest
		s="multi-measure rest prefix";
		
	} else if (val==742) { // contraction CHARACTER (last symbol)
		s="last character of text contraction character";

	} else if (val==746) { // contraction
		s="text contraction symbol";

	} else if (val==747) { // contraction STILL
		s="text contraction still";
		
	} else if (val==749) { // partial measure in-accord (second symbol)
		s="second character of partial measure in-accord";
		
	} else if (val>=750 && val<=757) { // punctuation and contractions
		chars=['be','con','dis','enough','to','were','his','was'];
		s="text contraction "+chars[val-750];

	} else if (val==758) {
		if (checkPreviousCell(x,y,534)) { // contraction WHERE (last symbol)
            s="last character of text contraction where";
        } else if (checkPreviousCell(x,y,594)) { // contraction WHOSE (last symbol)
            s="last character of text contraction whose";
        }

	} else if (val==760) { // bowing (first character)
		s="first character of bow marking";
		
	} else if (val==762) { // in-accord (second symbol)
		s="second character of in-accord symbol";
		
	} else if (val==763) {
		if (checkPreviousCell(x,y,534)) { // contraction THROUGH (last symbol)
            s="last character of text contraction through";
        } else if (checkPreviousCell(x,y,594)) { // contraction THOSE (last symbol)
            s="last character of text contraction those";
        }

	} else if (val==765) { // notehead only (second symbol)
		s="second character of notehead only symbol";

	} else if (val==766) { // X notehead (second symbol)
		s="second character of X notehead symbol";

	} else if (val==767) { // change fingers
		s="change fingering";
		
	} else if (val==768) {
		if (checkPreviousCell(x,y,534)) { // contraction DAY (last symbol)
            s="last character of text contraction day";
        } else if (checkPreviousCell(x,y,746)) { // contraction OUND (last symbol)
            s="last character of text contraction o u n d";
        }

	} else if (val==769) {
		if (checkPreviousCell(x,y,534)) { // contraction EVER (last symbol)
            s="last character of text contraction ever";
        } else if (checkPreviousCell(x,y,659)) { // contraction ENCE (last symbol)
            s="last character of text contraction e n c e";
        } else if (checkPreviousCell(x,y,746)) { // contraction ANCE (last symbol)
            s="last character of text contraction a n c e";
        }

	} else if (val==770) { // contraction FROM
		s="text contraction from";

	} else if (val==771) { // contraction ONG (last symbol)
		s="last character of text contraction o n g";

	} else if (val==772) {
		if (checkPreviousCell(x,y,534)) { // contraction HERE (last symbol)
            s="last character of text contraction here";
        } else if (checkPreviousCell(x,y,595)) { // contraction HAD (last symbol)
            s="last character of text contraction had";
        }

	} else if (val>=775 && val<=784) { // contractions
		chars=['knowledge','like','more','not','','people','quite','rather','so','that'];
		s="text contraction "+chars[val-775];

	} else if (val==785) {
		if (checkPreviousCell(x,y,534)) { // contraction UNDER (last symbol)
            s="last character of text contraction under";
        } else if (checkPreviousCell(x,y,594)) { // contraction UPON (last symbol)
            s="last character of text contraction upon";
        }

	} else if (val==787) {
		if (checkPreviousCell(x,y,534)) { // contraction WORK (last symbol)
            s="last character of text contraction work";
        } else if (checkPreviousCell(x,y,594)) { // contraction WORD (last symbol)
            s="last character of text contraction word";
        } else if (checkPreviousCell(x,y,595)) { // contraction WORLD (last symbol)
            s="last character of text contraction world";
        }

	} else if (val==789) {
		if (checkPreviousCell(x,y,534)) { // contraction young (last symbol)
            s="last character of text contraction young";
        } else if (checkPreviousCell(x,y,644)) { // contraction ALLY (last symbol)
            s="last character of text contraction a l l y";
        } else if (checkPreviousCell(x,y,659)) { // contraction ITY (last symbol)
            s="last character of text contraction i t y";
        }

	} else if (val==792) { // contraction OUGHT (last symbol)
		s="last character of text contraction ought";

	} else if (val==849) { // half-diminished (last symbol)
		s="last character of half-diminished symbol";

	} else if (val==835) { // contraction BLE
		s="text contraction b l e";

	} else if (val==854) { // plus (last symbol)
		s="last character of plus symbol";

	} else if (val==855) { // equals (last symbol)
		s="last character of equals symbol";

	} else if (val==860) { // in-accord (first character)
		s="first character of in-accord symbol";
		
	} else if (val>=866 && val<=874) { // contractions
		chars=['but','can','do','every','self','go','have','','just'];
		s="text contraction "+chars[val-866];

	} else if (val==967) { // contractions CANNOT (last symbol)
		s="last character of text contraction cannot";

	} else if (val==970) { // contractions FATHER (last symbol)
		s="last character of text contraction father";

	} else if (typeof val==="undefined" || val===null || val===0 || val==32) {
		s="empty";
		
	} else {
		s="unrecognized character";
	}
	
	return s;
}
