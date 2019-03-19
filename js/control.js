/* global titleArea, tctx, versionString, helpDialogOpen, roundRect, optionsDialogOpen, fileDialogOpen, controlArea, cctx, whichKeyboard, keyboardCoordinates, keymap, keycaps, displayControlHelp, cursor, hScroll, vScroll, controlsHeight, controlsWidth, chu, resizeBarHeight, keyboardOriginX, keyboardOriginY, kbu, controlHelpOriginX, controlHelpOriginY, console, shiftKeyDown, metaKeyDown, formFill, kProgramTitle, kVersionAndAuthor, kHelpButtonCaption, kOptionsButtonCaption, kFileButtonCaption, sendHTTPRequest, defaultControlModule, DOMParser, currentControlModule, updateScreenreader, kScreenReaderControlPageNumber, createTemporaryGrid, gridWidth, gridHeight, releaseTemporaryGrid, document, devMode, score, drawStoredScore, notate, tempGrid, drawNotation, currentCellFont, notationArea, notateMIDINotes, selectedControlModule, kControlChangeSymbol, toggleControlSelectionDialog: true */
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
	var t=kProgramTitle;
	tctx.fillText(t,0,0);
	var twid=tctx.measureText(t).width;
	tctx.font = "100 "+(thu*80)+"px sans-serif";
	tctx.fillText(formFill(kVersionAndAuthor,[versionString]),twid*1.03,0);
	
	tctx.strokeStyle="#000";
	tctx.lineWidth=1;
	tctx.textAlign="center";
	tctx.textBaseline="middle";
	tctx.font = "normal "+thu*50+"px sans-serif";
	
	// help button
	if (helpDialogOpen) {tctx.fillStyle="#000";} else {tctx.fillStyle="#fff";}
	roundRect(tctx, titleWidth-((thu*300)+1), thu*10, thu*300, thu*80, thu*5, helpDialogOpen, true);
	if (helpDialogOpen) {tctx.fillStyle="#fff";} else {tctx.fillStyle="#000";}
	tctx.fillText(kHelpButtonCaption,titleWidth-((thu*155)+0.5),thu*50);
	
	// options button
	if (optionsDialogOpen) {tctx.fillStyle="#000";} else {tctx.fillStyle="#fff";}
	roundRect(tctx, titleWidth-((thu*600)+5), thu*10, thu*300, thu*80, thu*5, optionsDialogOpen, true);
	if (optionsDialogOpen) {tctx.fillStyle="#fff";} else {tctx.fillStyle="#000";}
	tctx.fillText(kOptionsButtonCaption,titleWidth-((thu*455)+3),thu*50);
	
	// file button
	if (fileDialogOpen) {tctx.fillStyle="#000";} else {tctx.fillStyle="#fff";}
	roundRect(tctx, titleWidth-((thu*900)+10), thu*10, thu*300, thu*80, thu*5, fileDialogOpen, true);
	if (fileDialogOpen) {tctx.fillStyle="#fff";} else {tctx.fillStyle="#000";}
	tctx.fillText(kFileButtonCaption,titleWidth-((thu*755)+5.5),thu*50);

}

function initializeControls(forceLoad = false) {
    if (currentControlModule && !forceLoad) {
        currentControlModule.updateSizes();
    } else {
        // appending the date forces an uncached copy
        sendHTTPRequest(
            loadControlModule,
            selectedControlModule.pathname+'?_='+new Date().getTime(),
            ""
        );
    }
}

function loadControlModule(request) {

    if (request) {

        currentControlModule = new controlModule(
            controlArea,
            controlArea.clientWidth,
            controlArea.clientHeight-resizeBarHeight,
            request.responseXML
        );

        currentControlModule.draw();
	}
}

function drawControls() {
    currentControlModule.draw();
}

function resetCursorAndScroll() {
	cursor.x=0;
	cursor.y=0;
	hScroll=0;
	vScroll=0;
}

class controlModule {
    constructor(whichCanvas, width, height, xml) {
        this.myCanvas = whichCanvas;
        this.ctx = whichCanvas.getContext("2d");
        this.width = width;
        this.height = height;
        this.defaults = [];
        var root = xml.children[0];
        for (let name of root.getAttributeNames()) {
            let value = root.getAttribute(name);
            if (name == "name") {
                this.name = value;
            } else {
                this.defaults[name] = value;
            }
        }

        this.pages = [];
        this.helps = [];
        for (let node of root.children) {
            if (node.tagName=="help") {
                this.helps.push(new helpPage(node,this));
            } else {
                this.pages.push(new controlPage(node,this));
            }
        }
        this.currentPage = 0;

    }
    updateSizes() {
        this.width = controlArea.clientWidth;
        this.height = controlArea.clientHeight-10;
        this.chu = this.height/100;
        this.pageButtonWidth = this.chu*16.66;
        this.pageButtonHeight = this.height/this.pages.length;
    }
    draw() {
        this.updateSizes();
        var ctx=this.ctx;
        var pbw=this.pageButtonWidth;
        var pbh=this.pageButtonHeight;

        this.myCanvas.width=this.myCanvas.clientWidth;
        this.myCanvas.height=this.myCanvas.clientHeight;

        var cw = this.myCanvas.width;
        var ch = this.myCanvas.height-resizeBarHeight;

        ctx.save();
        ctx.translate(0.5,resizeBarHeight+0.5);

        // draw page buttons
        ctx.save();
        if (this.pages.length>1) {
            // gray background
            ctx.fillStyle="#CCC";
            ctx.fillRect(0,0,pbw,this.height);

            // blue current page indicator
            ctx.fillStyle="#00F";
            ctx.fillRect(
                0,
                pbh*this.currentPage,
                pbw,
                pbh
            );

            // separator lines
            ctx.strokeStyle="#FFF";
            ctx.beginPath();
            this.pages.forEach(function(page, index) {
                ctx.moveTo(0,pbh*(index+1));
                ctx.lineTo(pbw,pbh*(index+1));
            });
            ctx.stroke();
            ctx.closePath();

            // labels
            ctx.fillStyle="#FFF";
            ctx.textAlign="center";
            ctx.textBaseline="middle";
            ctx.font = "normal "+Math.min(this.chu*8,(pbh*0.8))+"px sans-serif";
            this.pages.forEach(function(page, index) {
                ctx.fillText(page.name,pbw/2,(pbh*index)+(pbh/2));
            });

            ctx.translate(pbw,0);
            this.width = this.width-pbw;
        }

        // draw control switcher
        ctx.fillStyle="#CCC";
        ctx.fillRect(this.width-pbw,0,pbw,pbw);

        ctx.fillStyle="#FFF";
        ctx.fillText(kControlChangeSymbol,this.width-(pbw/2),pbw/2);


        if (devMode) {
            // draw grid
            ctx.beginPath();
            var cgu = this.chu*10;
            for (var i=cgu; i<this.height; i+=cgu) {
                ctx.moveTo(0,i);
                ctx.lineTo(this.width,i);
            }
            for (i=cgu; i<this.width; i+=cgu) {
                ctx.moveTo(i,0);
                ctx.lineTo(i,this.height);
            }
            ctx.strokeStyle="#ddf";
            ctx.stroke();
            ctx.closePath();
        }

        this.pages[this.currentPage].draw();

        ctx.restore();

        // draw border
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(cw-1,0);
        ctx.lineTo(cw-1,ch-1);
        ctx.lineTo(0,ch-1);
        ctx.lineTo(0,0);
        ctx.lineWidth=1;
        ctx.strokeStyle="#000";
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }
    defaultHelp() {
        var found;
        found = this.helps.find(function(element) {
            return element.name=="default";
        });
        if (found) {
            return found;
        } else {
            return new helpPage(document.createElement('help'),this);
        }
    }
    click(x,y) {
        if (x<=this.pageButtonWidth) {
            this.currentPage = Math.floor(y/this.pageButtonHeight);
            this.draw();
        } else {
            if (x>(this.width-this.pageButtonWidth) && (y<=this.pageButtonWidth)) {
                toggleControlSelectionDialog();
            } else {
                this.pages[this.currentPage].click(x-this.pageButtonWidth,y);
            }
        }
    }
    mouseOver(x,y) {
        if (x>this.pageButtonWidth) {
            this.pages[this.currentPage].mouseOver(x-this.pageButtonWidth,y);
        }
    }
    nextPage() {
        if (this.pages.length>1) {
            this.currentPage += 1;
            if (this.currentPage>this.pages.length-1) {
                this.currentPage = 0;
            }
            updateScreenreader(
                formFill(
                    kScreenReaderControlPageNumber,
                    [this.currentPage+1]
                )
            );
            this.draw();
        }
    }
    prevPage() {
        if (this.pages.length>1) {
            this.currentPage -= 1;
            if (this.currentPage<0) {
                this.currentPage = this.pages.length-1;
            }
            updateScreenreader(
                formFill(
                    kScreenReaderControlPageNumber,
                    [this.currentPage+1]
                )
            );
            this.draw();
        }
    }
    keyPress(keycode) {
        this.pages[this.currentPage].keyPress(keycode);
    }
    onTextPage() {
        return this.pages[this.currentPage].isText;
    }
}

class controlPage {
    constructor(xml, root) {
        this.root = root;
        this.name = xml.getAttribute('name');
        this.isText = (xml.getAttribute('isText')=='true');
        this.controlItems = [];
        this.indicators = [];
        this.currentHelp = this.root.defaultHelp();
        for (let node of xml.children) {
            if (node.tagName=="indicator") {
                this.indicators.push(new indicator(node,this.root));
            } else {
                this.controlItems.push(new controlItem(node,this.root));
            }
        }
    }
    draw() {
        this.controlItems.forEach(function(controlItem) {
            controlItem.draw();
        });
        this.indicators.forEach(function(indicator) {
            indicator.draw();
        });
        this.currentHelp.draw();
    }
    click(x,y) {
        for (let c of this.controlItems) {
            if (c.click(x,y)) {
                break;
            }
        }
    }
    mouseOver(x,y) {
        this.currentHelp = this.root.defaultHelp();
        for (let c of this.controlItems) {
            if (c.mouseOver(x,y)) {
                this.currentHelp = c.help();
                break;
            }
        }
        this.root.draw();
    }
    keyPress(keycode) {
//        var resp = {};
        for (let c of this.controlItems) {
            if (c.keycode==keycode) {
                c.keyPress();
//                resp.chars = c.characters;
//                resp.returnText = c.label;
//                return resp;
            }
        }
//        resp.chars = [];
//        resp.returnText = "";
//        return resp;
    }
}

class helpPage {
    constructor(xml,root) {
        this.root = root;
        this.name = xml.getAttribute('name');
        this.top = xml.getAttribute('top');
        this.left = xml.getAttribute('left');
        this.width = xml.getAttribute('width');
        this.height = xml.getAttribute('height');
        this.graphics = [];
        for (let node of xml.getElementsByTagName('graphic')) {
            this.graphics.push(new graphic(node,this.root));
        }
    }
    draw() {
        var ctx=this.root.ctx;
        var chu=this.root.chu;

        ctx.save();
        ctx.translate(chu*this.left,chu*this.top);
        var w=chu*this.width;
        var h=chu*this.height;
        this.graphics.forEach(function(controlGraphic) {
            controlGraphic.draw(ctx,w,h);
        });
        ctx.restore();
    }
}

class controlItem {
    constructor(xml,root) {
        this.root = root;
        this.keycode = xml.getAttribute('keycode');
        this.top = xml.getAttribute('top');
        this.left = xml.getAttribute('left');
        this.width = xml.getAttribute('width');
        this.height = xml.getAttribute('height');
        this.label = xml.getAttribute('label');
        this.midiKey = (xml.getAttribute('midiKey') == 'true');
        this.midiDuration = xml.getAttribute('midiDuration');
        this.graphics = [];
        this.characters = [];
        for (let node of xml.getElementsByTagName('graphic')) {
            this.graphics.push(new graphic(node,this.root));
        }
        if (xml.getElementsByTagName('help').length) {
            this.helpName=xml.getElementsByTagName('help')[0].getAttribute('page');
        }
        for (let node of xml.getElementsByTagName('character')) {
            this.characters.push(node.getAttribute('code'));
        }
    }
    help() {
        var h = this.helpName;
        return this.root.helps.find(function(element) {
            return element.name==h;
        });
    }
    draw() {
        var ctx=this.root.ctx;
        var chu=this.root.chu;

        ctx.save();
        ctx.translate(chu*this.left,chu*this.top);
        var w=chu*this.width;
        var h=chu*this.height;
        this.graphics.forEach(function(controlGraphic) {
            controlGraphic.draw(ctx,w,h);
        });
        ctx.restore();
    }
    click(x,y) {
        var chu=this.root.chu;
        if (
            x>=this.left*chu &&
            y>=this.top*chu &&
            x<this.left*chu + this.width*chu &&
            y<this.top*chu + this.height*chu
        ) {
            if (this.midiKey) {
                notateMIDINotes(this.midiDuration,false,true);
            } else {
                notate(this.characters,this.label);
            }
            drawNotation();
            return true;
        } else {
            return false;
        }
    }
    keyPress() {
        if (this.midiKey) {
            notateMIDINotes(this.midiDuration,false,-1,true);
        } else {
            notate(this.characters,this.label);
        }
        drawNotation();
    }
    mouseOver(x,y) {
        var chu=this.root.chu;
        return (
            x>=this.left*chu &&
            y>=this.top*chu &&
            x<this.left*chu + this.width*chu &&
            y<this.top*chu + this.height*chu
        );
    }
}

class indicator {
    constructor(xml,root) {
        this.root = root;
        this.type = xml.getAttribute('type');
        this.top = xml.getAttribute('top');
        this.left = xml.getAttribute('left');
        this.width = xml.getAttribute('width');
        this.height = xml.getAttribute('height');
        this.graphics = [];
        for (let node of xml.getElementsByTagName('graphic')) {
            this.graphics.push(new graphic(node,this.root));
        }
    }
    draw() {
        var ctx=this.root.ctx;
        var chu=this.root.chu;

        if ((this.type=="shift" && shiftKeyDown) ||
            (this.type=="control" && metaKeyDown)) {
            ctx.save();
            ctx.translate(chu*this.left,chu*this.top);
            var w=chu*this.width;
            var h=chu*this.height;
            this.graphics.forEach(function(controlGraphic) {
                controlGraphic.draw(ctx,w,h);
            });
            ctx.restore();
        }
    }
}

class graphic {
    constructor(xml,root) {
        this.root = root;
        this.attr = {};
        for (let name of xml.getAttributeNames()) {
            let value = xml.getAttribute(name);
            if (name == "type") {
                this.type = value;
            } else {
                this.attr[name] = value;
            }
        }
    }
    draw(ctx,boxWidth,boxHeight) {
        var onScore = (ctx == notationArea.getContext("2d"));
        var a = this.attr;
        var d = this.root.defaults;
        var chars = [];
        var xx,yy,w,h,p,i,n,yp,c,o,x1,x2,x3,y1,y2,y3,m;
        [
            'font',
            'style',
            'align',
            'baseline',
            'color',
            'top',
            'left',
            'height',
            'width',
            'radius',
            'fill',
            'stroke',
            'size',
            'x',
            'y',
            'start',
            'end',
            'lineWidth',
            'lineHeight',
            'ccw',
            'startX',
            'startY',
            'controlX',
            'controlY',
            'endX',
            'endY',
            'strokeColor',
            'multiline',
            'clef',
            'position',
            'dots',
            'note',
            'accidental',
            'numerator',
            'denominator',
            'rotate',
            'cells'
        ].forEach(function(e) {
                if (!(a.hasOwnProperty(e)) && d.hasOwnProperty(e)) {
                a[e]=d[e];
            }
        });

        ctx.save();
        var left = a.left;
        var top = a.top;
        var x = a.x;
        var y = a.y;
        var startX = a.startX;
        var startY = a.startY;
        var controlX = a.controlX;
        var controlY = a.controlY;
        var endX = a.endX;
        var endY = a.endY;

        if (a.hasOwnProperty('rotate')) {
            ctx.rotate(a.rotate*(Math.PI/180));
            left = a.top * (-1.5);
            top = a.left/1.5;
            x = a.y * (-1.5);
            y = a.x/1.5;
            startX = a.startY * (-1.5);
            startY = a.startX/1.5;
            controlX = a.controlY * (-1.5);
            controlY = a.controlX/1.5;
            endX = a.endY * (-1.5);
            endY = a.endX/1.5;
        }

        switch (this.type) {
            case "rect":
                if (a.fill=="true") {
                    ctx.fillStyle=a.color;
                    ctx.fillRect(
                        left*(boxWidth/100),
                        top*(boxHeight/100),
                        a.width*(boxWidth/100),
                        a.height*(boxHeight/100)
                    );
                }
                if (a.stroke=="true") {
                    ctx.strokeStyle=a.strokeColor;
                    ctx.lineWidth=a.lineWidth;
                    ctx.beginPath();
                    ctx.rect(
                        left*(boxWidth/100),
                        top*(boxHeight/100),
                        a.width*(boxWidth/100),
                        a.height*(boxHeight/100)
                    );
                    ctx.stroke();
                    ctx.closePath();
                }
                break;
            case "roundRect":
                ctx.fillStyle=a.color;
                ctx.strokeStyle=a.strokeColor;
                ctx.lineWidth=a.lineWidth;
                roundRect(
                    ctx,
                    left*(boxWidth/100),
                    top*(boxHeight/100),
                    a.width*(boxWidth/100),
                    a.height*(boxHeight/100),
                    a.radius*(boxHeight/100),
                    a.fill=="true",
                    a.stroke=="true"
                );
                break;
            case "text":
                ctx.fillStyle=a.color;
                ctx.font = a.style+" "+(a.size*(boxHeight/100))+"px "+a.font;
                ctx.textAlign=a.align;
                ctx.textBaseline=a.baseline;
                if (a.multiline=="true") {
                    var lines = a.content.split('\\n');
                    var lineHeight = a.lineHeight*(boxHeight/100);
                    for (i=0; i<lines.length; i++) {
                        ctx.fillText(
                            lines[i],
                            left*(boxWidth/100),
                            (top*(boxHeight/100))+(i*lineHeight)
                        );
                    }
                } else {
                    ctx.fillText(
                        a.content,
                        left*(boxWidth/100),
                        top*(boxHeight/100)
                    );
                }

                break;
            case "arc":
                ctx.lineWidth=a.lineWidth;
                ctx.strokeStyle=a.color;
                ctx.beginPath();
                ctx.arc(
                    x*(boxWidth/100),
                    y*(boxHeight/100),
                    a.radius*(boxHeight/100),
                    a.start,
                    a.end,
                    a.ccw=="true"
                );
                ctx.stroke();
                ctx.closePath();
                break;
            case "line":
                ctx.lineWidth=a.lineWidth;
                ctx.strokeStyle=a.color;
                ctx.beginPath();
                ctx.moveTo(
                    startX*(boxWidth/100),
                    startY*(boxHeight/100)
                );
                ctx.lineTo(
                    endX*(boxWidth/100),
                    endY*(boxHeight/100)
                );
                ctx.stroke();
                ctx.closePath();
                break;
            case "staff":
                xx=left*(boxWidth/100);
                yy=top*(boxHeight/100);
                w=a.width*(boxWidth/100);
                h=a.height*(boxHeight/100);
                ctx.strokeStyle="#000";
                ctx.beginPath();
                ctx.moveTo(xx,yy);
                ctx.lineTo(xx+w,yy);
                ctx.moveTo(xx,yy+(h*0.25));
                ctx.lineTo(xx+w,yy+(h*0.25));
                ctx.moveTo(xx,yy+(h*0.5));
                ctx.lineTo(xx+w,yy+(h*0.5));
                ctx.moveTo(xx,yy+(h*0.75));
                ctx.lineTo(xx+w,yy+(h*0.75));
                ctx.moveTo(xx,yy+h);
                ctx.lineTo(xx+w,yy+h);
                ctx.stroke(); // staff lines
                ctx.closePath();

                o=0;
                switch (a.clef) {
                    case "1": // treble
                        c="\ue050";
                        o=h*0.75;
                        break;
                    case "2": // bass
                        c="\ue061";
                        o=h*0.25;
                        break;
                    default: // no clef
                        c="";
                }

                ctx.fillStyle="#000"; // black
                ctx.textBaseline = "alphabetic";
                ctx.textAlign = "left";
                ctx.font = "normal "+h+"px Bravura";
                ctx.fillText(c,xx+(h*0.15),yy+o);
                break;
            case "accidental":
                xx=left*(boxWidth/100);
                yy=top*(boxHeight/100);
                w=a.width*(boxWidth/100);
                h=a.height*(boxHeight/100);
                p=a.position;
                ctx.fillStyle="#000"; // black
                ctx.textBaseline = "alphabetic";
                ctx.textAlign = "left";
                ctx.font = "normal "+h+"px Bravura";
                yp=yy+(h*0.5)+(p*(h/8));
                switch (a.accidental) {
                    case "-2":
                        n="\ue264";
                        break;
                    case "-1":
                        n="\ue260";
                        break;
                    case "0":
                        n="\ue261";
                        break;
                    case "1":
                        n="\ue262";
                        break;
                    case "2":
                        n="\ue263";
                        break;
                }
                ctx.fillText(n,xx-(h/3),yp);
                break;
            case "note":
                xx=left*(boxWidth/100);
                yy=top*(boxHeight/100);
                w=a.width*(boxWidth/100);
                h=a.height*(boxHeight/100);
                p=a.position;
                ctx.fillStyle="#000"; // black
                ctx.textBaseline = "alphabetic";
                ctx.textAlign = "left";
                ctx.font = "normal "+h+"px Bravura";
                yp = yy+(h*0.5)+(p*(h/8));
                switch (a.note) {
                    case "noteWhole":
                        n="\ue1d2";
                        break;
                    case "noteHalfUp":
                        n="\ue1d3";
                        break;
                    case "noteHalfDown":
                        n="\ue1d4";
                        break;
                    case "noteQuarterUp":
                        n="\ue1d5";
                        break;
                    case "noteQuarterDown":
                        n="\ue1d6";
                        break;
                    case "note8thDown":
                        n="\ue1d8";
                        break;
                    case "noteheadBlack":
                        n="\ue0a4";
                        break;
                    case "restHalf":
                        n="\ue4e4";
                        yp = yy+(h*0.5)+(0*(h/8));
                        break;
                    case "restQuarter":
                        n="\ue4e5";
                        yp = yy+(h*0.5)+(0*(h/8));
                        break;
                }
                ctx.fillText(n,xx,yp);
                var numberOfLedgers=Math.floor(Math.abs(p/2))-2;
                ctx.lineWidth=1;
                ctx.strokeStyle="#000";
                ctx.beginPath();
                var currentY;
                for (i=1; i<=numberOfLedgers; i++) {
                    currentY=yy+(h*0.5)+((p/Math.abs(p))*(h*0.5+(i*(h*0.25))));
                    ctx.moveTo(xx-(h*0.15),currentY);
                    ctx.lineTo(xx+(h*0.45),currentY);
                }
                ctx.stroke();
                ctx.closePath();
                for (i=0; i<a.dots; i++) {
                    ctx.fillText("\ue1e7",xx+(h*0.5)+(i*(h*0.3)),yp-((h/8)*((Math.abs(p)%2)^1)));
                }
                break;
            case "braille":
                xx=left*(boxWidth/100);
                yy=top*(boxHeight/100);
                h=a.height*(boxHeight/100);
                chars = a.cells.split(",");
                currentCellFont.drawScoreLine(
                    xx,
                    yy,
                    chars,
                    0,
                    chars.length,
                    ctx,
                    h/1.5
                );

//                createTemporaryGrid(h);
//                ctx.strokeStyle="#000";
//                ctx.lineWidth=1;
//                score[0] = a.cells.split(",");
//                drawStoredScore(ctx,xx,yy);
//                releaseTemporaryGrid();
                break;
            case "tie":
                x1=startX*(boxHeight/100);
                x2=endX*(boxHeight/100);
                yy=top*(boxHeight/100);
                h=a.height*(boxHeight/100);
                p=a.position;
                yp = yy+(h*0.5)+((p-1)*(h/8));
                ctx.beginPath();
                m = (x2-x1)/2;
                ctx.arc(
                    x1+m,
                    yp+m,
                    Math.sqrt(2*Math.pow(m,2)),
                    1.25*Math.PI,
                    1.75*Math.PI,
                    false
                );
                ctx.lineWidth=2;
                ctx.strokeStyle = "#000"; // black
                ctx.stroke();
                ctx.closePath();
                break;
            case "timeSignature":
                xx=left*(boxWidth/100);
                yy=top*(boxHeight/100);
                h=a.height*(boxHeight/100);
                ctx.textBaseline = "middle";
                ctx.textAlign = "left";
                ctx.font = "normal "+h+"px Bravura";
                chars = [
                    "\ue080",
                    "\ue081",
                    "\ue082",
                    "\ue083",
                    "\ue084",
                    "\ue085",
                    "\ue086",
                    "\ue087",
                    "\ue088",
                    "\ue089"
                ];
                ctx.fillText(
                    chars[a.numerator],
                    xx,
                    yy+(h*0.25)
                );
                ctx.fillText(
                    chars[a.denominator],
                    xx,
                    yy+(h*0.75)
                );
                break;
            case "slur":
                x1=startX*(boxWidth/100);
                y1=startY*(boxHeight/100);
                x2=controlX*(boxWidth/100);
                y2=controlY*(boxHeight/100);
                x3=endX*(boxWidth/100);
                y3=endY*(boxHeight/100);
                ctx.beginPath();
                ctx.moveTo(x1,y1);
                ctx.quadraticCurveTo(x2,y2,x3,y3);
                ctx.lineWidth=2;
                ctx.strokeStyle = "#000"; // black
                ctx.stroke();
                ctx.closePath();
                break;
            case "background":
                ctx.fillStyle=a.color;
                if (a.hasOwnProperty('cells')) {
                    c=Math.max(a.cells,1);
                } else {
                    c=1;
                }
                ctx.fillRect(
                    boxWidth*(0.05),
                    boxWidth*(0.05),
                    (boxWidth*c)-boxWidth*(0.1),
                    boxHeight-boxWidth*(0.1)
                );
                if ((a.color.toUpperCase()=="#FFF") && !onScore) {
                    ctx.strokeStyle="#666";
                    ctx.lineWidth=1;
                    ctx.strokeRect(
                        boxWidth*(0.05)+0.5,
                        boxWidth*(0.05)+0.5,
                        (boxWidth*c)-boxWidth*(0.1)-1,
                        (boxHeight*c)-boxWidth*(0.1)-1
                    );
                }
        }
        ctx.restore();
    }
}
