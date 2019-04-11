/* global helpWindow, helpDialogOpen, optionsDialogOpen, fileDialogOpen, notationArea, notationWidth, window, config, nu, ctx, roundRect, dialogTop, dialogButtonLeft, dialogButtonTop, dialogButtonRight, interpretBraille, drawAllDots, notationGridHeight, showPageBreaks, pageWidth, pageHeight, dialogButtonWidth, dialogButtonHeight, parseOnImport, notationHeight, closeButtonCenterX, closeButtonCenterY, kOptionsDialogTitle, kShowTranslatedBrailleLabel, kShowTranslatedBrailleDescription, kShowSmallDotsLabel, kShowSmallDotsDescription, kScoreSizeLabel, kShowPageBoundariesLabel, kShowPageBoundariesDescription, kWidthLabel, kHeightLabel, kFileDialogTitle, kNewFileLabel, kNewFileDescription, kOpenFileLabel, kOpenFileDescription, kSaveFileLabel, kSaveFileDescription, kExportFileLabel, kExportFileDescription, kParseImportedFilesLabel, kParseImportedFilesDescription, currentCellFont, document, controlModules, currentLocale, selectedControlModule, initializeControls, drawNotation, currentControlModule: true */
/* jshint -W020 */

function showFileDialog() {
    fileDialogOpen = true;
    optionsDialogOpen = false;
    drawNotation();
    currentControlModule.draw();

    var d = document.createElement('div');
    d.setAttribute('id','fileDialog');
    var fileDialog = document.body.appendChild(d);
}

function showOptionsDialog() {
    fileDialogOpen = false;
    optionsDialogOpen = true;
    drawNotation();
    currentControlModule.draw();

    var d = document.createElement('div');
    d.setAttribute('id','optionsDialog');
    var optionsDialog = document.body.appendChild(d);
}

function hideDialog() {
    fileDialogOpen = false;
    optionsDialogOpen = false;
    drawNotation();
    currentControlModule.draw();
}

function toggleHelpDialog() {
	//helpDialogOpen = !helpDialogOpen
//	
//	if (helpDialogOpen) {
//		optionsDialogOpen = false;
//		fileDialogOpen = false;
//	}
	if (helpWindow && !helpWindow.closed) { // if help window is open
		helpWindow.close();
		helpDialogOpen = false;
	} else {
        helpWindow = window.open ('guide/index.html','helpWindow',config='height=400, width=600, toolbar=no, menubar=no scrollbars=yes, resizable=yes, location=no, directories=no, status=no');
        helpDialogOpen = true;
    }
}

function toggleOptionsDialog() {
	optionsDialogOpen = !optionsDialogOpen;
	
	if (optionsDialogOpen) {
		fileDialogOpen = false;
	}
}

function toggleFileDialog() {
	fileDialogOpen = !fileDialogOpen;
	
	if (fileDialogOpen) {
		optionsDialogOpen = false;
	}
}

function drawDialog() {
	
	notationWidth = notationArea.clientWidth;
	notationHeight = notationArea.clientHeight;
	
	var nhu = notationHeight/100;
	var nwu = notationWidth/100;
	nu=Math.min(nhu,nwu);
	
	ctx.fillStyle="#333";
	ctx.globalAlpha=0.8;
	dialogTop = (notationHeight/2)-(nu*45);
	roundRect(ctx, (notationWidth/2)-(nu*45), dialogTop, nu*90, nu*90, nu*5, true, false);
	dialogButtonLeft = (notationWidth/2)-(nu*40);
	dialogButtonRight = (notationWidth/2)+(nu*40);
	dialogButtonWidth = (nu*80);
	dialogButtonTop = [];
    dialogButtonTop[1] = dialogTop + (nu*10);
	dialogButtonTop[2] = dialogTop + (nu*26);
	dialogButtonTop[3] = dialogTop + (nu*42);
	dialogButtonTop[4] = dialogTop + (nu*58);
	dialogButtonTop[5] = dialogTop + (nu*74);
	dialogButtonHeight = (nu*12);
	ctx.globalAlpha=1;
	
	ctx.fillStyle="#f00";
	ctx.strokeStyle="#fff";
	ctx.lineWidth=nu;
	
	closeButtonCenterX = (notationWidth/2)+(nu*43);
	closeButtonCenterY = dialogTop+(nu*2);
	ctx.beginPath();
	ctx.arc(closeButtonCenterX,closeButtonCenterY,nu*3.5,0,2*Math.PI);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
	
	ctx.beginPath();
	ctx.moveTo(closeButtonCenterX-(nu*1.5),closeButtonCenterY-(nu*1.5));
	ctx.lineTo(closeButtonCenterX+(nu*1.5),closeButtonCenterY+(nu*1.5));
	ctx.moveTo(closeButtonCenterX-(nu*1.5),closeButtonCenterY+(nu*1.5));
	ctx.lineTo(closeButtonCenterX+(nu*1.5),closeButtonCenterY-(nu*1.5));
	ctx.stroke();
	ctx.closePath();
	
}

/*function drawHelpDialog() {
	drawDialog()
	
	ctx.fillStyle="#FFF";
	ctx.strokeStyle="#FFF";
	ctx.lineWidth=2;
	ctx.textAlign="center";
	ctx.textBaseline="middle";
	ctx.font="normal "+(nu*5)+"px sans-serif";
	ctx.fillText("Help",notationWidth/2,dialogTop+(nu*5));
	
	ctx.font="bold "+(nu*5)+"px sans-serif";
	roundRect(ctx, dialogButtonLeft, dialogButtonTop[1], dialogButtonWidth, dialogButtonHeight, nu*4, false, true);
	ctx.fillText("Button 1",notationWidth/2,dialogButtonTop[1]+(nu*4));
	
	ctx.font="bold "+(nu*5)+"px sans-serif";
	roundRect(ctx, dialogButtonLeft, dialogButtonTop[2], dialogButtonWidth, dialogButtonHeight, nu*4, false, true);
	ctx.fillText("Button 2",notationWidth/2,dialogButtonTop[2]+(nu*4));
	
	ctx.font="bold "+(nu*5)+"px sans-serif";
	roundRect(ctx, dialogButtonLeft, dialogButtonTop[3], dialogButtonWidth, dialogButtonHeight, nu*4, false, true);
	ctx.fillText("Button 3",notationWidth/2,dialogButtonTop[3]+(nu*4));
	
	ctx.font="bold "+(nu*5)+"px sans-serif";
	roundRect(ctx, dialogButtonLeft, dialogButtonTop[4], dialogButtonWidth, dialogButtonHeight, nu*4, false, true);
	ctx.fillText("Button 4",notationWidth/2,dialogButtonTop[4]+(nu*4));
	
	ctx.font="bold "+(nu*5)+"px sans-serif";
	roundRect(ctx, dialogButtonLeft, dialogButtonTop[5], dialogButtonWidth, dialogButtonHeight, nu*4, false, true);
	ctx.fillText("Button 5",notationWidth/2,dialogButtonTop[5]+(nu*4));
}*/

function drawOptionsDialog() {
	drawDialog();
	
	ctx.fillStyle="#FFF";
	ctx.strokeStyle="#FFF";
	ctx.lineWidth=2;
	ctx.textAlign="center";
	ctx.textBaseline="middle";
	ctx.font="normal "+(nu*5)+"px sans-serif";
	ctx.fillText(kOptionsDialogTitle,notationWidth/2,dialogTop+(nu*5));
	
	ctx.textAlign="left";
	ctx.font="bold "+(nu*5)+"px sans-serif";
	//roundRect(ctx, dialogButtonLeft, dialogButtonTop[1], dialogButtonWidth, dialogButtonHeight, nu*4, false, true);
	roundRect(ctx, dialogButtonLeft+(nu*3), dialogButtonTop[1]+(nu*3), nu*6, nu*6, nu*2, false, true);
	ctx.fillText(kShowTranslatedBrailleLabel,dialogButtonLeft+(nu*15),dialogButtonTop[1]+(nu*4));
	ctx.font="normal "+(nu*2.7)+"px sans-serif";
	ctx.fillText(kShowTranslatedBrailleDescription,dialogButtonLeft+(nu*15),dialogButtonTop[1]+(nu*8.5));
	if (currentCellFont.interpretBraille) {
		ctx.lineWidth=4;
		ctx.beginPath();
		ctx.moveTo(dialogButtonLeft+(nu*4),dialogButtonTop[1]+(nu*6));
		ctx.lineTo(dialogButtonLeft+(nu*5.5),dialogButtonTop[1]+(nu*7.5));
		ctx.lineTo(dialogButtonLeft+(nu*8),dialogButtonTop[1]+(nu*4));
		ctx.stroke();
		ctx.closePath();
		ctx.lineWidth=2;
	}
	
	ctx.font="bold "+(nu*5)+"px sans-serif";
	//roundRect(ctx, dialogButtonLeft, dialogButtonTop[2], dialogButtonWidth, dialogButtonHeight, nu*4, false, true);
	roundRect(ctx, dialogButtonLeft+(nu*3), dialogButtonTop[2]+(nu*3), nu*6, nu*6, nu*2, false, true);
	ctx.fillText(kShowSmallDotsLabel,dialogButtonLeft+(nu*15),dialogButtonTop[2]+(nu*4));
	ctx.font="normal "+(nu*2.7)+"px sans-serif";
	ctx.fillText(kShowSmallDotsDescription,dialogButtonLeft+(nu*15),dialogButtonTop[2]+(nu*8.5));
	if (drawAllDots) {
		ctx.lineWidth=4;
		ctx.beginPath();
		ctx.moveTo(dialogButtonLeft+(nu*4),dialogButtonTop[2]+(nu*6));
		ctx.lineTo(dialogButtonLeft+(nu*5.5),dialogButtonTop[2]+(nu*7.5));
		ctx.lineTo(dialogButtonLeft+(nu*8),dialogButtonTop[2]+(nu*4));
		ctx.stroke();
		ctx.closePath();
		ctx.lineWidth=2;
	}
	
	ctx.font="bold "+(nu*5)+"px sans-serif";
	//roundRect(ctx, dialogButtonLeft, dialogButtonTop[3], dialogButtonWidth, dialogButtonHeight, nu*4, false, true);
	ctx.fillText(kScoreSizeLabel,dialogButtonLeft+(nu*3),dialogButtonTop[3]+(nu*6));
	ctx.strokeRect(dialogButtonLeft+(nu*33),dialogButtonTop[3]+(nu*1),nu*20,nu*10);
	
	ctx.beginPath();
	ctx.moveTo(dialogButtonLeft+(nu*48.5),dialogButtonTop[3]+(nu*5));
	ctx.lineTo(dialogButtonLeft+(nu*50),dialogButtonTop[3]+(nu*3));
	ctx.lineTo(dialogButtonLeft+(nu*51.5),dialogButtonTop[3]+(nu*5));
	ctx.lineTo(dialogButtonLeft+(nu*48.5),dialogButtonTop[3]+(nu*5));
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.moveTo(dialogButtonLeft+(nu*48.5),dialogButtonTop[3]+(nu*7));
	ctx.lineTo(dialogButtonLeft+(nu*50),dialogButtonTop[3]+(nu*9));
	ctx.lineTo(dialogButtonLeft+(nu*51.5),dialogButtonTop[3]+(nu*7));
	ctx.lineTo(dialogButtonLeft+(nu*48.5),dialogButtonTop[3]+(nu*7));
	ctx.fill();
	ctx.closePath();
	
	ctx.textAlign="left";
	ctx.font="normal "+(nu*5)+"px sans-serif";
	ctx.fillText(notationGridHeight,dialogButtonLeft+(nu*36),dialogButtonTop[3]+(nu*6));
	
	ctx.font="bold "+(nu*5)+"px sans-serif";
	//roundRect(ctx, dialogButtonLeft, dialogButtonTop[4], dialogButtonWidth, dialogButtonHeight, nu*4, false, true);
	roundRect(ctx, dialogButtonLeft+(nu*3), dialogButtonTop[4]+(nu*3), nu*6, nu*6, nu*2, false, true);
	ctx.fillText(kShowPageBoundariesLabel,dialogButtonLeft+(nu*15),dialogButtonTop[4]+(nu*4));
	ctx.font="normal "+(nu*2.7)+"px sans-serif";
	ctx.fillText(kShowPageBoundariesDescription,dialogButtonLeft+(nu*15),dialogButtonTop[4]+(nu*8.5));
	if (showPageBreaks) {
		ctx.lineWidth=4;
		ctx.beginPath();
		ctx.moveTo(dialogButtonLeft+(nu*4),dialogButtonTop[4]+(nu*6));
		ctx.lineTo(dialogButtonLeft+(nu*5.5),dialogButtonTop[4]+(nu*7.5));
		ctx.lineTo(dialogButtonLeft+(nu*8),dialogButtonTop[4]+(nu*4));
		ctx.stroke();
		ctx.closePath();
		ctx.lineWidth=2;
	
		ctx.font="bold "+(nu*5)+"px sans-serif";
		ctx.fillText(kWidthLabel,dialogButtonLeft+(nu*3),dialogButtonTop[5]+(nu*6));
		ctx.strokeRect(dialogButtonLeft+(nu*22),dialogButtonTop[5]+(nu*1),nu*15,nu*10);
		ctx.beginPath();
		ctx.moveTo(dialogButtonLeft+(nu*32.5),dialogButtonTop[5]+(nu*5));
		ctx.lineTo(dialogButtonLeft+(nu*34),dialogButtonTop[5]+(nu*3));
		ctx.lineTo(dialogButtonLeft+(nu*35.5),dialogButtonTop[5]+(nu*5));
		ctx.lineTo(dialogButtonLeft+(nu*32.5),dialogButtonTop[5]+(nu*5));
		ctx.fill();
		ctx.closePath();
		ctx.beginPath();
		ctx.moveTo(dialogButtonLeft+(nu*32.5),dialogButtonTop[5]+(nu*7));
		ctx.lineTo(dialogButtonLeft+(nu*34),dialogButtonTop[5]+(nu*9));
		ctx.lineTo(dialogButtonLeft+(nu*35.5),dialogButtonTop[5]+(nu*7));
		ctx.lineTo(dialogButtonLeft+(nu*35.5),dialogButtonTop[5]+(nu*7));
		ctx.fill();
		ctx.closePath();
		
		ctx.textAlign="left";
		ctx.font="normal "+(nu*5)+"px sans-serif";
		ctx.fillText(pageWidth,dialogButtonLeft+(nu*24),dialogButtonTop[5]+(nu*6));
		
		ctx.font="bold "+(nu*5)+"px sans-serif";
		ctx.fillText(kHeightLabel,dialogButtonLeft+(nu*42),dialogButtonTop[5]+(nu*6));
		ctx.strokeRect(dialogButtonLeft+(nu*62),dialogButtonTop[5]+(nu*1),nu*15,nu*10);
		ctx.beginPath();
		ctx.moveTo(dialogButtonLeft+(nu*72.5),dialogButtonTop[5]+(nu*5));
		ctx.lineTo(dialogButtonLeft+(nu*74),dialogButtonTop[5]+(nu*3));
		ctx.lineTo(dialogButtonLeft+(nu*75.5),dialogButtonTop[5]+(nu*5));
		ctx.lineTo(dialogButtonLeft+(nu*72.5),dialogButtonTop[5]+(nu*5));
		ctx.fill();
		ctx.closePath();
		ctx.beginPath();
		ctx.moveTo(dialogButtonLeft+(nu*72.5),dialogButtonTop[5]+(nu*7));
		ctx.lineTo(dialogButtonLeft+(nu*74),dialogButtonTop[5]+(nu*9));
		ctx.lineTo(dialogButtonLeft+(nu*75.5),dialogButtonTop[5]+(nu*7));
		ctx.lineTo(dialogButtonLeft+(nu*75.5),dialogButtonTop[5]+(nu*7));
		ctx.fill();
		ctx.closePath();
		
		ctx.textAlign="left";
		ctx.font="normal "+(nu*5)+"px sans-serif";
		ctx.fillText(pageHeight,dialogButtonLeft+(nu*64),dialogButtonTop[5]+(nu*6));
	
	}
	
}

function drawFileDialog() {
	drawDialog();
	
	ctx.fillStyle="#FFF";
	ctx.strokeStyle="#FFF";
	ctx.lineWidth=2;
	ctx.textAlign="center";
	ctx.textBaseline="middle";
	ctx.font="normal "+(nu*5)+"px sans-serif";
	ctx.fillText(kFileDialogTitle,notationWidth/2,dialogTop+(nu*5));
	
	ctx.font="bold "+(nu*5)+"px sans-serif";
	roundRect(ctx, dialogButtonLeft, dialogButtonTop[1], dialogButtonWidth, dialogButtonHeight, nu*4, false, true);
	ctx.fillText(kNewFileLabel,notationWidth/2,dialogButtonTop[1]+(nu*4));
	ctx.font="normal "+(nu*2.7)+"px sans-serif";
	ctx.fillText(kNewFileDescription,notationWidth/2,dialogButtonTop[1]+(nu*8.5));
	
	ctx.font="bold "+(nu*5)+"px sans-serif";
	roundRect(ctx, dialogButtonLeft, dialogButtonTop[2], dialogButtonWidth, dialogButtonHeight, nu*4, false, true);
	ctx.fillText(kOpenFileLabel,notationWidth/2,dialogButtonTop[2]+(nu*4));
	ctx.font="normal "+(nu*2.7)+"px sans-serif";
	ctx.fillText(kOpenFileDescription,notationWidth/2,dialogButtonTop[2]+(nu*8.5));
	
	ctx.font="bold "+(nu*5)+"px sans-serif";
	roundRect(ctx, dialogButtonLeft, dialogButtonTop[3], dialogButtonWidth, dialogButtonHeight, nu*4, false, true);
	ctx.fillText(kSaveFileLabel,notationWidth/2,dialogButtonTop[3]+(nu*4));
	ctx.font="normal "+(nu*2.7)+"px sans-serif";
	ctx.fillText(kSaveFileDescription,notationWidth/2,dialogButtonTop[3]+(nu*8.5));
	
	ctx.font="bold "+(nu*5)+"px sans-serif";
	roundRect(ctx, dialogButtonLeft, dialogButtonTop[4], dialogButtonWidth, dialogButtonHeight, nu*4, false, true);
	ctx.fillText(kExportFileLabel,notationWidth/2,dialogButtonTop[4]+(nu*4));
	ctx.font="normal "+(nu*2.7)+"px sans-serif";
	ctx.fillText(kExportFileDescription,notationWidth/2,dialogButtonTop[4]+(nu*8.5));
	
	ctx.textAlign="left";
	ctx.font="bold "+(nu*5)+"px sans-serif";
	roundRect(ctx, dialogButtonLeft+(nu*3), dialogButtonTop[5]+(nu*3), nu*6, nu*6, nu*2, false, true);
	ctx.fillText(kParseImportedFilesLabel,dialogButtonLeft+(nu*13),dialogButtonTop[5]+(nu*4));
	ctx.font="normal "+(nu*2.7)+"px sans-serif";
	ctx.fillText(kParseImportedFilesDescription,dialogButtonLeft+(nu*13),dialogButtonTop[5]+(nu*8.5));
	if (parseOnImport) {
		ctx.lineWidth=4;
		ctx.beginPath();
		ctx.moveTo(dialogButtonLeft+(nu*4),dialogButtonTop[5]+(nu*6));
		ctx.lineTo(dialogButtonLeft+(nu*5.5),dialogButtonTop[5]+(nu*7.5));
		ctx.lineTo(dialogButtonLeft+(nu*8),dialogButtonTop[5]+(nu*4));
		ctx.stroke();
		ctx.closePath();
		ctx.lineWidth=2;
	}
}

function toggleControlSelectionDialog() {
    if (document.querySelectorAll("#dialog").length) {
        hideControlSelectionDialog();
    } else {
        showControlSelectionDialog();
    }
}

function showControlSelectionDialog() {
    var d = document.createElement('div');
    d.setAttribute('id','dialog');
    d.appendNode('div',{id:'dialogTitle'}).textContent = 'Select Controls';
    d.appendNode('div',{id:'dialogDescription'}).textContent = 'Select one of the control arrangements below.';
    var e = d.appendNode('div',{id:'dialogControlList'});
    controlModules.forEach(function(cm) {
        if (cm.locale === '' || cm.locale == currentLocale) {
            var params = {
                class:'dialogControlListItem',
                onClick:'setControlModule('+cm.id+'); hideControlSelectionDialog();'
            };
            if (selectedControlModule.id == cm.id) {
                params.selected = "selected";
            }
            e.appendNode('div', params).textContent = cm.name;
        }
    });
    document.body.appendChild(d);
}

function setControlModule(whichID) {
    selectedControlModule = controlModules.find(function(c) {
        return c.id == whichID;
    });
    initializeControls(true);
}

function hideControlSelectionDialog() {
    document.querySelector("#dialog").remove();
}
