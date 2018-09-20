/* global notationArea, gridHeight, gridWidth, notationGridHeight, notationGridWidth, notationCellWidth, notationCellHeight, ctx, showPageBreaks, pageWidth, pageHeight, hScrollUnits, vScrollUnits, hScrollOffset, vScrollOffset, hScroll, vScroll, gh, gw, score, arrayHasOwnIndex, interpretBraille, cursor, devMode, getScore, dropzone, optionsDialogOpen, fileDialogOpen, drawOptionsDialog, drawFileDialog, doNotCheckContiguousCells, brailleDots, drawAllDots, cellIsEmpty, setScore, saveToUndo: true */
/* jshint -W020 */

function initializeNotation() {
 	notationArea.width=notationArea.clientWidth;
	notationArea.height=notationArea.clientHeight;
	
	drawNotation();
}

function clearNotationArea() {
	notationArea.width = notationArea.clientWidth;
}

function drawNotation() {
	var col, rightMargin;
    
    clearNotationArea();
	
	var notationWidth = notationArea.clientWidth;
	var notationHeight = notationArea.clientHeight;
	
	gridHeight = notationGridHeight;
	gridWidth = notationGridWidth;
	
	notationCellWidth = notationWidth/gridWidth;
	notationCellHeight = notationHeight/gridHeight;
	
	ctx.translate(0.5,0.5);
	
	setScrollVars();
	
	// add shading for right margin
	if (showPageBreaks) {
		rightMargin = (gridWidth*(pageWidth-hScrollUnits))-hScrollOffset;
		ctx.fillStyle="#bbb";
		if (rightMargin<notationWidth) {
			ctx.fillRect(rightMargin,0,notationWidth+hScroll,notationHeight);
		}
	}
	
	// draw page numbers
	var i, row=vScrollUnits;
    if (showPageBreaks) {
		ctx.fillStyle="#fff";
		ctx.textAlign="left";
		ctx.textBaseline="top";
		ctx.font="normal "+gh(0.75)+"px sans-serif";
		for (i=gridHeight-vScrollOffset; i<notationHeight; i+=gridHeight) {
			if ((row===0) || ((row) % pageHeight === 0)) {
				ctx.fillText("PAGE "+(((row)/pageHeight)+1),rightMargin+gw(0.25),i-gh(0.9));
			}
			row+=1;
		}
	}
		
	// draw grid
	ctx.beginPath();
	for (i=gridHeight-vScrollOffset; i<notationHeight; i+=gridHeight) {
		ctx.moveTo(0,i);
		ctx.lineTo(notationWidth,i);
		row+=1;
	}
	col=hScrollUnits;
	for (i=gridWidth-hScrollOffset; i<notationWidth; i+=gridWidth) {
		ctx.moveTo(i,0);
		ctx.lineTo(i,notationHeight);
		col+=1;
	}
	ctx.strokeStyle="#ddf";
	ctx.stroke();
	ctx.closePath();
	
	// draw braille symbols
	for (var y in score) {
		if (arrayHasOwnIndex(score,y)) {
			for (var x in score[y]) {
				if (arrayHasOwnIndex(score[y],x)) {
					if (interpretBraille) {
						drawInterpretedBrailleSymbol(ctx,score[y][x],(gridWidth*(x-hScrollUnits))-hScrollOffset,(gridHeight*(y-vScrollUnits))-vScrollOffset,x,y);
					} else {
						if (score[y][x] !== null) {
							drawLiteralBrailleSymbol(ctx,score[y][x],(gridWidth*(x-hScrollUnits))-hScrollOffset,(gridHeight*(y-vScrollUnits))-vScrollOffset);
						}
					}
				}
			}
		}
	}

	// draw cursor
	// note: cursor coordinates are absolute now, not relative coordinates in viewable area
	ctx.globalAlpha=0.2;
	ctx.fillStyle="#000";
	ctx.fillRect(gridWidth*(cursor.x-hScrollUnits)-hScrollOffset,gridHeight*(cursor.y-vScrollUnits)-vScrollOffset,gridWidth*cursor.width,gridHeight*cursor.height);
	ctx.globalAlpha=1;
	
	// draw page breaks
	if (showPageBreaks) {
		row=vScrollUnits;
		ctx.fillStyle="#bbb";
		for (i=gridHeight-vScrollOffset; i<notationHeight; i+=gridHeight) {
			if ((row>0) && ((row+1) % pageHeight === 0)) {
				ctx.fillRect(0,i-1,rightMargin,3);
			}
			row+=1;
		}
	}
	
	// draw grid numbers
	// we're using row+1 and col+1 here because even though row and col are 0-based, we want the UI to be 1-based
	ctx.fillStyle="#ddf";
	ctx.textAlign="right";
	ctx.textBaseline="top";
	ctx.font="normal "+gh(0.166)+"px sans-serif";
	row=vScrollUnits;
	for (i=gridHeight-vScrollOffset; i<=notationHeight+gridHeight; i+=gridHeight) {
		if ((row>0) && ((row+1) % 10 === 0)) {
			ctx.fillText(row+1,gridWidth-gw(0.1),i-gridHeight+gw(0.1));
		}
		row+=1;
	}
	col=hScrollUnits;
	for (i=gridWidth-hScrollOffset; i<=notationWidth+gridWidth; i+=gridWidth) {
		if ((col>0) && ((col+1) % 10 === 0)) {
			ctx.fillText(col+1,i-gw(0.1),gw(0.1));
		}
		col+=1;
	}
	
	// draw debug info
	if (devMode) {
	
		ctx.fillStyle="#F00";
		ctx.textAlign="left";
		ctx.textBaseline="top";
		ctx.font="normal "+gh(0.25)+"px sans-serif";
		ctx.fillText(getScore(cursor.x,cursor.y),4,4);
		
	}
	
	// draw dropzone indicator
	if (dropzone) {
		ctx.globalAlpha=0.7;
		ctx.fillStyle="#FFF";
		ctx.fillRect(0,0,notationWidth,notationHeight);
		ctx.globalAlpha=1;
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.font="bold 36px sans-serif";
		ctx.fillStyle="#00F";
		ctx.fillText("drop file here to load",notationWidth/2,notationHeight/2);
	}
	
	if (optionsDialogOpen || fileDialogOpen) {
		ctx.globalAlpha=0.7;
		ctx.fillStyle="#FFF";
		ctx.fillRect(0,0,notationWidth,notationHeight);
		ctx.globalAlpha=1;
		if (optionsDialogOpen) { drawOptionsDialog(); }
		if (fileDialogOpen) { drawFileDialog(); }
	}
		

	// draw border
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(notationWidth-1,0);
	ctx.lineTo(notationWidth-1,notationHeight-1);
	ctx.lineTo(0,notationHeight-1);
	ctx.lineTo(0,0);
	ctx.lineWidth=1;
	ctx.strokeStyle="#000";
	ctx.stroke();
	ctx.closePath();
	
}

function setScrollVars() {
	hScrollOffset = hScroll % gridWidth;
	vScrollOffset = vScroll % gridHeight;
	hScrollUnits = Math.floor(hScroll/gridWidth);
	vScrollUnits = Math.floor(vScroll/gridHeight);
}

function drawCellBackground(ctx,x,y,color) {
	ctx.fillStyle=color;
	ctx.fillRect(x+gw(0.05),y+gw(0.05),gridWidth-gw(0.1),gridHeight-gw(0.1));
}

function drawMultiCellBackground(ctx,x,y,color,cells) {
	ctx.fillStyle=color;
	ctx.fillRect(x+gw(0.05),y+gw(0.05),(gridWidth*cells)-gw(0.1),gridHeight-gw(0.1));
}

function drawCellNote(ctx,x,y,char) {
	ctx.font = "normal "+gh(0.5)+"px Bravura";
	ctx.fillStyle="#FFF"; // white
	ctx.textBaseline = "alphabetic";
	ctx.textAlign = "right";
	ctx.fillText(char,x+gridWidth-gw(0.2),y+gridHeight-gh(0.2)); // draw note
}

function drawCellNoteName(ctx,x,y,char) {
	ctx.font = "normal "+gh(0.3)+"px sans-serif";
	ctx.textAlign = "left";
	ctx.fillText(char,x+gw(0.15),y+gh(0.333));
}

function drawCellChordSymbol(ctx,x,y,char) {
	var chars=['\ue872','\ue870','\ue871','\ue873'];
    ctx.font = "normal "+gh(0.5)+"px Bravura";
	ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    if (char==3) {
        ctx.fillStyle = "#FFF"; // white
        ctx.fillRect(x+gw(0.01),y+gw(0.01),(gridWidth*2)-gw(0.02),gridHeight-gw(0.02));
        ctx.fillStyle = "#000"; // black
        ctx.fillText(chars[char-1],x+gw(1),y+gh(0.5));
    } else {
        ctx.fillStyle = "#000"; // black
        ctx.fillText(chars[char-1],x+gw(0.5),y+gh(0.5));
    }
}

function drawCellASCII(ctx,x,y,char,ascii) {
	ctx.fillStyle = "#000"; // black
	if (char.length==1) {
		ctx.font = "normal "+gh(0.5)+"px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(char,x+gw(0.5),y+gh(0.5));
	} else if (char.length>1 && char.length<=4) {
		ctx.save();
		ctx.translate(x,y+gridHeight);
		ctx.rotate(-Math.PI/2);
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.font = "normal "+gh(0.3)+"px sans-serif";
		ctx.fillText(char,gridHeight/2,gw(0.5));
		ctx.restore();
	} else if (char=="capital sign") {
		ctx.save();
		ctx.translate(x,y+gridHeight);
		ctx.rotate(-Math.PI/2);
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.font = "normal "+gh(0.2)+"px sans-serif";
		ctx.fillText("CAPITAL",gh(0.5),gw(0.3));
		ctx.fillText("LETTER",gh(0.5),gw(0.7));
		ctx.restore();
	} else if (char=="text sign") {
		ctx.save();
		ctx.translate(x,y+gridHeight);
		ctx.rotate(-Math.PI/2);
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.font = "normal "+gh(0.2)+"px sans-serif";
		ctx.fillText("BRAILLE",gh(0.5),gw(0.3));
		ctx.fillText("TEXT",gh(0.5),gw(0.7));
		ctx.restore();
	} else if (char.length>4) {
		ctx.save();
		ctx.translate(x,y+gridHeight);
		ctx.rotate(-Math.PI/2);
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.font = "normal "+gh(0.3)+"px sans-serif";
		ctx.fillText(char,gridHeight/2,gw(0.5));
		ctx.restore();
	} else {
		drawLiteralBrailleSymbol(ctx,ascii,x,y);
	}
}

function drawCellOctaveRange(ctx,x,y,val) {
	drawCellBackground(ctx,x,y,"#929");
	ctx.fillStyle="#FFF"; // white
	ctx.save();
	ctx.translate(x,y+gridHeight);
	ctx.rotate(-Math.PI/2);
	ctx.textAlign="center";
	ctx.textBaseline="top";
	ctx.font = "normal "+gh(0.166)+"px sans-serif";
	ctx.fillText("OCTAVE",gridHeight/2,gw(0.075));
	ctx.restore();
	ctx.font = "bold "+gh(0.6)+"px sans-serif";
	ctx.textAlign="right";
	ctx.textBaseline="middle";
	ctx.fillText(val,x+gridWidth-gw(0.075),y+(gridHeight/2));
}

function drawCellTimeSignatureNumber(ctx,x,y,val,isTop) {
	drawCellBackground(ctx,x,y,"#070"); // green
	ctx.fillStyle="#FFF"; // white
	ctx.font = "normal "+gh(0.5)+"px Bravura";
	ctx.textBaseline = "alphabetic";
	ctx.textAlign = "center";
	var char = ['\ue080','\ue081','\ue082','\ue083','\ue084','\ue085','\ue086','\ue087','\ue088','\ue089'];
	if (isTop) {
		ctx.fillText(char[val],x+gw(0.5),y+gh(0.333));
		ctx.fillStyle="#7B7";
		ctx.font = "bold italic "+gh(0.5)+"px serif";
		ctx.fillText("x",x+gw(0.5),y+gh(0.77));
	} else {
		ctx.fillText(char[val],x+gw(0.5),y+gh(0.666));
		ctx.fillStyle="#7B7";
		ctx.font = "bold italic "+gh(0.5)+"px serif";
		ctx.fillText("x",x+gw(0.5),y+gh(0.43));
	}
}

function drawCellArticulation(ctx,x,y,val) {
	if (val==1 || val==7 || val > 9) {
		drawCellBackground(ctx,x,y,"#7f462c"); // mocha
	} else {
		drawMultiCellBackground(ctx,x,y,"#7f462c",2); // mocha
	}
	ctx.fillStyle="#FFF"; // white
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	switch (val) {
		case 1: // staccato
			ctx.font = "normal "+gridHeight*0.6+"px Bravura";
			ctx.fillText("\ue4a2",x+gw(0.5),y+gh(0.6));
			break;
		case 2: // tenuto
			ctx.font = "normal "+gridHeight*0.8+"px Bravura";
			ctx.fillText("\ue4a4",x+gw(1),y+gh(0.6));
			break;
		case 3: // accent
			ctx.font = "normal "+gridHeight*0.8+"px Bravura";
			ctx.fillText("\ue4a0",x+gw(1),y+gh(0.6));
			break;
		case 4: // marcato
			ctx.font = "normal "+gridHeight*0.8+"px Bravura";
			ctx.fillText("\ue4ac",x+gw(1),y+gh(0.6));
			break;
		case 5: // fermata
			ctx.font = "normal "+gridHeight*0.8+"px Bravura";
			ctx.fillText("\ue4c0",x+gw(1),y+gh(0.6));
			break;
		case 6: // pause
			ctx.font = "normal "+gridHeight*0.8+"px Bravura";
			ctx.fillText("\ue4ce",x+gw(1),y+gh(0.6));
			break;
		case 7: // trill
			ctx.font = "normal "+gridHeight*0.8+"px Bravura";
			ctx.fillText("\ue566",x+gw(0.5),y+gh(0.6));
			break;
		case 8: // up bow
			ctx.font = "normal "+gridHeight*0.8+"px Bravura";
			ctx.fillText("\ue612",x+gw(1),y+gh(0.6));
			break;
		case 9: // down bow
			ctx.font = "normal "+gridHeight*0.8+"px Bravura";
			ctx.fillText("\ue610",x+gw(1),y+gh(0.6));
			break;
		case 10: // fingering change
			ctx.font = "normal "+gridHeight*0.8+"px Bravura";
			ctx.fillText("\ue577",x+gw(0.5),y+gh(0.3));
			break;
		case 11: // fingering 1
			ctx.font = "normal "+gridHeight*0.8+"px Bravura";
			ctx.fillText("\uea51",x+gw(0.5),y+gh(0.6));
			break;
		case 12: // fingering 2
			ctx.font = "normal "+gridHeight*0.8+"px Bravura";
			ctx.fillText("\uea52",x+gw(0.5),y+gh(0.6));
			break;
		case 13: // fingering 3
			ctx.font = "normal "+gridHeight*0.8+"px Bravura";
			ctx.fillText("\uea54",x+gw(0.5),y+gh(0.6));
			break;
		case 14: // fingering 4
			ctx.font = "normal "+gridHeight*0.8+"px Bravura";
			ctx.fillText("\uea55",x+gw(0.5),y+gh(0.6));
			break;
		case 15: // fingering 5
			ctx.font = "normal "+gridHeight*0.8+"px Bravura";
			ctx.fillText("\uea57",x+gw(0.5),y+gh(0.6));
			break;
	}
}

function drawCellSimpleDynamic(ctx,x,y,val) {
	var char, size;
    switch (val) {
		case 1: // ff
		case 7:
			char="\ue52f"; size=3;
			break;
		case 2: // f
		case 8:
			char="\ue522"; size=2;
			break;
		case 3: // mf
		case 9:
			char="\ue52d"; size=3;
			break;
		case 4: // mp
		case 10:
			char="\ue52c"; size=3;
			break;
		case 5: // p
		case 11:
			char="\ue520"; size=2;
			break;
		case 6: // pp
		case 12:
			char="\ue52b"; size=3;
			break;
	}
	if (val>6) { size = size + 1; }
	drawMultiCellBackground(ctx,x,y,"#0FF",size); // cyan
	
	ctx.fillStyle="#000"; // black
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.font = "normal "+gridHeight*0.7+"px Bravura";
	ctx.fillText(char,x+gw(size/2),y+gh(0.6));
}

function drawCellHairpinDynamic(ctx,x,y,val) {
	var text, cresc;
    if (val<5) {
		drawMultiCellBackground(ctx,x,y,"#0FF",2); // cyan
	} else {
		drawMultiCellBackground(ctx,x,y,"#0FF",3); // cyan
	}
	switch (val) {
		case 1: // begin cresc
		case 5:
			text="BEGIN"; cresc=true;
			break;
		case 2: // end cresc
		case 6:
			text="END"; cresc=true;
			break;
		case 3: // begin dim
		case 7:
			text="BEGIN"; cresc=false;
			break;
		case 4: // end dim
		case 8:
			text="END"; cresc=false;
			break;
	}
	
	ctx.fillStyle="#000"; // black
	ctx.textBaseline = "alphabetic";
	ctx.textAlign = "center";
	ctx.font = "normal "+gridHeight*0.2+"px sans-serif";
	if (val<5) {
		ctx.fillText(text,x+gw(1),y+gh(0.4));
		ctx.beginPath();
		if (cresc) {
			ctx.moveTo(x+gw(1.5),y+gh(0.55));
			ctx.lineTo(x+gw(0.5),y+gh(0.65));
			ctx.lineTo(x+gw(1.5),y+gh(0.75));
		} else {
			ctx.moveTo(x+gw(0.5),y+gh(0.55));
			ctx.lineTo(x+gw(1.5),y+gh(0.65));
			ctx.lineTo(x+gw(0.5),y+gh(0.75));
		}
		ctx.lineWidth=1;
		ctx.strokeStyle="#000";
		ctx.stroke();
		ctx.closePath();
	} else {
		ctx.fillText(text,x+gw(1.5),y+gh(0.4));
		ctx.beginPath();
		if (cresc) {
			ctx.moveTo(x+gw(2.5),y+gh(0.55));
			ctx.lineTo(x+gw(0.5),y+gh(0.65));
			ctx.lineTo(x+gw(2.5),y+gh(0.75));
		} else {
			ctx.moveTo(x+gw(0.5),y+gh(0.55));
			ctx.lineTo(x+gw(2.5),y+gh(0.65));
			ctx.lineTo(x+gw(0.5),y+gh(0.75));
		}
		ctx.lineWidth=1;
		ctx.strokeStyle="#000";
		ctx.stroke();
		ctx.closePath();
	}
}

function drawCellTextDynamic(ctx,x,y,val) {
	var char, size;
    switch (val) {
		case 1: // cresc.
			char="cresc."; size=4;
			break;
		case 2: // decresc.
			char="decresc."; size=6;
			break;
		case 3: // dim.
			char="dim."; size=5;
			break;
	}
	drawMultiCellBackground(ctx,x,y,"#0FF",size); // cyan
	
	ctx.fillStyle="#000"; // black
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.font = "italic "+gridHeight*0.5+"px serif";
	ctx.fillText(char,x+gw(size/2),y+gh(0.5));
}

function drawMetronomeMarkingEquals(ctx,x,y) {
	drawMultiCellBackground(ctx,x,y,"#000",2); // 2 cells black
	ctx.fillStyle = "#FFF"; // white
	ctx.textAlign="center";
	ctx.textBaseline="middle";
	ctx.font = "normal "+gw(0.3)+"px sans-serif";
	ctx.fillText("M.M.",x+gw(1),y+gh(0.25));
	ctx.font = "normal "+gw(0.75)+"px sans-serif";
	ctx.fillText("=",x+gw(1),y+gh(0.55));
}

function drawInAccord(ctx,x,y,val) {
	drawMultiCellBackground(ctx,x,y,"#000",2); // black
	
	ctx.fillStyle="#FFF"; // black
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
			
	switch (val) {
		case 1: // in-accord
			ctx.font = "normal "+gridHeight*0.65+"px Bravura";
			ctx.fillText("\ue030",x+gw(0.5),y+gh(0.825));
			ctx.fillText("\ue030",x+gw(1.5),y+gh(0.825));
			ctx.font = "normal "+gridHeight*0.3+"px Bravura";
			ctx.fillText("\ue1d3 \ue1d3",x+gw(1),y+gh(0.43));
			ctx.fillText("\ue1d2   ",x+gw(1.05),y+gh(0.57));
			break;
		case 2: // measure division
			ctx.font = "normal "+gridHeight*0.2+"px sans-serif";
			ctx.fillText("MEASURE",x+gw(1),y+gh(0.4));
			ctx.fillText("DIVISION",x+gw(1),y+gh(0.6));
			break;
		case 3: // partial measure in-accord
			ctx.font = "normal "+gridHeight*0.3+"px Bravura";
			ctx.fillText("\ue1f0\ue1f7 \ue1f2",x+gw(1),y+gh(0.43));
			ctx.fillText("\ue1d6  ",x+gw(1),y+gh(0.57));
			break;
	}
}

function drawCellTupletNumber(ctx,x,y,val) {
	drawCellBackground(ctx,x,y,"#FF0"); // yellow
	ctx.fillStyle="#000"; // black
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	switch (val) {
		case -3: // triplet
			ctx.font = "normal "+gridHeight*0.4+"px Bravura";
			ctx.fillText("\ue1fe",x+gw(0.2),y+gh(0.9));
			ctx.fillText("\ue1ff",x+gw(0.3),y+gh(0.9));
			ctx.fillText("\ue200",x+gw(0.6),y+gh(0.9));
					
			break;
		case -2: // suffix
			ctx.font = "normal "+gridHeight*0.5+"px Bravura";
			ctx.fillText("\ue200",x+gw(0.4),y+gh(1));
			break;
		case -1: // prefix
			ctx.font = "normal "+gridHeight*0.5+"px Bravura";
			ctx.fillText("\ue1fe",x+gw(0.4),y+gh(1));
			break;
		default: // tuplet number
			ctx.font = "normal "+gridHeight*0.5+"px Bravura";
			var char = ['\ue880','\ue881','\ue882','\ue883','\ue884','\ue885','\ue886','\ue887','\ue888','\ue889'];
			ctx.fillText(char[val],x+gw(0.5),y+gh(0.6));
	}
}

function drawCellKeySigMultiplier(ctx,x,y,val) {
	drawCellBackground(ctx,x,y,"#00F"); // blue
	ctx.fillStyle="#FFF";
	ctx.textAlign="center";
	ctx.textBaseline="middle";
	ctx.font = "bold "+gh(0.4)+"px sans-serif";
	ctx.fillText(val + "×",x+gw(0.5),y+gh(0.5));
}

function drawCellClef(ctx,x,y,val) {
	var char, size, clefHeight;
    switch (val) {
		case 1: // treble
			char="\ue050"; size=3; clefHeight=1;
			break;
		case 2: // alto
			char="\ue05b"; size=3; clefHeight=2;
			break;
		case 3: // tenor
			char="\ue05b"; size=4; clefHeight=3;
			break;
		case 4: // bass
			char="\ue061"; size=3; clefHeight=3;
			break;
	}
	drawMultiCellBackground(ctx,x,y,"#0F0",size); // lt green
	
	ctx.fillStyle="#000"; // black
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.font = "normal "+gridHeight*0.5+"px Bravura";
	ctx.fillText("\ue014\ue014",x+gw(size/2),y+gh(0.75));
	ctx.fillText(char,x+gw(size/2),y+gh(0.75)-gh(clefHeight*0.122));
}

function drawCellInterval(ctx,x,y,val) {
	drawCellBackground(ctx,x,y,"#FAF"); // pink
	ctx.fillStyle="#000";
	ctx.textAlign="center";
	ctx.textBaseline="middle";
	ctx.font = "bold "+gh(0.3)+"px sans-serif";
	var char = ['','','2nd','3rd','4th','5th','6th','7th','8ve'];
	ctx.fillText(char[val],x+gw(0.5),y+gh(0.6));
	ctx.textBaseline="top";
	ctx.fillText("+",x+gw(0.5),y+gh(0.1));
}

function drawCellTextLabel(ctx,x,y,firstLine,secondLine,fillColor,textColor,size) {
	if (size>1) {
		drawMultiCellBackground(ctx,x,y,fillColor,size);
		ctx.fillStyle=textColor;
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.font = "normal "+gh(0.2)+"px sans-serif";
		ctx.fillText(firstLine,x+gw(size/2),y+gh(0.35));
		ctx.fillText(secondLine,x+gw(size/2),y+gh(0.65));
	} else {
		drawCellBackground(ctx,x,y,fillColor);
		ctx.fillStyle=textColor;
		ctx.save();
		ctx.translate(x,y+gridHeight);
		ctx.rotate(-Math.PI/2);
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.font = "normal "+gridHeight*0.17+"px sans-serif";
		ctx.fillText(firstLine,gh(0.5),gw(0.35));
		ctx.fillText(secondLine,gh(0.5),gw(0.65));
		ctx.restore();
	}
}

function checkContiguousCells(col,row,cells) {
	if (doNotCheckContiguousCells) {
		return true;
	} else {
		var len = cells.length;
		var matches = true;
		for (var i=0; i<len; i++) {
			if ((row>=score.length) || (+col+i>=score[row].length) || (score[row][+col+i]!=cells[i])) {
				matches=false;
			}
		}
		return matches;
	}
}

function checkPreviousCell(col,row,cell) {
	return (score[row][+col-1] == cell);
}

function drawLiteralBrailleSymbol(ctx,val,x,y) {

	var code = brailleDots[(val % 100)-32];
	var col1 = x+gw(0.333);
	var col2 = x+gw(0.666);
	var row1 = y+gh(0.25);
	var row2 = y+gh(0.5);
	var row3 = y+gh(0.75);
	var largeDotRadius = gh(0.066);
	var smallDotRadius = gh(0.033);
	
	ctx.fillStyle = "#000";
	ctx.beginPath();
		if (code & 1) { // dot 1
			ctx.arc(col1,row1,largeDotRadius,0,2*Math.PI,false);
			ctx.fill();
		} else if (drawAllDots) {
			ctx.arc(col1,row1,smallDotRadius,0,2*Math.PI,false);
			ctx.fill();
		}
	ctx.closePath();
	
	ctx.beginPath();
		if (code & 2) { // dot 2
			ctx.arc(col1,row2,largeDotRadius,0,2*Math.PI,false);
			ctx.fill();
		} else if (drawAllDots) {
			ctx.arc(col1,row2,smallDotRadius,0,2*Math.PI,false);
			ctx.fill();
		}
	ctx.closePath();
	
	ctx.beginPath();
		if (code & 4) { // dot 3
			ctx.arc(col1,row3,largeDotRadius,0,2*Math.PI,false);
			ctx.fill();
		} else if (drawAllDots) {
			ctx.arc(col1,row3,smallDotRadius,0,2*Math.PI,false);
			ctx.fill();
		}
	ctx.closePath();
	
	ctx.beginPath();
		if (code & 8) { // dot 4
			ctx.arc(col2,row1,largeDotRadius,0,2*Math.PI,false);
			ctx.fill();
		} else if (drawAllDots) {
			ctx.arc(col2,row1,smallDotRadius,0,2*Math.PI,false);
			ctx.fill();
		}
	ctx.closePath();
	
	ctx.beginPath();
		if (code & 16) { // dot 5
			ctx.arc(col2,row2,largeDotRadius,0,2*Math.PI,false);
			ctx.fill();
		} else if (drawAllDots) {
			ctx.arc(col2,row2,smallDotRadius,0,2*Math.PI,false);
			ctx.fill();
		}
	ctx.closePath();
	
	ctx.beginPath();
		if (code & 32) { // dot 6
			ctx.arc(col2,row3,largeDotRadius,0,2*Math.PI,false);
			ctx.fill();
		} else if (drawAllDots) {
			ctx.arc(col2,row3,smallDotRadius,0,2*Math.PI,false);
			ctx.fill();
		}
	ctx.closePath();
	
}

function drawInterpretedBrailleSymbol(ctx,val,x,y,col,row) {
	
	var chars;
    
    // center text as default
	ctx.textAlign="center";
	ctx.textBaseline="middle";
	
	if (val==33) { // A whole note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d2");
		drawCellNoteName(ctx,x,y,"A");
		
	} else if (val==34) { // octave 4
		drawCellOctaveRange(ctx,x,y,"4");
		
	} else if (val==35) { // time sig prefix
		drawCellTextLabel(ctx,x,y,"METER","PREFIX","#070","#FFF",1);
	
	} else if (val==36) { // E quarter note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d5");
		drawCellNoteName(ctx,x,y,"E");
		
	} else if (val==37) { // sharp
		if (checkContiguousCells(col,row,[37,337])) {
			drawMultiCellBackground(ctx,x,y,"#F80",2); // 2 cells orange
			ctx.fillStyle="#000"; // black
			ctx.font = "normal "+gh(0.8)+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillText("\ue263",x+gw(1.05),y+gh(0.5));
		} else {
			drawCellBackground(ctx,x,y,"#F80"); //orange
			ctx.fillStyle="#000"; // black
			ctx.font = "normal "+gh(0.8)+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillText("\ue262",x+gw(0.55),y+gh(0.5));
		}

	} else if (val==38) { // E whole note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d2");
		drawCellNoteName(ctx,x,y,"E");
		
	} else if (val==39) { // augmentation dot
		drawCellBackground(ctx,x,y,"#F00");
		ctx.font = "normal "+gh(0.5)+"px Bravura";
		ctx.fillStyle="#FFF"; // white
		ctx.textBaseline = "alphabetic";
		ctx.textAlign = "right";
		ctx.fillText("\ue1e7",x+gw(0.55),y+gh(0.533)); // draw note
		
	} else if (val==40) { // G whole note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d2");
		drawCellNoteName(ctx,x,y,"G");
		
	} else if (val==41) { // B whole note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d2");
		drawCellNoteName(ctx,x,y,"B");
		
	} else if (val==42) { // natural
		drawCellBackground(ctx,x,y,"#F80"); //orange
		ctx.fillStyle="#000"; // black
		ctx.font = "normal "+gh(0.8)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillText("\ue261",x+gw(0.55),y+gh(0.5));
		
	} else if (val==43) { // interval 3rd
		drawCellInterval(ctx,x,y,3);
		
	} else if (val==44) { // octave 7
		if (checkContiguousCells(col,row,[44,144])) { // octave 8
			drawMultiCellBackground(ctx,x,y,"#929",2); // 2 cells purple
			drawCellOctaveRange(ctx,x+gw(0.5),y,"8");
		} else if (checkPreviousCell(col,row,144) === false) {
			drawCellOctaveRange(ctx,x,y,"7");
		}
		
	} else if (val==45) { // interval 8ve
		drawCellInterval(ctx,x,y,8);
		
	} else if (val==46) { // octave 5
		drawCellOctaveRange(ctx,x,y,"5");
		
	} else if (val==47) { // interval 2nd
		drawCellInterval(ctx,x,y,2);
		
	} else if (val==48) { // time signature bottom 0
		drawCellTimeSignatureNumber(ctx,x,y,0,false);
		
	} else if (val>=49 && val<=57) { // time signature bottom numbers
		drawCellTimeSignatureNumber(ctx,x,y,val-48,false);
		
	} else if (val==58) { // D quarter note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d5");
		drawCellNoteName(ctx,x,y,"D");
		
	} else if (val==59) { // octave 6
		drawCellOctaveRange(ctx,x,y,"6");
		
	} else if (val==60) { // flat
		if (checkContiguousCells(col,row,[60,360])) {
			drawMultiCellBackground(ctx,x,y,"#F80",2); // 2 cells orange
			ctx.fillStyle="#000"; // black
			ctx.font = "normal "+gh(0.8)+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillText("\ue264",x+gw(1.05),y+gh(0.6));
		} else {
			drawCellBackground(ctx,x,y,"#F80"); //orange
			ctx.fillStyle="#000"; // black
			ctx.font = "normal "+gh(0.8)+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillText("\ue260",x+gw(0.55),y+gh(0.6));
		}
		
	} else if (val==61) { // F whole note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d2");
		drawCellNoteName(ctx,x,y,"F");
		
	} else if (val==62) { // text prefix
		drawCellTextLabel(ctx,x,y,"WORD","PREFIX","#000","#FFF",1);
		
		
	} else if (val==63) { // C quarter note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d5");
		drawCellNoteName(ctx,x,y,"C");
		
	} else if (val==64) { // octave 1
		if (checkContiguousCells(col,row,[64,164])) { // octave 0
			drawMultiCellBackground(ctx,x,y,"#929",2); // 2 cells purple
			drawCellOctaveRange(ctx,x+gw(0.5),y,"0");
		} else {
			drawCellOctaveRange(ctx,x,y,"1");
		}
		
	} else if (val==66) { // down bow (second symbol)
		if (checkPreviousCell(col,row,760) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==67) { // short slur
		if (checkPreviousCell(col,row,259) === false) {
			drawCellBackground(ctx,x,y,"#FF0"); // yellow
			ctx.beginPath();
			ctx.arc(x+gw(0.5),y+gh(0.6),gh(0.25),1.25*Math.PI,1.75*Math.PI,false);
			ctx.lineWidth=gh(0.033);
			ctx.strokeStyle = "#000"; // black
			ctx.stroke();
			ctx.closePath();
			ctx.fillStyle = "#000"; // black
			ctx.textAlign="center";
			ctx.textBaseline="middle";
			ctx.font = "normal "+gw(0.2)+"px sans-serif";
			ctx.fillText("SLUR",x+gw(0.5),y+gh(0.7));
		}
			
		
	} else if (val>=68 && val<=74) { // eighth notes
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d7");
		chars=['C','D','E','F','G','A','B'];
		drawCellNoteName(ctx,x,y,chars[val-68]);
		
	} else if (val==76) { // forced barline
		drawCellBackground(ctx,x,y,"#222");
		ctx.font = "normal "+gh(0.6)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#FFF"; // white
		ctx.fillText("\ue030",x+gw(0.5),y+gh(0.8));
		
	} else if (val==77) { // whole rest
		drawCellBackground(ctx,x,y,"#F00");
		ctx.font = "normal "+gh(0.6)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#FFF"; // white
		ctx.fillText("\ue4f4",x+gw(0.5),y+gh(0.5));
		
	} else if (val>=78 && val<=84) { // half notes
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d3");
		chars=['C','D','E','F','G','A','B'];
		drawCellNoteName(ctx,x,y,chars[val-78]);
		
	} else if (val==85) { // half rest
		drawCellBackground(ctx,x,y,"#F00");
		ctx.font = "normal "+gh(0.6)+"px Bravura";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#FFF"; // white
		ctx.fillText("\ue4f5",x+gw(0.5),y+gh(0.5));
		
	} else if (val==86) { // quarter rest
		drawCellBackground(ctx,x,y,"#F00");
		ctx.font = "normal "+gh(0.6)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#FFF"; // white
		ctx.fillText("\ue4e5",x+gw(0.5),y+gh(0.5));
		
	} else if (val==87) { // B quarter note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d5");
		drawCellNoteName(ctx,x,y,"B");
		
	} else if (val==88) { // eighth rest
		drawCellBackground(ctx,x,y,"#F00");
		ctx.font = "normal "+gh(0.6)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#FFF"; // white
		ctx.fillText("\ue4e6",x+gw(0.5),y+gh(0.5));
		
	} else if (val>=89 && val<=90) { // C and D whole notes
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d2");
		chars=['C','D'];
		drawCellNoteName(ctx,x,y,chars[val-89]);
		
	} else if (val==91) { // A quarter note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d5");
		drawCellNoteName(ctx,x,y,"A");
		
	} else if (val==92) { // G quarter note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d5");
		drawCellNoteName(ctx,x,y,"G");
		
	} else if (val==93) { // F quarter note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d5");
		drawCellNoteName(ctx,x,y,"F");
		
	} else if (val==94) { // octave 2
		drawCellOctaveRange(ctx,x,y,"2");
		
	} else if (val==95) { // octave 3
		drawCellOctaveRange(ctx,x,y,"3");
		
	} else if (val==133) { // A 16th note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d9");
		drawCellNoteName(ctx,x,y,"A");
		
	} else if (val==134) { // play section #
		if (checkContiguousCells(col,row,[134,243])) {
			drawCellTextLabel(ctx,x,y,"PLAY","SECTION #","#000","#FFF",2); // white on black
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==135) { // interval 4th
		drawCellInterval(ctx,x,y,4);
		
	} else if (val==136) { // E 64th note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1dd");
		drawCellNoteName(ctx,x,y,"E");
		
	} else if (val==137) { // key signature sharp
		drawCellBackground(ctx,x,y,"#00F"); // blue
		ctx.fillStyle="#FFF"; // white
		ctx.font = "normal "+gh(0.8)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillText("\ue262",x+gw(0.55),y+gh(0.5));
		
	} else if (val==138) { // E 16th note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d9");
		drawCellNoteName(ctx,x,y,"E");
		
	} else if (val==139) { // final/double barline (second symbol)
		if (checkPreviousCell(col,row,175) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==140) { // G 16th note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d9");
		drawCellNoteName(ctx,x,y,"G");
		
	} else if (val==141) { // B 16th note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d9");
		drawCellNoteName(ctx,x,y,"B");
		
	} else if (val==142) { // key signature natural
		drawCellBackground(ctx,x,y,"#00F"); // blue
		ctx.fillStyle="#FFF"; // white
		ctx.font = "normal "+gh(0.8)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillText("\ue261",x+gw(0.55),y+gh(0.5));
		
	} else if (val==143) { // begin repeated section
		drawCellBackground(ctx,x,y,"#000"); // black
		ctx.font = "normal "+gridHeight*0.55+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#FFF"; // white
		ctx.fillText("\ue040",x+gw(0.5),y+gh(0.8));
		
	} else if (val==144) { // octave 8
		if (checkPreviousCell(col,row,44) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==146) { // common time
		if (checkContiguousCells(col,row,[146,467])) {
			drawMultiCellBackground(ctx,x,y,"#070",2); // 2 cells green
			ctx.fillStyle="#FFF"; // black
			ctx.font = "normal "+gh(0.8)+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillText("\ue08a",x+gw(1.05),y+gh(0.5));
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==148) { // interval 6th
		drawCellInterval(ctx,x,y,6);
		
	} else if (val==149) { // pause (second symbol)
		if (checkPreviousCell(col,row,362) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==150) { // triplet
		drawCellTupletNumber(ctx,x,y,-3);
		
	} else if (val==151) { // interval 7th
		drawCellInterval(ctx,x,y,7);
		
	} else if (val==153) { // grace note
		drawCellBackground(ctx,x,y,"#F00");
		//ctx.font = "normal "+gh(0.47)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#FFF"; // white
		//ctx.fillText("\ue1d6",x+gw(0.60),y+gh(0.43));
		ctx.font = "normal "+gh(0.47)+"px Bravura";
		ctx.fillText("\ue560",x+gw(0.5),y+gh(0.55));
			
	} else if (val==154) { // trill
		drawCellArticulation(ctx,x,y,7);
	
	} else if (val==155) { // measure repeat
		drawCellBackground(ctx,x,y,"#222");
		ctx.font = "normal "+gh(0.6)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#FFF"; // white
		ctx.fillText("\ue500",x+gw(0.5),y+gh(0.5));
		
	} else if (val==156) { // tenuto, accent, marcato (second symbol)
		if (checkPreviousCell(col,row,159)===false && checkPreviousCell(col,row,346)===false && checkPreviousCell(col,row,395)===false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==157) { // interval 5th
		drawCellInterval(ctx,x,y,5);
		
	} else if (val==158) { // D 64th note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1dd");
		drawCellNoteName(ctx,x,y,"D");
		
	} else if (val==159) { // marcato (first character)
		if (checkContiguousCells(col,row,[159,156])) {
			drawCellArticulation(ctx,x,y,4);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==160) { // key signature flat
		drawCellBackground(ctx,x,y,"#00F"); // blue
		ctx.fillStyle="#FFF"; // white
		ctx.font = "normal "+gh(0.8)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillText("\ue260",x+gw(0.55),y+gh(0.6));
		
	} else if (val==161) { // F 16th note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d9");
		drawCellNoteName(ctx,x,y,"F");
		
	} else if (val==162) { // hairpin dynamic
		if (checkContiguousCells(col,row,[162,551,239])) {
			drawCellHairpinDynamic(ctx,x,y,6);
		} else if (checkContiguousCells(col,row,[162,552,239])) {
			drawCellHairpinDynamic(ctx,x,y,8);
		} else if (checkContiguousCells(col,row,[162,567,239])) {
			drawCellHairpinDynamic(ctx,x,y,5);
		} else if (checkContiguousCells(col,row,[162,568,239])) {
			drawCellHairpinDynamic(ctx,x,y,7);
		} else if (checkContiguousCells(col,row,[162,551])) {
			drawCellHairpinDynamic(ctx,x,y,2);
		} else if (checkContiguousCells(col,row,[162,552])) {
			drawCellHairpinDynamic(ctx,x,y,4);
		} else if (checkContiguousCells(col,row,[162,567])) {
			drawCellHairpinDynamic(ctx,x,y,1);
		} else if (checkContiguousCells(col,row,[162,568])) {
			drawCellHairpinDynamic(ctx,x,y,3);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
	
	} else if (val==163) { // C 64th note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1dd");
		drawCellNoteName(ctx,x,y,"C");
		
	} else if (val==164) { // octave 0
		if (checkPreviousCell(col,row,64) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val>=165 && val<=173) { // time signature top numbers 1-9
		drawCellTimeSignatureNumber(ctx,x,y,val-164,true);
		
	} else if (val==174) { // time signature top 0
		drawCellTimeSignatureNumber(ctx,x,y,0,true);
		
	} else if (val==175) { // part of barline symbol
		if (checkPreviousCell(col,row,260) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==176) { // fermata (second symbol)
		if (checkPreviousCell(col,row,460) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==177) { // 16th rest
		drawCellBackground(ctx,x,y,"#F00");
		ctx.font = "normal "+gh(0.6)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#FFF"; // white
		ctx.fillText("\ue4e7",x+gw(0.5),y+gh(0.5));
		
	} else if (val>=178 && val<=184) { // 32nd notes
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1db");
		chars=['C','D','E','F','G','A','B'];
		drawCellNoteName(ctx,x,y,chars[val-178]);
		
	} else if (val==185) { // 32nd rest
		drawCellBackground(ctx,x,y,"#F00");
		ctx.font = "normal "+gh(0.6)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#FFF"; // white
		ctx.fillText("\ue4e8",x+gw(0.5),y+gh(0.5));
		
	} else if (val==186) { // 64th rest
		drawCellBackground(ctx,x,y,"#F00");
		ctx.font = "normal "+gh(0.5)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#FFF"; // white
		ctx.fillText("\ue4e9",x+gw(0.5),y+gh(0.5));
		
	} else if (val==187) { // B 64th note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1dd");
		drawCellNoteName(ctx,x,y,"B");
		
	} else if (val==188) { // 128th rest
		drawCellBackground(ctx,x,y,"#F00");
		ctx.font = "normal "+gh(0.5)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#FFF"; // white
		ctx.fillText("\ue4ea",x+gw(0.5),y+gh(0.5));
		
	} else if (val>=189 && val<=190) { // C and D 16th notes
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1d9");
		chars=['C','D'];
		drawCellNoteName(ctx,x,y,chars[val-189]);
		
	} else if (val==191) { // A 64th note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1dd");
		drawCellNoteName(ctx,x,y,"A");
		
	} else if (val==192) { // G 64th note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1dd");
		drawCellNoteName(ctx,x,y,"G");
		
	} else if (val==193) { // F 64th note
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1dd");
		drawCellNoteName(ctx,x,y,"F");
		
	} else if (val==194) { // prefer larger note values
		if (checkContiguousCells(col,row,[194,660,349])) {
			drawCellTextLabel(ctx,x,y,"READ AS","LARGER VALUES","#000","#FFF",3);
		}
		
	} else if (val==195) { // cut time
		if (checkContiguousCells(col,row,[195,467])) {
			drawMultiCellBackground(ctx,x,y,"#070",2); // 2 cells green
			ctx.fillStyle="#FFF"; // black
			ctx.font = "normal "+gh(0.8)+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillText("\ue08b",x+gw(1.05),y+gh(0.5));
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==234) { // braille music hyphen
		drawCellTextLabel(ctx,x,y,"MUSIC","HYPHEN","#000","#FFF",1);
		
	} else if (val==235) { // key sig prefix
		drawCellTextLabel(ctx,x,y,"KEY","PREFIX","#00F","#FFF",1); // white on blue
	
	} else if (val==239) { // hairpin dynamic (third symbol) or text dynamic (last symbol) or hand sign (last symbol)
		if (letterIsPartOfSymbol(col,row,239) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==242) { // end repeated section
		drawCellBackground(ctx,x,y,"#000"); // black
		ctx.font = "normal "+gridHeight*0.55+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#FFF"; // white
		ctx.fillText("\ue041",x+gw(0.5),y+gh(0.8));
		
	} else if (val==243) { // play section # (second symbol)
		if (checkPreviousCell(col,row,134) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==244) { // prefer smaller note values
		if (checkContiguousCells(col,row,[244,660,349])) {
			drawCellTextLabel(ctx,x,y,"READ AS","SMALLER VALUES","#000","#FFF",3);
		}
		
	} else if (val==248) { // tuplet 0
		drawCellTupletNumber(ctx,x,y,0);
		
	} else if (val>=249 && val<=257) { // tuplet numbers
		drawCellTupletNumber(ctx,x,y,val-248);
		
	} else if (val==259) { // grace note slur
		if (checkContiguousCells(col,row,[259,67])) {
			drawMultiCellBackground(ctx,x,y,"#FF0",2); // 2 cells yellow
			ctx.fillStyle = "#000"; // black
			ctx.textAlign="center";
			ctx.textBaseline="middle";
			ctx.font = "normal "+gw(0.25)+"px sans-serif";
			ctx.fillText("GRACE NOTE",x+gw(1),y+gh(0.35));
			ctx.font = "normal "+gw(0.4)+"px sans-serif";
			ctx.fillText("SLUR",x+gw(1),y+gh(0.65));
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==260) { // final or double barline
		ctx.font = "normal "+gridHeight*0.6+"px Bravura";
		ctx.textBaseline = "alphabetic";
		if (checkContiguousCells(col,row,[260,175,139])) { // double barline
			drawMultiCellBackground(ctx,x,y,"#000",3); // 3 cells black
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue031",x+gw(1.5),y+gh(0.8));
		} else if (checkContiguousCells(col,row,[260,175])) { // final barline
			drawMultiCellBackground(ctx,x,y,"#000",2); // 2 cells black
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue032",x+gw(1),y+gh(0.8));
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
	
	} else if (val==262) { // right hand / left hand (second symbol)
		if ((checkPreviousCell(col,row,446) === false) && (checkPreviousCell(col,row,495) === false)) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val>=265 && val<=271) { // key signature accidental multipliers
		drawCellKeySigMultiplier(ctx,x,y,val-264);
	
	} else if (val==295) { // time signature prefix
		drawCellTupletNumber(ctx,x,y,-1);
		
	} else if (val==334) { // partial measure in-accord (first character)
		if (checkContiguousCells(col,row,[334,749])) {
			drawInAccord(ctx,x,y,3);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==335) { // number of measures to repeat
		drawCellTextLabel(ctx,x,y,"NO. OF","MEAS.","#000","#FFF",1);
	
	} else if (val==337) { // double sharp
		if (checkPreviousCell(col,row,37) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==339) { // music prefix (second symbol)
		if (checkPreviousCell(col,row,344) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==343) { // plus
		drawCellChordSymbol(ctx,x,y,1);
	
	} else if (val==344) { // music prefix
		drawCellTextLabel(ctx,x,y,"MUSIC","PREFIX","#000","#FFF",2);
		
	} else if (val==346) { // accent
		if (checkContiguousCells(col,row,[346,156])) {
			drawCellArticulation(ctx,x,y,3);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==349) { // braille music comma (second symbol)
		if (checkPreviousCell(col,row,660) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==350) { // end bracket slur (second symbol)
		if (checkPreviousCell(col,row,394) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==356) { // staccato
		drawCellArticulation(ctx,x,y,1);
	
		
	} else if (val==359) { // begin bracket slur
		if (checkContiguousCells(col,row,[359,366])) {
			drawCellTextLabel(ctx,x,y,"BEGIN","SLUR","#FF0","#000",2);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==360) { // double flat
		if (checkPreviousCell(col,row,60) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==362) { // pause
		if (checkContiguousCells(col,row,[362,149])) {
			drawCellArticulation(ctx,x,y,6);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==364) { // tie
		if (checkContiguousCells(col,row,[364,367])) {
			drawMultiCellBackground(ctx,x,y,"#FF0",2); // 2 cells yellow
			ctx.beginPath();
			ctx.arc(x+gw(1),y+gh(0.9),gh(0.5),1.25*Math.PI,1.75*Math.PI,false);
			ctx.lineWidth=gh(0.033);
			ctx.strokeStyle = "#000"; // black
			ctx.stroke();
			ctx.closePath();
			ctx.fillStyle = "#000"; // black
			ctx.textAlign="center";
			ctx.textBaseline="middle";
			ctx.font = "normal "+gw(0.3)+"px sans-serif";
			ctx.fillText("TIE",x+gw(1),y+gh(0.7));
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==366) { // begin bracket slur (second symbol)
		if (checkPreviousCell(col,row,359) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==367) { // tie (second symbol)
		if (checkPreviousCell(col,row,364) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val>=368 && val<=374) { // 128th notes
		drawCellBackground(ctx,x,y,"#F00");
		drawCellNote(ctx,x,y,"\ue1df");
		chars=['C','D','E','F','G','A','B'];
		drawCellNoteName(ctx,x,y,chars[val-368]);
	
	} else if (val==377) { // right H-bar rest
		drawCellBackground(ctx,x,y,"#F00");
		ctx.font = "normal "+gh(0.6)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#FFF"; // white
		ctx.fillText("\ue4f1",x+gw(0.5),y+gh(0.5));
		
	} else if (val==394) { // end bracket slur
		if (checkContiguousCells(col,row,[394,350])) {
			drawCellTextLabel(ctx,x,y,"END","SLUR","#FF0","#000",2);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==395) { // tenuto
		if (checkContiguousCells(col,row,[395,156])) {
			drawCellArticulation(ctx,x,y,2);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==435) { // metronome marking equals (second symbol)
		if (checkPreviousCell(col,row,455) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==439) { // tuplet suffix
		drawCellTupletNumber(ctx,x,y,-2);
		
	} else if (val==446) { // right hand (first symbol)
		if (checkContiguousCells(col,row,[446,262,239])) {
			drawCellTextLabel(ctx,x,y,"RIGHT","HAND","#000","#FFF",3);
		} else if (checkContiguousCells(col,row,[446,262])) {
			drawCellTextLabel(ctx,x,y,"RIGHT","HAND","#000","#FFF",2);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==447) { // treble clef (second symbol)
		if (checkPreviousCell(col,row,662) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}

	} else if (val==448) { // triangle
		drawCellChordSymbol(ctx,x,y,4);
	
	} else if (val==449) { // fingering 4
		drawCellArticulation(ctx,x,y,14);
		
	} else if (val==452) { // circle
		if (checkContiguousCells(col,row,[452,849])) {
			drawCellChordSymbol(ctx,x,y,3); // circle with slash
		} else {
			drawCellChordSymbol(ctx,x,y,2); // circle
		}
	
	} else if (val==455) { // metronome marking equals (first character)
		if (checkContiguousCells(col,row,[455,435])) {
			drawMetronomeMarkingEquals(ctx,x,y);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==460) { // fermata
		if (checkContiguousCells(col,row,[460,176])) {
			drawCellArticulation(ctx,x,y,5);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==462) { // simple dynamic
		if (checkContiguousCells(col,row,[462,570,570,239])) {
			drawCellSimpleDynamic(ctx,x,y,7);
		} else if (checkContiguousCells(col,row,[462,570,239])) {
			drawCellSimpleDynamic(ctx,x,y,8);
		} else if (checkContiguousCells(col,row,[462,577,570,239])) {
			drawCellSimpleDynamic(ctx,x,y,9);
		} else if (checkContiguousCells(col,row,[462,577,580,239])) {
			drawCellSimpleDynamic(ctx,x,y,10);
		} else if (checkContiguousCells(col,row,[462,580,580,239])) {
			drawCellSimpleDynamic(ctx,x,y,12);
		} else if (checkContiguousCells(col,row,[462,580,239])) {
			drawCellSimpleDynamic(ctx,x,y,11);
		} else if (checkContiguousCells(col,row,[462,570,570])) {
			drawCellSimpleDynamic(ctx,x,y,1);
		} else if (checkContiguousCells(col,row,[462,570])) {
			drawCellSimpleDynamic(ctx,x,y,2);
		} else if (checkContiguousCells(col,row,[462,577,570])) {
			drawCellSimpleDynamic(ctx,x,y,3);
		} else if (checkContiguousCells(col,row,[462,577,580])) {
			drawCellSimpleDynamic(ctx,x,y,4);
		} else if (checkContiguousCells(col,row,[462,580,580])) {
			drawCellSimpleDynamic(ctx,x,y,6);
		} else if (checkContiguousCells(col,row,[462,580])) {
			drawCellSimpleDynamic(ctx,x,y,5);
		} else if (checkContiguousCells(col,row,[462,567,582,239])) {
			drawCellTextDynamic(ctx,x,y,1);
		} else if (checkContiguousCells(col,row,[462,568,569,567,582,239])) {
			drawCellTextDynamic(ctx,x,y,2);
		} else if (checkContiguousCells(col,row,[462,568,573,577,239])) {
			drawCellTextDynamic(ctx,x,y,3);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
	
	} else if (val==465) { // fingering 1
		drawCellArticulation(ctx,x,y,11);
		
	} else if (val==466) { // fingering 2
		drawCellArticulation(ctx,x,y,12);
		
	} else if (val==467) { // common time/cut time (second symbol)
		if ((checkPreviousCell(col,row,146) === false) && (checkPreviousCell(col,row,195) === false)) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==475) { // fingering 5
		drawCellArticulation(ctx,x,y,15);
		
	} else if (val==476) { // fingering 3
		drawCellArticulation(ctx,x,y,13);
		
	} else if (val==495) { // left hand (first symbol)
		if (checkContiguousCells(col,row,[495,262,239])) {
			drawCellTextLabel(ctx,x,y,"LEFT","HAND","#000","#FFF",3);
		} else if (checkContiguousCells(col,row,[495,262])) {
			drawCellTextLabel(ctx,x,y,"LEFT","HAND","#000","#FFF",2);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val>=533 && val<=563) { // punctuation and contractions
		if (val==544 && checkContiguousCells(col,row,[544,544])) {
			drawCellTextLabel(ctx,x,y,"CAPITALIZE","WORD","#FFF","#000",2);
		} else if (val==534 && checkContiguousCells(col,row,[534,854])) {
			drawCellASCII(ctx,x,y,'+',(val % 100));
		} else if (val==534 && checkContiguousCells(col,row,[534,855])) {
			drawCellASCII(ctx,x,y,'=',(val % 100));
		} else if (val==544 && checkPreviousCell(col,row,544)) {
			// leave it blank
		} else if (!(letterIsPartOfSymbol(col,row,val)) || doNotCheckContiguousCells) {
			chars=['THE','','#','ED','SH','AND',"'",'OF','WITH','CH','ING','capital sign','-','.','ST','',',',';',':','.','EN','!','()','?','IN','WH','text sign','GH','FOR','AR','TH'];
			drawCellASCII(ctx,x,y,chars[val-533],(val % 100));
		}
	
	} else if (val>=565 && val<=590) { // text letters
		if (!(letterIsPartOfSymbol(col,row,val)) || doNotCheckContiguousCells) {
			drawCellASCII(ctx,x,y,String.fromCharCode(val-500),(val % 100));
		}
		
	} else if (val>=591 && val<=593) { // contractions
		chars=['OW','OU','ER'];
		drawCellASCII(ctx,x,y,chars[val-591],(val % 100));
	
	} else if (val==634) { // tenor clef (third symbol)
		if (checkPreviousCell(col,row,643) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==635) { // bass clef (second symbol)
		if (checkPreviousCell(col,row,662) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==637) { // contractions
		drawCellASCII(ctx,x,y,'SHALL',(val % 100));

	} else if (val==639) { // up bow (second symbol)
		if (checkPreviousCell(col,row,760) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==642) { // contractions
		drawCellASCII(ctx,x,y,'CHILD',(val % 100));

	} else if (val==643) { // alto/tenor clef (second symbol)
		if (checkPreviousCell(col,row,662) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==645) { // contractions
		drawCellASCII(ctx,x,y,'COM',(val % 100));

	} else if (val==646) { // in-accord measure division (first character)
		if (checkContiguousCells(col,row,[646,675])) {
			drawInAccord(ctx,x,y,2);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val>=647 && val<=651) { // punctuation and contractions
		chars=['/','”','EA','BB','CC','DD','','FF','GG','“','BY'];
		drawCellASCII(ctx,x,y,chars[val-647],(val % 100));
	
	} else if (val==658) { // contractions
		drawCellASCII(ctx,x,y,'WHICH',(val % 100));
	
	} else if (val==660) { // braille music comma (first symbol)
		if ((checkPreviousCell(col,row,194) === false) && (checkPreviousCell(col,row,244) === false)) {
			if (checkContiguousCells(col,row,[660,349])) {
				drawCellTextLabel(ctx,x,y,"MUSIC","COMMA","#000","#FFF",2);
			} else {
				drawLiteralBrailleSymbol(ctx,val,x,y);
			}
		}
		
	} else if (val==662) { // clefs
		if (checkContiguousCells(col,row,[662,447,676])) { // treble clef
			drawCellClef(ctx,x,y,1);
		} else if (checkContiguousCells(col,row,[662,643,676])) { // alto clef
			drawCellClef(ctx,x,y,2);
		} else if (checkContiguousCells(col,row,[662,643,634,676])) { // tenor clef
			drawCellClef(ctx,x,y,3);
		} else if (checkContiguousCells(col,row,[662,635,676])) { // bass clef
			drawCellClef(ctx,x,y,4);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
	
	} else if (val==663) { // contractions
		drawCellASCII(ctx,x,y,'THIS',(val % 100));

	} else if (val>=665 && val<=673) { // numbers 1-9
		drawCellASCII(ctx,x,y,String.fromCharCode(val-616),(val % 100));
	
	} else if (val==674) { // numbers 0
		drawCellASCII(ctx,x,y,"0",(val % 100));
	
	} else if (val==675) { // in-accord measure division (second symbol)
		if (checkPreviousCell(col,row,646) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==676) { // clef (last symbol)
		if ((checkPreviousCell(col,row,447) === false) && (checkPreviousCell(col,row,643) === false) && (checkPreviousCell(col,row,634) === false) && (checkPreviousCell(col,row,635) === false)) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val>=685 && val<=692) { // punctuation and contractions
		chars=['US','VERY','WILL','IT','YOU','AS','','OUT'];
		drawCellASCII(ctx,x,y,chars[val-685],(val % 100));

	} else if (val==735) { // left H-bar rest
		drawCellBackground(ctx,x,y,"#F00");
		ctx.font = "normal "+gh(0.6)+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#FFF"; // white
		ctx.fillText("\ue4ef",x+gw(0.5),y+gh(0.5));
		
	} else if (val==747) { // contractions
		drawCellASCII(ctx,x,y,'STILL',(val % 100));

	} else if (val==749) { // partial measure in-accord (second symbol)
		if (checkPreviousCell(col,row,334) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val>=750 && val<=757) { // punctuation and contractions
		chars=['BE','CON','DIS','ENOUGH','TO','WERE','HIS','WAS'];
		drawCellASCII(ctx,x,y,chars[val-750],(val % 100));

	} else if (val==760) { // bowing (first character)
		if (checkContiguousCells(col,row,[760,66])) {
			drawCellArticulation(ctx,x,y,9);
		} else if (checkContiguousCells(col,row,[760,639])) {
			drawCellArticulation(ctx,x,y,8);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==762) { // in-accord (second symbol)
		if (checkPreviousCell(col,row,860) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==767) { // change fingers
		drawCellArticulation(ctx,x,y,10);
		
	} else if (val==770) { // contractions
		drawCellASCII(ctx,x,y,'FROM',(val % 100));

	} else if (val>=775 && val<=784) { // contractions
		chars=['KNOWLEDGE','LIKE','MORE','NOT','','PEOPLE','QUITE','RATHER','SO','THAT'];
		drawCellASCII(ctx,x,y,chars[val-775],(val % 100));

	} else if (val==835) { // contractions
		drawCellASCII(ctx,x,y,'BLE',(val % 100));

	} else if (val==849) { // half diminished (second symbol)
		if (checkPreviousCell(col,row,452) === false) {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val==860) { // in-accord (first character)
		if (checkContiguousCells(col,row,[860,762])) {
			drawInAccord(ctx,x,y,1);
		} else {
			drawLiteralBrailleSymbol(ctx,val,x,y);
		}
		
	} else if (val>=866 && val<=874) { // contractions
		chars=['BUT','CAN','DO','EVERY','SELF','GO','HAVE','','JUST'];
		drawCellASCII(ctx,x,y,chars[val-866],(val % 100));

	} else if ((val !== null) && ((val%100) !== 0)) {
		drawLiteralBrailleSymbol(ctx,val,x,y);
	}
}

function letterIsPartOfSymbol(col,row,val) {
	// might be nice to replace this someday with an automatic comparison against preset character sequences
	var result=false;
	
	if (val==239) { // yeah, I know character 239 isn't a braille letter per se, get off my back
		if (checkContiguousCells(col-3,row,[462,570,570,239]) || checkContiguousCells(col-2,row,[462,570,239]) || checkContiguousCells(col-3,row,[462,577,570,239]) || checkContiguousCells(col-3,row,[462,577,580,239]) || checkContiguousCells(col-2,row,[462,580,239]) || checkContiguousCells(col-3,row,[462,567,582,239]) || checkContiguousCells(col-5,row,[462,568,569,567,582,239]) || checkContiguousCells(col-4,row,[462,568,573,577,239]) || checkContiguousCells(col-2,row,[162,551,239]) || checkContiguousCells(col-2,row,[162,552,239]) || checkContiguousCells(col-2,row,[162,567,239]) || checkContiguousCells(col-2,row,[162,568,239]) || checkContiguousCells(col-2,row,[446,262,239]) || checkContiguousCells(col-2,row,[495,262,239])) {
			result=true;
		}
	} else if (val==551 || val==552) {
		if (checkPreviousCell(col,row,162)) {
			result=true;
		}
	} else if (val==567) {
		if (checkPreviousCell(col,row,162) || checkContiguousCells(col-1,row,[462,567,582]) || checkContiguousCells(col-3,row,[462,568,569,567,582])) {
			result=true;
		}
	} else if (val==568) {
		if (checkPreviousCell(col,row,162) || checkContiguousCells(col-1,row,[462,568,569,567,582]) || checkContiguousCells(col-1,row,[462,568,573,577])) {
			result=true;
		}
	} else if (val==569) {
		if (checkContiguousCells(col-2,row,[462,568,569,567,582])) {
			result=true;
		}
	} else if (val==570) {
		if (checkContiguousCells(col-1,row,[462,570]) || checkContiguousCells(col-2,row,[462,570,570]) || checkContiguousCells(col-2,row,[462,577,570])) {
			result=true;
		}
	} else if (val==573) {
		if (checkContiguousCells(col-2,row,[462,568,573,577])) {
			result=true;
		}
	} else if (val==577) {
		if (checkContiguousCells(col-1,row,[462,577,570]) || checkContiguousCells(col-1,row,[462,577,580]) || checkContiguousCells(col-3,row,[462,568,573,577])) {
			result=true;
		}
	} else if (val==580) {
		if (checkContiguousCells(col-1,row,[462,580]) || checkContiguousCells(col-2,row,[462,580,580]) || checkContiguousCells(col-2,row,[462,577,580])) {
			result=true;
		}
	} else if (val==582) {
		if (checkPreviousCell(col,row,162) || checkContiguousCells(col-2,row,[462,567,582]) || checkContiguousCells(col-4,row,[462,568,569,567,582])) {
			result=true;
		}
	}
	
	return result;
	
}

function setCellHeight(val) {
	notationGridHeight=val;
	notationGridWidth=(val*2)/3;
	drawNotation();
}

function setPageSize(w,h) {
	pageWidth=w;
	pageHeight=h;
	drawNotation();
}

function rotateChar(x,y) {
	if (!cellIsEmpty(x,y)) {
		if (getScore(x,y) > 900) {
			setScore(x,y,getScore(x,y) % 100);
		} else {
			setScore(x,y,getScore(x,y)+100);
		}
	}
}

function convertToText(x,y) {
	if (!cellIsEmpty(x,y)) {
		if ((getScore(x,y) > 0) && (getScore(x,y) < 500)) {
			setScore(x,y,(getScore(x,y) % 100)+500);
		}
	}
}

function scrollCanvas(x,y) {
	hScroll += (x*notationGridWidth);
	if (hScroll<0) {
		hScroll=0;
	}
	
	vScroll += (y*notationGridHeight);
	if (vScroll<0) {
		vScroll=0;
	}
	drawNotation();
}

function scrollToCursor() {
	var activeX = cursor.x;
	if (cursor.pinnedLeft) { activeX += (cursor.width-1); }                                
	if (activeX<=hScrollUnits) {
		hScroll=Math.max(0,(activeX*gridWidth)-gw(0.5));
	} else if (activeX>=(hScrollUnits+notationCellWidth)) {
		hScroll=((activeX)*gridWidth)-((notationCellWidth*gridWidth)-(gw(1.5)));
	}
	var activeY = cursor.y;
	if (cursor.pinnedTop) { activeY += (cursor.height-1); }
	if (activeY<=vScrollUnits) {
		vScroll=Math.max(0,(activeY*gridHeight)-gh(0.5));
	} else if (activeY>=(vScrollUnits+notationCellHeight)) {
		vScroll=((activeY)*gridHeight)-((notationCellHeight*gridHeight)-(gh(1.5)));
	}
}

function insertRowAtCursor() {
	saveToUndo();
	score.splice(cursor.y,0,[]);
}

function deleteRowAtCursor() {
	saveToUndo();
	score.splice(cursor.y,1);
}
