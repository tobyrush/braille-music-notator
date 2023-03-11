/* global helpWindow, helpDialogOpen, optionsDialogOpen, fileDialogOpen, notationArea, notationWidth, window, config, nu, ctx, roundRect, dialogTop, dialogButtonLeft, dialogButtonTop, dialogButtonRight, translateBraille, showSmallDots, notationGridHeight, showPageBreaks, pageWidth, pageHeight, dialogButtonWidth, dialogButtonHeight, parseFiles, notationHeight, closeButtonCenterX, closeButtonCenterY, kOptionsDialogTitle, kTranslateBrailleLabel, kTranslateBrailleDescription, kShowSmallDotsLabel, kShowSmallDotsDescription, kScoreSizeLabel, kShowPageBreaksLabel, kShowPageBreaksDescription, kWidthLabel, kHeightLabel, kFileDialogTitle, kNewFileLabel, kNewFileDescription, kOpenFileLabel, kOpenFileDescription, kSaveFileLabel, kSaveFileDescription, kExportFileLabel, kExportFileDescription, kParseImportedFilesLabel, kParseImportedFilesDescription, currentCellFont, document, controlModules, currentLocale, selectedControlModule, initializeControls, drawNotation, currentControlModule, gridHeight, setCellHeight, dialogFieldFocus, useWordWrap, setPageSize, Event, insertOctaveSymbols, useBrailleDisplay, kUseBrailleDisplayLabel, kUseBrailleDisplayDescription, kScoreSizeUpButton, kScoreSizeDownButton, kPageSizeLabel, kPageSizeByLabel, kUseWordWrapLabel, kUseWordWrapDescription, kControlsLabel, kMIDISettingsLabel, kInsertOctaveSymbolsLabel, kInsertOctaveSymbolsDescription, kObserveKeySignaturesLabel, kObserveKeySignaturesDescription, observeKeySignatures, spellChordsDownward, kSpellChordsDownwardLabel, kSpellChordsDownwardDescription, drawControls, kImportFileText: true */
/* jshint esversion: 6 */
/* jshint -W020 */

function toggleFileDialog() {
    if (fileDialogOpen) {
        hideDialog();
    } else {
        hideDialog();
        showFileDialog();
    }
}

function showFileDialog() {
    fileDialogOpen = true;
    optionsDialogOpen = false;
    drawNotation();
    currentControlModule.draw();

    if (!document.querySelector('#fileDialog')) {
        var d = document.createElement('div');
        d.setAttribute('id','fileDialog');
        var fileDialog = document.body.appendChild(d);

        var newFileButton = fileDialog.appendChild(document.createTag('div','',{
            class: 'dialogButton',
            id: 'newFileButton',
            onclick: 'doNewFile();'
        }));
        newFileButton.appendChild(document.createTag('div',kNewFileLabel,{
            class: 'dialogButtonCaption'
        }));
        newFileButton.appendChild(document.createTag('div',kNewFileDescription,{
            class: 'dialogButtonDescription'
        }));

        var openFileButton = fileDialog.appendChild(document.createTag('div','',{
            class: 'dialogButton',
            id: 'openFileButton',
            onclick: 'doOpenFile();'
        }));
        openFileButton.appendChild(document.createTag('div',kOpenFileLabel,{
            class: 'dialogButtonCaption'
        }));
        openFileButton.appendChild(document.createTag('div',kOpenFileDescription,{
            class: 'dialogButtonDescription'
        }));

        // var importFileText = fileDialog.appendChild(document.createTag('div',kImportFileText,{
        //     class: 'dialogText',
        //     id: 'importFileText',
        // }));

        var saveFileButton = fileDialog.appendChild(document.createTag('div','',{
            class: 'dialogButton',
            id: 'saveFileButton',
            onclick: 'doSaveFile();'
        }));
        saveFileButton.appendChild(document.createTag('div',kSaveFileLabel,{
            class: 'dialogButtonCaption'
        }));
        saveFileButton.appendChild(document.createTag('div',kSaveFileDescription,{
            class: 'dialogButtonDescription'
        }));

        var exportFileButton = fileDialog.appendChild(document.createTag('div','',{
            class: 'dialogButton',
            id: 'exportFileButton',
            onclick: 'doExportFile();'
        }));
        exportFileButton.appendChild(document.createTag('div',kExportFileLabel,{
            class: 'dialogButtonCaption'
        }));
        exportFileButton.appendChild(document.createTag('div',kExportFileDescription,{
            class: 'dialogButtonDescription'
        }));

        var parseFilesCheckbox = fileDialog.appendChild(document.createTag('div','',{
            class: 'dialogCheckbox',
            id: 'parseFilesCheckbox',
            onclick: 'toggleParseFiles();'
        }));
        parseFilesCheckbox.appendChild(document.createTag('div','',{
            class: 'dialogCheckboxIndicator'
        }));
        parseFilesCheckbox.appendChild(document.createTag('div',kParseImportedFilesLabel,{
            class: 'dialogCheckboxCaption'
        }));
        parseFilesCheckbox.appendChild(document.createTag('div',kParseImportedFilesDescription,{
            class: 'dialogCheckboxDescription'
        }));
        if (parseFiles) { parseFilesCheckbox.setAttribute('selected','selected'); }

    }
}

function toggleParseFiles() {
    if (parseFiles) {
        parseFiles=false;
        if (document.querySelector('#fileDialog')) {
            document.querySelector('#parseFilesCheckbox').removeAttribute('selected');
        }
    } else {
        parseFiles=true;
        if (document.querySelector('#fileDialog')) {
            document.querySelector('#parseFilesCheckbox').setAttribute('selected','selected');
        }
    }
}

function toggleOptionsDialog() {
    if (optionsDialogOpen) {
        hideDialog();
    } else {
        hideDialog();
        showOptionsDialog();
    }
}

function handleDialogKeypress(e) {
    if (e.target.className=="dialogFieldValue") {
        var inputEvent = new Event('input', {'bubbles': true, 'cancelable': true});
        switch(e.keyCode) {
            case 38: // up arrow
                e.target.value++;
                e.target.dispatchEvent(inputEvent);
                e.target.select();
                e.preventDefault();

                break;
            case 40: // down arrow
                e.target.value--;
                e.target.dispatchEvent(inputEvent);
                e.target.select();
                e.preventDefault();
                break;
        }
    }
}

function showOptionsDialog() {
    fileDialogOpen = false;
    optionsDialogOpen = true;
    drawNotation();
    currentControlModule.draw();

    if (!document.querySelector('#optionsDialog')) {
        var d = document.createElement('div');
        d.setAttribute('id','optionsDialog');
        var optionsDialog = document.body.appendChild(d);

        optionsDialog.addEventListener('keydown',handleDialogKeypress,true);

        var translateBrailleCheckbox = optionsDialog.appendChild(document.createTag('div','',{
            class: 'dialogCheckbox',
            id: 'translateBrailleCheckbox',
            onclick: 'toggleTranslateBraille();'
        }));
        translateBrailleCheckbox.appendChild(document.createTag('div','',{
            class: 'dialogCheckboxIndicator'
        }));
        translateBrailleCheckbox.appendChild(document.createTag('div',kTranslateBrailleLabel,{
            class: 'dialogCheckboxCaption'
        }));
        translateBrailleCheckbox.appendChild(document.createTag('div',kTranslateBrailleDescription,{
            class: 'dialogCheckboxDescription'
        }));
        if (currentCellFont.translateBraille) { translateBrailleCheckbox.setAttribute('selected','selected'); }

        var showSmallDotsCheckbox = optionsDialog.appendChild(document.createTag('div','',{
            class: 'dialogCheckbox',
            id: 'showSmallDotsCheckbox',
            onclick: 'toggleShowSmallDots();'
        }));
        showSmallDotsCheckbox.appendChild(document.createTag('div','',{
            class: 'dialogCheckboxIndicator'
        }));
        showSmallDotsCheckbox.appendChild(document.createTag('div',kShowSmallDotsLabel,{
            class: 'dialogCheckboxCaption'
        }));
        showSmallDotsCheckbox.appendChild(document.createTag('div',kShowSmallDotsDescription,{
            class: 'dialogCheckboxDescription'
        }));
        if (showSmallDots) { showSmallDotsCheckbox.setAttribute('selected','selected'); }

        var useBrailleDisplayCheckbox = optionsDialog.appendChild(document.createTag('div','',{
            class: 'dialogCheckbox',
            id: 'useBrailleDisplayCheckbox',
            onclick: 'toggleUseBrailleDisplay();'
        }));
        useBrailleDisplayCheckbox.appendChild(document.createTag('div','',{
            class: 'dialogCheckboxIndicator'
        }));
        useBrailleDisplayCheckbox.appendChild(document.createTag('div',kUseBrailleDisplayLabel,{
            class: 'dialogCheckboxCaption'
        }));
        useBrailleDisplayCheckbox.appendChild(document.createTag('div',kUseBrailleDisplayDescription,{
            class: 'dialogCheckboxDescription'
        }));
        if (useBrailleDisplay) { useBrailleDisplayCheckbox.setAttribute('selected','selected'); }

        var scoreSizeField = optionsDialog.appendChild(document.createTag('div','',{
            class: 'dialogField',
            id: 'scoreSizeField'
        }));
        scoreSizeField.appendChild(document.createTag('label',kScoreSizeLabel,{
            class: 'dialogFieldCaption',
            for: 'scoreSizeFieldValue'
        }));
        scoreSizeField.appendChild(document.createTag('input','',{
            class: 'dialogFieldValue',
            name: 'scoreSizeFieldValue',
            id: 'scoreSizeFieldValue',
            value: gridHeight,
            oninput: 'setScoreSize(event);',
            onfocus: 'setDialogFieldFocus(true)',
            onblur: 'setDialogFieldFocus(false)'
        }));
        var scoreSizeButtons = scoreSizeField.appendChild(document.createTag('div','',{
            class: 'dialogFieldButtons'
        }));
        scoreSizeButtons.appendChild(document.createTag('div',kScoreSizeUpButton,{ // unicode 25b2
            class: 'dialogFieldIncreaseButton',
            onclick: 'setScoreSize(gridHeight+10);',
        }));
        scoreSizeButtons.appendChild(document.createTag('div',kScoreSizeDownButton,{ // unicode 25bc
            class: 'dialogFieldDecreaseButton',
            onclick: 'setScoreSize(gridHeight-10);',
        }));

        var showPageBreaksCheckbox = optionsDialog.appendChild(document.createTag('div','',{
            class: 'dialogCheckbox',
            id: 'showPageBreaksCheckbox',
            onclick: 'toggleShowPageBreaks();'
        }));
        showPageBreaksCheckbox.appendChild(document.createTag('div','',{
            class: 'dialogCheckboxIndicator'
        }));
        showPageBreaksCheckbox.appendChild(document.createTag('div',kShowPageBreaksLabel,{
            class: 'dialogCheckboxCaption'
        }));
        showPageBreaksCheckbox.appendChild(document.createTag('div',kShowPageBreaksDescription,{
            class: 'dialogCheckboxDescription'
        }));
        if (showPageBreaks) { showPageBreaksCheckbox.setAttribute('selected','selected'); }

        var pageSizeField = optionsDialog.appendChild(document.createTag('div','',{
            class: 'dialogSubField',
            id: 'pageSizeField'
        }));
        pageSizeField.appendChild(document.createTag('label',kPageSizeLabel,{
            class: 'dialogFieldCaption',
            for: 'scoreSizeFieldValue'
        }));
        pageSizeField.appendChild(document.createTag('input','',{
            class: 'dialogFieldValue',
            name: 'pageSizeFieldWidthValue',
            id: 'pageSizeFieldWidthValue',
            value: pageWidth,
            oninput: 'setPageWidth(event);',
            onfocus: 'setDialogFieldFocus(true)',
            onblur: 'setDialogFieldFocus(false)'
        }));
        pageSizeField.appendChild(document.createTag('label',kPageSizeByLabel,{
            class: 'dialogFieldCaption'
        }));
        pageSizeField.appendChild(document.createTag('input','',{
            class: 'dialogFieldValue',
            name: 'pageSizeFieldHeightValue',
            id: 'pageSizeFieldHeightValue',
            value: pageHeight,
            oninput: 'setPageHeight(event);',
            onfocus: 'setDialogFieldFocus(true)',
            onblur: 'setDialogFieldFocus(false)'
        }));

        var useWordWrapCheckbox = optionsDialog.appendChild(document.createTag('div','',{
            class: 'dialogSubCheckbox',
            id: 'useWordWrapCheckbox',
            onclick: 'toggleUseWordWrap();'
        }));
        useWordWrapCheckbox.appendChild(document.createTag('div','',{
            class: 'dialogCheckboxIndicator'
        }));
        useWordWrapCheckbox.appendChild(document.createTag('div',kUseWordWrapLabel,{
            class: 'dialogCheckboxCaption'
        }));
        useWordWrapCheckbox.appendChild(document.createTag('div',kUseWordWrapDescription,{
            class: 'dialogCheckboxDescription'
        }));
        if (useWordWrap) { useWordWrapCheckbox.setAttribute('selected','selected'); }

        var controlsPopup = optionsDialog.appendChild(document.createTag('div','',{
            class: 'dialogPopup',
            id: 'controlsPopup'
        }));
        controlsPopup.appendChild(document.createTag('label',kControlsLabel,{
            class: 'dialogPopupCaption',
            for: 'controlsPopupMenu'
        }));
        var controlsPopupMenu = controlsPopup.appendChild(document.createTag('select','',{
            class: 'dialogPopupMenu',
            name: 'controlsPopupMenu',
            id: 'controlsPopupMenu',
            onchange: 'switchControls(this.value);'
        }));
        controlModules.forEach(function(cm) {
            if (cm.locale === '' || cm.locale == currentLocale) {
                let c = controlsPopupMenu.appendChild(document.createTag('option',cm.name,{
                    class: 'dialogPopupMenuItem',
                    value: cm.id
                }));
                if (selectedControlModule.id == cm.id) {
                    c.setAttribute('selected','selected');
                }
            }
        });

        var midiSettingsLabel = optionsDialog.appendChild(document.createTag('div',kMIDISettingsLabel, {
            class: 'dialogLabel',
            id: 'midiSettingsLabel'
        }));

        var insertOctaveSymbolsCheckbox = optionsDialog.appendChild(document.createTag('div','',{
            class: 'dialogSubCheckbox',
            id: 'insertOctaveSymbolsCheckbox',
            onclick: 'toggleInsertOctaveSymbols();'
        }));
        insertOctaveSymbolsCheckbox.appendChild(document.createTag('div','',{
            class: 'dialogCheckboxIndicator'
        }));
        insertOctaveSymbolsCheckbox.appendChild(document.createTag('div',kInsertOctaveSymbolsLabel,{
            class: 'dialogCheckboxCaption'
        }));
        insertOctaveSymbolsCheckbox.appendChild(document.createTag('div',kInsertOctaveSymbolsDescription,{
            class: 'dialogCheckboxDescription'
        }));
        if (insertOctaveSymbols) { insertOctaveSymbolsCheckbox.setAttribute('selected','selected'); }

        var observeKeySignaturesCheckbox = optionsDialog.appendChild(document.createTag('div','',{
            class: 'dialogSubCheckbox',
            id: 'observeKeySignaturesCheckbox',
            onclick: 'toggleObserveKeySignatures();'
        }));
        observeKeySignaturesCheckbox.appendChild(document.createTag('div','',{
            class: 'dialogCheckboxIndicator'
        }));
        observeKeySignaturesCheckbox.appendChild(document.createTag('div',kObserveKeySignaturesLabel,{
            class: 'dialogCheckboxCaption'
        }));
        observeKeySignaturesCheckbox.appendChild(document.createTag('div',kObserveKeySignaturesDescription,{
            class: 'dialogCheckboxDescription'
        }));
        if (observeKeySignatures) { observeKeySignaturesCheckbox.setAttribute('selected','selected'); }

        var spellChordsDownwardCheckbox = optionsDialog.appendChild(document.createTag('div','',{
            class: 'dialogSubCheckbox',
            id: 'spellChordsDownwardCheckbox',
            onclick: 'toggleSpellChordsDownward();'
        }));
        spellChordsDownwardCheckbox.appendChild(document.createTag('div','',{
            class: 'dialogCheckboxIndicator'
        }));
        spellChordsDownwardCheckbox.appendChild(document.createTag('div',kSpellChordsDownwardLabel,{
            class: 'dialogCheckboxCaption'
        }));
        spellChordsDownwardCheckbox.appendChild(document.createTag('div',kSpellChordsDownwardDescription,{
            class: 'dialogCheckboxDescription'
        }));
        if (spellChordsDownward) { spellChordsDownwardCheckbox.setAttribute('selected','selected'); }
    }

    updateEnabledFlags();
}

function switchControls(id) {
    setControlModule(id);
    updateEnabledFlags();
}

function setDialogFieldFocus(f) {
    dialogFieldFocus = f;
}

function setScoreSize(s) {
    var scoreSizeField = document.querySelector('#scoreSizeFieldValue');
    if (s.type) { // if an event was passed
        setCellHeight(s.target.value*1);
    } else {
        setCellHeight(s*1);
    }
	if (scoreSizeField) {
        scoreSizeField.value = gridHeight;
    }
}

function setPageHeight(s) {
    var pageHeightField = document.querySelector('#pageSizeFieldHeightValue');
    if (s.type) { // if an event was passed
        setPageSize(pageWidth,s.target.value*1);
    } else {
        setPageSize(pageWidth,s*1);
    }
	if (pageHeightField) {
        pageHeightField.value = pageHeight;
    }
}

function setPageWidth(s) {
    var pageWidthField = document.querySelector('#pageSizeFieldWidthValue');
    if (s.type) { // if an event was passed
        setPageSize(s.target.value*1,pageHeight);
    } else {
        setPageSize(s*1,pageHeight);
    }
	if (pageWidthField) {
        pageWidthField.value = pageWidth;
    }
}

function toggleTranslateBraille() {
    if (currentCellFont.translateBraille) {
        currentCellFont.translateBraille=false;
        if (document.querySelector('#optionsDialog')) {
            document.querySelector('#translateBrailleCheckbox').removeAttribute('selected');
        }
    } else {
        currentCellFont.translateBraille=true;
        if (document.querySelector('#optionsDialog')) {
            document.querySelector('#translateBrailleCheckbox').setAttribute('selected','selected');
        }
    }
    drawNotation();
}

function toggleShowSmallDots() {
    if (showSmallDots) {
        showSmallDots=false;
        if (document.querySelector('#optionsDialog')) {
            document.querySelector('#showSmallDotsCheckbox').removeAttribute('selected');
        }
    } else {
        showSmallDots=true;
        if (document.querySelector('#optionsDialog')) {
            document.querySelector('#showSmallDotsCheckbox').setAttribute('selected','selected');
        }
    }
    drawNotation();
}

function toggleShowPageBreaks() {
    if (showPageBreaks) {
        showPageBreaks=false;
        if (document.querySelector('#optionsDialog')) {
            document.querySelector('#showPageBreaksCheckbox').removeAttribute('selected');
        }
    } else {
        showPageBreaks=true;
        if (document.querySelector('#optionsDialog')) {
            document.querySelector('#showPageBreaksCheckbox').setAttribute('selected','selected');
        }
    }
    updateEnabledFlags();
    drawNotation();
}

function toggleUseBrailleDisplay() {
    if (useBrailleDisplay) {
        useBrailleDisplay=false;
        if (document.querySelector('#optionsDialog')) {
            document.querySelector('#useBrailleDisplayCheckbox').removeAttribute('selected');
        }
    } else {
        useBrailleDisplay=true;
        if (document.querySelector('#optionsDialog')) {
            document.querySelector('#useBrailleDisplayCheckbox').setAttribute('selected','selected');
        }
    }
}

function toggleInsertOctaveSymbols() {
    if (insertOctaveSymbols) {
        insertOctaveSymbols=false;
        if (document.querySelector('#optionsDialog')) {
            document.querySelector('#insertOctaveSymbolsCheckbox').removeAttribute('selected');
        }
    } else {
        insertOctaveSymbols=true;
        if (document.querySelector('#optionsDialog')) {
            document.querySelector('#insertOctaveSymbolsCheckbox').setAttribute('selected','selected');
        }
    }
}

function toggleObserveKeySignatures() {
    if (observeKeySignatures) {
        observeKeySignatures=false;
        if (document.querySelector('#optionsDialog')) {
            document.querySelector('#observeKeySignaturesCheckbox').removeAttribute('selected');
        }
    } else {
        observeKeySignatures=true;
        if (document.querySelector('#optionsDialog')) {
            document.querySelector('#observeKeySignaturesCheckbox').setAttribute('selected','selected');
        }
    }
}

function toggleSpellChordsDownward() {
     if (spellChordsDownward) {
         spellChordsDownward=false;
         if (document.querySelector('#optionsDialog')) {
             document.querySelector('#spellChordsDownwardCheckbox').removeAttribute('selected');
         }
     } else {
         spellChordsDownward=true;
         if (document.querySelector('#optionsDialog')) {
             document.querySelector('#spellChordsDownwardCheckbox').setAttribute('selected','selected');
         }
     }
     drawControls();
 }

function updateEnabledFlags() {
    var pb = document.querySelector('#showPageBreaksCheckbox');
    if (pb) {
        if (pb.getAttribute('selected')) {
            document.querySelector('#pageSizeField').removeAttribute('disabled');
            document.querySelector('#useWordWrapCheckbox').removeAttribute('disabled');
        } else {
            document.querySelector('#pageSizeField').setAttribute('disabled','disabled');
            document.querySelector('#useWordWrapCheckbox').setAttribute('disabled','disabled');
        }
    }
    var ms = document.querySelector('#midiSettingsLabel');
    if (ms) {
        if (currentControlModule.midi) {
            ms.removeAttribute('disabled');
            document.querySelector('#insertOctaveSymbolsCheckbox').removeAttribute('disabled');
            document.querySelector('#observeKeySignaturesCheckbox').removeAttribute('disabled');
            document.querySelector('#spellChordsDownwardCheckbox').removeAttribute('disabled');
        } else {
            ms.setAttribute('disabled','disabled');
            document.querySelector('#insertOctaveSymbolsCheckbox').setAttribute('disabled','disabled');
            document.querySelector('#observeKeySignaturesCheckbox').setAttribute('disabled','disabled');
            document.querySelector('#spellChordsDownwardCheckbox').setAttribute('disabled','disabled');
        }
    }
}

function toggleUseWordWrap() {
    if (useWordWrap) {
        useWordWrap=false;
        if (document.querySelector('#optionsDialog')) {
            document.querySelector('#useWordWrapCheckbox').removeAttribute('selected');
        }
    } else {
        useWordWrap=true;
        if (document.querySelector('#optionsDialog')) {
            document.querySelector('#useWordWrapCheckbox').setAttribute('selected','selected');
        }
    }
    drawNotation();
}

function hideDialog() {
    fileDialogOpen = false;
    optionsDialogOpen = false;
    var n = document.querySelector('#fileDialog');
    if (n) {
        n.remove();
    }
    n = document.querySelector('#optionsDialog');
    if (n) {
        n.remove();
    }
    drawNotation();
    currentControlModule.draw();
}

function toggleHelpWindow() {
	if (helpWindow && !helpWindow.closed) { // if help window is open
		helpWindow.close();
		helpDialogOpen = false;
	} else {
        helpWindow = window.open ('guide/index.html','helpWindow',config='height=400, width=600, toolbar=no, menubar=no scrollbars=yes, resizable=yes, location=no, directories=no, status=no');
        helpDialogOpen = true;
    }
}

function setControlModule(whichID) {
    selectedControlModule = controlModules.find(function(c) {
        return c.id == whichID;
    });
    initializeControls(true);
}

function showInsertSymbolDialog() {
    var s = prompt("Enter symbol to insert at cursor:");
    if (s) {
        currentCellFont.addCellToScore(cursor.x, cursor.y, s, 0);
    }
}
