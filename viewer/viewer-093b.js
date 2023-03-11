// Braille Music Viewer by Toby W. Rush. For information and usage, visit <http://tobyrush.com/braillemusic/viewer/>.
/* global document, window, navigator: true */

var versionString = "0.9.3b";
var brailleDots = [0,46,16,60,43,41,47,4,55,62,33,44,32,36,40,12,52,2,6,18,50,34,22,54,38,20,49,48,35,63,28,57,8,1,3,9,25,17,11,27,19,10,26,5,7,13,29,21,15,31,23,14,30,37,39,58,45,61,53,42,51,59,24,56];

function initializeBMViewers(fontURL = "https://tobyrush.com/braillemusic/notator/cellfonts/en/classic.xml") {
	var u;
	if (fontURL.match(/\:\/\//g).length) {
		u = new URL(fontURL,document.location);
	} else {
		u = new URL(fontURL);
	}
	
	var r = new XMLHttpRequest();
	var o = this;
	r.addEventListener("load", continueInitialization);
	r.addEventListener("error", function() {alert("error");});
	r.open("GET", u);
	r.send();
}

function continueInitialization(request) {

	if (request.target) {
		var fontXML = request.target.responseXML;
		var notationArea,currentViewer, viewers=[];
	
		window.addEventListener("resize",initializeBMViewers,false);
	
		var objectElements = document.getElementsByTagName("object");
		for (var i=0; i<objectElements.length; i++) {
			if (objectElements[i].getAttribute("type") == 'application/braillemusic') {
				objectElements[i].appendChild(document.createElement("canvas"));
				currentViewer = new bmviewer(objectElements[i],fontXML,readParams(objectElements[i]));
				viewers.push(currentViewer);
				currentViewer.loadScore();
			}
		}
	} else {
		// error loading font file
	}
	
}

class bmviewer {
	
	constructor(whichObject, whichFontXML, params) {
		this.object = whichObject;
		this.canvas = whichObject.getElementsByTagName('canvas')[0];
		this.doc = this.object.ownerDocument;
		this.cellFont = new cellFontModule(this.canvas, whichFontXML, this);
		this.canvas.wrapper = this;
		this.canvas.addEventListener("mousedown",this.doNotationMouseDown,false);
		this.canvas.addEventListener("mousemove",this.doNotationMouseMove,false);
		this.canvas.addEventListener("mousewheel",this.doNotationMouseWheel,false);
		this.canvas.addEventListener("DOMMouseScroll",this.doNotationMouseWheel,false); // because Firefox doesn't do mousewheel
		this.ctx = this.canvas.getContext('2d');
		this.mouseIsOverTranslationToggle = false;
		this.score = [[]];
		this.hScroll = 0;
		this.vScroll = 0;
		this.readParams(params);
		this.canvas.style.width = "100%";
		this.canvas.style.height = "100%";
		this.notationWidth = this.canvas.clientWidth;
		this.notationHeight = this.canvas.clientHeight;
		this.notationCellWidth = this.notationWidth/this.gridWidth;
		this.notationCellHeight = this.notationHeight/this.gridHeight;
	}
	
	doNotationMouseWheel(e) {
		var v = this.wrapper;
		var deltaX=0;
		var deltaY=0;
		var resolution=1;
		if (v.scrollable=="true") {
			switch (e.axis) {
				case 1: // horizontal (Firefox only)
					deltaX = e.detail * resolution;
					break;
				case 2: // vertical (Firefox only)
					deltaY = e.detail * resolution;
					break;
				default: // not Firefox
					deltaX = -e.wheelDeltaX * resolution;
					deltaY = -e.wheelDeltaY * resolution;
			}

			v.vScroll = Math.max(0,v.vScroll + deltaY);
			v.hScroll = Math.max(0,v.hScroll + deltaX);

			e.preventDefault();

			v.drawNotation();

			return false;
		} else {
			return true;
		}
	};

	doNotationMouseMove(e) {
		var rect=e.target.getBoundingClientRect();
		var localX = e.clientX-rect.left;
		var localY = e.clientY-rect.top;
		var v = this.wrapper;

		if (localX>=v.notationWidth-50 && localX<=v.notationWidth-10 && localY>=v.notationHeight-30 && localY<=v.notationHeight-10) {
			v.mouseIsOverTranslationToggle = true;
		} else {
			v.mouseIsOverTranslationToggle = false;
		}

		v.drawNotation();
	};

	doNotationMouseDown(e) {
		var rect=e.target.getBoundingClientRect();
		var localX = e.clientX-rect.left;
		var localY = e.clientY-rect.top;
		var v = this.wrapper;

		if (localX>=v.notationWidth-50 && localX<=v.notationWidth-10 && localY>=v.notationHeight-30 && localY<=v.notationHeight-10) {
			v.translateBraille = !v.translateBraille;
		}
		v.drawNotation();
	}
	
	readParams(p) {
		this.translateBraille = true;
		if (p.initialView=="braille") {
			this.translateBraille = false;
		}
		
		if (p.brailleDisplay) {
			this.brailleDisplayElement = this.doc.getElementById(p.brailleDisplay);
		} else {
			var objectID = getRandomString();
			if (this.object.hasAttribute("id")) {
				objectID = this.object.getAttribute("id");
			} else {
				this.object.setAttribute("id",objectID);
			}
			
			var alertNode = this.doc.createElement("div");
			alertNode.setAttribute("id","bmviewer");
			alertNode.setAttribute("aria-details",objectID);
			alertNode.style.position = "absolute";
			alertNode.style.left = "-999999";
			this.object.parentElement.insertBefore(alertNode,this.object);
			this.brailleDisplayElement = alertNode;
		}
		
		this.scrollable = p.scrollable;
		this.drawSmallDots = p.drawSmallDots;
		var h = 60;
		if (p.scoreSize) {
			h=p.scoreSize*1;
		}
		this.gridHeight=h;
		this.gridWidth=(h*2)/3;
	}
	
	populateBrailleDisplay() {
		var d = "";
		if (this.score.length) {
			for (var y=0; y<this.score.length; y++) {
				if (this.score[y].length) {
					for (var x=0; x<this.score[y].length; x++) {
						d = d + encodeForHTML(String.fromCharCode(this.getScore(x,y) % 100));
					}
				}
				d = d + "<br />";
			}
		}
		this.brailleDisplayElement.innerHTML = d;
	}
	
	getScore(x,y) {
		if ((x === null) || (y === null) ||
			(typeof this.score[y]==='undefined') || (this.score[y]===null) ||
			(typeof this.score[y][x]==='undefined')) {
			return 32;
		} else {
			return this.score[y][x];
		}
	}
	
	loadScore() {
		if (this.object.hasAttribute("data")) {
			var r = new XMLHttpRequest();
			var u = new URL(this.object.getAttribute("data"),document.location);
			var o = this;
			r.addEventListener("load", function() {
				o.parseScore(this.responseXML);
			});
			r.open("GET", u);
			r.send();
		} else {
			this.parseScore(this.object);
		}
	}
	
	parseScore(o) {
		if (o.getElementsByTagName('score-braille').length) {
			var xmlData = o.getElementsByTagName('score-braille')[0];
			this.openBRMFile(xmlData);
		}
	}
	
	openBRMFile(xml) {
		
		var err = false;
		var s = xml.getElementsByTagName("symbol");
		for (var i=0; i<s.length; i++) {
			this.cellFont.addCellToScore(s[i].getAttribute("col"), s[i].getAttribute("row"), s[i].getAttribute("char"), s[i].getAttribute("val"));
		}
		
		if (err == true) {
			alert("Error loading file.");
			score = [[]];
		}
		
		this.drawNotation();
		this.populateBrailleDisplay();
	}
	
	drawNotation() {
		var t=this;
		var col, rightMargin, ctx=t.ctx;
		var gh = t.gridHeight, gw = t.gridWidth;
		var nh = t.notationHeight, nw = t.notationWidth;
		var nch = t.notationCellHeight, ncw = t.notationCellWidth;
		
		ctx.resetTransform();
		ctx.translate(0.5,0.5);
		t.canvas.width=t.canvas.offsetWidth;
		t.canvas.height=t.canvas.offsetHeight;
	
		var hso = t.hScroll % t.gridWidth;
		var vso = t.vScroll % t.gridHeight;
		var hsu = Math.floor(t.hScroll/t.gridWidth);
		var vsu = Math.floor(t.vScroll/t.gridHeight);
		
		var i, row=vsu;
		
		// draw grid
		ctx.beginPath();
		for (i=gh-vso; i<nh; i+=gh) {
			ctx.moveTo(0,i);
			ctx.lineTo(nw,i);
			row+=1;
		}
		col=hsu;
		for (i=gw-hso; i<nw; i+=gw) {
			ctx.moveTo(i,0);
			ctx.lineTo(i,nh);
			col+=1;
		}
		ctx.strokeStyle="#ddf";
		ctx.stroke();
		ctx.closePath();
		
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(nw,0);
		ctx.lineTo(nw,nh);
		ctx.lineTo(0,nh);
		ctx.lineTo(0,0);
		ctx.clip();
	
		// draw braille symbols
	
		for (var y in t.score) {
			if ((y>vsu-1) && (y<vsu+(nch+1)) && arrayHasOwnIndex(t.score,y)) {
				t.cellFont.drawScoreLine(
					(gw*(0-hsu))-hso,
					(gh*(y-vsu))-vso,
					t.score[y],
					hsu-7,
					hsu+ncw+1
				);
			}
		}
	
		ctx.restore(); // release clipping area
		
		// draw grid numbers
		// we're using row+1 and col+1 here because even though row and col are 0-based, we want the UI to be 1-based
		ctx.fillStyle="#ddf";
		ctx.textAlign="right";
		ctx.textBaseline="top";
		ctx.font="normal "+(gh*0.166)+"px sans-serif";
		row=vsu;
		for (i=gh-vso; i<=nh+gh; i+=gh) {
			if ((row>0) && ((row+1) % 10 === 0)) {
				ctx.fillText(row+1,gw-(gw*0.1),i-gh+(gw*0.1));
			}
			row+=1;
		}
		col=hsu;
		for (i=gw-hso; i<=nw+gw; i+=gw) {
			if ((col>0) && ((col+1) % 10 === 0)) {
				ctx.fillText(col+1,i-(gw*0.1),(gw*0.1));
			}
			col+=1;
		}
		
		// drawTranslationToggle
		var translationButtonColor = "#999";
		if (t.mouseIsOverTranslationToggle) {
			translationButtonColor = "#000";
		}
		ctx.strokeStyle=translationButtonColor;
		if (t.translateBraille) { ctx.fillStyle="#F00"; } else { ctx.fillStyle="#FFF"; }
		roundLeftRect(t.ctx,nw-50,nh-30,20,20,4,true,true);
		if (t.translateBraille) { ctx.fillStyle="#FFF"; } else { ctx.fillStyle=translationButtonColor; }
		ctx.font="normal 14px Bravura";
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.fillText("\ue1d5",nw-40,nh-16);
		if (t.translateBraille) { ctx.fillStyle="#FFF"; } else { ctx.fillStyle="#000"; }
		roundRightRect(t.ctx,nw-30,nh-30,20,20,4,true,true);
		if (t.translateBraille) { ctx.fillStyle=translationButtonColor; } else { ctx.fillStyle="#FFF"; }
		ctx.beginPath();
		ctx.arc(nw-22.5,nh-25,1.5,0,2*Math.PI,false);
		ctx.fill();
		ctx.closePath();
		ctx.beginPath();
		ctx.arc(nw-17.5,nh-25,1.5,0,2*Math.PI,false);
		ctx.fill();
		ctx.closePath();
		ctx.beginPath();
		ctx.arc(nw-17.5,nh-20,1.5,0,2*Math.PI,false);
		ctx.fill();
		ctx.closePath();
		ctx.beginPath();
		ctx.arc(nw-17.5,nh-15,1.5,0,2*Math.PI,false);
		ctx.fill();
		ctx.closePath();
		
		// draw border
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(nw-1,0);
		ctx.lineTo(nw-1,nh-1);
		ctx.lineTo(0,nh-1);
		ctx.lineTo(0,0);
		ctx.lineWidth=1;
		ctx.strokeStyle="#000";
		ctx.stroke();
		ctx.closePath();
		
	}
	
	setScore(x,y,val) {
		if (typeof val!=="undefined") {
			if (!(arrayHasOwnIndex(this.score,y)) || this.score[y]===null) {
				this.score[y] = [];
			}
			this.score[y][x] = String(val);
		}
	}

}

// cellFontModule class below is from js/notation.js
// with changes marked with "// ***"
class cellFontModule {
	constructor(whichCanvas, xml, whichViewer) { // *** add whichViewer
		this.myCanvas = whichCanvas;
		this.myViewer = whichViewer; // *** add line
		this.ctx = whichCanvas.getContext("2d");
		// this.translateBraille = true; // *** remove line
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
	getXMLFromScoreLine(scoreLine, row, doc) {
		var c = scoreLine;
		var newWord = true;
		var cells = [];
		var el;
		c.push("0");
		var col = 0;
		while (c.length) {
			var sym = this.findSymbol(c,newWord);
			if (sym.length) {
				el = doc.createElement("symbol");
				el.setAttribute("row",row);
				el.setAttribute("col",col);
				el.setAttribute("char",sym[0].char);
				cells.push(el);
				c=c.slice(sym[0].length());
				col += sym[0].length();
				if (sym[0].wordModifier) {
					newWord = true;
				} else {
					newWord = false;
				}
			} else {
				if (!cellValIsEmpty(c[0])) {
					el = doc.createElement("symbol");
					el.setAttribute("row",row);
					el.setAttribute("col",col);
					el.setAttribute("char","untranslated");
					el.setAttribute("val",c[0]);
					cells.push(el);
					newWord = false;
				} else {
					newWord = true;
				}
				col += 1;
				c = c.slice(1);
			}
		}
		return cells;
	}
	
	drawScoreLine(x,y,chars,startCell,endCell,ctx=this.ctx,gw=this.myViewer.gridWidth) { // *** added myViewer
		if (chars) {
			var c = chars.slice(Math.max(Math.floor(startCell),0),Math.ceil(endCell)+1);
			var newWord = true;
			c.push("0");
			var currentX = x+(gw*Math.max(startCell,0));
			while (c.length) {
				var sym = this.findSymbol(c,newWord);
				if (this.myViewer.translateBraille && sym.length) {
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
	addCellToScore(x, y, charName, val) {
		var c = this.cells.find(e => e.char==charName);
		if (c) {
			c.codes.forEach((code,i) => this.myViewer.setScore((x*1)+i, y, code));
		} else {
			this.myViewer.setScore(x, y, val);
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
		if (!this.myViewer.showSmallDots) { smallDotRadius=0; } // *** added myViewer
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

// cell class below is from js/notation.js
class cell {
	constructor(xml, root) {
		this.root = root;
		this.name = xml.getAttribute('name');
		this.char = xml.getAttribute('char');
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

// graphic class below is from js/control.js
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
		// var onScore = (ctx == notationArea.getContext("2d"));
		var a = this.attr;
		var d = this.root.defaults;
		var chars = [];
		var xx,yy,w,h,p,i,n,yp,c,o,x1,x2,x3,y1,y2,y3,m,co;
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
			'cells',
			'flipX',
			'flipY'
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
		
		if (a.hasOwnProperty('dashPattern')) {
			ctx.setLineDash(a.dashPattern.split(','));
		} else {
			ctx.setLineDash([]);
		}
		
		if (a.hasOwnProperty('coords')) {
			var coords = a.coords.split(';');
			for (i=0; i<coords.length; i++) {
				coords[i] = coords[i].split(',');
			}
		}

		if (a.hasOwnProperty('rotateCCW')) {
			ctx.rotate(270*(Math.PI/180));
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
		
		if (a.hasOwnProperty('rotateCW')) {
			ctx.rotate(90*(Math.PI/180));
			left = a.top * (1.5);
			top = a.left/-1.5;
			x = a.y * (1.5);
			y = a.x/-1.5;
			startX = a.startY * (1.5);
			startY = a.startX/-1.5;
			controlX = a.controlY * (1.5);
			controlY = a.controlX/-1.5;
			endX = a.endY * (1.5);
			endY = a.endX/-1.5;
		}
		
		if (a.hasOwnProperty('flipX')) {
			ctx.transform(-1,0,0,1,0,0);
			left = a.left * (-1);
			x = a.x * (-1);
			startX = a.startX * (-1);
			controlX = a.controlX * (-1);
			endX = a.endX * (-1);
		}
		
		if (a.hasOwnProperty('flipY')) {
			ctx.transform(1,0,0,-1,0,0);
			top = a.top * (-1);
			y = a.y * (-1);
			startY = a.startY * (-1);
			controlY = a.controlY * (-1);
			endY = a.endY * (-1);
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
					ctx.lineWidth=a.lineWidth*(boxHeight/100);
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
				ctx.lineWidth=a.lineWidth*(boxHeight/100);
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
			case "path":
				ctx.fillStyle=a.color;
				ctx.strokeStyle=a.strokeColor;
				ctx.lineWidth=a.lineWidth*(boxHeight/100);
				ctx.beginPath();
				ctx.moveTo(coords[0][0]*(boxWidth/100),coords[0][1]*(boxHeight/100));
				for (i=1; i<coords.length; i++) {
					ctx.lineTo(coords[i][0]*(boxWidth/100),coords[i][1]*(boxHeight/100));    
				}
				ctx.closePath();
				if (a.stroke="true") {
					ctx.stroke();
				}
				if (a.fill="true") {
					ctx.fill();
				}
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
				ctx.lineWidth=a.lineWidth*(boxHeight/100);
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
				ctx.lineWidth=a.lineWidth*(boxHeight/100);
				ctx.strokeStyle=a.color;
				ctx.beginPath();
				// ctx.setLineDash(dashPattern);
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
				ctx.fillStyle="#000"; // black
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
				// if ((a.color.toUpperCase()=="#FFF") && !onScore) {
				// 	ctx.strokeStyle="#666";
				// 	ctx.lineWidth=1;
				// 	ctx.strokeRect(
				// 		boxWidth*(0.05)+0.5,
				// 		boxWidth*(0.05)+0.5,
				// 		(boxWidth*c)-boxWidth*(0.1)-1,
				// 		(boxHeight)-boxWidth*(0.1)-1
				// 	);
				// }
		}
		ctx.restore();
	}
}

// **** utility functions

function arrayHasOwnIndex(array, prop) { // by T.J. Crowder, from http://stackoverflow.com/questions/9329446/for-each-in-an-array-how-to-do-that-in-javascript
	return array.hasOwnProperty(prop) && /^0$|^[1-9]\d*$/.test(prop) && prop <= 4294967294; // 2^32 - 2
}

function cellValIsEmpty(val) {
	return !(
		typeof(val) !== 'undefined' &&
		val !== null &&
		val !== "0" &&
		val != "32" &&
		val !== 0 &&
		val != 32
	);
}

function encodeForHTML(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getRandomString() {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function readParams(o) {
	var p,r=[];
	p=o.getElementsByTagName('param');
	for (var i=0; i<p.length; i++) {
		r[p[i].getAttribute('name')]=p[i].getAttribute('value');
	}
	return r;
}

function roundLeftRect(ctx, x, y, width, height, radius, fill, stroke) {
	 if (typeof stroke == "undefined" ) {
		stroke = true;
	}
	if (typeof radius === "undefined") {
		radius = 5;
	}
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width, y);
	ctx.lineTo(x + width, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
	if (stroke) {
		ctx.stroke();
	}
	if (fill) {
		ctx.fill();
	}
}

function roundRightRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke == "undefined" ) {
		stroke = true;
	}
	if (typeof radius === "undefined") {
		radius = 5;
	}
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x, y + height);
	ctx.lineTo(x, y);
	ctx.closePath();
	if (stroke) {
		ctx.stroke();
	}
	if (fill) {
		ctx.fill();
	}
}

Array.prototype.equals = function (array) {
	// if the other array is a falsy value, return
	if (!array)
		return false;

	// compare lengths - can save a lot of time
	if (this.length != array.length)
		return false;

	for (var i = 0, l=this.length; i < l; i++) {
		// Check if we have nested arrays
		if (this[i] instanceof Array && array[i] instanceof Array) {
			// recurse into the nested arrays
			if (!this[i].equals(array[i]))
				return false;
		}
		else if (this[i] != array[i]) {
			// Warning - two different object instances will never be equal: {x:20} != {x:20}
			return false;
		}
	}
	return true;
};
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});