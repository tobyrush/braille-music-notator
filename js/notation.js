/* global notationArea, currentCellFont, sendHTTPRequest, defaultCellFont, gridHeight, notationGridHeight, gridWidth, notationGridWidth, notationCellWidth, notationCellHeight, ctx, showPageBreaks, pageWidth, hScrollUnits, hScrollOffset, hScroll, vScrollUnits, vScrollOffset, pageHeight, score, arrayHasOwnIndex, cursor, devMode, getScore, gh, gw, dropzone, kDropFileZoneMessage, optionsDialogOpen, fileDialogOpen, drawOptionsDialog, drawFileDialog, vScroll, setScore, updateScreenreader, formFill, kScreenReaderTemplate, characterName, saveToUndo, brailleDots, showSmallDots, graphic, cellIsEmpty, cellValIsEmpty, translateBrailleDefault, kProgramTitle, kVersionAndAuthor, versionString, helpDialogOpen, roundRect, kHelpButtonCaption, kOptionsButtonCaption, kFileButtonCaption, kTitleAreaHeight, document, kDialogWidth, window, setNodeValue, fileLoading, kFileLoadingMessage, kFileLoadingCreditMessage, kFileLoadingBrailleMUSE, kFileLoadingURL: true */
/* jshint esversion: 6 */
/* jshint -W020 */

function drawTitle() {

	var titleWidth = notationArea.clientWidth;
	var titleHeight = kTitleAreaHeight;

	var thu = titleHeight/100; // title height unit

	ctx.resetTransform();
    ctx.translate(0.5,0.5);

	ctx.fillStyle="#000";
	ctx.textAlign="left";
	ctx.textBaseline="top";
	ctx.font = "bold "+(thu*74)+"px sans-serif";
	var t=kProgramTitle;
	ctx.fillText(t,0,0);
	var twid=ctx.measureText(t).width;
	ctx.font = "100 "+(thu*74)+"px sans-serif";
	ctx.fillText(formFill(kVersionAndAuthor,[versionString]),twid*1.03,0);

    updateButtons();

}

function updateButtons() {

    var d;
    var fileButton = document.querySelector('#fileButton');
    var optionsButton = document.querySelector('#optionsButton');
    var helpButton = document.querySelector('#helpButton');

    if (!fileButton) {
        d = document.createElement('div');
        d.setAttribute('id','fileButton');
        d.setAttribute('onclick','toggleFileDialog();');
        d.textContent = kFileButtonCaption;
        fileButton = document.body.appendChild(d);
    }

    if (!optionsButton) {
        d = document.createElement('div');
        d.setAttribute('id','optionsButton');
        d.setAttribute('onclick','toggleOptionsDialog();');
        d.textContent = kOptionsButtonCaption;
        optionsButton = document.body.appendChild(d);
    }

    if (!helpButton) {
        d = document.createElement('div');
        d.setAttribute('id','helpButton');
        d.setAttribute('onclick','toggleHelpWindow();');
        d.textContent = kHelpButtonCaption;
        helpButton = document.body.appendChild(d);
    }

    if (fileDialogOpen) {
        fileButton.setAttribute('selected','selected');
    } else {
        fileButton.removeAttribute('selected');
    }

    if (optionsDialogOpen) {
        optionsButton.setAttribute('selected','selected');
    } else {
        optionsButton.removeAttribute('selected');
    }
}

function initializeNotation() {
 	notationArea.width = window.innerWidth-8;
	
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
    
    if (fileDialogOpen || optionsDialogOpen) {
        notationArea.width = window.innerWidth-300;
    } else {
        notationArea.width = window.innerWidth-8;
    }

	var notationWidth = notationArea.clientWidth;
	var notationHeight = notationArea.clientHeight-(kTitleAreaHeight+4);

    drawTitle();

	notationCellWidth = notationWidth/gridWidth;
	notationCellHeight = notationHeight/gridHeight;
	
	ctx.resetTransform();
    ctx.translate(0.5,kTitleAreaHeight+0.5);

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
	
	ctx.save();
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(notationWidth,0);
    ctx.lineTo(notationWidth,notationHeight);
    ctx.lineTo(0,notationHeight);
    ctx.lineTo(0,0);
    ctx.clip();

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

    ctx.restore(); // release clipping area
	
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
	
	// draw dropzone/file loading indicator
	if (dropzone) {
		ctx.globalAlpha=0.9;
		ctx.fillStyle="#FFF";
		ctx.fillRect(0,0,notationWidth,notationHeight);
		ctx.globalAlpha=1;
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.font="bold 36px sans-serif";
		ctx.fillStyle="#00F";
        ctx.fillText(kDropFileZoneMessage,notationWidth/2,notationHeight/2);
	} else if (fileLoading) {
        ctx.globalAlpha=0.9;
		ctx.fillStyle="#FFF";
		ctx.fillRect(0,0,notationWidth,notationHeight);
		ctx.globalAlpha=1;
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.font="bold 36px sans-serif";
		ctx.fillStyle="#00F";
        ctx.fillText(kFileLoadingMessage,notationWidth/2,(notationHeight/2)-40);
        ctx.font="bold 18px sans-serif";
        ctx.fillText(kFileLoadingCreditMessage,notationWidth/2,notationHeight/2+10);
        ctx.font="bold 36px 'Arial Rounded MT Bold'";
        ctx.fillText(kFileLoadingBrailleMUSE,notationWidth/2,(notationHeight/2+40));
        ctx.font="bold 14px sans-serif";
        ctx.fillText(kFileLoadingURL,notationWidth/2,(notationHeight/2+70));
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

function setCellHeight(val,redraw=true) {
	gridHeight=val;
	gridWidth=(val*2)/3;
    setNodeValue(document.querySelector("#scoreSizeFieldValue"),gridHeight);
	if (redraw) {
        drawNotation();
    }
}

function setPageSize(w,h,redraw=true) {
	pageWidth=w;
	pageHeight=h;
    setNodeValue(document.querySelector("#pageSizeFieldWidthValue"),pageWidth);
    setNodeValue(document.querySelector("#pageSizeFieldHeightValue"),pageHeight);
	if (redraw) {
        drawNotation();
    }
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
		var val = getScore(x,y);
        if ((val > 0) && (val < 500) && (val != 32)) {
			setScore(x,y,(val % 100)+500);
		}
	}
}

function scrollCanvas(x,y) {
	hScroll += (x*gridWidth);
	if (hScroll<0) {
		hScroll=0;
	}
	
	vScroll += (y*gridHeight);
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
        this.translateBraille = translateBrailleDefault;
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
        if (chars) {
            var c = chars.slice(Math.max(Math.floor(startCell),0),Math.ceil(endCell)+1);
            var newWord = true;
            c.push("0");
            var currentX = x+(gw*Math.max(startCell,0));
            while (c.length) {
                var sym = this.findSymbol(c,newWord);
                if (this.translateBraille && sym.length) {
                    sym[0].draw(currentX,y,ctx,gw);
                    c=c.slice(sym[0].length());
                    currentX += gw * sym[0].length();
                    if (sym[0].wordModifier) {
                        newWord = true;
                    } else {
                        newWord = false;
                    }
                } else {
                    if (!cellValIsEmpty(c[0])) {
                        this.drawBrailleSymbol(currentX,y,c[0],ctx,gw);
                        newWord = false;
                    } else {
                        newWord = true;
                    }
                    currentX += gw;
                    c = c.slice(1);
                }
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
        if (!showSmallDots) { smallDotRadius=0; }
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
    findSymbol(chars, newWord) {
        // finds best match for the array
        // courtesy of JS genius benvc at https://stackoverflow.com/a/54873442/1754243
        // JSON.stringify was slow so I replaced it with Tomáš Zato's Array.equals()
        let matches = this.cells.reduce((acc, obj) => {
            let len = chars.length <= obj.codes.length ? chars.length : obj.codes.length;
            if (chars.slice(0, len).equals(obj.codes.slice(0, len)) &&
                (!obj.discrete ||
                 (newWord &&
                  (cellValIsEmpty(chars[len]) || currentCellFont.findSymbol(chars.slice(len,chars.length),false)[0].wordModifier)
                 )
                )
               ) {
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
        this.discrete = (xml.getAttribute('discrete')=="1");
        this.wordModifier = (xml.getAttribute('word-modifier')=="1");
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
