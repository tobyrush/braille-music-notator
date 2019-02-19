/* global devMode, cctx, controlHelpOriginX, controlHelpOriginY, controlsHeight, chu, controlsWidth, controlHelp, gridHeight, gridWidth, drawCellSimpleDynamic, drawCellHairpinDynamic, drawMultiCellBackground, gw, gh, drawCellClef, drawCellTextLabel, drawMetronomeMarkingEquals, drawInterpretedBrailleSymbol, drawCellOctaveRange, savedGridHeight, storedScore, score, storedBlankCells, blankCells, tempGrid: true */
/* jshint -W020 */

//function displayControlHelp() {
//
//	if (devMode) {
//
//		cctx.beginPath();
//		var row=controlHelpOriginY;
//		for (var i=row; i<controlsHeight; i+=(chu*10)) {
//			cctx.moveTo(controlHelpOriginX,i);
//			cctx.lineTo(controlsWidth,i);
//		}
//		var col=controlHelpOriginX;
//		for (i=col; i<controlsWidth; i+=(chu*10)) {
//			cctx.moveTo(i,controlHelpOriginY);
//			cctx.lineTo(i,controlsHeight);
//		}
//		cctx.strokeStyle="#ddf";
//		cctx.stroke();
//		cctx.closePath();
//
//	}
//
//    var tempGridHeight = gridHeight;
//
//}

//function drawControlHelpTitleText(title) {
//	cctx.fillStyle="#000"; // black
//	cctx.textBaseline = "alphabetic";
//	cctx.textAlign = "left";
//	cctx.font = "bold "+chu*10+"px sans-serif";
//	cctx.fillText(title,controlHelpOriginX,controlHelpOriginY+(chu*10));
//}
//
//function drawControlHelpDescriptionText(description) {
//	cctx.fillStyle="#000"; // black
//	cctx.textBaseline = "alphabetic";
//	cctx.textAlign = "left";
//	cctx.font = "normal "+chu*6+"px sans-serif";
//	fillTextMultiline(description,cctx,controlHelpOriginX,controlHelpOriginY+(chu*20),chu*8);
//}
//
//
//function fillTextMultiline(txt,context,x,y,lineHeight) {
//	var lines = txt.split('\n');
//	for (var i=0; i<lines.length; i++) {
//		context.fillText(lines[i], x, y+(i*lineHeight));
//	}
//}
//
//function drawStaff(c,x,y,height,width,clef) {
//	c.strokeStyle="#000";
//	c.beginPath();
//	c.moveTo(x,y);
//	c.lineTo(x+width,y);
//	c.moveTo(x,y+(height*0.25));
//	c.lineTo(x+width,y+(height*0.25));
//	c.moveTo(x,y+(height*0.5));
//	c.lineTo(x+width,y+(height*0.5));
//	c.moveTo(x,y+(height*0.75));
//	c.lineTo(x+width,y+(height*0.75));
//	c.moveTo(x,y+height);
//	c.lineTo(x+width,y+height);
//	c.stroke(); // staff lines
//	c.closePath();
//
//	var clefChar, offset=0;
//	switch (clef) {
//		case 1: // treble
//			clefChar="\ue050";
//			offset=height*0.75;
//			break;
//		case 2: // bass
//			clefChar="\ue061";
//			offset=height*0.25;
//			break;
//		default: // no clef
//			clefChar="";
//	}
//
//	c.fillStyle="#000"; // black
//	c.textBaseline = "alphabetic";
//	c.textAlign = "left";
//	c.font = "normal "+height+"px Bravura";
//	c.fillText(clefChar,x+(height*0.15),y+offset);
//
//}
//
//function drawNote(c,x,y,height,note,position,dots) {
//	c.fillStyle="#000"; // black
//	c.textBaseline = "alphabetic";
//	c.textAlign = "left";
//	c.font = "normal "+height+"px Bravura";
//	var noteChar, yPos = y+(height*0.5)+(position*(height/8));
//	switch (note) {
//		case "noteWhole":
//			noteChar="\ue1d2";
//			break;
//		case "noteHalfUp":
//			noteChar="\ue1d3";
//			break;
//		case "noteHalfDown":
//			noteChar="\ue1d4";
//			break;
//		case "noteQuarterUp":
//			noteChar="\ue1d5";
//			break;
//		case "noteQuarterDown":
//			noteChar="\ue1d6";
//			break;
//		case "note8thDown":
//			noteChar="\ue1d8";
//			break;
//		case "noteheadBlack":
//			noteChar="\ue0a4";
//			break;
//		case "restHalf":
//			noteChar="\ue4e4";
//			yPos = y+(height*0.5)+(0*(height/8));
//			break;
//		case "restQuarter":
//			noteChar="\ue4e5";
//			yPos = y+(height*0.5)+(0*(height/8));
//			break;
//	}
//	c.fillText(noteChar,x,yPos);
//	var numberOfLedgers=Math.floor(Math.abs(position/2))-2;
//	c.strokeStyle="#000";
//	c.beginPath();
//	var i, currentY;
//	for (i=1; i<=numberOfLedgers; i++) {
//		currentY=y+(height*0.5)+((position/Math.abs(position))*(height*0.5+(i*(height*0.25))));
//		c.moveTo(x-(height*0.15),currentY);
//		c.lineTo(x+(height*0.45),currentY);
//	}
//	c.stroke();
//	c.closePath();
//	for (i=0; i<dots; i++) {
//		c.fillText("\ue1e7",x+(height*0.5)+(i*(height*0.3)),yPos-((height/8)*((Math.abs(position)%2)^1)));
//	}
//}
//
//function drawArrow(c,x,y,height) {
//	c.fillStyle="#000"; // black
//	c.textBaseline = "middle";
//	c.textAlign = "left";
//	c.font = "normal "+height+"px Bravura";
//	c.fillText("\ueb62",x,y);
//}
//
//function drawBrailleIcons(c,x,y,height,chars,multiCell) {
//	createTemporaryGrid(height);
//	c.strokeStyle="#000";
//	c.lineWidth=1;
//	for (var i=0; i<chars.length; i++) {
//		if (chars[i]!==0) {
//			if ((chars[i]>=533 && chars[i]<=563) || (chars[i]>=565 && chars[i]<=593) || (chars[i]>=647 && chars[i]<=651) || (chars[i]>=654 && chars[i]<=656) || (chars[i]>=665 && chars[i]<=674)) { // if it's literary braille
//				c.strokeRect(x+(gridWidth*i)+2,y+2,gridWidth-4,gridHeight-4);
//			}
//			drawInterpretedBrailleSymbol(c,chars[i],x+(gridWidth*i),y,0,0);
//		}
//	}
//    releaseTemporaryGrid();
//}
//
//function drawCellOctaveIcon(c,x,y,height,val) {
//	createTemporaryGrid(height);
//	drawCellOctaveRange(c,x,y,val);
//    releaseTemporaryGrid();
//}
//
//function drawLine(c,x1,y1,x2,y2,color,width) {
//	c.save();
//	c.strokeStyle=color;
//	c.lineWidth=width;
//	c.beginPath();
//	c.moveTo(x1,y1);
//	c.lineTo(x2,y2);
//	c.stroke();
//	c.closePath();
//	c.restore();
//}
//
//function drawMusicSymbol(c,txt,x,y,height) {
//	c.textBaseline = "middle";
//	c.textAlign = "left";
//	c.font = "normal "+height+"px Bravura";
//	c.fillText(txt,x,y);
//}
//
//function drawAccidental(c,x,y,height,accidental,position) {
//	c.fillStyle="#000"; // black
//	c.textBaseline = "alphabetic";
//	c.textAlign = "left";
//	c.font = "normal "+height+"px Bravura";
//	var noteChar, yPos = y+(height*0.5)+(position*(height/8));
//	switch (accidental) {
//		case -2:
//			noteChar="\ue264";
//			break;
//		case -1:
//			noteChar="\ue260";
//			break;
//		case 0:
//			noteChar="\ue261";
//			break;
//		case 1:
//			noteChar="\ue262";
//			break;
//		case 2:
//			noteChar="\ue263";
//			break;
//	}
//	c.fillText(noteChar,x-(height/3),yPos);
//}
//
//function drawTie(c,x1,x2,y,height,position) {
//	var yPos = y+(height*0.5)+((position-1)*(height/8));
//	c.beginPath();
//	var a = (x2-x1)/2;
//	c.arc(x1+a,yPos+a,Math.sqrt(2*Math.pow(a,2)),1.25*Math.PI,1.75*Math.PI,false);
//	c.lineWidth=2;
//	c.strokeStyle = "#000"; // black
//	c.stroke();
//	c.closePath();
//}
//
//function drawTimeSignature(c,x,y,height,top,bottom) {
//	c.textBaseline = "middle";
//	c.textAlign = "left";
//	c.font = "normal "+height+"px Bravura";
//	var chars=["\ue080","\ue081","\ue082","\ue083","\ue084","\ue085","\ue086","\ue087","\ue088","\ue089"];
//	c.fillText(chars[top],x,y+(height*0.25));
//	c.fillText(chars[bottom],x,y+(height*0.75));
//}
//
//function drawSlur(c,x1,y1,x2,y2,x3,y3) {
//	c.beginPath();
//	c.moveTo(x1,y1);
//	c.quadraticCurveTo(x2,y2,x3,y3);
//	c.lineWidth=2;
//	c.strokeStyle = "#000"; // black
//	c.stroke();
//	c.closePath();
//}

//function createTemporaryGrid(height) {
//    savedGridHeight = gridHeight;
//    gridHeight = height;
//    gridWidth = (height*2)/3;
//    storedScore = score.slice(0);
//    score = [[]];
//    score[0] = [];
//    storedBlankCells = blankCells.slice(0);
//    blankCells = [[]];
//    tempGrid = true;
//}
//
//function releaseTemporaryGrid() {
//    gridHeight = savedGridHeight;
//    gridWidth = (gridHeight*2)/3;
//    score = storedScore.slice(0);
//    blankCells = storedBlankCells.slice(0);
//    tempGrid = false;
//}
