/* global titleArea, tctx, versionString, helpDialogOpen, roundRect, optionsDialogOpen, fileDialogOpen, controlArea, cctx, whichKeyboard, keyboardCoordinates, keymap, keycaps, displayControlHelp, cursor, hScroll, vScroll, controlsHeight, controlsWidth, chu, resizeBarHeight, keyboardOriginX, keyboardOriginY, kbu, controlHelpOriginX, controlHelpOriginY, console: true */
/* jshint -W020 */

function initializeTitle() {
	titleArea.width=titleArea.clientWidth;
	titleArea.height=titleArea.clientHeight;
	
    drawTitle();
}

function clearTitleArea() {
	titleArea.width = titleArea.clientWidth;
}


function drawTitle() {
	clearTitleArea();
	
	titleArea.width=titleArea.clientWidth;
	titleArea.height=titleArea.clientHeight;
	
	var titleWidth = titleArea.clientWidth;
	var titleHeight = titleArea.clientHeight;
	
	var thu = titleHeight/100; // title height unit
	
	tctx.translate(0.5,0.5);
	
	tctx.fillStyle="#000";
	tctx.textAlign="left";
	tctx.textBaseline="top";
	tctx.font = "bold "+(thu*80)+"px sans-serif";
	var t="Braille Music Notator";
	tctx.fillText(t,0,0);
	var twid=tctx.measureText(t).width;
	tctx.font = "100 "+(thu*80)+"px sans-serif";
	tctx.fillText("v"+versionString+" by Toby W. Rush",twid*1.03,0);
	
	tctx.strokeStyle="#000";
	tctx.lineWidth=1;
	tctx.textAlign="center";
	tctx.textBaseline="middle";
	tctx.font = "normal "+thu*50+"px sans-serif";
	
	// help button
	if (helpDialogOpen) {tctx.fillStyle="#000";} else {tctx.fillStyle="#fff";}
	roundRect(tctx, titleWidth-((thu*300)+1), thu*10, thu*300, thu*80, thu*5, helpDialogOpen, true);
	if (helpDialogOpen) {tctx.fillStyle="#fff";} else {tctx.fillStyle="#000";}
	tctx.fillText("Help",titleWidth-((thu*155)+0.5),thu*50);
	
	// options button
	if (optionsDialogOpen) {tctx.fillStyle="#000";} else {tctx.fillStyle="#fff";}
	roundRect(tctx, titleWidth-((thu*600)+5), thu*10, thu*300, thu*80, thu*5, optionsDialogOpen, true);
	if (optionsDialogOpen) {tctx.fillStyle="#fff";} else {tctx.fillStyle="#000";}
	tctx.fillText("Options",titleWidth-((thu*455)+3),thu*50);
	
	// file button
	if (fileDialogOpen) {tctx.fillStyle="#000";} else {tctx.fillStyle="#fff";}
	roundRect(tctx, titleWidth-((thu*900)+10), thu*10, thu*300, thu*80, thu*5, fileDialogOpen, true);
	if (fileDialogOpen) {tctx.fillStyle="#fff";} else {tctx.fillStyle="#000";}
	tctx.fillText("File",titleWidth-((thu*755)+5.5),thu*50);

}

function initializeControls() {
 	controlArea.width=controlArea.clientWidth;
	controlArea.height=controlArea.clientHeight;
	
	drawControls();
}

function clearControlArea() {
	controlArea.width = controlArea.clientWidth;
}

function drawControls() {
	clearControlArea();
	
	controlArea.width=controlArea.clientWidth;
	controlArea.height=controlArea.clientHeight;
	
	resizeBarHeight = 10;
	
	controlsWidth = controlArea.clientWidth;
	controlsHeight = controlArea.clientHeight-resizeBarHeight;
	
	chu = controlsHeight/100; // controls height unit
	
	cctx.translate(0.5,resizeBarHeight+0.5);
	
	// draw keyboard mode buttons
	cctx.fillStyle="#CCC";
	cctx.fillRect(0,0,chu*16.66,chu*100); // gray background
	cctx.fillStyle="#00F";
	switch (whichKeyboard) { // blue indicator
		case 1: cctx.fillRect(0,0,chu*16.66,chu*16.66); break;
		case 2: cctx.fillRect(0,chu*16.66,chu*16.66,chu*16.66); break;
		case 3: cctx.fillRect(0,chu*33.33,chu*16.66,chu*16.66); break;
		case 4: cctx.fillRect(0,chu*50,chu*16.66,chu*16.66); break;
		case 5: cctx.fillRect(0,chu*66.66,chu*16.66,chu*16.66); break;
		case 6: cctx.fillRect(0,chu*83.33,chu*16.66,chu*16.66);
	}
	
	cctx.strokeStyle="#FFF";
	cctx.beginPath();
	cctx.moveTo(0,chu*16.66);
	cctx.lineTo(chu*16.66,chu*16.66);
	cctx.moveTo(0,chu*33.33);
	cctx.lineTo(chu*16.66,chu*33.33);
	cctx.moveTo(0,chu*50);
	cctx.lineTo(chu*16.66,chu*50);
	cctx.moveTo(0,chu*66.66);
	cctx.lineTo(chu*16.66,chu*66.66);
	cctx.moveTo(0,chu*83.33);
	cctx.lineTo(chu*16.66,chu*83.33);
	cctx.stroke(); // separator lines
	cctx.closePath();
	
	cctx.fillStyle="#FFF";
	cctx.textAlign="center";
	cctx.textBaseline="middle";
	cctx.font = "normal "+chu*8+"px sans-serif";
	cctx.fillText("1",chu*8.33,chu*8.33);
	cctx.fillText("2",chu*8.33,chu*25);
	cctx.fillText("3",chu*8.33,chu*41.66);
	cctx.fillText("4",chu*8.33,chu*58.33);
	cctx.fillText("5",chu*8.33,chu*75);
	cctx.fillText("Aa",chu*8.33,chu*91.67);
	
	// draw keyboard
	
	kbu = chu*18;
	//keyboardOriginX = (controlsWidth/2)-((kbu*14.5)/2);
	keyboardOriginX = chu*33;
	keyboardOriginY = chu*13;
	for (var i=0;i<keyboardCoordinates.length;i++) {
		drawKeyCap(cctx,kbu,keyboardOriginX+(keyboardCoordinates[i][0]*kbu), keyboardOriginY+(keyboardCoordinates[i][1]*kbu),keymap[whichKeyboard][i],keycaps[i]);
	}
	
	// draw controls help
	
	controlHelpOriginX = chu*320;
	controlHelpOriginY = chu*10;
	
	displayControlHelp();
	
	// draw border
	cctx.beginPath();
	cctx.moveTo(0,0);
	cctx.lineTo(controlsWidth-1,0);
	cctx.lineTo(controlsWidth-1,controlsHeight-1);
	cctx.lineTo(0,controlsHeight-1);
	cctx.lineTo(0,0);
	cctx.lineWidth=1;
	cctx.strokeStyle="#000";
	cctx.stroke();
	cctx.closePath();
}

function drawKeyCap(cctx,kbu,x,y,noteDescriptor,key) {
	var char, offset=0;
    var drawSmallKeyCap=true;
	switch (noteDescriptor[0]) {
		case 1: // note
			// background
			cctx.fillStyle="#F00";
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			// note name
			cctx.fillStyle="#FFF";
			cctx.font = "normal "+kbu*0.33+"px sans-serif";
			cctx.textAlign="center";
			cctx.textBaseline="top";
			cctx.fillText(noteDescriptor[1],x+(kbu*0.4),y+(kbu*0.1));
			
			// note symbol
			
			cctx.font = "normal "+kbu*0.5+"px Bravura";
			cctx.textAlign="right";
			cctx.textBaseline="alphabetic";
			switch (noteDescriptor[2]) {
				case 1: char="\ue1d2"; break;
				case 2: char="\ue1d3"; break;
				case 4: char="\ue1d5"; break;
				case 8: char="\ue1d7"; break;
				case 16: char="\ue1d9"; break;
				case 32: char="\ue1db"; break;
				case 64: char="\ue1dd"; break;
				case 128: char="\ue1df";
			}
			cctx.fillText(char,x+(kbu*0.8),y+(kbu*0.75));	
			
			// set color for key cap
			cctx.fillStyle="#F77";
			
			break;
			
		case 2: // octave
			// background
			cctx.fillStyle="#929";
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			// "oct"
			cctx.fillStyle="#FFF";
			cctx.font = "normal "+kbu*0.22+"px sans-serif";
			cctx.textAlign="center";
			cctx.textBaseline="top";
			cctx.fillText("OCT",x+(kbu*0.48),y+(kbu*0.1));
			
			// octave number
			
			cctx.font = "normal "+kbu*0.45+"px sans-serif";
			cctx.textBaseline="alphabetic";
			cctx.fillText(noteDescriptor[1],x+(kbu*0.48),y+(kbu*0.75));	
			
			// set color for key cap
			cctx.fillStyle="#C8C";
			
			break;
			
		case 3: // tie and slurs
			// background
			cctx.fillStyle="#FF0";
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			cctx.lineWidth=2;
			cctx.strokeStyle = "#000"; // black
			cctx.fillStyle = "#000"; // black
			
			switch (noteDescriptor[1]) {
				case 1: // tie
					cctx.beginPath();
					cctx.arc(x+(kbu*0.48),y+(kbu*0.65),kbu*0.4,1.25*Math.PI,1.75*Math.PI,false);
					cctx.stroke();
					cctx.closePath();
					cctx.font = "normal "+kbu*0.2+"px sans-serif";
					cctx.textAlign="center";
					cctx.textBaseline="alphabetic";
					cctx.fillText("TIE",x+(kbu*0.47),y+(kbu*0.6));
					break;
				case 2: // short slur
					cctx.beginPath();
					cctx.arc(x+(kbu*0.48),y+(kbu*0.65),kbu*0.4,1.25*Math.PI,1.75*Math.PI,false);
					cctx.stroke();
					cctx.closePath();
					cctx.font = "normal "+kbu*0.2+"px sans-serif";
					cctx.textAlign="center";
					cctx.textBaseline="alphabetic";
					cctx.fillText("SLUR",x+(kbu*0.47),y+(kbu*0.6));
					break;
				case 3: // begin bracket slur
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.20)+"px sans-serif";
					cctx.fillText("BEGIN",x+(kbu*0.47),y+(kbu*0.25));
					cctx.fillText("SLUR",x+(kbu*0.47),y+(kbu*0.51));
					break;
				case 4: // begin bracket slur
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.20)+"px sans-serif";
					cctx.fillText("END",x+(kbu*0.47),y+(kbu*0.25));
					cctx.fillText("SLUR",x+(kbu*0.47),y+(kbu*0.51));
					break;
			}
				
			
			// set color for key cap
			cctx.fillStyle="#770";
			
			break;
			
		case 4: // accidentals
			// background
			cctx.fillStyle="#F80";
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			// accidental
			cctx.fillStyle="#000";
			cctx.font = "normal "+kbu*0.8+"px Bravura";
			cctx.textAlign="center";
			cctx.textBaseline="alphabetic";
			switch (noteDescriptor[1]) {
				case -2: char="\ue264"; offset=0.1; break;
				case -1: char="\ue260"; offset=0.1; break;
				case 0: char="\ue261"; break;
				case 1: char="\ue262"; break;
				case 2: char="\ue263";
			}
			cctx.fillText(char,x+(kbu*0.48),y+(kbu*(0.47+offset)));
			
			// set color for key cap
			cctx.fillStyle="#740";
			
			break;
			
		case 5: // augmentation dot
			// background
			cctx.fillStyle="#F00";
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			// dot
			cctx.fillStyle="#FFF";
			cctx.font = "normal "+kbu*0.8+"px Bravura";
			cctx.textAlign="center";
			cctx.textBaseline="alphabetic";
			cctx.fillText("\ue1e7",x+(kbu*0.48),y+(kbu*0.48));
			
			// set color for key cap
			cctx.fillStyle="#F77";
			
			break;
			
		case 6: // interval
			// background
			cctx.fillStyle="#FAF";
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			// "+"
			cctx.fillStyle="#000";
			cctx.font = "bold "+kbu*0.3+"px sans-serif";
			cctx.textAlign="center";
			cctx.textBaseline="alphabetic";
			cctx.fillText("+",x+(kbu*0.48),y+(kbu*0.27));
			
			// interval number
			
			cctx.font = "bold "+kbu*0.35+"px sans-serif";
			cctx.textBaseline="alphabetic";
			cctx.fillText(noteDescriptor[1],x+(kbu*0.48),y+(kbu*0.6));	
			
			// set color for key cap
			cctx.fillStyle="#757";
			
			break;
			
		case 7: // meter
			// background
			cctx.fillStyle="#070";
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			char = ['\ue080','\ue081','\ue082','\ue083','\ue084','\ue085','\ue086','\ue087','\ue088','\ue089'];
			cctx.fillStyle="#FFF"; // white
			cctx.textBaseline = "alphabetic";
			cctx.textAlign = "center";
			switch (noteDescriptor[1]) {
				case 0: // prefix
					cctx.save();
					cctx.translate(x,y+(kbu*0.95));
					cctx.rotate(-Math.PI/2);
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.20)+"px sans-serif";
					cctx.fillText("METER",kbu*0.47,kbu*0.40);
					cctx.fillText("PREFIX",kbu*0.47,kbu*0.66);
					cctx.restore();
					break;
				case 1: // top number
					cctx.font = "normal "+(kbu*0.5)+"px Bravura";
					cctx.fillText(char[noteDescriptor[2]],x+(kbu*0.53),y+(kbu*0.30));
					cctx.fillStyle="#7B7";
					cctx.font = "bold italic "+(kbu*0.4)+"px serif";
					cctx.fillText("x",x+(kbu*0.53),y+kbu*0.76);
					break;
				case 2: // bottom number
					cctx.font = "normal "+(kbu*0.5)+"px Bravura";
					cctx.fillText(char[noteDescriptor[2]],x+(kbu*0.53),y+(kbu*0.63));
					cctx.fillStyle="#7B7";
					cctx.font = "bold italic "+(kbu*0.4)+"px serif";
					cctx.fillText("x",x+(kbu*0.53),y+kbu*0.40);
					break;
				case 3: // common time
					cctx.font = "normal "+(kbu*0.65)+"px Bravura";
					cctx.fillText("\ue08a",x+(kbu*0.47),y+(kbu*0.47));
					break;
				case 4: // cut time
					cctx.font = "normal "+(kbu*0.65)+"px Bravura";
					cctx.fillText("\ue08b",x+(kbu*0.47),y+(kbu*0.47));
			}
				
			// set color for key cap
			cctx.fillStyle="#7B7";
			
			break;
			
		case 8: // key signatures
			// background
			cctx.fillStyle="#00F"; // blue
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			cctx.fillStyle="#FFF";
					
			switch (noteDescriptor[1]) {
				case 0: // accidental
					cctx.font = "normal "+(kbu*0.8)+"px Bravura";
					cctx.textAlign="center";
					cctx.textBaseline="alphabetic";
					switch (noteDescriptor[2]) {
						case -1: char="\ue260"; offset=0.1; break;
						case 0: char="\ue261"; break;
						case 1: char="\ue262"; break;
					}
					cctx.fillText(char,x+(kbu*0.48),y+(kbu*(0.47+offset)));
					break;
				case 1: // multiplier
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.4)+"px sans-serif";
					cctx.fillText(noteDescriptor[2] + "×",x+(kbu*0.47),y+(kbu*0.4));
					break;
				case 2: // prefix
					cctx.save();
					cctx.translate(x,y+(kbu*0.95));
					cctx.rotate(-Math.PI/2);
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.20)+"px sans-serif";
					cctx.fillText("KEY",kbu*0.47,kbu*0.40);
					cctx.fillText("PREFIX",kbu*0.47,kbu*0.66);
					cctx.restore();
			}
			
			// set color for key cap
			cctx.fillStyle="#77F";
			
			break;
			
		case 9: // barlines and full measure symbols
			// background
			cctx.fillStyle="#000";
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			// barline
			cctx.fillStyle="#FFF";
			if (noteDescriptor[1]==4) { // end repeat
				cctx.textAlign="center";
				cctx.textBaseline="middle";
				cctx.font = "normal "+(kbu*0.20)+"px sans-serif";
				cctx.fillText("END",x+(kbu*0.47),y+(kbu*0.25));
				cctx.fillText("RPT",x+(kbu*0.47),y+(kbu*0.51));
			} else if (noteDescriptor[1]==7) {
				cctx.textAlign="center";
				cctx.textBaseline="middle";
				cctx.font = "normal "+(kbu*0.20)+"px sans-serif";
				cctx.fillText("# OF",x+(kbu*0.47),y+(kbu*0.25));
				cctx.fillText("MEAS.",x+(kbu*0.47),y+(kbu*0.51));
			} else if (noteDescriptor[1]>10 && noteDescriptor[1]<14) {
				cctx.beginPath();
				cctx.moveTo(x+(kbu*0.75),y+(kbu*0.30));
                cctx.lineTo(x+(kbu*0.25),y+(kbu*0.30));
                cctx.lineTo(x+(kbu*0.25),y+(kbu*0.60));
                cctx.lineWidth=1;
                cctx.strokeStyle="#FFF";
                cctx.stroke();
                cctx.closePath();
                cctx.textAlign="center";
				cctx.textBaseline="middle";
				cctx.font = "normal "+(kbu*0.25)+"px sans-serif";
				cctx.fillText((noteDescriptor[1]-10).toString()+".",x+(kbu*0.47),y+(kbu*0.45));
			} else {
				cctx.font = "normal "+kbu*0.5+"px Bravura";
				cctx.textAlign="center";
				cctx.textBaseline="alphabetic";
				var baseline=0.7;
				switch (noteDescriptor[1]) {
					case 0: char="\ue030"; break; // single barline
					case 1: char="\ue031"; break; // double barline
					case 2: char="\ue032"; break; // final barline
					case 3: char="\ue047"; baseline=0.55; break; // segno
					case 5: char="\ue500"; baseline=0.45; break; // measure repeat
					case 6: char="\ue045"; baseline=0.45; break; // D.S.
                    case 8: char="\ue040"; break; // begin repeat barline
                    case 9: char="\ue041"; break; // end repeat barline
                    case 10: char="\ue048"; baseline=0.55; break; // coda
					
				}
				cctx.fillText(char,x+(kbu*0.48),y+(kbu*baseline));
			}
			
			// set color for key cap
			cctx.fillStyle="#777";
			
			break;
			
		case 10: // rest
			// background
			cctx.fillStyle="#F00";
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			// symbol
			cctx.fillStyle="#FFF";
			cctx.font = "normal "+kbu*0.6+"px Bravura";
			cctx.textAlign="center";
			cctx.textBaseline="middle";
			switch (noteDescriptor[1]) {
				case 1: char="\ue4f4"; break; // whole rest
				case 2: char="\ue4f5"; break; // half rest
				case 4: char="\ue4e5"; break; // quarter rest
				case 8: char="\ue4e6"; break; // eighth rest
				case 16: char="\ue4e7"; break; // 16th rest
				case 32: char="\ue4e8"; break; // 32nd rest
				case 64: char="\ue4e9"; cctx.font = "normal "+kbu*0.5+"px Bravura"; break; // 64th rest
				case 128: char="\ue4ea"; cctx.font = "normal "+kbu*0.5+"px Bravura"; break; // 128th rest
				case 901: char="\ue4ef"; break; // left H-bar rest
				case 902: char="\ue4f1"; break; // right H-bar rest
				
			}
			cctx.fillText(char,x+(kbu*0.48),y+(kbu*0.48));
			
			// set color for key cap
			cctx.fillStyle="#F77";
			
			break;
			
		case 11: // tuplets
			// background
			cctx.fillStyle="#FF0";
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			cctx.fillStyle="#000";
					
			switch (noteDescriptor[1]) {
				case -3: // triplet
					cctx.font = "normal "+(kbu*0.6)+"px Bravura";
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.fillText("\ue1fe",x+(kbu*0.20),y+(kbu*(1.00)));
					cctx.fillText("\ue1ff",x+(kbu*0.30),y+(kbu*(1.00)));
					cctx.fillText("\ue200",x+(kbu*0.60),y+(kbu*(1.00)));
					break;
				case -2: // suffix
					cctx.font = "normal "+(kbu*0.8)+"px Bravura";
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.fillText("\ue200",x+(kbu*0.40),y+(kbu*(1.30)));
					break;
				case -1: // prefix
					cctx.font = "normal "+(kbu*0.8)+"px Bravura";
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.fillText("\ue1fe",x+(kbu*0.40),y+(kbu*(1.30)));
					break;
				default: // numbers
					cctx.font = "normal "+(kbu*0.8)+"px Bravura";
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					switch (noteDescriptor[1]) {
						case 0: char="\ue880"; break;
						case 1: char="\ue881"; break;
						case 2: char="\ue882"; break;
						case 3: char="\ue883"; break;
						case 4: char="\ue884"; break;
						case 5: char="\ue885"; break;
						case 6: char="\ue886"; break;
						case 7: char="\ue887"; break;
						case 8: char="\ue888"; break;
						case 9: char="\ue889"; break;
					}
					cctx.fillText(char,x+(kbu*0.56),y+(kbu*(0.57)));
					break;
					
					
			}
			
			// set color for key cap
			cctx.fillStyle="#77F";
			
			break;
			
		case 12: // ascii
			// background
			//cctx.fillStyle="#FFF";
			cctx.strokeStyle="#CCC";
			cctx.lineWidth=1;
			roundRect(cctx, x, y, kbu*0.92, kbu*0.92, kbu*0.2, false, true);
			
			// letter
			cctx.fillStyle="#000";
			cctx.font = "normal "+kbu*0.45+"px sans-serif";
			cctx.textAlign="center";
			cctx.textBaseline="middle";
            var letterText = String.fromCharCode(noteDescriptor[1]);
            if (noteDescriptor[1] == 40) {
                letterText = "( )";
            }
            cctx.fillText(letterText,x+(kbu*0.48),y+(kbu*0.48));
			
			// don't draw small key cap
			drawSmallKeyCap=false;
			
			break;
			
		case 13: // dynamics
			// background
			cctx.fillStyle="#0FF"; // cyan
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			cctx.fillStyle="#000";
					
			switch (noteDescriptor[1]) {
				case 1: // begin crescendo
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.20)+"px sans-serif";
					cctx.fillText("BEGIN",x+(kbu*0.47),y+(kbu*0.25));
					cctx.beginPath();
					cctx.moveTo(x+(kbu*0.70),y+(kbu*0.45));
					cctx.lineTo(x+(kbu*0.30),y+(kbu*0.55));
					cctx.lineTo(x+(kbu*0.70),y+(kbu*0.65));
					cctx.lineWidth=1;
					cctx.strokeStyle="#000";
					cctx.stroke();
					cctx.closePath();
					break;
				case 2: // end crescendo
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.20)+"px sans-serif";
					cctx.fillText("END",x+(kbu*0.47),y+(kbu*0.25));
					cctx.beginPath();
					cctx.moveTo(x+(kbu*0.70),y+(kbu*0.45));
					cctx.lineTo(x+(kbu*0.30),y+(kbu*0.55));
					cctx.lineTo(x+(kbu*0.70),y+(kbu*0.65));
					cctx.lineWidth=1;
					cctx.strokeStyle="#000";
					cctx.stroke();
					cctx.closePath();
					break;
				case 3: // begin diminuendo
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.20)+"px sans-serif";
					cctx.fillText("BEGIN",x+(kbu*0.47),y+(kbu*0.25));
					cctx.beginPath();
					cctx.moveTo(x+(kbu*0.30),y+(kbu*0.45));
					cctx.lineTo(x+(kbu*0.70),y+(kbu*0.55));
					cctx.lineTo(x+(kbu*0.30),y+(kbu*0.65));
					cctx.lineWidth=1;
					cctx.strokeStyle="#000";
					cctx.stroke();
					cctx.closePath();
					break;
				case 4: // end dimineundo
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.20)+"px sans-serif";
					cctx.fillText("END",x+(kbu*0.47),y+(kbu*0.25));
					cctx.beginPath();
					cctx.moveTo(x+(kbu*0.30),y+(kbu*0.45));
					cctx.lineTo(x+(kbu*0.70),y+(kbu*0.55));
					cctx.lineTo(x+(kbu*0.30),y+(kbu*0.65));
					cctx.lineWidth=1;
					cctx.strokeStyle="#000";
					cctx.stroke();
					cctx.closePath();
					break;
				case 11: // cresc.
				case 12: // decresc.
				case 13: // dim.
					cctx.font = "italic "+(kbu*0.3)+"px serif";
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					switch (noteDescriptor[1]) {
						case 11: char="cresc."; break;
						case 12: char="decresc."; cctx.font = "italic "+(kbu*0.25)+"px serif"; break;
						case 13: char="dim."; break;
					}
					cctx.fillText(char,x+(kbu*0.5),y+(kbu*(0.42)));
					break;
				default: // others
					cctx.font = "normal "+(kbu*0.6)+"px Bravura";
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					switch (noteDescriptor[1]) {
						case 5: char="\ue52f"; break;
						case 6: char="\ue522"; break;
						case 7: char="\ue52d"; break;
						case 8: char="\ue52c"; break;
						case 9: char="\ue520"; break;
						case 10: char="\ue52b"; break;
					}
					cctx.fillText(char,x+(kbu*0.56),y+(kbu*(0.42)));
					break;
					
			}
			
			break;
					
		case 14: // articulation
			// background
			cctx.fillStyle="#7f462c"; //mocha
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			// symbol
			cctx.fillStyle="#FFF";
			cctx.font = "normal "+kbu*0.6+"px Bravura";
			cctx.textAlign="center";
			cctx.textBaseline="middle";
			switch (noteDescriptor[1]) {
				case 1: char="\ue4a2"; break; // staccato
				case 2: char="\ue4a4"; break; // tenuto
				case 3: char="\ue4a0"; break; // accent
				case 4: char="\ue4ac"; break; // marcato
				case 5: char="\ue4c0"; break; // fermata
				case 6: char="\ue4ce"; break; // pause
				case 7: char="\ue566"; break; // trill
				case 8: char="\ue612"; break; // up bow
				case 9: char="\ue610"; break; // down bow
				case 10: char="\ue577"; break; // fingering change
				case 11: char="\uea51"; break; // fingering 1
				case 12: char="\uea52"; break; // fingering 2
				case 13: char="\uea54"; break; // fingering 3
				case 14: char="\uea55"; break; // fingering 4
				case 15: char="\uea57"; break; // fingering 5
				
			}
			cctx.fillText(char,x+(kbu*0.48),y+(kbu*0.48));
			
			// set color for key cap
			cctx.fillStyle="#bfa295";
			
			break;
			
		case 15: // other
			
			switch (noteDescriptor[1]) {
				case 1: // music prefix
					// background
					cctx.fillStyle="#000";
					roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
					
					cctx.fillStyle="#FFF"; // white
					cctx.textBaseline = "alphabetic";
					cctx.textAlign = "center";		
					cctx.save();
					cctx.translate(x,y+(kbu*0.95));
					cctx.rotate(-Math.PI/2);
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.20)+"px sans-serif";
					cctx.fillText("MUSIC",kbu*0.47,kbu*0.40);
					cctx.fillText("PREFIX",kbu*0.47,kbu*0.66);
					cctx.restore();
					break;
				case 2: // word prefix
					// background
					cctx.fillStyle="#000";
					roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
					
					cctx.fillStyle="#FFF"; // white
					cctx.textBaseline = "alphabetic";
					cctx.textAlign = "center";		
					cctx.save();
					cctx.translate(x,y+(kbu*0.95));
					cctx.rotate(-Math.PI/2);
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.20)+"px sans-serif";
					cctx.fillText("WORD",kbu*0.47,kbu*0.40);
					cctx.fillText("PREFIX",kbu*0.47,kbu*0.66);
					cctx.restore();
					break;
				case 3: // braille music comma
					// background
					cctx.fillStyle="#000";
					roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
					
					cctx.fillStyle="#FFF"; // white
					cctx.textBaseline = "alphabetic";
					cctx.textAlign = "center";		
					cctx.save();
					cctx.translate(x,y+(kbu*0.95));
					cctx.rotate(-Math.PI/2);
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.19)+"px sans-serif";
					cctx.fillText("MUSIC",kbu*0.47,kbu*0.40);
					cctx.fillText("COMMA",kbu*0.47,kbu*0.66);
					cctx.restore();
					break;
				case 4: // prefer larger note values
					// background
					cctx.fillStyle="#000";
					roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
					
					cctx.fillStyle="#FFF"; // white
					cctx.textBaseline = "alphabetic";
					cctx.textAlign = "center";		
					cctx.save();
					cctx.translate(x,y+(kbu*0.95));
					cctx.rotate(-Math.PI/2);
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.16)+"px sans-serif";
					cctx.fillText("LARGER",kbu*0.47,kbu*0.40);
					cctx.fillText("VALUES",kbu*0.47,kbu*0.66);
					cctx.restore();
					break;
				case 5: // prefer smaller note values
					// background
					cctx.fillStyle="#000";
					roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
					
					cctx.fillStyle="#FFF"; // white
					cctx.textBaseline = "alphabetic";
					cctx.textAlign = "center";		
					cctx.save();
					cctx.translate(x,y+(kbu*0.95));
					cctx.rotate(-Math.PI/2);
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.16)+"px sans-serif";
					cctx.fillText("SMALLER",kbu*0.47,kbu*0.40);
					cctx.fillText("VALUES",kbu*0.47,kbu*0.66);
					cctx.restore();
					break;
				case 6: // metronome marking equals
					// background
					cctx.fillStyle="#000";
					roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
					
					cctx.fillStyle="#FFF"; // white
					cctx.textBaseline = "alphabetic";
					cctx.textAlign = "center";		
					cctx.font = "normal "+(kbu*0.20)+"px sans-serif";
					cctx.fillText("M.M.",x+(kbu*0.47),y+(kbu*0.30));
					cctx.font = "normal "+(kbu*0.50)+"px sans-serif";
					cctx.fillText("=",x+(kbu*0.47),y+(kbu*0.66));
					break;
				case 7: // braille music hyphen
					// background
					cctx.fillStyle="#000";
					roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
					
					cctx.fillStyle="#FFF"; // white
					cctx.textBaseline = "alphabetic";
					cctx.textAlign = "center";		
					cctx.save();
					cctx.translate(x,y+(kbu*0.95));
					cctx.rotate(-Math.PI/2);
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.19)+"px sans-serif";
					cctx.fillText("MUSIC",kbu*0.47,kbu*0.40);
					cctx.fillText("HYPHEN",kbu*0.47,kbu*0.66);
					cctx.restore();
					break;
				case 8: // right hand
					// background
					cctx.fillStyle="#000";
					roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
					
					cctx.fillStyle="#FFF"; // white
					cctx.textBaseline = "alphabetic";
					cctx.textAlign = "center";		
					cctx.save();
					cctx.translate(x,y+(kbu*0.95));
					cctx.rotate(-Math.PI/2);
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.19)+"px sans-serif";
					cctx.fillText("RIGHT",kbu*0.47,kbu*0.40);
					cctx.fillText("HAND",kbu*0.47,kbu*0.66);
					cctx.restore();
					break;
				case 9: // left hand
					// background
					cctx.fillStyle="#000";
					roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
					
					cctx.fillStyle="#FFF"; // white
					cctx.textBaseline = "alphabetic";
					cctx.textAlign = "center";		
					cctx.save();
					cctx.translate(x,y+(kbu*0.95));
					cctx.rotate(-Math.PI/2);
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.19)+"px sans-serif";
					cctx.fillText("LEFT",kbu*0.47,kbu*0.40);
					cctx.fillText("HAND",kbu*0.47,kbu*0.66);
					cctx.restore();
					break;
			}
				
			// set color for key cap
			cctx.fillStyle="#777";
			
			break;
			
		case 16: // clefs
			// background
			cctx.fillStyle="#0F0"; // lt green
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			cctx.fillStyle="#000";
			cctx.font = "normal "+(kbu*0.35)+"px Bravura";
			cctx.textAlign="center";
			cctx.textBaseline="middle";
			cctx.fillText("\ue014\ue014\ue014",x+(kbu*0.5),y+(kbu*(0.60)));
					
			switch (noteDescriptor[1]) {
				case 1: // treble clef
					cctx.fillText("\ue050",x+(kbu*0.5),y+(kbu*(0.52)));
					break;
				case 2: // alto clef
					cctx.fillText("\ue05b",x+(kbu*0.5),y+(kbu*(0.43)));
					break;
				case 3: // tenor clef
					cctx.fillText("\ue05b",x+(kbu*0.5),y+(kbu*(0.34)));
					break;
				case 4: // bass clef
					cctx.fillText("\ue061",x+(kbu*0.5),y+(kbu*(0.33)));
					break;
					
			}
			
			// set color for key cap
			cctx.fillStyle="#077";
			
			break;
			
		case 17: // grace notes
			
			// background
			cctx.fillStyle="#F00"; // red
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			cctx.fillStyle="#FFF";
			//cctx.font = "normal "+(kbu*0.45)+"px Bravura";
			cctx.textAlign="center";
			cctx.textBaseline="middle";
			//cctx.fillText("\ue1d6",x+(kbu*0.55),y+(kbu*(0.40)));
			cctx.font = "normal "+(kbu*0.45)+"px Bravura";
			cctx.fillText("\ue560",x+(kbu*0.5),y+(kbu*(0.5)));
			
			// set color for key cap
			cctx.fillStyle="#F77";
			
			break;
	
		case 18: // in-accord
			
			// background
			cctx.fillStyle="#000"; // black
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			cctx.fillStyle="#FFF"; // white
			cctx.textAlign="center";
			cctx.textBaseline="middle";
			
			switch (noteDescriptor[1]) {
				case 1: // in-accord
					cctx.font = "normal "+(kbu*0.35)+"px Bravura";
					cctx.fillText("\ue1d3 \ue1d3",x+(kbu*0.5),y+(kbu*0.40));
					cctx.fillText("\ue1d2   ",x+(kbu*0.53),y+(kbu*0.55));
					break;
				case 2: // measure division
					cctx.textBaseline = "alphabetic";
					cctx.textAlign = "center";		
					cctx.save();
					cctx.translate(x,y+(kbu*0.95));
					cctx.rotate(-Math.PI/2);
					cctx.textAlign="center";
					cctx.textBaseline="middle";
					cctx.font = "normal "+(kbu*0.17)+"px sans-serif";
					cctx.fillText("MEASURE",kbu*0.47,kbu*0.40);
					cctx.fillText("DIVISION",kbu*0.47,kbu*0.66);
					cctx.restore();
					break;
				case 3: // partial measure in-accord
					cctx.font = "normal "+(kbu*0.35)+"px Bravura";
					cctx.fillText("\ue1f0\ue1f7 \ue1f2",x+(kbu*0.6),y+(kbu*0.4));
					cctx.fillText("\ue1d6    ",x+(kbu*0.68),y+(kbu*0.55));
					break;
			}
			
			// set color for key cap
			cctx.fillStyle="#777";
			
			break;
	
		case 19: // chord symbols
			// background
			//cctx.fillStyle="#FFF";
			cctx.strokeStyle="#CCC";
			cctx.lineWidth=1;
			roundRect(cctx, x, y, kbu*0.92, kbu*0.92, kbu*0.2, false, true);
			
			// letter
			cctx.fillStyle="#000";
			cctx.font = "normal "+kbu*0.45+"px bravura";
			cctx.textAlign="center";
			cctx.textBaseline="alphabetic";
			cctx.fillText(['\ue872','\ue870','\ue871','\ue873'][noteDescriptor[1]-1],x+(kbu*0.45),y+(kbu*0.50));
			
            // set color for key cap
			cctx.fillStyle="#CCC";
            
			break;
			
		default: // blank
			// background
			cctx.fillStyle="#CCC";
			roundRect(cctx, x, y, kbu*0.95, kbu*0.95, kbu*0.2, true, false);
			
			// set color for key cap
			cctx.fillStyle="#FFF";
			
	}
	
	// draw key cap
	if (drawSmallKeyCap) {
		cctx.font = "normal "+kbu*0.2+"px sans-serif";
		cctx.textAlign="left";
		cctx.textBaseline="alphabetic";
		cctx.fillText(key,x+(kbu*0.15),y+(kbu*0.8));
	}
	
}

function resetCursorAndScroll() {
	cursor.x=0;
	cursor.y=0;
	hScroll=0;
	vScroll=0;
}

//function openEditField(x,y,width,height,defaultVal,callback) {
//	//position editField
//	//resize editField
//	//show editField
//	//populate editField
//	//set focus to editField
//	editFieldCallback = callback;
//}

//function dismissEditFIeld() {
//	// hide editField
//	editFieldCallback.call(editFieldValue);
//}
