// Braille Music Viewer by Toby W. Rush. For information and usage, visit <http://tobyrush.com/braillemusic/viewer/>.
/* global document, window, navigator: true */

var versionString = "0.9.1b";
var viewerCanvases = [];
var viewers = [];
// the following array starts at 32, so values should be accessed a brailleDots[theAsciiCode-32].
var brailleDots = [0,46,16,60,43,41,47,4,55,62,33,44,32,36,40,12,52,2,6,18,50,34,22,54,38,20,49,48,35,63,28,57,8,1,3,9,25,17,11,27,19,10,26,5,7,13,29,21,15,31,23,14,30,37,39,58,45,61,53,42,51,59,24,56];
var alternateNotationFormat = 0; // 0 = character description, 1 = dots description, 2 = braille character (for refreshable displays)
var alternateNotationAlertMessages = ["Alternate interface set to translated music characters.","Alternate interface set to braille character description.","Alternate interface set to braille."];
var ariaLiveID = "bmviewerstatus";
var ariaAlertElement = null;
var metaKeyDown = false;

function bmviewer(whichCanvas) {
	this.canvas = whichCanvas;
	this.emptyScore = true;
	this.score = [[]]; // y,x
    this.blankCells = [[]];
	this.notationGridHeight = 60;
	this.notationGridWidth = 40;
	this.interpretBraille = true;
	this.doNotCheckContiguousCells = false;
	this.hScroll = 0;
	this.vScroll = 0; // these values are in pixels
	this.mouseIsOverInfoButton = false;
	this.mouseIsOverTranslationToggle = false;
	this.showInfo = false;
	this.drawAllDots = false;
	this.scrollable = false;
	this.ctx = this.canvas.getContext("2d");
    this.metaKeyDown = false;
    this.passThrough = false;

	this.doNotationMouseWheel = function(e) {
		var v = this.wrapper;
		var deltaX=0;
		var deltaY=0;
		var resolution=1;
		if (v.scrollable) {
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

	this.doNotationMouseMove = function(e) {
		var localX = e.clientX-findPos(this).x;
		var localY = e.clientY-findPos(this).y;
		var v = this.wrapper;

		if (localX>=10 && localX<=30 && localY>=v.notationHeight-30 && localY<=v.notationHeight-10) {
			v.mouseIsOverInfoButton = true;
		} else {
			v.mouseIsOverInfoButton = false;
		}

		if (localX>=v.notationWidth-50 && localX<=v.notationWidth-10 && localY>=v.notationHeight-30 && localY<=v.notationHeight-10) {
			v.mouseIsOverTranslationToggle = true;
		} else {
			v.mouseIsOverTranslationToggle = false;
		}

		v.drawNotation();
	};

	this.doNotationMouseDown = function(e) {
		var localX = e.clientX-findPos(this).x;
		var localY = e.clientY-findPos(this).y;
		var v = this.wrapper;

		if (localX>=10 && localX<=30 && localY>=v.notationHeight-30 && localY<=v.notationHeight-10) {
			v.showInfo = !v.showInfo;
		}
		if (localX>=v.notationWidth-50 && localX<=v.notationWidth-10 && localY>=v.notationHeight-30 && localY<=v.notationHeight-10) {
			v.interpretBraille = !v.interpretBraille;
		}
		v.drawNotation();
	};

	this.canvas.wrapper = this;

	this.canvas.addEventListener("mousedown",this.doNotationMouseDown,false);
	this.canvas.addEventListener("mousemove",this.doNotationMouseMove,false);
	this.canvas.addEventListener("mousewheel",this.doNotationMouseWheel,false);
	this.canvas.addEventListener("DOMMouseScroll",this.doNotationMouseWheel,false); // because Firefox doesn't do mousewheel

	this.loadScore = function() {
		if (this.canvas.getAttribute("initialView")=="braille") {
			this.interpretBraille = false;
		}
		if (this.canvas.getAttribute("scrollable")=="true") {
			this.scrollable = true;
		}
		if (this.canvas.getAttribute("drawSmallDots")=="true") {
			this.drawAllDots = true;
		}
		if (this.canvas.getAttribute("initialAlternateInterface")=="character-description") {
			this.alternateNotationFormat = 1;
		} else {
			if (this.canvas.getAttribute("initialAlternateInterface")=="translation") {
				this.alternateNotationFormat = 2;
			}
		}
		if (this.canvas.hasAttribute("ariaLiveID")) {
			ariaLiveID = this.canvas.getAttribute("ariaLiveID");
		}
		var scoreSize = this.canvas.getAttribute("scoreSize");
		if (scoreSize !== undefined && scoreSize !== null) {
			this.notationGridHeight = scoreSize * 1;
			this.notationGridWidth = scoreSize * 0.66;
		}
		var data = this.canvas.getAttribute("value");

		this.initializeAlertElement();

		if (data === undefined || data === null) { // if no value attribute is present
			this.emptyScore = true;
		} else {
			this.emptyScore = false;

			var dataArray = data.split(',');
			var val, row=0, col=0;
			for (var i=0; i<dataArray.length; i++) {
				val=dataArray[i]*1;
				if ((val>96) && (val<123)) {
					val=val-32;
				}
				switch (val) {
					case 13:
						row++;
						col=0;
						if (data[i+1] == 10) {
							i++;
						}
						break;
					case 10:
						row++;
						col=0;
						break;
					case 32:
						col++;
						break;
					default:
						this.setScore(col,row,val);
						col++;
				}
			}
		}
	};

	this.setScore = function(x,y,val) {
		if (typeof val!=="undefined") {
			if (!(arrayHasOwnIndex(this.score,y)) || this.score[y]===null) {
				this.score[y] = [];
			}
			this.score[y][x] = val;
//		} else {
//			this.deleteScore(x,y);
		}
	};

	this.getScoreChar = function(x,y) {
		var char = "";
        if (this.score !== null && this.score[y] !== null && this.score[y][x] !== null) {
			char = this.score[y][x];
		}
		return String.fromCharCode(char);
	};

//	this.deleteScore = function(x,y) {
//		if (!arrayHasOwnIndex(this.score,y)) {
//			this.score[y] = [];
//		}
//		delete this.score[y][x];
//	};

	this.initializeNotation = function() {
 		this.canvas.width=this.canvas.clientWidth;
		this.canvas.height=this.canvas.clientHeight;
		this.drawNotation();
		this.generateAlternateNotation();
	};

	this.initializeAlertElement = function() {
		ariaAlertElement = document.getElementById(ariaLiveID);
		if (ariaAlertElement === null) {
			var alertNode = document.createElement("div");
			alertNode.setAttribute("id",ariaLiveID);
			alertNode.setAttribute("role","alert");
			alertNode.setAttribute("aria-live","assertive");
			document.getElementsByTagName('body')[0].appendChild(alertNode);
			ariaAlertElement = alertNode;
		}
	};

	this.generateAlternateNotation = function() {

		var tableNode = document.createElement("table");
		tableNode.setAttribute("border","1");
		//tableNode.setAttribute("class","antable");
		tableNode.setAttribute("style","position: absolute !important; clip: rect(1px 1px 1px 1px); font-size: 1px;");
		tableNode.setAttribute("aria-hidden","false");
		//tableNode.setAttribute("aria-live","polite"); // setting this seems to cause Safari to slow way down when navigating the table
		var sh = this.scoreHeight()-1;
		var sw = this.scoreWidth()-1;
		var rowNode = document.createElement("th");
		rowNode.setAttribute("colspan",sw);
		rowNode.innerHTML = "Braille music notation is presented in the following table. Press Control-U to change notation type.";
		tableNode.appendChild(rowNode);
		for (var y=0; y<=sh; y++) {
			rowNode = document.createElement("tr");
			for (var x=0; x<=sw; x++) {
				var cellNode = document.createElement("td");
				cellNode.setAttribute("class",y + "-" + x);
				rowNode.appendChild(cellNode);
			}
			tableNode.appendChild(rowNode);
		}

		this.canvas.parentNode.appendChild(tableNode);
		this.setAlternateNotation();

	};

	this.setAlternateNotation = function() {

		var sh = this.scoreHeight()-1;
		var sw = this.scoreWidth()-1;
		var anTable = this.canvas.parentNode.getElementsByClassName("antable")[0];
        var x,y;
		switch (alternateNotationFormat) {
			case 0:
				for (y=0; y<=sh; y++) {
					for (x=0; x<=sw; x++) {
						this.canvas.parentNode.getElementsByClassName(y + "-" + x)[0].innerHTML = this.getCharacterDescription(x,y);
					}
				}
				break;
			case 1:
				for (y=0; y<=sh; y++) {
					for (x=0; x<=sw; x++) {
						this.canvas.parentNode.getElementsByClassName(y + "-" + x)[0].innerHTML = this.getBrailleDescription(this.score[y][x]);
					}
				}
				break;
			case 2:
				for (y=0; y<=sh; y++) {
					for (x=0; x<=sw; x++) {
						this.canvas.parentNode.getElementsByClassName(y + "-" + x)[0].innerHTML = this.getScoreChar(x,y);
					}
				}
				break;
		}
	};

	this.getBrailleDescription = function(val) {
		var desc, z, code = brailleDots[(val % 100)-32];

		if (val === 0) {
			return "empty";
		} else {
			var r = [];

			if (code & 1) { // dot 1
				r.push("1 ");
			}
			if (code & 2) { // dot 2
				r.push("2 ");
			}
			if (code & 4) { // dot 3
				r.push("3 ");
			}
			if (code & 8) { // dot 4
				r.push("4 ");
			}
			if (code & 16) { // dot 5
				r.push("5 ");
			}
			if (code & 32) { // dot 6
				r.push("6 ");
			}

			if (r.length == 1) {
				desc = "dot ";
			} else {
				desc = "dots ";
			}
			for (z=0; z<r.length; z++) {
				desc = desc + r[z];
			}

			if (r.length === 0) {
				return "empty";
			} else {
				return desc;
			}

		}

	};

	this.drawNotation = function() {
		var t = this;
		t.clearNotationArea();

		var c = t.canvas;

		t.notationWidth = c.clientWidth;
		t.notationHeight = c.clientHeight;

		t.gridHeight = t.notationGridHeight;
		t.gridWidth = t.notationGridWidth;

		t.notationCellWidth = t.notationWidth/t.gridWidth;
		t.notationCellHeight = t.notationHeight/t.gridHeight;

		var gw=t.gridWidth;
		var gh=t.gridHeight;

		t.ctx.translate(0.5,0.5);

		t.setScrollVars();

		// draw grid
		t.ctx.beginPath();
		var row=t.vScrollUnits;
		for (var i=gh-t.vScrollOffset; i<t.notationHeight; i+=gh) {
			t.ctx.moveTo(0,i);
			t.ctx.lineTo(t.notationWidth,i);
			row+=1;
		}
		var col=t.hScrollUnits;
		for (i=gw-t.hScrollOffset; i<t.notationWidth; i+=gw) {
			t.ctx.moveTo(i,0);
			t.ctx.lineTo(i,t.notationHeight);
			col+=1;
		}
		t.ctx.strokeStyle="#ddf";
		t.ctx.stroke();
		t.ctx.closePath();

		// draw braille symbols
		t.blankCells = [[]]; // clear blanks

        for (var y in t.score) {
			if ((y>t.vScrollUnits-1) && (y<t.vScrollUnits+(t.notationCellHeight+1)) && arrayHasOwnIndex(t.score,y)) {
				for (var x in t.score[y]) {
					if ((x>t.hScrollUnits-1) && (x<t.hScrollUnits+(t.notationCellWidth+1)) && arrayHasOwnIndex(t.score[y],x)) {
						if (t.interpretBraille) {
							t.drawInterpretedBrailleSymbol(t.score[y][x],(gw*(x-t.hScrollUnits))-t.hScrollOffset,(gh*(y-t.vScrollUnits))-t.vScrollOffset,x,y);
						} else {
							if (t.score[y][x] !== null) {
								t.drawLiteralBrailleSymbol(t.score[y][x],(gw*(x-t.hScrollUnits))-t.hScrollOffset,(gh*(y-t.vScrollUnits))-t.vScrollOffset);
							}
						}
					}
				}
			}
		}

		// draw grid numbers
		// we're using row+1 and col+1 here because even though row and col are 0-based, we want the UI to be 1-based
		t.ctx.fillStyle="#ddf";
		t.ctx.textAlign="right";
		t.ctx.textBaseline="top";
		t.ctx.font="normal "+gh*0.166+"px sans-serif";
		//var row=t.vScrollUnits;
		for (i=gh-t.vScrollOffset; i<=t.notationHeight+gh; i+=gh) {
			if ((row>0) && ((row+1) % 10 === 0)) {
				t.ctx.fillText(row+1,gw-gw*0.1,i-gh+gh*0.1);
			}
			row+=1;
		}
		//var col=t.hScrollUnits;
		for (i=gw-t.hScrollOffset; i<=t.notationWidth+gw; i+=gw) {
			if ((col>0) && ((col+1) % 10 === 0)) {
				t.ctx.fillText(col+1,i-gw*0.1,gw*0.1);
			}
			col+=1;
		}

		// draw message if empty score
		if (t.emptyScore && !t.showInfo) {
			t.ctx.globalAlpha=0.7;
			t.ctx.fillStyle="#FFF";
			t.ctx.fillRect(0,0,t.notationWidth,t.notationHeight);
			t.ctx.globalAlpha=1;
			t.ctx.fillStyle="#666";
			t.ctx.textAlign="center";
			t.ctx.textBaseline="middle";
			t.ctx.font="normal "+gh*0.25+"px sans-serif";
			t.ctx.fillText("To display braille music, populate the \"value\" attribute of this canvas.",t.notationWidth/2,(t.notationHeight/2)-gh*0.17);
			t.ctx.fillText("For more information, visit http://tobyrush.com/braillemusic/viewer/.",t.notationWidth/2,(t.notationHeight/2)+gh*0.17);
		}

		// display info if showInfo

		if (t.showInfo) {
			var itf=Math.min(20,t.notationWidth*0.025);
			t.ctx.globalAlpha=0.7;
			t.ctx.fillStyle="#000";
			t.ctx.fillRect(0,t.notationHeight-40,t.notationWidth,t.notationHeight);
			t.ctx.globalAlpha=1;
			t.ctx.fillStyle="#FFF";
			t.ctx.textAlign="left";
			t.ctx.textBaseline="alphabetic";
			t.ctx.font="bold "+itf+"px sans-serif";
			t.ctx.fillText("Braille Music Viewer",40,(t.notationHeight-20)+(itf/3));
			t.ctx.font="normal "+itf*0.75+"px sans-serif";
			t.ctx.fillText("v"+versionString+" by Toby W. Rush · http://tobyrush.com/braillemusic/viewer",40+(itf*10),(t.notationHeight-20)+(itf/3));
		}


		// draw about icon
		var infoButtonColor = "#999";
        if (t.mouseIsOverInfoButton) {
			infoButtonColor = "#000";
		}
		//ctx.globalAlpha=0.7;
		t.ctx.fillStyle="#FFF";
		t.ctx.strokeStyle=infoButtonColor;
		t.ctx.lineWidth=1;
		t.ctx.beginPath();
		t.ctx.arc(20,t.notationHeight-20,10,0,2*Math.PI);
		t.ctx.fill();
		t.ctx.stroke();
		t.ctx.fillStyle=infoButtonColor;
		t.ctx.textAlign="center";
		t.ctx.textBaseline="middle";
		t.ctx.font="bold 15px serif";
		t.ctx.fillText("i",20,t.notationHeight-20);

		// drawTranslationToggle
		var translationButtonColor = "#999";
        if (t.mouseIsOverTranslationToggle) {
			translationButtonColor = "#000";
		}
		t.ctx.strokeStyle=translationButtonColor;
		if (t.interpretBraille) { t.ctx.fillStyle="#F00"; } else { t.ctx.fillStyle="#FFF"; }
		roundLeftRect(t.ctx,t.notationWidth-50,t.notationHeight-30,20,20,4,true,true);
		if (t.interpretBraille) { t.ctx.fillStyle="#FFF"; } else { t.ctx.fillStyle=translationButtonColor; }
		t.ctx.font="normal 14px Bravura";
		t.ctx.fillText("\ue1d5",t.notationWidth-40,t.notationHeight-16);
		if (t.interpretBraille) { t.ctx.fillStyle="#FFF"; } else { t.ctx.fillStyle="#000"; }
		roundRightRect(t.ctx,t.notationWidth-30,t.notationHeight-30,20,20,4,true,true);
		if (t.interpretBraille) { t.ctx.fillStyle=translationButtonColor; } else { t.ctx.fillStyle="#FFF"; }
		t.ctx.beginPath();
		t.ctx.arc(t.notationWidth-22.5,t.notationHeight-25,1.5,0,2*Math.PI,false);
		t.ctx.fill();
		t.ctx.closePath();
		t.ctx.beginPath();
		t.ctx.arc(t.notationWidth-17.5,t.notationHeight-25,1.5,0,2*Math.PI,false);
		t.ctx.fill();
		t.ctx.closePath();
		t.ctx.beginPath();
		t.ctx.arc(t.notationWidth-17.5,t.notationHeight-20,1.5,0,2*Math.PI,false);
		t.ctx.fill();
		t.ctx.closePath();
		t.ctx.beginPath();
		t.ctx.arc(t.notationWidth-17.5,t.notationHeight-15,1.5,0,2*Math.PI,false);
		t.ctx.fill();
		t.ctx.closePath();


		// draw border
		t.ctx.beginPath();
		t.ctx.moveTo(0,0);
		t.ctx.lineTo(t.notationWidth-1,0);
		t.ctx.lineTo(t.notationWidth-1,t.notationHeight-1);
		t.ctx.lineTo(0,t.notationHeight-1);
		t.ctx.lineTo(0,0);
		t.ctx.lineWidth=1;
		t.ctx.strokeStyle="#000";
		t.ctx.stroke();
		t.ctx.closePath();

	};

	this.clearNotationArea = function() {
		this.canvas.width = this.canvas.clientWidth;
	};

	this.setScrollVars = function() {
		this.hScrollOffset = this.hScroll % this.gridWidth;
		this.vScrollOffset = this.vScroll % this.gridHeight;
		this.hScrollUnits = Math.floor(this.hScroll/this.gridWidth);
		this.vScrollUnits = Math.floor(this.vScroll/this.gridHeight);
	};

	this.drawCellBackground = function(x,y,color) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		ctx.fillStyle=color;
		ctx.fillRect(x+gw*0.05,y+gw*0.05,gw-gw*0.1,gh-gw*0.1);
	};

	this.drawMultiCellBackground = function(x,y,col,row,color,cells) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		ctx.fillStyle=color;
		ctx.fillRect(x+gw*0.05,y+gw*0.05,(gw*cells)-gw*0.1,gh-gw*0.1);
        this.setBlankCells(col,row,cells);
	};

	this.drawCellNote = function(x,y,char) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		ctx.font = "normal "+gh*0.5+"px Bravura";
		ctx.fillStyle="#FFF"; // white
		ctx.textBaseline = "alphabetic";
		ctx.textAlign = "right";
		ctx.fillText(char,x+gw-gw*0.2,y+gh-gh*0.2); // draw note
	};

	this.drawCellNoteName = function(x,y,char) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		ctx.font = "normal "+gh*0.3+"px sans-serif";
		ctx.textAlign = "left";
		ctx.fillText(char,x+gw*0.15,y+gh*0.333);
	};

	this.drawMultiCellNote = function (x,y,char,cells) {
        var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		ctx.font = "normal "+gh*0.5+"px Bravura";
        ctx.fillStyle="#FFF"; // white
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "right";
        ctx.fillText(char,x+gw*(0.8+(cells-1)/2),y*0.8); // draw note
    };

    this.drawCellChordSymbol = function(x,y,char) {
        var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		var chars=['\ue872','\ue870','\ue871','\ue873'];
        ctx.font = "normal "+gh*0.5+"px Bravura";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        if (char==3) {
            ctx.fillStyle = "#FFF"; // white
            ctx.fillRect(x+gw*0.01,y+gw*0.01,gw*1.98,gh-gw*0.02);
            ctx.fillStyle = "#000"; // black
            ctx.fillText(chars[char-1],x+gw,y+gh*0.5);
        } else {
            ctx.fillStyle = "#000"; // black
            ctx.fillText(chars[char-1],x+gw*0.5,y+gh*0.5);
        }
    };

    this.drawCellASCII = function(x,y,col,row,char,ascii) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		ctx.fillStyle = "#000"; // black
		if (char.length==1) {
			ctx.font = "normal "+gh*0.5+"px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(char,x+gw*0.5,y+gh*0.5);
		} else if (char.length>1 && char.length<=3) {
//			ctx.save();
//			ctx.translate(x,y+gh);
//			ctx.rotate(-Math.PI/2);
			ctx.textAlign="center";
			ctx.textBaseline="middle";
			ctx.font = "normal "+gh*0.3+"px sans-serif";
			ctx.fillText(char,x+gw*0.5,y+gh*0.5);
			ctx.restore();
		} else if (char=="capital sign") {
			ctx.save();
			ctx.translate(x,y+gh);
			ctx.rotate(-Math.PI/2);
			ctx.textAlign="center";
			ctx.textBaseline="middle";
			ctx.font = "normal "+gh*0.2+"px sans-serif";
			ctx.fillText("CAPITAL",gh*0.5,gw*0.3);
			ctx.fillText("LETTER",gh*0.5,gw*0.7);
			ctx.restore();
		} else if (char=="text sign") {
			ctx.save();
			ctx.translate(x,y+gh);
			ctx.rotate(-Math.PI/2);
			ctx.textAlign="center";
			ctx.textBaseline="middle";
			ctx.font = "normal "+gh*0.2+"px sans-serif";
			ctx.fillText("BRAILLE",gh*0.5,gw*0.3);
			ctx.fillText("TEXT",gh*0.5,gw*0.7);
			ctx.restore();
        } else if (char.length>3) {
            ctx.save();
            ctx.translate(x,y+gh);
            ctx.rotate(-Math.PI/2);
            ctx.textAlign="center";
            ctx.textBaseline="middle";
            ctx.font = "normal "+gh*0.3+"px sans-serif";
            ctx.fillText(char,gh*0.5,gw*0.5);
            ctx.restore();
		} else {
			this.drawLiteralBrailleSymbol(ascii,x,y,col,row);
		}
	};

	this.drawMultiCellASCII = function (x,y,col,row,cellCount,char,ascii) {

        var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;
        this.drawMultiCellBackground(ctx,x,y,col,row,"#fff",cellCount);
        ctx.fillStyle = "#000"; // black
        ctx.font = "normal "+gh*0.3+"px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(char,x+gw*0.5*cellCount,y+gh*0.5);
    };

    this.drawCellOctaveRange = function(x,y,val) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		this.drawCellBackground(x,y,"#929");
		ctx.fillStyle="#FFF"; // white
		ctx.save();
		ctx.translate(x,y+gh);
		ctx.rotate(-Math.PI/2);
		ctx.textAlign="center";
		ctx.textBaseline="top";
		ctx.font = "normal "+gh*0.166+"px sans-serif";
		ctx.fillText("OCTAVE",gh*0.5,gw*0.075);
		ctx.restore();
		ctx.font = "bold "+gh*0.6+"px sans-serif";
		ctx.textAlign="right";
		ctx.textBaseline="middle";
		ctx.fillText(val,x+gw-gw*0.075,y+gh*0.5);
	};

	this.drawCellTimeSignatureNumber = function(x,y,val,isTop) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		this.drawCellBackground(x,y,"#070"); // green
		ctx.fillStyle="#FFF"; // white
		ctx.font = "normal "+gh*0.5+"px Bravura";
		ctx.textBaseline = "alphabetic";
		ctx.textAlign = "center";
		var char = ['\ue080','\ue081','\ue082','\ue083','\ue084','\ue085','\ue086','\ue087','\ue088','\ue089'];
		if (isTop) {
			ctx.fillText(char[val],x+gw*0.5,y+gh*0.333);
			ctx.fillStyle="#7B7";
			ctx.font = "bold italic "+gh*0.5+"px serif";
			ctx.fillText("x",x+gw*0.5,y+gh*0.77);
		} else {
			ctx.fillText(char[val],x+gw*0.5,y+gh*0.666);
			ctx.fillStyle="#7B7";
			ctx.font = "bold italic "+gh*0.5+"px serif";
			ctx.fillText("x",x+gw*0.5,y+gh*0.43);
		}
	};

	this.drawCellArticulation = function(x,y,col,row,val) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		if (val==1 || val==7 || val > 9) {
			this.drawCellBackground(x,y,"#7f462c"); // mocha
		} else {
			this.drawMultiCellBackground(x,y,col,row,"#7f462c",2); // mocha
		}
		ctx.fillStyle="#FFF"; // white
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		switch (val) {
			case 1: // staccato
				ctx.font = "normal "+gh*0.6+"px Bravura";
				ctx.fillText("\ue4a2",x+gw*0.5,y+gh*0.6);
				break;
			case 2: // tenuto
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.fillText("\ue4a4",x+gw,y+gh*0.6);
				break;
			case 3: // accent
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.fillText("\ue4a0",x+gw,y+gh*0.6);
				break;
			case 4: // marcato
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.fillText("\ue4ac",x+gw,y+gh*0.6);
				break;
			case 5: // fermata
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.fillText("\ue4c0",x+gw,y+gh*0.6);
				break;
			case 6: // pause
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.fillText("\ue4ce",x+gw,y+gh*0.6);
				break;
			case 7: // trill
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.fillText("\ue566",x+gw*0.5,y+gh*0.6);
				break;
			case 8: // up bow
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.fillText("\ue612",x+gw,y+gh*0.6);
				break;
			case 9: // down bow
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.fillText("\ue610",x+gw,y+gh*0.6);
				break;
			case 10: // fingering change
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.fillText("\ue577",x+gw*0.5,y+gh*0.3);
				break;
			case 11: // fingering 1
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.fillText("\uea51",x+gw*0.5,y+gh*0.6);
				break;
			case 12: // fingering 2
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.fillText("\uea52",x+gw*0.5,y+gh*0.6);
				break;
			case 13: // fingering 3
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.fillText("\uea54",x+gw*0.5,y+gh*0.6);
				break;
			case 14: // fingering 4
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.fillText("\uea55",x+gw*0.5,y+gh*0.6);
				break;
			case 15: // fingering 5
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.fillText("\uea57",x+gw*0.5,y+gh*0.6);
				break;
		}
	};

	this.drawCellSimpleDynamic = function(x,y,col,row,val) {
		var char, size;
        var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

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
        this.drawMultiCellBackground(x,y,col,row,"#0FF",size); // cyan

		ctx.fillStyle="#000"; // black
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.font = "normal "+gh*0.7+"px Bravura";
		ctx.fillText(char,x+gw*(size/2),y+gh*0.6);
	};

	this.drawCellHairpinDynamic = function(x,y,col,row,val) {
		var text, cresc, ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		if (val<5) {
            this.drawMultiCellBackground(x,y,col,row,"#0FF",2); // cyan
        } else {
            this.drawMultiCellBackground(x,y,col,row,"#0FF",3); // cyan
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
		ctx.font = "normal "+gh*0.2+"px sans-serif";
		if (val<5) {
            ctx.fillText(text,x+gw,y+gh*0.4);
            ctx.beginPath();
            if (cresc) {
                ctx.moveTo(x+gw*1.5,y+gh*0.55);
                ctx.lineTo(x+gw*0.5,y+gh*0.65);
                ctx.lineTo(x+gw*1.5,y+gh*0.75);
            } else {
                ctx.moveTo(x+gw*0.5,y+gh*0.55);
                ctx.lineTo(x+gw*1.5,y+gh*0.65);
                ctx.lineTo(x+gw*0.5,y+gh*0.75);
            }
            ctx.lineWidth=1;
            ctx.strokeStyle="#000";
            ctx.stroke();
            ctx.closePath();
        } else {
            ctx.fillText(text,x+gw*1.5,y+gh*0.4);
            ctx.beginPath();
            if (cresc) {
                ctx.moveTo(x+gw*2.5,y+gh*0.55);
                ctx.lineTo(x+gw*0.5,y+gh*0.65);
                ctx.lineTo(x+gw*2.5,y+gh*0.75);
            } else {
                ctx.moveTo(x+gw*0.5,y+gh*0.55);
                ctx.lineTo(x+gw*2.5,y+gh*0.65);
                ctx.lineTo(x+gw*0.5,y+gh*0.75);
            }
            ctx.lineWidth=1;
            ctx.strokeStyle="#000";
            ctx.stroke();
            ctx.closePath();
        }
	};

	this.drawCellTextDynamic = function(x,y,col,row,val) {
		var char, size, ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

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
		this.drawMultiCellBackground(x,y,col,row,"#0FF",size); // cyan

		ctx.fillStyle="#000"; // black
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.font = "italic "+gh*0.5+"px serif";
		ctx.fillText(char,x+gw*(size/2),y+gh*0.5);
	};


	this.drawMetronomeMarkingEquals = function(x,y,col,row) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		this.drawMultiCellBackground(x,y,col,row,"#000",2); // 2 cells black
		ctx.fillStyle = "#FFF"; // white
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.font = "normal "+gw*0.3+"px sans-serif";
		ctx.fillText("M.M.",x+gw,y+gh*0.25);
		ctx.font = "normal "+gw*0.75+"px sans-serif";
		ctx.fillText("=",x+gw,y+gh*0.55);
	};

	this.drawInAccord = function(x,y,col,row,val) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		this.drawMultiCellBackground(x,y,col,row,"#000",2); // black

		ctx.fillStyle="#FFF"; // black
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";

		switch (val) {
			case 1: // in-accord
				ctx.font = "normal "+gh*0.65+"px Bravura";
				ctx.fillText("\ue030",x+gw*0.5,y+gh*0.825);
				ctx.fillText("\ue030",x+gw*1.5,y+gh*0.825);
				ctx.font = "normal "+gh*0.3+"px Bravura";
				ctx.fillText("\ue1d3 \ue1d3",x+gw,y+gh*0.43);
				ctx.fillText("\ue1d2   ",x+gw*1.05,y+gh*0.57);
				break;
			case 2: // measure division
				ctx.font = "normal "+gh*0.2+"px sans-serif";
				ctx.fillText("MEASURE",x+gw,y+gh*0.4);
				ctx.fillText("DIVISION",x+gw,y+gh*0.6);
				break;
			case 3: // partial measure in-accord
				ctx.font = "normal "+gh*0.3+"px Bravura";
				ctx.fillText("\ue1f0\ue1f7 \ue1f2",x+gw,y+gh*0.43);
				ctx.fillText("\ue1d6  ",x+gw,y+gh*0.57);
				break;
		}
	};

	this.drawCellTupletNumber = function(x,y,val) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		this.drawCellBackground(x,y,"#FF0"); // yellow
		ctx.fillStyle="#000"; // black
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		switch (val) {
			case -3: // triplet
				ctx.font = "normal "+gh*0.4+"px Bravura";
				ctx.fillText("\ue1fe",x+gw*0.2,y+gh*0.9);
				ctx.fillText("\ue1ff",x+gw*0.3,y+gh*0.9);
				ctx.fillText("\ue200",x+gw*0.6,y+gh*0.9);

				break;
			case -2: // suffix
				ctx.font = "normal "+gh*0.5+"px Bravura";
				ctx.fillText("\ue200",x+gw*0.4,y+gh);
				break;
			case -1: // prefix
				ctx.font = "normal "+gh*0.5+"px Bravura";
				ctx.fillText("\ue1fe",x+gw*0.4,y+gh);
				break;
			default: // tuplet number
				ctx.font = "normal "+gh*0.5+"px Bravura";
				var char = ['\ue880','\ue881','\ue882','\ue883','\ue884','\ue885','\ue886','\ue887','\ue888','\ue889'];
				ctx.fillText(char[val],x+gw*0.5,y+gh*0.6);
		}
	};

	this.drawCellKeySigMultiplier = function(x,y,val) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		this.drawCellBackground(x,y,"#00F"); // blue
		ctx.fillStyle="#FFF";
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.font = "bold "+gh*0.4+"px sans-serif";
		ctx.fillText(val + "×",x+gw*0.5,y+gh*0.5);
	};

	this.drawCellClef = function(x,y,col,row,val) {
		var char, size, clefHeight, ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

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
		this.drawMultiCellBackground(x,y,col,row,"#0F0",size); // lt green

		ctx.fillStyle="#000"; // black
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.font = "normal "+gh*0.5+"px Bravura";
		ctx.fillText("\ue014\ue014",x+gw*(size/2),y+gh*0.75);
		ctx.fillText(char,x+gw*(size/2),y+gh*0.75-gh*(clefHeight*0.122));
	};

	this.drawCellInterval = function(x,y,val) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		this.drawCellBackground(x,y,"#FAF"); // pink
		ctx.fillStyle="#000";
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.font = "bold "+gh*0.3+"px sans-serif";
		var char = ['','','2nd','3rd','4th','5th','6th','7th','8ve'];
		ctx.fillText(char[val],x+gw*0.5,y+gh*0.6);
		ctx.textBaseline="top";
		ctx.fillText("+",x+gw*0.5,y+gh*0.1);
	};

	this.drawCellTextLabel = function(x,y,col,row,firstLine,secondLine,fillColor,textColor,size) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		if (size>1) {
			this.drawMultiCellBackground(x,y,col,row,fillColor,size);
			ctx.fillStyle=textColor;
			ctx.textAlign="center";
			ctx.textBaseline="middle";
			ctx.font = "normal "+gh*0.2+"px sans-serif";
			ctx.fillText(firstLine,x+gw*(size/2),y+gh*0.35);
			ctx.fillText(secondLine,x+gw*(size/2),y+gh*0.65);
		} else {
			this.drawCellBackground(x,y,fillColor);
			ctx.fillStyle=textColor;
			ctx.save();
			ctx.translate(x,y+gh);
			ctx.rotate(-Math.PI/2);
			ctx.textAlign="center";
			ctx.textBaseline="middle";
			ctx.font = "normal "+gh*0.17+"px sans-serif";
			ctx.fillText(firstLine,gh*0.5,gw*0.35);
			ctx.fillText(secondLine,gh*0.5,gw*0.65);
			ctx.restore();
		}
	};

	this.setBlankCells = function (col,row,cells) {
        for (var i=1; i<cells; i++) {
            if (!(arrayHasOwnIndex(this.blankCells,row)) || this.blankCells[row]===null) {
                this.blankCells[row] = [];
            }
            this.blankCells[row][+col+i] = true;
        }
    };

    this.isBlank = function(col,row) {
        if ((col === null) ||
            (row === null) ||
            (typeof this.blankCells[row]==='undefined') ||
            (typeof this.blankCells[row][col]==='undefined')) {
            return 0;
        } else {
            return this.blankCells[row][col];
        }
    };

    this.checkContiguousCells = function(col,row,cells) {
		var t=this;
        if (t.doNotCheckContiguousCells) {
			return true;
		} else {
			var len = cells.length;
			var matches = true;
			for (var i=0; i<len; i++) {
				if ((row>=t.score.length) ||
                    (+col+i>=t.score[row].length && cells[i]!=-1) ||
                    (!(compareCell(t.score[row][+col+i],cells[i])) &&
                     !((typeof t.score[row][+col+i] == 'undefined') &&
                      (cells[i] === 0)))) {
					matches=false;
				}
			}
			return matches;
		}
	};

	this.checkPreviousCell = function(col,row,cell) {
		return ((compareCell(this.score[row][+col-1],cell)) || ((typeof this.score[row][+col-1] == 'undefined') && (cell === 0)));
	};

	this.drawLiteralBrailleSymbol = function(val,x,y,col,row) {
		var ctx = this.ctx;
		var gh = this.gridHeight;
		var gw = this.gridWidth;

		var code = brailleDots[(val % 100)-32];
		var col1 = x+gw*0.333;
		var col2 = x+gw*0.666;
		var row1 = y+gh*0.25;
		var row2 = y+gh*0.5;
		var row3 = y+gh*0.75;
		var largeDotRadius = gh*0.066;
		var smallDotRadius = gh*0.033;

		if (!this.interpretBraille || !this.isBlank(col,row)) {
            ctx.fillStyle = "#000";
            ctx.beginPath();
                if (code & 1) { // dot 1
                    ctx.arc(col1,row1,largeDotRadius,0,2*Math.PI,false);
                    ctx.fill();
                } else if (this.drawAllDots) {
                    ctx.arc(col1,row1,smallDotRadius,0,2*Math.PI,false);
                    ctx.fill();
                }
            ctx.closePath();

            ctx.beginPath();
                if (code & 2) { // dot 2
                    ctx.arc(col1,row2,largeDotRadius,0,2*Math.PI,false);
                    ctx.fill();
                } else if (this.drawAllDots) {
                    ctx.arc(col1,row2,smallDotRadius,0,2*Math.PI,false);
                    ctx.fill();
                }
            ctx.closePath();

            ctx.beginPath();
                if (code & 4) { // dot 3
                    ctx.arc(col1,row3,largeDotRadius,0,2*Math.PI,false);
                    ctx.fill();
                } else if (this.drawAllDots) {
                    ctx.arc(col1,row3,smallDotRadius,0,2*Math.PI,false);
                    ctx.fill();
                }
            ctx.closePath();

            ctx.beginPath();
                if (code & 8) { // dot 4
                    ctx.arc(col2,row1,largeDotRadius,0,2*Math.PI,false);
                    ctx.fill();
                } else if (this.drawAllDots) {
                    ctx.arc(col2,row1,smallDotRadius,0,2*Math.PI,false);
                    ctx.fill();
                }
            ctx.closePath();

            ctx.beginPath();
                if (code & 16) { // dot 5
                    ctx.arc(col2,row2,largeDotRadius,0,2*Math.PI,false);
                    ctx.fill();
                } else if (this.drawAllDots) {
                    ctx.arc(col2,row2,smallDotRadius,0,2*Math.PI,false);
                    ctx.fill();
                }
            ctx.closePath();

            ctx.beginPath();
                if (code & 32) { // dot 6
                    ctx.arc(col2,row3,largeDotRadius,0,2*Math.PI,false);
                    ctx.fill();
                } else if (this.drawAllDots) {
                    ctx.arc(col2,row3,smallDotRadius,0,2*Math.PI,false);
                    ctx.fill();
                }
            ctx.closePath();
        }

	};

	this.drawInterpretedBrailleSymbol = function(val,x,y,col,row) {
		var t = this;
		var ctx = t.ctx;
		var gh = t.gridHeight;
		var gw = t.gridWidth;
        var chars=[];

		// center text as default
		ctx.textAlign="center";
		ctx.textBaseline="middle";

		if (val==33) { // A whole note
			if (t.checkContiguousCells(col,row,[val,75])) {
                t.drawMultiCellBackground(x,y,col,row,"#F00",2); // 2 cells red
                t.drawMultiCellNote(x,y,"\ue1d0",2);
                t.drawCellNoteName(x,y,"A");
            } else {
                t.drawCellBackground(x,y,"#F00");
                t.drawCellNote(x,y,"\ue1d2");
                t.drawCellNoteName(x,y,"A");
            }

		} else if (val==34) { // octave 4
			t.drawCellOctaveRange(x,y,"4");

		} else if (val==35) { // time sig prefix
			t.drawCellTextLabel(x,y,col,row,"METER","PREFIX","#070","#FFF",1);

		} else if (val==36) { // E quarter note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d5");
			t.drawCellNoteName(x,y,"E");

		} else if (val==37) { // sharp
			if (t.checkContiguousCells(col,row,[37,337])) {
				t.drawMultiCellBackground(x,y,col,row,"#F80",2); // 2 cells orange
				ctx.fillStyle="#000"; // black
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.textBaseline = "alphabetic";
				ctx.fillText("\ue263",x+gw*1.05,y+gh*0.5);
			} else {
				t.drawCellBackground(x,y,"#F80"); //orange
				ctx.fillStyle="#000"; // black
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.textBaseline = "alphabetic";
				ctx.fillText("\ue262",x+gw*0.55,y+gh*0.5);
			}

		} else if (val==38) { // E whole note
			if (t.checkContiguousCells(col,row,[val,75])) {
                t.drawMultiCellBackground(x,y,col,row,"#F00",2); // 2 cells red
                t.drawMultiCellNote(x,y,"\ue1d0",2);
                t.drawCellNoteName(x,y,"E");
            } else {
                t.drawCellBackground(x,y,"#F00");
                t.drawCellNote(x,y,"\ue1d2");
                t.drawCellNoteName(x,y,"E");
            }

		} else if (val==39) { // augmentation dot
			t.drawCellBackground(x,y,"#F00");
			ctx.font = "normal "+gh*0.5+"px Bravura";
			ctx.fillStyle="#FFF"; // white
			ctx.textBaseline = "alphabetic";
			ctx.textAlign = "right";
			ctx.fillText("\ue1e7",x+gw*0.55,y+gh*0.533); // draw note

		} else if (val==40) { // G whole note
			if (t.checkContiguousCells(col,row,[val,75])) {
                t.drawMultiCellBackground(x,y,col,row,"#F00",2); // 2 cells red
                t.drawMultiCellNote(x,y,"\ue1d0",2);
                t.drawCellNoteName(x,y,"G");
            } else {
                t.drawCellBackground(x,y,"#F00");
                t.drawCellNote(x,y,"\ue1d2");
                t.drawCellNoteName(x,y,"G");
            }

		} else if (val==41) { // B whole note
			if (t.checkContiguousCells(col,row,[val,75])) {
                t.drawMultiCellBackground(x,y,col,row,"#F00",2); // 2 cells red
                t.drawMultiCellNote(x,y,"\ue1d0",2);
                t.drawCellNoteName(x,y,"B");
            } else {
                t.drawCellBackground(x,y,"#F00");
                t.drawCellNote(x,y,"\ue1d2");
                t.drawCellNoteName(x,y,"B");
            }

		} else if (val==42) { // natural
			t.drawCellBackground(x,y,"#F80"); //orange
			ctx.fillStyle="#000"; // black
			ctx.font = "normal "+gh*0.8+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillText("\ue261",x+gw*0.55,y+gh*0.5);

		} else if (val==43) { // interval 3rd
			t.drawCellInterval(x,y,3);

		} else if (val==44) { // octave 7
			if (t.checkContiguousCells(col,row,[44,144])) { // octave 8
				t.drawMultiCellBackground(x,y,col,row,"#929",2); // 2 cells purple
				t.drawCellOctaveRange(x+gw*0.5,y,"8");
			} else if (t.checkPreviousCell(col,row,144) === false) {
				t.drawCellOctaveRange(x,y,"7");
			}

		} else if (val==45) { // interval 8ve
			t.drawCellInterval(x,y,8);

		} else if (val==46) { // octave 5
			t.drawCellOctaveRange(x,y,"5");

		} else if (val==47) { // interval 2nd
			t.drawCellInterval(x,y,2);

		} else if (val==48) { // time signature bottom 0
			t.drawCellTimeSignatureNumber(x,y,0,false);

		} else if (val>=49 && val<=57) { // time signature bottom numbers
			t.drawCellTimeSignatureNumber(x,y,val-48,false);

		} else if (val==58) { // D quarter note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d5");
			t.drawCellNoteName(x,y,"D");

		} else if (val==59) { // octave 6
			t.drawCellOctaveRange(x,y,"6");

		} else if (val==60) { // flat
			if (t.checkContiguousCells(col,row,[60,360])) {
				t.drawMultiCellBackground(x,y,col,row,"#F80",2); // 2 cells orange
				ctx.fillStyle="#000"; // black
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.textBaseline = "alphabetic";
				ctx.fillText("\ue264",x+gw*1.05,y+gh*0.6);
			} else {
				t.drawCellBackground(x,y,"#F80"); //orange
				ctx.fillStyle="#000"; // black
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.textBaseline = "alphabetic";
				ctx.fillText("\ue260",x+gw*0.55,y+gh*0.6);
			}

		} else if (val==61) { // F whole note
			if (t.checkContiguousCells(col,row,[val,75])) {
                t.drawMultiCellBackground(x,y,col,row,"#F00",2); // 2 cells red
                t.drawMultiCellNote(x,y,"\ue1d0",2);
                t.drawCellNoteName(x,y,"F");
            } else {
                t.drawCellBackground(x,y,"#F00");
                t.drawCellNote(x,y,"\ue1d2");
                t.drawCellNoteName(x,y,"F");
            }

		} else if (val==62) { // text prefix
			t.drawCellTextLabel(x,y,col,row,"WORD","PREFIX","#000","#FFF",1);


		} else if (val==63) { // C quarter note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d5");
			t.drawCellNoteName(x,y,"C");

		} else if (val==64) { // octave 1
			if (t.checkContiguousCells(col,row,[64,164])) { // octave 0
				t.drawMultiCellBackground(x,y,col,row,"#929",2); // 2 cells purple
				t.drawCellOctaveRange(x+gw*0.5,y,"0");
			} else {
				t.drawCellOctaveRange(x,y,"1");
			}

		} else if (val==67) { // short slur
			if (t.checkPreviousCell(col,row,259) === false) {
                t.drawCellBackground(x,y,"#FF0"); // yellow
                ctx.beginPath();
                ctx.arc(x+gw*0.5,y+gh*0.6,gh*0.25,1.25*Math.PI,1.75*Math.PI,false);
                ctx.lineWidth=gh*0.033;
                ctx.strokeStyle = "#000"; // black
                ctx.stroke();
                ctx.closePath();
                ctx.fillStyle = "#000"; // black
                ctx.textAlign="center";
                ctx.textBaseline="middle";
                ctx.font = "normal "+gw*0.2+"px sans-serif";
                ctx.fillText("SLUR",x+gw*0.5,y+gh*0.7);
            }

		} else if (val>=68 && val<=74) { // eighth notes
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d7");
			chars=['C','D','E','F','G','A','B'];
			t.drawCellNoteName(x,y,chars[val-68]);

		} else if (val==76) { // forced barline
			t.drawCellBackground(x,y,"#222");
			ctx.font = "normal "+gh*0.6+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue030",x+gw*0.5,y+gh*0.8);

		} else if (val==77) { // whole rest
			ctx.font = "normal "+gh*0.6+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillStyle = "#FFF"; // white
			if (t.checkContiguousCells(col,row,[val,75])) {
                t.drawMultiCellBackground(x,y,col,row,"#F00",2); // 2 cells red
                ctx.fillText("\ue4f4",x+gw*0.5,y+gh*0.5);
            } else {
                t.drawCellBackground(x,y,"#F00");
                ctx.fillText("\ue4f4",x+gw*0.5,y+gh*0.5);
            }

		} else if (val>=78 && val<=84) { // half notes
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d3");
			chars=['C','D','E','F','G','A','B'];
			t.drawCellNoteName(x,y,chars[val-78]);

		} else if (val==85) { // half rest
			t.drawCellBackground(x,y,"#F00");
			ctx.font = "normal "+gh*0.6+"px Bravura";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue4f5",x+gw*0.5,y+gh*0.5);

		} else if (val==86) { // quarter rest
			t.drawCellBackground(x,y,"#F00");
			ctx.font = "normal "+gh*0.6+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue4e5",x+gw*0.5,y+gh*0.5);

		} else if (val==87) { // B quarter note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d5");
			t.drawCellNoteName(x,y,"B");

		} else if (val==88) { // eighth rest
			t.drawCellBackground(x,y,"#F00");
			ctx.font = "normal "+gh*0.6+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue4e6",x+gw*0.5,y+gh*0.5);

		} else if (val>=89 && val<=90) { // C and D whole notes
			chars=['C','D'];
			if (t.checkContiguousCells(col,row,[val,75])) {
                t.drawMultiCellBackground(x,y,col,row,"#F00",2); // 2 cells red
                t.drawMultiCellNote(x,y,"\ue1d0",2);
                t.drawCellNoteName(x,y,chars[val-89]);
            } else {
                t.drawCellBackground(x,y,"#F00");
                t.drawCellNote(x,y,"\ue1d2");
                t.drawCellNoteName(x,y,chars[val-89]);
            }

		} else if (val==91) { // A quarter note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d5");
			t.drawCellNoteName(x,y,"A");

		} else if (val==92) { // G quarter note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d5");
			t.drawCellNoteName(x,y,"G");

		} else if (val==93) { // F quarter note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d5");
			t.drawCellNoteName(x,y,"F");

		} else if (val==94) { // octave 2
			t.drawCellOctaveRange(x,y,"2");

		} else if (val==95) { // octave 3
			t.drawCellOctaveRange(x,y,"3");

		} else if (val==133) { // A 16th note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d9");
			t.drawCellNoteName(x,y,"A");

		} else if (val==134) { // play section #
			if (t.checkContiguousCells(col,row,[134,243])) {
				t.drawCellTextLabel(x,y,col,row,"PLAY","SECTION #","#000","#FFF",2); // white on black
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==135) { // interval 4th
			t.drawCellInterval(x,y,4);

		} else if (val==136) { // E 64th note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1dd");
			t.drawCellNoteName(x,y,"E");

		} else if (val==137) { // key signature sharp
			t.drawCellBackground(x,y,"#00F"); // blue
			ctx.fillStyle="#FFF"; // white
			ctx.font = "normal "+gh*0.8+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillText("\ue262",x+gw*0.55,y+gh*0.5);

		} else if (val==138) { // E 16th note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d9");
			t.drawCellNoteName(x,y,"E");

		} else if (val==140) { // G 16th note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d9");
			t.drawCellNoteName(x,y,"G");

		} else if (val==141) { // B 16th note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d9");
			t.drawCellNoteName(x,y,"B");

		} else if (val==142) { // key signature natural
			t.drawCellBackground(x,y,"#00F"); // blue
			ctx.fillStyle="#FFF"; // white
			ctx.font = "normal "+gh*0.8+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillText("\ue261",x+gw*0.55,y+gh*0.5);

		} else if (val==143) { // begin repeated section
			t.drawCellBackground(x,y,"#000"); // black
			ctx.font = "normal "+gh*0.55+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue040",x+gw*0.5,y+gh*0.8);

		} else if (val==144) { // octave 8
			if (t.checkPreviousCell(col,row,44) === false) {
				t.drawLiteralBrailleSymbol(val,x,y);
			}

		} else if (val==146) { // common time
			if (t.checkContiguousCells(col,row,[146,467])) {
				t.drawMultiCellBackground(x,y,col,row,"#070",2); // 2 cells green
				ctx.fillStyle="#FFF"; // black
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.textBaseline = "alphabetic";
				ctx.fillText("\ue08a",x+gw*1.05,y+gh*0.5);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==148) { // interval 6th
			t.drawCellInterval(x,y,6);

		} else if (val==150) { // triplet
			t.drawCellTupletNumber(x,y,-3);

		} else if (val==151) { // interval 7th
			t.drawCellInterval(x,y,7);

		} else if (val==153) { // grace note
			t.drawCellBackground(x,y,"#F00");
			ctx.textBaseline = "alphabetic";
			ctx.fillStyle = "#FFF"; // white
			ctx.font = "normal "+gh*0.47+"px Bravura";
			ctx.fillText("\ue560",x+gw*0.5,y+gh*0.55);

		} else if (val==154) { // trill
			t.drawCellArticulation(x,y,7);

		} else if (val==155) { // measure repeat
			t.drawCellBackground(x,y,"#222");
			ctx.font = "normal "+gh*0.6+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue500",x+gw*0.5,y+gh*0.5);

		} else if (val==157) { // interval 5th
			t.drawCellInterval(x,y,5);

		} else if (val==158) { // D 64th note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1dd");
			t.drawCellNoteName(x,y,"D");

		} else if (val==159) { // marcato
			if (t.checkContiguousCells(col,row,[159,156])) {
				t.drawCellArticulation(x,y,4);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==160) { // key signature flat
			t.drawCellBackground(x,y,"#00F"); // blue
			ctx.fillStyle="#FFF"; // white
			ctx.font = "normal "+gh*0.8+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillText("\ue260",x+gw*0.55,y+gh*0.6);

		} else if (val==161) { // F 16th note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d9");
			t.drawCellNoteName(x,y,"F");

		} else if (val==162) { // hairpin dynamic
			if (t.checkContiguousCells(col,row,[162,551,239])) {
				t.drawCellHairpinDynamic(x,y,col,row,6);
			} else if (t.checkContiguousCells(col,row,[162,552,239])) {
				t.drawCellHairpinDynamic(x,y,col,row,8);
			} else if (t.checkContiguousCells(col,row,[162,567,239])) {
				t.drawCellHairpinDynamic(x,y,col,row,5);
			} else if (t.checkContiguousCells(col,row,[162,568,239])) {
				t.drawCellHairpinDynamic(x,y,col,row,7);
			} else if (t.checkContiguousCells(col,row,[162,551])) {
				t.drawCellHairpinDynamic(x,y,col,row,2);
			} else if (t.checkContiguousCells(col,row,[162,552])) {
				t.drawCellHairpinDynamic(x,y,col,row,4);
			} else if (t.checkContiguousCells(col,row,[162,567])) {
				t.drawCellHairpinDynamic(x,y,col,row,1);
			} else if (t.checkContiguousCells(col,row,[162,568])) {
				t.drawCellHairpinDynamic(x,y,col,row,3);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==163) { // C 64th note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1dd");
			t.drawCellNoteName(x,y,"C");

		} else if (val>=165 && val<=173) { // time signature top numbers 1-9
			t.drawCellTimeSignatureNumber(x,y,val-164,true);

		} else if (val==174) { // time signature top 0
			t.drawCellTimeSignatureNumber(x,y,0,true);

		} else if (val==177) { // 16th rest
			t.drawCellBackground(x,y,"#F00");
			ctx.font = "normal "+gh*0.6+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue4e7",x+gw*0.5,y+gh*0.5);

		} else if (val>=178 && val<=184) { // 32nd notes
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1db");
			chars=['C','D','E','F','G','A','B'];
			t.drawCellNoteName(x,y,chars[val-178]);

		} else if (val==185) { // 32nd rest
			t.drawCellBackground(x,y,"#F00");
			ctx.font = "normal "+gh*0.6+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue4e8",x+gw*0.5,y+gh*0.5);

		} else if (val==186) { // 64th rest
			t.drawCellBackground(x,y,"#F00");
			ctx.font = "normal "+gh*0.5+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue4e9",x+gw*0.5,y+gh*0.5);

		} else if (val==187) { // B 64th note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1dd");
			t.drawCellNoteName(x,y,"B");

		} else if (val==188) { // 128th rest
			t.drawCellBackground(x,y,"#F00");
			ctx.font = "normal "+gh*0.5+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue4ea",x+gw*0.5,y+gh*0.5);

		} else if (val>=189 && val<=190) { // C and D 16th notes
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1d9");
			chars=['C','D'];
			t.drawCellNoteName(x,y,chars[val-189]);

		} else if (val==191) { // A 64th note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1dd");
			t.drawCellNoteName(x,y,"A");

		} else if (val==192) { // G 64th note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1dd");
			t.drawCellNoteName(x,y,"G");

		} else if (val==193) { // F 64th note
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1dd");
			t.drawCellNoteName(x,y,"F");

		} else if (val==194) { // prefer larger note values
			if (t.checkContiguousCells(col,row,[194,660,349])) {
				t.drawCellTextLabel(x,y,"READ AS","LARGER VALUES","#000","#FFF",3);
			}

		} else if (val==195) { // cut time
			if (t.checkContiguousCells(col,row,[195,467])) {
				t.drawMultiCellBackground(x,y,col,row,"#070",2); // 2 cells green
				ctx.fillStyle="#FFF"; // black
				ctx.font = "normal "+gh*0.8+"px Bravura";
				ctx.textBaseline = "alphabetic";
				ctx.fillText("\ue08b",x+gw*1.05,y+gh*0.5);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==234) { // braille music hyphen
			t.drawCellTextLabel(x,y,col,row,"MUSIC","HYPHEN","#000","#FFF",1);

		} else if (val==235) { // key sig prefix
			t.drawCellTextLabel(x,y,col,row,"KEY","PREFIX","#00F","#FFF",1); // white on blue

		} else if (val==242) { // end repeated section
			t.drawCellBackground(x,y,col,row,"#000"); // black
			ctx.font = "normal "+gh*0.55+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue041",x+gw*0.5,y+gh*0.8);

		} else if (val==244) { // prefer smaller note values
			if (t.checkContiguousCells(col,row,[244,660,349])) {
				t.drawCellTextLabel(x,y,"READ AS","SMALLER VALUES","#000","#FFF",3);
			}

		} else if (val==248) { // tuplet 0
			t.drawCellTupletNumber(x,y,0);

		} else if (val>=249 && val<=257) { // tuplet numbers
			t.drawCellTupletNumber(x,y,val-248);

		} else if (val==259) { // grace note slur
			if (t.checkContiguousCells(col,row,[259,67])) {
				t.drawMultiCellBackground(x,y,col,row,"#FF0",2); // 2 cells yellow
				ctx.fillStyle = "#000"; // black
				ctx.textAlign="center";
				ctx.textBaseline="middle";
				ctx.font = "normal "+gw*0.25+"px sans-serif";
				ctx.fillText("GRACE NOTE",x+gw,y+gh*0.35);
				ctx.font = "normal "+gw*0.4+"px sans-serif";
				ctx.fillText("SLUR",x+gw,y+gh*0.65);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==260) { // final or double barline
			ctx.font = "normal "+gh*0.6+"px Bravura";
			ctx.textBaseline = "alphabetic";
			if (t.checkContiguousCells(col,row,[260,175,139])) { // double barline
				t.drawMultiCellBackground(x,y,"#000",3); // 3 cells black
				ctx.fillStyle = "#FFF"; // white
				ctx.fillText("\ue031",x+gw*1.5,y+gh*0.8);
			} else if (t.checkContiguousCells(col,row,[260,175])) { // final barline
				t.drawMultiCellBackground(x,y,"#000",2); // 2 cells black
				ctx.fillStyle = "#FFF"; // white
				ctx.fillText("\ue032",x+gw,y+gh*0.8);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val>=265 && val<=271) { // key signature accidental multipliers
			t.drawCellKeySigMultiplier(x,y,val-264);

		} else if (val==295) { // time signature prefix
			t.drawCellTupletNumber(x,y,-1);

		} else if (val==334) { // partial measure in-accord (first character)
			if (t.checkContiguousCells(col,row,[334,749])) {
				t.drawInAccord(x,y,3);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y);
			}

		} else if (val==335) { // number of measures to repeat
			t.drawCellTextLabel(x,y,col,row,"NO. OF","MEAS.","#000","#FFF",1);

		} else if (val==343) { // plus
            t.drawCellChordSymbol(x,y,1);

        } else if (val==344) { // music prefix
			t.drawCellTextLabel(x,y,col,row,"MUSIC","PREFIX","#000","#FFF",2);

		} else if (val==346) { // accent
			if (t.checkContiguousCells(col,row,[346,156])) {
				t.drawCellArticulation(x,y,3);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==356) { // staccato
			t.drawCellArticulation(x,y,1);


		} else if (val==359) { // begin bracket slur
			if (t.checkContiguousCells(col,row,[359,366])) {
				t.drawCellTextLabel(x,y,col,row,"BEGIN","SLUR","#FF0","#000",2);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==362) { // pause
			if (t.checkContiguousCells(col,row,[362,149])) {
				t.drawCellArticulation(x,y,6);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==364) { // tie
			if (t.checkContiguousCells(col,row,[364,367])) {
				t.drawMultiCellBackground(x,y,"#FF0",2); // 2 cells yellow
				ctx.beginPath();
				ctx.arc(x+gw,y+gh*0.9,gh*0.5,1.25*Math.PI,1.75*Math.PI,false);
				ctx.lineWidth=gh*0.033;
				ctx.strokeStyle = "#000"; // black
				ctx.stroke();
				ctx.closePath();
				ctx.fillStyle = "#000"; // black
				ctx.textAlign="center";
				ctx.textBaseline="middle";
				ctx.font = "normal "+gw*0.3+"px sans-serif";
				ctx.fillText("TIE",x+gw,y+gh*0.7);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val>=368 && val<=374) { // 128th notes
			t.drawCellBackground(x,y,"#F00");
			t.drawCellNote(x,y,"\ue1df");
			chars=['C','D','E','F','G','A','B'];
			t.drawCellNoteName(x,y,chars[val-368]);

		} else if (val==377) { // right H-bar rest
			t.drawCellBackground(x,y,"#F00");
			ctx.font = "normal "+gh*0.6+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue4f1",x+gw*0.5,y+gh*0.5);

		} else if (val==394) { // end bracket slur
			if (t.checkContiguousCells(col,row,[394,350])) {
				t.drawCellTextLabel(x,y,col,row,"END","SLUR","#FF0","#000",2);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y);
			}

		} else if (val==395) { // tenuto
			if (t.checkContiguousCells(col,row,[395,156])) {
				t.drawCellArticulation(x,y,2);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y);
			}

		} else if (val==439) { // tuplet suffix
			t.drawCellTupletNumber(x,y,-2);

		} else if (val==446) { // right hand (first symbol)
			if (t.checkContiguousCells(col,row,[446,262,239])) {
				t.drawCellTextLabel(x,y,"RIGHT","HAND","#000","#FFF",3);
			} else if (t.checkContiguousCells(col,row,[446,262])) {
				t.drawCellTextLabel(x,y,"RIGHT","HAND","#000","#FFF",2);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==448) { // triangle
            t.drawCellChordSymbol(ctx,x,y,4);

        } else if (val==449) { // fingering 4
			t.drawCellArticulation(x,y,14);

		} else if (val==452) { // circle
            if (t.checkContiguousCells(col,row,[452,849])) {
                t.drawCellChordSymbol(ctx,x,y,3); // circle with slash
            } else {
                t.drawCellChordSymbol(ctx,x,y,2); // circle
            }

        } else if (val==455) { // metronome marking equals (first character)
			if (t.checkContiguousCells(col,row,[455,435])) {
				t.drawMetronomeMarkingEquals(x,y,col,row);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==460) { // fermata
			if (t.checkContiguousCells(col,row,[460,176])) {
				t.drawCellArticulation(x,y,5);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==462) { // simple dynamic
			if (t.checkContiguousCells(col,row,[462,570,570,239])) {
				t.drawCellSimpleDynamic(x,y,col,row,7);
			} else if (t.checkContiguousCells(col,row,[462,570,239])) {
				t.drawCellSimpleDynamic(x,y,col,row,8);
			} else if (t.checkContiguousCells(col,row,[462,577,570,239])) {
				t.drawCellSimpleDynamic(x,y,col,row,9);
			} else if (t.checkContiguousCells(col,row,[462,577,580,239])) {
				t.drawCellSimpleDynamic(x,y,col,row,10);
			} else if (t.checkContiguousCells(col,row,[462,580,580,239])) {
				t.drawCellSimpleDynamic(x,y,col,row,12);
			} else if (t.checkContiguousCells(col,row,[462,580,239])) {
				t.drawCellSimpleDynamic(x,y,col,row,11);
			} else if (t.checkContiguousCells(col,row,[462,570,570])) {
				t.drawCellSimpleDynamic(x,y,col,row,1);
			} else if (t.checkContiguousCells(col,row,[462,570])) {
				t.drawCellSimpleDynamic(x,y,col,row,2);
			} else if (t.checkContiguousCells(col,row,[462,577,570])) {
				t.drawCellSimpleDynamic(x,y,col,row,3);
			} else if (t.checkContiguousCells(col,row,[462,577,580])) {
				t.drawCellSimpleDynamic(x,y,col,row,4);
			} else if (t.checkContiguousCells(col,row,[462,580,580])) {
				t.drawCellSimpleDynamic(x,y,col,row,6);
			} else if (t.checkContiguousCells(col,row,[462,580])) {
				t.drawCellSimpleDynamic(x,y,col,row,5);
			} else if (t.checkContiguousCells(col,row,[462,567,582,239])) {
				t.drawCellTextDynamic(x,y,col,row,1);
			} else if (t.checkContiguousCells(col,row,[462,568,569,567,582,239])) {
				t.drawCellTextDynamic(x,y,col,row,2);
			} else if (t.checkContiguousCells(col,row,[462,568,573,577,239])) {
				t.drawCellTextDynamic(x,y,col,row,3);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==465) { // fingering 1
			t.drawCellArticulation(x,y,11);

		} else if (val==466) { // fingering 2
			t.drawCellArticulation(x,y,12);

		} else if (val==475) { // fingering 5
			t.drawCellArticulation(x,y,15);

		} else if (val==476) { // fingering 3
			t.drawCellArticulation(x,y,13);

		} else if (val==495) { // left hand (first symbol)
			if (t.checkContiguousCells(col,row,[495,262,239])) {
				t.drawCellTextLabel(x,y,col,row,"LEFT","HAND","#000","#FFF",3);
			} else if (t.checkContiguousCells(col,row,[495,262])) {
				t.drawCellTextLabel(x,y,col,row,"LEFT","HAND","#000","#FFF",2);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val>=533 && val<=563) { // punctuation and contractions
			if (val==544 && t.checkContiguousCells(col,row,[544,544])) {
				t.drawCellTextLabel(x,y,col,row,"CAPITALIZE","WORD","#FFF","#000",2);
			} else if (val==534 && t.checkContiguousCells(col,row,[534,633])) { // there
                t.drawMultiCellASCII(x,y,col,row,2,'THERE',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,683])) { // some
                t.drawMultiCellASCII(x,y,col,row,2,'SOME',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,675])) { // know
                t.drawMultiCellASCII(x,y,col,row,2,'KNOW',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,676])) { // lord
                t.drawMultiCellASCII(x,y,col,row,2,'LORD',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,677])) { // mother
                t.drawMultiCellASCII(x,y,col,row,2,'MOTHER',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,678])) { // name
                t.drawMultiCellASCII(x,y,col,row,2,'NAME',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,679])) { // one
                t.drawMultiCellASCII(x,y,col,row,2,'ONE',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,680])) { // part
                t.drawMultiCellASCII(x,y,col,row,2,'PART',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,681])) { // question
                t.drawMultiCellASCII(x,y,col,row,2,'QUESTION',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,682])) { // right
                t.drawMultiCellASCII(x,y,col,row,2,'RIGHT',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,684])) { // time
                t.drawMultiCellASCII(x,y,col,row,2,'TIME',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,742])) { // character
                t.drawMultiCellASCII(x,y,col,row,2,'CHARACTER',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,758])) { // where
                t.drawMultiCellASCII(x,y,col,row,2,'WHERE',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,763])) { // through
                t.drawMultiCellASCII(x,y,col,row,2,'THROUGH',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,768])) { // day
                t.drawMultiCellASCII(x,y,col,row,2,'DAY',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,769])) { // ever
                t.drawMultiCellASCII(x,y,col,row,2,'EVER',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,772])) { // here
                t.drawMultiCellASCII(x,y,col,row,2,'HERE',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,785])) { // under
                t.drawMultiCellASCII(x,y,col,row,2,'UNDER',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,787])) { // work
                t.drawMultiCellASCII(x,y,col,row,2,'WORK',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,789])) { // young
                t.drawMultiCellASCII(x,y,col,row,2,'YOUNG',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,792])) { // ought
                t.drawMultiCellASCII(x,y,col,row,2,'OUGHT',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,854])) {
                t.drawMultiCellASCII(x,y,col,row,2,'+',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,855])) {
                t.drawMultiCellASCII(x,y,col,row,2,'=',(val % 100));
            } else if (val==534 && t.checkContiguousCells(col,row,[534,970])) { // father
                t.drawMultiCellASCII(x,y,col,row,2,'FATHER',(val % 100));
            } else if (val==545 && t.checkContiguousCells(col,row,[545,545,545])) { // em dash
                t.drawMultiCellASCII(x,y,col,row,3,'—',(val % 100));
            } else if (val==545 && t.checkContiguousCells(col,row,[545,545])) { // en dash
                t.drawMultiCellASCII(x,y,col,row,2,'–',(val % 100));
            } else if (val==555 && t.checkPreviousCell(col,row,-1)) {
                t.drawCellASCII(x,y,col,row,'(',(val % 100));
            } else if (val==555 && t.checkContiguousCells(col,row,[555,-1])) {
                t.drawCellASCII(x,y,col,row,')',(val % 100));
            } else if (!(t.drawLongTextContraction(x,y,col,row,val)) &&
                (!(t.letterIsPartOfSymbol(col,row,val)) ||
                t.doNotCheckContiguousCells)) {
                chars=['THE','','#','ED','SH','AND',"'",'OF','WITH','CH','ING','capital sign','-','.','ST','',',',';',':','.','EN','!','(…)','?','IN','WH','text sign','GH','FOR','AR','TH'];
                t.drawCellASCII(x,y,col,row,chars[val-533],(val % 100));
            }

		} else if (val>=565 && val<=590) { // text letters
			if (!(t.drawLongTextContraction(x,y,col,row,val)) &&
                (!(t.letterIsPartOfSymbol(col,row,val)) ||
                    t.doNotCheckContiguousCells)) {
				    t.drawCellASCII(x,y,String.fromCharCode(val-500),(val % 100));
			}

		} else if (val>=591 && val<=593) { // contractions
            if (!(t.drawLongTextContraction(x,y,col,row,val)) &&
                (!(t.letterIsPartOfSymbol(col,row,val)) ||
                 t.doNotCheckContiguousCells)) {
                chars=['OW','OU','ER'];
                t.drawCellASCII(x,y,col,row,chars[val-591],(val % 100));
            }

		} else if (val==594) { // contractions
            if (t.checkContiguousCells(col,row,[594,633])) { // these
                t.drawMultiCellASCII(x,y,col,row,2,'THESE',(val % 100));
            } else if (t.checkContiguousCells(col,row,[594,758])) { // whose
                t.drawMultiCellASCII(x,y,col,row,2,'WHOSE',(val % 100));
            } else if (t.checkContiguousCells(col,row,[594,763])) { // those
                t.drawMultiCellASCII(x,y,col,row,2,'THOSE',(val % 100));
            } else if (t.checkContiguousCells(col,row,[594,785])) { // upon
                t.drawMultiCellASCII(x,y,col,row,2,'UPON',(val % 100));
            } else if (t.checkContiguousCells(col,row,[594,787])) { // word
                t.drawMultiCellASCII(x,y,col,row,2,'WORD',(val % 100));
            } else {
                t.drawLiteralBrailleSymbol(val,x,y,col,row);
            }

        } else if (val==595) { // contractions
            if (t.checkContiguousCells(col,row,[595,633])) { // their
                t.drawMultiCellASCII(x,y,col,row,2,'THEIR',(val % 100));
            } else if (t.checkContiguousCells(col,row,[595,638])) { // spirit
                t.drawMultiCellASCII(x,y,col,row,2,'SPIRIT',(val % 100));
            } else if (t.checkContiguousCells(col,row,[595,677])) { // many
                t.drawMultiCellASCII(x,y,col,row,2,'MANY',(val % 100));
            } else if (t.checkContiguousCells(col,row,[595,772])) { // had
                t.drawMultiCellASCII(x,y,col,row,2,'HAD',(val % 100));
            } else if (t.checkContiguousCells(col,row,[595,787])) { // world
                t.drawMultiCellASCII(x,y,col,row,2,'WORLD',(val % 100));
            } else if (t.checkContiguousCells(col,row,[595,967])) { // cannot
                t.drawMultiCellASCII(x,y,col,row,2,'CANNOT',(val % 100));
            } else {
                t.drawLiteralBrailleSymbol(val,x,y,col,row);
            }

        } else if (val==637) { // contractions
            t.drawCellASCII(x,y,col,row,'SHALL',(val % 100));

        } else if (val==642) { // contractions
            t.drawCellASCII(x,y,col,row,'CHILD',(val % 100));

        } else if (val==644) { // contractions
            if (t.checkContiguousCells(col,row,[644,789])) { // ally
                t.drawMultiCellASCII(x,y,col,row,2,'ALLY',(val % 100));
            } else if (t.checkContiguousCells(col,row,[644,678])) { // ation
                t.drawMultiCellASCII(x,y,col,row,2,'ATION',(val % 100));
            } else {
                t.drawLiteralBrailleSymbol(val,x,y,col,row);
            }

        } else if (val==645) { // contractions
            t.drawCellASCII(x,y,col,row,'COM',(val % 100));

        } else if (val==646) { // in-accord measure division (first character)
			if (t.checkContiguousCells(col,row,[646,675])) {
				t.drawInAccord(x,y,2);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val>=647 && val<=657) { // punctuation and contractions
			chars=['/','”','EA','BB','CC','DD','','FF','GG','“','BY'];
			t.drawCellASCII(x,y,col,row,chars[val-647],(val % 100));

		} else if (val==658) { // contractions
            t.drawCellASCII(x,y,col,row,'WHICH',(val % 100));

        } else if (val==659) { // contractions
            if (t.checkContiguousCells(col,row,[659,771])) { // ong
                t.drawMultiCellASCII(x,y,col,row,2,'ONG',(val % 100));
            } else if (t.checkContiguousCells(col,row,[659,676])) { // ful
                t.drawMultiCellASCII(x,y,col,row,2,'FUL',(val % 100));
            } else if (t.checkContiguousCells(col,row,[659,684])) { // ment
                t.drawMultiCellASCII(x,y,col,row,2,'MENT',(val % 100));
            } else if (t.checkContiguousCells(col,row,[659,769])) { // ence
                t.drawMultiCellASCII(x,y,col,row,2,'ENCE',(val % 100));
            } else if (t.checkContiguousCells(col,row,[659,683])) { // ness
                t.drawMultiCellASCII(x,y,col,row,2,'NESS',(val % 100));
            } else if (t.checkContiguousCells(col,row,[659,678])) { // tion
                t.drawMultiCellASCII(x,y,col,row,2,'TION',(val % 100));
            } else if (t.checkContiguousCells(col,row,[659,789])) { // ity
                t.drawMultiCellASCII(x,y,col,row,2,'ITY',(val % 100));
            } else {
                t.drawLiteralBrailleSymbol(val,x,y,col,row);
            }

        } else if (val==660) { // braille music comma (first symbol)
			if ((t.checkPreviousCell(col,row,194) === false) && (t.checkPreviousCell(col,row,244) === false)) {
				if (t.checkContiguousCells(col,row,[660,349])) {
					t.drawCellTextLabel(x,y,col,row,"MUSIC","COMMA","#000","#FFF",2);
				} else {
					t.drawLiteralBrailleSymbol(val,x,y,col,row);
				}
			}

		} else if (val==662) { // clefs
			if (t.checkContiguousCells(col,row,[662,747,676])) { // treble clef
				t.drawCellClef(x,y,col,row,1);
			} else if (t.checkContiguousCells(col,row,[662,643,676])) { // alto clef
				t.drawCellClef(x,y,col,row,2);
			} else if (t.checkContiguousCells(col,row,[662,643,634,676])) { // tenor clef
				t.drawCellClef(x,y,col,row,3);
			} else if (t.checkContiguousCells(col,row,[662,635,676])) { // bass clef
				t.drawCellClef(x,y,col,row,4);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==663) { // contractions
            t.drawCellASCII(x,y,col,row,'THIS',(val % 100));

        } else if (val>=665 && val<=673) { // numbers 1-9
			t.drawCellASCII(x,y,col,row,String.fromCharCode(val-616),(val % 100));

		} else if (val==674) { // numbers 0
			t.drawCellASCII(x,y,col,row,"0",(val % 100));

		} else if (val>=685 && val<=692) { // punctuation and contractions
            chars=['US','VERY','WILL','IT','YOU','AS','','OUT'];
            t.drawCellASCII(x,y,col,row,chars[val-685],(val % 100));

        } else if (val==735) { // left H-bar rest
			t.drawCellBackground(x,y,"#F00");
			ctx.font = "normal "+gh*0.6+"px Bravura";
			ctx.textBaseline = "alphabetic";
			ctx.fillStyle = "#FFF"; // white
			ctx.fillText("\ue4ef",x+gw*0.5,y+gh*0.5);

		} else if (val==746) { // contractions
            if (t.checkContiguousCells(col,row,[746,768])) { // ound
                t.drawMultiCellASCII(x,y,col,row,2,'OUND',(val % 100));
            } else if (t.checkContiguousCells(col,row,[746,684])) { // ount
                t.drawMultiCellASCII(x,y,col,row,2,'OUNT',(val % 100));
            } else if (t.checkContiguousCells(col,row,[746,769])) { // ance
                t.drawMultiCellASCII(x,y,col,row,2,'ANCE',(val % 100));
            } else if (t.checkContiguousCells(col,row,[746,683])) { // less
                t.drawMultiCellASCII(x,y,col,row,2,'LESS',(val % 100));
            } else if (t.checkContiguousCells(col,row,[746,678])) { // sion
                t.drawMultiCellASCII(x,y,col,row,2,'SION',(val % 100));
            } else {
                t.drawLiteralBrailleSymbol(val,x,y,col,row);
            }

        } else if (val==747) { // contractions
			t.drawCellASCII(x,y,col,row,'STILL',(val % 100));

		} else if (val>=750 && val<=757) { // punctuation and contractions
            if (!(t.drawLongTextContraction(x,y,col,row,val)) &&
                (!(t.letterIsPartOfSymbol(col,row,val)) ||
                t.doNotCheckContiguousCells)) {
                chars=['BE','CON','DIS','ENOUGH','TO','WERE','HIS','WAS'];
                t.drawCellASCII(x,y,col,row,chars[val-750],(val % 100));
            }

        } else if (val==760) { // bowing (first character)
			if (t.checkContiguousCells(col,row,[760,66])) {
				t.drawCellArticulation(x,y,col,row,9);
			} else if (t.checkContiguousCells(col,row,[760,639])) {
				t.drawCellArticulation(x,y,col,row,8);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val==767) { // change fingers
			t.drawCellArticulation(x,y,col,row,10);

		} else if (val==770) { // contractions
            t.drawCellASCII(x,y,col,row,'FROM',(val % 100));

        } else if (val>=775 && val<=784) { // contractions
            chars=['KNOWLEDGE','LIKE','MORE','NOT','','PEOPLE','QUITE','RATHER','SO','THAT'];
            t.drawCellASCII(x,y,col,row,chars[val-775],(val % 100));

        } else if (val==835) { // contractions
            t.drawCellASCII(x,y,col,row,'BLE',(val % 100));

        } else if (val==860) { // in-accord (first character)
			if (t.checkContiguousCells(col,row,[860,762])) {
				t.drawInAccord(x,y,col,row,1);
			} else {
				t.drawLiteralBrailleSymbol(val,x,y,col,row);
			}

		} else if (val>=866 && val<=874) { // contractions
            chars=['BUT','CAN','DO','EVERY','SELF','GO','HAVE','','JUST'];
            t.drawCellASCII(x,y,col,row,chars[val-866],(val % 100));

        } else if ((val !== null) && ((val%100) !== 0)) {
			t.drawLiteralBrailleSymbol(val,x,y,col,row);
		}
	};

	this.letterIsPartOfSymbol = function(col,row,val) {
		var result=false;
		var t = this;

		if (val==239) { // yeah, I know character 239 isn't a braille letter per se, get off my back
			if (t.checkContiguousCells(col-3,row,[462,570,570,239]) || t.checkContiguousCells(col-2,row,[462,570,239]) || t.checkContiguousCells(col-3,row,[462,577,570,239]) || t.checkContiguousCells(col-3,row,[462,577,580,239]) || t.checkContiguousCells(col-2,row,[462,580,239]) || t.checkContiguousCells(col-3,row,[462,567,582,239]) || t.checkContiguousCells(col-5,row,[462,568,569,567,582,239]) || t.checkContiguousCells(col-4,row,[462,568,573,577,239]) || t.checkContiguousCells(col-2,row,[162,551,239]) || t.checkContiguousCells(col-2,row,[162,552,239]) || t.checkContiguousCells(col-2,row,[162,567,239]) || t.checkContiguousCells(col-2,row,[162,568,239]) || t.checkContiguousCells(col-2,row,[446,262,239]) || t.checkContiguousCells(col-2,row,[495,262,239])) {
				result=true;
			}
		} else if (val==551 || val==552) {
			if (t.checkPreviousCell(col,row,162)) {
				result=true;
			}
		} else if (val==567) {
			if (t.checkPreviousCell(col,row,162) || t.checkContiguousCells(col-1,row,[462,567,582]) || t.checkContiguousCells(col-3,row,[462,568,569,567,582])) {
				result=true;
			}
		} else if (val==568) {
			if (t.checkPreviousCell(col,row,162) || t.checkContiguousCells(col-1,row,[462,568,569,567,582]) || t.checkContiguousCells(col-1,row,[462,568,573,577])) {
				result=true;
			}
		} else if (val==569) {
			if (t.checkContiguousCells(col-2,row,[462,568,569,567,582])) {
				result=true;
			}
		} else if (val==570) {
			if (t.checkContiguousCells(col-1,row,[462,570]) || t.checkContiguousCells(col-2,row,[462,570,570]) || t.checkContiguousCells(col-2,row,[462,577,570])) {
				result=true;
			}
		} else if (val==573) {
			if (t.checkContiguousCells(col-2,row,[462,568,573,577])) {
				result=true;
			}
		} else if (val==577) {
			if (t.checkContiguousCells(col-1,row,[462,577,570]) || t.checkContiguousCells(col-1,row,[462,577,580]) || t.checkContiguousCells(col-3,row,[462,568,573,577])) {
				result=true;
			}
		} else if (val==580) {
			if (t.checkContiguousCells(col-1,row,[462,580]) || t.checkContiguousCells(col-2,row,[462,580,580]) || t.checkContiguousCells(col-2,row,[462,577,580])) {
				result=true;
			}
		} else if (val==582) {
			if (t.checkPreviousCell(col,row,162) || t.checkContiguousCells(col-2,row,[462,567,582]) || t.checkContiguousCells(col-4,row,[462,568,569,567,582])) {
				result=true;
			}
		}

		return result;

	};

	this.setCellHeight = function(val) {
		this.notationGridHeight=val;
		this.notationGridWidth=(val*2)/3;
		this.drawNotation();
	};

	this.scrollCanvas = function(x,y) {
		this.hScroll += (x*this.notationGridWidth);
		if (this.hScroll<0) {
			this.hScroll=0;
		}

		this.vScroll += (y*this.notationGridHeight);
		if (this.vScroll<0) {
			this.vScroll=0;
		}
		this.drawNotation();
	};

	this.scoreHeight = function() {
		return this.score.length;
	};

	this.scoreWidth = function() {
		var max = 0;
		for (var y in this.score) {
			if (this.score[y].length > max) {
				max = this.score[y].length;
			}
		}
		return max;
	};

	this.checkContiguousCells = function (col,row,cells) {
		var len = cells.length;
		var matches = true;
		for (var i=0; i<len; i++) {
			if ((row>=this.score.length) || (+col+i>=this.score[row].length) || (this.score[row][+col+i]!=cells[i])) {
				matches=false;
			}
		}
		return matches;
	};

	this.getCharacterDescription = function (x,y) {
        var s, val = 32;
        var chars = [];
        var t = this;
		if (t.score !== null && t.score[y] !== null && t.score[y][x] !== null) {
			val = t.score[y][x];
		}

		if (val==33) { // A whole note
			if (t.checkContiguousCells(x,y,[33,75])) {
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
			if (t.checkContiguousCells(x,y,[37,337])) {
				s="first character of double sharp";
			} else {
				s="sharp";
			}

		} else if (val==38) { // E whole note
			if (t.checkContiguousCells(x,y,[38,75])) {
                s="first character of E double whole note";
            } else {
                s="E whole note";
            }

		} else if (val==39) { // augmentation dot
			s="dot";

		} else if (val==40) { // G whole note
			if (t.checkContiguousCells(x,y,[40,75])) {
                s="first character of G double whole note";
            } else {
                s="G whole note";
            }

		} else if (val==41) { // B whole note
			if (t.checkContiguousCells(x,y,[41,75])) {
                s="first character of B double whole note";
            } else {
                s="B whole note";
            }

		} else if (val==42) { // natural
			s="natural";

		} else if (val==43) { // interval 3rd
			s="added note at the third";

		} else if (val==44) { // octave 7
			if (t.checkContiguousCells(x,y,[44,144])) { // octave 8
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
			if (t.checkContiguousCells(x,y,[60,360])) {
				s="first character of double flat";
			} else {
				s="flat";
			}

		} else if (val==61) { // F whole note
			if (t.checkContiguousCells(x,y,[61,75])) {
                s="first character of F double whole note";
            } else {
                s="F whole note";
            }

		} else if (val==62) { // word prefix
			s="word prefix";

		} else if (val==63) { // C quarter note
			s="C quarter note";

		} else if (val==64) { // octave 1
			if (t.checkContiguousCells(x,y,[64,164])) { // octave 0
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
            if (t.checkPreviousCell(x,y,77)) {
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
			if (t.checkContiguousCells(x,y,[val,75])) {
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
			if (this.checkContiguousCells(x,y,[260,175,139])) { // double barline
				s="first character of double bar line";
			} else if (this.checkContiguousCells(x,y,[260,175])) { // final barline
				s="first character of final bar line";
			} else if (this.checkContiguousCells(x,y,[260,355])) { // forward repeat
				s="first character of forward repeat";
			} else if (this.checkContiguousCells(x,y,[260,350])) { // backward repeat
				s="first character of backward repeat";
			} else {
				s="first character of bar line symbol";
			}

		} else if (val==262) { // right hand / left hand (second symbol)
			s="second character of hand sign";

		} else if (val>=265 && val<=271) { // key signature accidental multipliers
			s="key signature "+(val-264)+" accidentals";

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
            if (t.checkPreviousCell(x,y,534)) { // contraction THERE (last symbol)
                s="last character of text contraction there";
            } else if (t.checkPreviousCell(x,y,594)) { // contraction THESE (last symbol)
                s="last character of text contraction these";
            } else if (t.checkPreviousCell(x,y,595)) { // contraction THEIR (last symbol)
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
            if (t.checkContiguousCells(x,y,[644,789])) { // ally
                s="first character of contraction a l l y";
            } else if (t.checkContiguousCells(x,y,[644,678])) { // ation
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

		} else if (val==675) { // in-accord measure division (second symbol)
			s="second character of measure division for in-accord";

		} else if (val==676) { // clef (last symbol)
			s="last character of clef symbol";

		} else if (val==677) {
            if (t.checkPreviousCell(x,y,534)) { // contraction MOTHER (last symbol)
                s="last character of text contraction mother";
            } else if (t.checkPreviousCell(x,y,595)) { // contraction MANY (last symbol)
                s="last character of text contraction many";
            }

        } else if (val==678) {
            if (t.checkPreviousCell(x,y,534)) { // contraction NAME (last symbol)
                s="last character of text contraction name";
            } else if (t.checkPreviousCell(x,y,644)) { // contraction ATION (last symbol)
                s="last character of text contraction a t i o n";
            } else if (t.checkPreviousCell(x,y,659)) { // contraction TION (last symbol)
                s="last character of text contraction t i o n";
            } else if (t.checkPreviousCell(x,y,746)) { // contraction SION (last symbol)
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
            if (t.checkPreviousCell(x,y,534)) { // contraction SOME (last symbol)
                s="last character of text contraction some";
            } else if (t.checkPreviousCell(x,y,659)) { // contraction NESS (last symbol)
                s="last character of text contraction ness";
            } else if (t.checkPreviousCell(x,y,746)) { // contraction LESS (last symbol)
                s="last character of text contraction less";
            }

        } else if (val==684) {
            if (t.checkPreviousCell(x,y,534)) { // contraction TIME (last symbol)
                s="last character of text contraction time";
            } else if (t.checkPreviousCell(x,y,659)) { // contraction MENT (last symbol)
                s="last character of text contraction m e n t";
            } else if (t.checkPreviousCell(x,y,746)) { // contraction OUNT (last symbol)
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

        } else if (val==747) { // treble clef (second symbol)
			s="second character of treble clef";

		} else if (val==749) { // partial measure in-accord (second symbol)
			s="second character of partial measure in-accord";

		} else if (val>=750 && val<=757) { // punctuation and contractions
            chars=['be','con','dis','enough','to','were','his','was'];
            s="text contraction "+chars[val-750];

        } else if (val==758) {
            if (t.checkPreviousCell(x,y,534)) { // contraction WHERE (last symbol)
                s="last character of text contraction where";
            } else if (t.checkPreviousCell(x,y,594)) { // contraction WHOSE (last symbol)
                s="last character of text contraction whose";
            }

        } else if (val==760) { // bowing (first character)
			s="first character of bow marking";

		} else if (val==762) { // in-accord (second symbol)
			s="second character of in-accord symbol";

		} else if (val==763) {
            if (t.checkPreviousCell(x,y,534)) { // contraction THROUGH (last symbol)
                s="last character of text contraction through";
            } else if (t.checkPreviousCell(x,y,594)) { // contraction THOSE (last symbol)
                s="last character of text contraction those";
            }

        } else if (val==767) { // change fingers
			s="change fingering";

		} else if (val==768) {
            if (t.checkPreviousCell(x,y,534)) { // contraction DAY (last symbol)
                s="last character of text contraction day";
            } else if (t.checkPreviousCell(x,y,746)) { // contraction OUND (last symbol)
                s="last character of text contraction o u n d";
            }

        } else if (val==769) {
            if (t.checkPreviousCell(x,y,534)) { // contraction EVER (last symbol)
                s="last character of text contraction ever";
            } else if (t.checkPreviousCell(x,y,659)) { // contraction ENCE (last symbol)
                s="last character of text contraction e n c e";
            } else if (t.checkPreviousCell(x,y,746)) { // contraction ANCE (last symbol)
                s="last character of text contraction a n c e";
            }

        } else if (val==770) { // contraction FROM
            s="text contraction from";

        } else if (val==771) { // contraction ONG (last symbol)
            s="last character of text contraction o n g";

        } else if (val==772) {
            if (t.checkPreviousCell(x,y,534)) { // contraction HERE (last symbol)
                s="last character of text contraction here";
            } else if (t.checkPreviousCell(x,y,595)) { // contraction HAD (last symbol)
                s="last character of text contraction had";
            }

        } else if (val>=775 && val<=784) { // contractions
            chars=['knowledge','like','more','not','','people','quite','rather','so','that'];
            s="text contraction "+chars[val-775];

        } else if (val==785) {
            if (t.checkPreviousCell(x,y,534)) { // contraction UNDER (last symbol)
                s="last character of text contraction under";
            } else if (t.checkPreviousCell(x,y,594)) { // contraction UPON (last symbol)
                s="last character of text contraction upon";
            }

        } else if (val==787) {
            if (t.checkPreviousCell(x,y,534)) { // contraction WORK (last symbol)
                s="last character of text contraction work";
            } else if (t.checkPreviousCell(x,y,594)) { // contraction WORD (last symbol)
                s="last character of text contraction word";
            } else if (t.checkPreviousCell(x,y,595)) { // contraction WORLD (last symbol)
                s="last character of text contraction world";
            }

        } else if (val==789) {
            if (t.checkPreviousCell(x,y,534)) { // contraction young (last symbol)
                s="last character of text contraction young";
            } else if (t.checkPreviousCell(x,y,644)) { // contraction ALLY (last symbol)
                s="last character of text contraction a l l y";
            } else if (t.checkPreviousCell(x,y,659)) { // contraction ITY (last symbol)
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

        } else if (val==-1) {
			s="viewer error";

		} else if (typeof val==="undefined" || val===null || val===0 || val==32) {
			s="empty";

		} else {
			s="unrecognized character";
		}

		return s;
	};

    this.doKeyDown = function (e) {
        return this.interpretKeyCode(e.keyCode);
    };

    this.doKeyUp = function (e) {
        var t = this;
        t.passThrough = false;
        switch (e.keyCode) {
            case 17: // control
                t.metaKeyDown = false;
                t.passThrough = true;
                break;
            case 91: // left command (Safari/Chrome/Opera)
            case 93: // right command (Safari/Chrome/Opera)
            case 224: // command (Firefox)
                t.metaKeyDown = false;
                t.passThrough = true;
                break;
            default:
                t.passThrough = true;
        }
        if (t.passThrough) {
            return true;
        } else {
            e.preventDefault();
            return false;
        }
    };

    this.interpretKeyCode = function (keyCode) {

        var t = this;
        t.passThrough=false;
        switch (keyCode) {
            case 17: // control
                if (!isMacOS()) {
                    t.metaKeyDown = true;
                }
                t.passThrough = true;
                break;
            case 91: // left command (Safari/Chrome/Opera)
            case 93: // right command (Safari/Chrome/Opera)
            case 224: // command (Firefox)
                if (isMacOS()) {
                    t.metaKeyDown = true;
                }
                t.passThrough = true;
                break;
            case 85: // U
                if (t.metaKeyDown) { // toggle braille translation

                    switchAlternateNotation();
                    t.passThrough = false;
                }
                break;
        }

        return t.passThrough;
    };
}

function initializeBMViewers() {

	var currentViewer;

    window.addEventListener("resize",initializeBMViewers,false);

	viewerCanvases = document.getElementsByClassName("bmviewer");
	for (var i=0; i<viewerCanvases.length; i++) {
		currentViewer = new bmviewer(viewerCanvases[i]);
		viewers.push(currentViewer);
		currentViewer.loadScore();
		currentViewer.initializeNotation();
        currentViewer.addEventListener("keydown",currentViewer.doKeyDown,false);
        currentViewer.addEventListener("keyup",currentViewer.doKeyUp,false);
        // keydown and keyup require tabindex to be set on the canvas (see stackoverflow.com/questions/12886286)
	}
}

function switchAlternateNotation() {
	alternateNotationFormat++;
	if (alternateNotationFormat == 3) {
		alternateNotationFormat = 0;
	}
	for (var i=0, len=viewers.length; i<len; i++) {
		viewers[i].setAlternateNotation();
	}
	ariaAlertElement.innerHTML = alternateNotationAlertMessages[alternateNotationFormat];
}

function arrayHasOwnIndex(array, prop) { // by T.J. Crowder, from http://stackoverflow.com/questions/9329446/for-each-in-an-array-how-to-do-that-in-javascript
    return array.hasOwnProperty(prop) && /^0$|^[1-9]\d*$/.test(prop) && prop <= 4294967294; // 2^32 - 2
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

function findPos(obj) { // from http://www.quirksmode.org/js/findpos.html
	var curLeft = 0;
	var curTop = 0;
	if (obj.offsetParent) {
		do {
			curLeft += obj.offsetLeft;
			curTop += obj.offsetTop;
		} while (obj == obj.offsetParent);
	}
	curLeft -= window.scrollX;
	curTop -= window.scrollY;
	return { x: curLeft, y: curTop};
}

function isMacOS() {
	return (navigator.appVersion.indexOf("Mac") != -1);
}

function compareCell(scoreVal,testVal) {
    // does a basic compare, but testVal=-1 means includes non-letter characters like parens
    if (testVal>-1) {
        return (scoreVal==testVal);
    } else {
        return (typeof scoreVal == 'undefined' || scoreVal === null ||
                scoreVal === 0 || scoreVal == 549 || scoreVal == 550 || scoreVal == 554 ||
                scoreVal == 555 || scoreVal == 551 || scoreVal == 552 || scoreVal == 648 ||
                scoreVal == 544 || scoreVal == 556 || scoreVal == 656);
    }
}
