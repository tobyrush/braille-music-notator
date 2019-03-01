/* global notationArea, currentCellFont, sendHTTPRequest, defaultCellFont, gridHeight, notationGridHeight, gridWidth, notationGridWidth, notationCellWidth, notationCellHeight, ctx, showPageBreaks, pageWidth, hScrollUnits, hScrollOffset, hScroll, vScrollUnits, vScrollOffset, pageHeight, score, arrayHasOwnIndex, cursor, devMode, getScore, gh, gw, dropzone, kDropFileZoneMessage, optionsDialogOpen, fileDialogOpen, drawOptionsDialog, drawFileDialog, vScroll, setScore, updateScreenreader, formFill, kScreenReaderTemplate, characterName, saveToUndo, brailleDots, drawAllDots, graphic, cellIsEmpty: true */
/* jshint -W020 */

function initializeNotation() {
 	notationArea.width=notationArea.clientWidth;
	notationArea.height=notationArea.clientHeight;
	
    initializeCellFont();
}

function initializeCellFont() {
    if (!currentCellFont) {
        // appending the date forces an uncached copy
        sendHTTPRequest(
            loadCellFont,
            defaultCellFont+'?_='+new Date().getTime(),
            ""
        );
    }
}

function loadCellFont(request) {
    if (request) {
        currentCellFont = new cellFontModule(
        notationArea,
        request.responseXML
        );
        drawNotation();
    }
}

function drawNotation() {
	var col, rightMargin;
    
    notationArea.width = notationArea.clientWidth;
	
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
		if ((y>vScrollUnits-1) && (y<vScrollUnits+(notationCellHeight+1)) && arrayHasOwnIndex(score,y)) {
			currentCellFont.drawScoreLine(
				(gridWidth*(0-hScrollUnits))-hScrollOffset,
				(gridHeight*(y-vScrollUnits))-vScrollOffset,
				score[y],
				hScrollUnits-7,
				hScrollUnits+notationCellWidth+1
			);
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
        //ctx.fillText("vScroll: " + vScroll + "; vScrollUnits: " + vScrollUnits + "; vScrollOffset: " + vScrollOffset + "; notationCellHeight: " + notationCellHeight,4,4);
		
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
		ctx.fillText(kDropFileZoneMessage,notationWidth/2,notationHeight/2);
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
			setScore(x,y,(getScore(x,y)*1) % 100);
		} else {
			setScore(x,y,(getScore(x,y)*1)+100);
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

function placeCursor(x,y,w,h,readerText) {
    cursor.x = x;
    cursor.y = y;
    cursor.width = w;
    cursor.height = h;
    updateScreenreader(
        formFill(
            kScreenReaderTemplate,
            [
                readerText,
                y,
                x,
                characterName(getScore(x,y),x,y)
            ]
        )
    );
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

class cellFontModule {
    constructor(whichCanvas, xml) {
        this.myCanvas = whichCanvas;
        this.ctx = whichCanvas.getContext("2d");
        this.interpretBraille = true;
        var root = xml.children[0];
        this.defaults = [];
        for (let name of root.getAttributeNames()) {
            let value = root.getAttribute(name);
            if (name == "name") {
                this.name = value;
            } else {
                this.defaults[name] = value;
            }
        }

        this.cells = [];
        for (let node of root.children) {
            this.cells.push(new cell(node,this));
        }
    }
    drawScoreLine(x,y,chars,startCell,endCell,ctx=this.ctx,gw=gridWidth) {
        var c = chars.slice(Math.max(Math.floor(startCell),0),Math.ceil(endCell)+1);
        c.push("0");
        var currentX = x+(gw*Math.max(startCell,0));
        while (c.length) {
            var sym = this.findSymbol(c);
            if (this.interpretBraille && sym.length) {
                sym[0].draw(currentX,y,ctx,gw);
                c=c.slice(sym[0].length());
                currentX += gw * sym[0].length();
            } else {
                if (
                    typeof(c[0]) !== 'undefined' &&
                    c[0] !== null &&
                    c[0] !== "0" &&
                    c[0] !== "32"
                ) {
                    this.drawBrailleSymbol(currentX,y,c[0],ctx,gw);
                }
                currentX += gw;
                c = c.slice(1);
            }
        }

    }
    drawBrailleSymbol(x,y,val,ctx=this.ctx,gw=gridWidth) {
        var code = brailleDots[(val % 100)-32];
        var col1 = x+gw*0.333;
        var col2 = x+gw*0.666;
        var row1 = y+gw*0.375;
        var row2 = y+gw*0.75;
        var row3 = y+gw*1.125;
        var smallDotRadius = gw*0.025;
        if (!drawAllDots) { smallDotRadius=0; }
        var radii = [smallDotRadius,gw*0.1];
        var f = 2*Math.PI;

        ctx.fillStyle = "#000";

        ctx.beginPath();
        ctx.arc(col1,row1,radii[code & 1 ? 1 : 0],0,f,false);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(col1,row2,radii[code & 2 ? 1 : 0],0,f,false);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(col1,row3,radii[code & 4 ? 1 : 0],0,f,false);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(col2,row1,radii[code & 8 ? 1 : 0],0,f,false);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(col2,row2,radii[code & 16 ? 1 : 0],0,f,false);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(col2,row3,radii[code & 32 ? 1 : 0],0,f,false);
        ctx.fill();

    }
    findSymbol(chars) {
        // finds best match for the array
        // courtesy of JS genius benvc at https://stackoverflow.com/a/54873442/1754243
        let matches = this.cells.reduce((acc, obj) => {
            let len = chars.length <= obj.codes.length ? chars.length : obj.codes.length;
            let a = JSON.stringify(chars.slice(0, len));
            let b = JSON.stringify(obj.codes.slice(0, len));
            if (a === b) {
                if (len < chars.length) {
                    acc.short.push(obj);
                } else {
                    acc.long.push(obj);
                }
            }
            return acc;
        }, {long: [], short: []});

        if (!matches.long.length) {
            return matches.short.sort((a,b) => b.codes.length - a.codes.length).slice(0,1);
        }

        return matches.long;
    }
}

class cell {
    constructor(xml, root) {
        this.root = root;
        this.name = xml.getAttribute('name');
        this.codes = [];
        this.graphics = [];
        for (let node of xml.children) {
            if (node.tagName=="code") {
                this.codes.push(node.getAttribute("value"));
            } else {
                this.graphics.push(new graphic(node,this.root));
            }
        }
    }
    length() {
        return this.codes.length;
    }
    draw(x,y,ctx=this.root.ctx,gw=gridWidth) {
        ctx.save();
        ctx.translate(x,y);
        this.graphics.forEach(function(graphic) {
            graphic.draw(ctx,gw,gw*1.5);
        });
        ctx.restore();
    }
}
