/* global titleArea, tctx, versionString, helpDialogOpen, roundRect, optionsDialogOpen, fileDialogOpen, controlArea, cctx, whichKeyboard, keyboardCoordinates, keymap, keycaps, displayControlHelp, cursor, hScroll, vScroll, controlsHeight, controlsWidth, chu, resizeBarHeight, keyboardOriginX, keyboardOriginY, kbu, controlHelpOriginX, controlHelpOriginY, console, shiftKeyDown, metaKeyDown, formFill, kProgramTitle, kVersionAndAuthor, kHelpButtonCaption, kOptionsButtonCaption, kFileButtonCaption, sendHTTPRequest, defaultControlModule, DOMParser, currentControlModule, updateScreenreader, kScreenReaderControlPageNumber, doNotCheckContiguousCells, createTemporaryGrid, gridWidth, gridHeight, drawSymbol, releaseTemporaryGrid, document, devMode: true */
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

function initializeControls() {
    if (currentControlModule) {
        currentControlModule.updateSizes();
    } else {
        // appending the date forces an uncached copy
        sendHTTPRequest(
            loadControlModule,
            defaultControlModule+'?_='+new Date().getTime(),
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

//function clearControlArea() {
//	controlArea.width = controlArea.clientWidth;
//}
//
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
        //this.currentHelp = "default";
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
            this.pages[this.currentPage].click(x-this.pageButtonWidth,y);
        }
    }
    mouseOver(x,y) {
        if (x>this.pageButtonWidth) {
            this.pages[this.currentPage].mouseOver(x-this.pageButtonWidth,y);
        }
    }
    keyDown(keycode) {
        if (keycode==9 && this.pages.length>1) {
            if (shiftKeyDown) {
                this.currentPage -= 1;
                if (this.currentPage<0) {
                    this.currentPage = this.pages.length-1;
                }
            } else {
                this.currentPage += 1;
                if (this.currentPage>this.pages.length-1) {
                    this.currentPage = 0;
                }
            }
            updateScreenreader(formFill(kScreenReaderControlPageNumber,[this.currentPage+1]));
            this.draw();
        } else {
            this.pages[this.currentPage].keyDown(keycode);
        }
    }
}

class controlPage {
    constructor(xml, root) {
        this.root = root;
        this.name = xml.getAttribute('name');
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
    keyDown(keycode) {
        for (let c of this.controlItems) {
            if (c.keyDown(keycode)) {
                break;
            }
        }
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
            this.graphics.push(new controlGraphic(node,this.root));
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
        this.graphics = [];
        this.characters = [];
        for (let node of xml.getElementsByTagName('graphic')) {
            this.graphics.push(new controlGraphic(node,this.root));
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
            this.fire();
            return true;
        } else {
            return false;
        }
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
    keyDown(keycode) {
        if (this.keycode==keycode) {
            this.fire();
            return true;
        } else {
            return false;
        }
    }
    fire() {
        // send this.characters to notation area
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
            this.graphics.push(new controlGraphic(node,this.root));
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

class controlGraphic {
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
        var a = this.attr;
        var d = this.root.defaults;
        var x,y,w,h,p,i;
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
            'endX',
            'endY',
            'strokeColor',
            'multiline',
            'clef',
            'position',
            'dots',
            'note'
        ].forEach(function(e) {
                if (!(a.hasOwnProperty(e)) && d.hasOwnProperty(e)) {
                a[e]=d[e];
            }
        });

        switch (this.type) {
            case "rect":
                if (a.fill=="true") {
                    ctx.fillStyle=a.color;
                    ctx.fillRect(
                        a.left*(boxWidth/100),
                        a.top*(boxHeight/100),
                        a.width*(boxWidth/100),
                        a.height*(boxHeight/100)
                    );
                }
                if (a.stroke=="true") {
                    ctx.strokeStyle=a.strokeColor;
                    ctx.lineWidth=a.lineWidth;
                    ctx.beginPath();
                    ctx.rect(
                        a.left*(boxWidth/100),
                        a.top*(boxHeight/100),
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
                    a.left*(boxWidth/100),
                    a.top*(boxHeight/100),
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
                    for (i=0; i<lines.length; i++) {
                        ctx.fillText(
                            lines[i],
                            a.left*(boxWidth/100),
                            (a.top*(boxHeight/100))+(i*a.lineHeight)
                        );
                    }
                } else {
                    ctx.fillText(
                        a.content,
                        a.left*(boxWidth/100),
                        a.top*(boxHeight/100)
                    );
                }

                break;
            case "arc":
                ctx.lineWidth=a.lineWidth;
                ctx.strokeStyle=a.color;
                ctx.beginPath();
                ctx.arc(
                    a.x*(boxWidth/100),
                    a.y*(boxHeight/100),
                    a.radius*(boxWidth/100),
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
                    a.startX*(boxWidth/100),
                    a.startY*(boxHeight/100)
                );
                ctx.lineTo(
                    a.endX*(boxWidth/100),
                    a.endY*(boxHeight/100)
                );
                ctx.stroke();
                ctx.closePath();
                break;
            case "staff":
                x=a.left*(boxWidth/100);
                y=a.top*(boxHeight/100);
                w=a.width*(boxWidth/100);
                h=a.height*(boxHeight/100);
                ctx.strokeStyle="#000";
                ctx.beginPath();
                ctx.moveTo(x,y);
                ctx.lineTo(x+w,y);
                ctx.moveTo(x,y+(h*0.25));
                ctx.lineTo(x+w,y+(h*0.25));
                ctx.moveTo(x,y+(h*0.5));
                ctx.lineTo(x+w,y+(h*0.5));
                ctx.moveTo(x,y+(h*0.75));
                ctx.lineTo(x+w,y+(h*0.75));
                ctx.moveTo(x,y+h);
                ctx.lineTo(x+w,y+h);
                ctx.stroke(); // staff lines
                ctx.closePath();

                var clefChar, offset=0;
                switch (a.clef) {
                    case "1": // treble
                        clefChar="\ue050";
                        offset=h*0.75;
                        break;
                    case "2": // bass
                        clefChar="\ue061";
                        offset=h*0.25;
                        break;
                    default: // no clef
                        clefChar="";
                }

                ctx.fillStyle="#000"; // black
                ctx.textBaseline = "alphabetic";
                ctx.textAlign = "left";
                ctx.font = "normal "+h+"px Bravura";
                ctx.fillText(clefChar,x+(h*0.15),y+offset);
                break;
            case "note":
                x=a.left*(boxWidth/100);
                y=a.top*(boxHeight/100);
                w=a.width*(boxWidth/100);
                h=a.height*(boxHeight/100);
                p=a.position;
                ctx.fillStyle="#000"; // black
                ctx.textBaseline = "alphabetic";
                ctx.textAlign = "left";
                ctx.font = "normal "+h+"px Bravura";
                var noteChar, yPos = y+(h*0.5)+(p*(h/8));
                switch (a.note) {
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
                        yPos = y+(h*0.5)+(0*(h/8));
                        break;
                    case "restQuarter":
                        noteChar="\ue4e5";
                        yPos = y+(h*0.5)+(0*(h/8));
                        break;
                }
                ctx.fillText(noteChar,x,yPos);
                var numberOfLedgers=Math.floor(Math.abs(p/2))-2;
                ctx.strokeStyle="#000";
                ctx.beginPath();
                var currentY;
                for (i=1; i<=numberOfLedgers; i++) {
                    currentY=y+(h*0.5)+((p/Math.abs(p))*(h*0.5+(i*(h*0.25))));
                    ctx.moveTo(x-(h*0.15),currentY);
                    ctx.lineTo(x+(h*0.45),currentY);
                }
                ctx.stroke();
                ctx.closePath();
                for (i=0; i<a.dots; i++) {
                    ctx.fillText("\ue1e7",x+(h*0.5)+(i*(h*0.3)),yPos-((h/8)*((Math.abs(p)%2)^1)));
                }
                break;
            case "braille":
                x=a.left*(boxWidth/100);
                y=a.top*(boxHeight/100);
                h=a.height*(boxHeight/100);
                var chars = a.cells.split(",");
                doNotCheckContiguousCells = a.multiCell;
                createTemporaryGrid(h);
                ctx.strokeStyle="#000";
                ctx.lineWidth=1;
                for (i=0; i<chars.length; i++) {
                    if (chars[i]!==0) {
                        if ((chars[i]>=533 && chars[i]<=563) || (chars[i]>=565 && chars[i]<=593) || (chars[i]>=647 && chars[i]<=651) || (chars[i]>=654 && chars[i]<=656) || (chars[i]>=665 && chars[i]<=674)) { // if it's literary braille
                            ctx.strokeRect(x+(gridWidth*i)+2,y+2,gridWidth-4,gridHeight-4);
                        }
                        drawSymbol(ctx,chars[i],x+(gridWidth*i),y,i,0);
                    }
                }
                releaseTemporaryGrid();
                doNotCheckContiguousCells = false;
        }
    }
}
