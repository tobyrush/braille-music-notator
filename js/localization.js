/* global mkStr, defaultControlModule, defaultCellFont: true */
/* jshint -W046 */
/* jshint -W020 */
/* jshint -W069 */

var kCharNames,
    kCommonWords = [],
    kDefaultFilename,
    kDotsPrefix,
    kDropFileZoneMessage,
    kExportFileDescription,
    kExportFileLabel,
    kFileButtonCaption,
    kFileDialogTitle,
    kFileNameBRF,
    kFileNameBRM,
    kHeightLabel,
    kHelpButtonCaption,
    kKeyCommands = [],
    kLongestSymbol,
    kNewFileDescription,
    kNewFileLabel,
    kOpenFileDescription,
    kOpenFileLabel,
    kOptionsButtonCaption,
    kOptionsDialogTitle,
    kParseImportedFilesDescription,
    kParseImportedFilesLabel,
    kPrefixAbbreviations = [],
    kProgramTitle,
    kSaveFileDescription,
    kSaveFileLabel,
    kScoreSizeLabel,
    kScreenReaderControlPageNumber,
    kScreenReaderTemplate,
    kShowPageBoundariesDescription,
    kShowPageBoundariesLabel,
    kShowSmallDotsDescription,
    kShowSmallDotsLabel,
    kShowTranslatedBrailleDescription,
    kShowTranslatedBrailleLabel,
    kTextAbbreviations = [],
    kUnrecognizedCharacterMessage,
    kUnsavedChangesDialogMessage,
    kVersionAndAuthor,
    kWordAbbreviations = [],
    kWidthLabel;

function localize(lang) {

    switch(lang) {

        case "en":

            defaultControlModule = 'controls/en/classic.xml';

            defaultCellFont = 'cellfonts/en/classic.xml';

            kDefaultFilename = "Untitled Score";
            kDotsPrefix = "Dots";
            kDropFileZoneMessage = "Drop file here to load";
            kExportFileDescription = "Export this document as an embosser-ready BRF file.";
            kExportFileLabel = "Export File";
            kFileButtonCaption = "File";
            kFileDialogTitle = "File";
            kFileNameBRF = "Untitled.brf";
            kFileNameBRM = "Untitled.brm";
            kHeightLabel = "Height:";
            kHelpButtonCaption = "Help";
            kLongestSymbol = 7;
            kNewFileDescription = "Discard current document and start with an empty one.";
            kNewFileLabel = "New File…";
            kOpenFileDescription = "Open a previously saved document from your computer.";
            kOpenFileLabel = "Open File…";
            kOptionsButtonCaption = "Options";
            kOptionsDialogTitle = "Options";
            kParseImportedFilesDescription = "Attempt to translate BRF files created by other programs.";
            kParseImportedFilesLabel = "Parse Imported Files";
            kProgramTitle = "Braille Music Notator";
            kSaveFileDescription = "Save this document in a format this utility can open.";
            kSaveFileLabel = "Save File";
            kScoreSizeLabel = "Score size:";
            kScreenReaderControlPageNumber = "Control page %%1";
            kScreenReaderTemplate = "%%1. line %%2 character %%3. %%4";
            kShowPageBoundariesDescription = "Show where page breaks occur when embossed.";
            kShowPageBoundariesLabel = "Show Page Boundaries";
            kShowSmallDotsDescription = "Fill in empty dots in braille characters.";
            kShowSmallDotsLabel = "Show Small Dots";
            kShowTranslatedBrailleDescription = "Automatically translate braille into music notation.";
            kShowTranslatedBrailleLabel = "Show Translated Braille";
            kUnrecognizedCharacterMessage = "unrecognized character";
            kUnsavedChangesDialogMessage = "Any unsaved changes will be lost. Are you sure you want to continue?";
            kVersionAndAuthor = "v%%1 by Toby W. Rush";
            kWidthLabel = "Width:";

            kCharNames = [
                [mkStr([0,0,0,32,0,0,0]),"empty"],
                [mkStr([0,0,0,33,75,0,0]),"first character of A double whole note"],
                [mkStr([0,0,0,33,0,0,0]),"A whole note"],
                [mkStr([0,0,0,34,0,0,0]),"fourth octave"],
                [mkStr([0,0,0,35,0,0,0]),"time signature prefix"],
                [mkStr([0,0,0,36,0,0,0]),"E quarter note"],
                [mkStr([0,0,0,37,337,0,0]),"first character of double sharp"],
                [mkStr([0,0,0,37,0,0,0]),"sharp"],
                [mkStr([0,0,0,38,75,0,0]),"first character of E double whole note"],
                [mkStr([0,0,0,38,0,0,0]),"E whole note"],
                [mkStr([0,0,0,39,0,0,0]),"dot"],
                [mkStr([0,0,0,40,75,0,0]),"first character of G double whole note"],
                [mkStr([0,0,0,40,0,0,0]),"G whole note"],
                [mkStr([0,0,0,41,75,0,0]),"first character of B double whole note"],
                [mkStr([0,0,0,41,0,0,0]),"B whole note"],
                [mkStr([0,0,0,42,0,0,0]),"natural"],
                [mkStr([0,0,0,43,0,0,0]),"added note at the third"],
                [mkStr([0,0,0,44,144,0,0]),"first character of eighth octave"],
                [mkStr([0,0,0,44,0,0,0]),"seventh octave"],
                [mkStr([0,0,0,45,0,0,0]),"added note at the octave"],
                [mkStr([0,0,0,46,0,0,0]),"fifth octave"],
                [mkStr([0,0,0,47,0,0,0]),"added note at the second"],
                [mkStr([0,0,0,48,0,0,0]),"time signature lower number 0"],
                [mkStr([0,0,0,49,0,0,0]),"time signature lower number 1"],
                [mkStr([0,0,0,50,0,0,0]),"time signature lower number 2"],
                [mkStr([0,0,0,51,0,0,0]),"time signature lower number 3"],
                [mkStr([0,0,0,52,0,0,0]),"time signature lower number 4"],
                [mkStr([0,0,0,53,0,0,0]),"time signature lower number 5"],
                [mkStr([0,0,0,54,0,0,0]),"time signature lower number 6"],
                [mkStr([0,0,0,55,0,0,0]),"time signature lower number 7"],
                [mkStr([0,0,0,56,0,0,0]),"time signature lower number 8"],
                [mkStr([0,0,0,57,0,0,0]),"time signature lower number 9"],
                [mkStr([0,0,0,58,0,0,0]),"D quarter note"],
                [mkStr([0,0,0,59,0,0,0]),"sixth octave"],
                [mkStr([0,0,0,60,360,0,0]),"first character of double flat"],
                [mkStr([0,0,0,60,0,0,0]),"flat"],
                [mkStr([0,0,0,61,75,0,0]),"first character of F double whole note"],
                [mkStr([0,0,0,61,0,0,0]),"F whole note"],
                [mkStr([0,0,0,62,0,0,0]),"word prefix"],
                [mkStr([0,0,0,63,0,0,0]),"C quarter note"],
                [mkStr([0,0,0,64,164,0,0]),"first character of octave 0"],
                [mkStr([0,0,0,64,0,0,0]),"first octave"],
                [mkStr([0,0,0,66,0,0,0]),"second character of down bow"],
                [mkStr([0,0,0,67,0,0,0]),"short slur"],
                [mkStr([0,0,0,68,0,0,0]),"C eighth note"],
                [mkStr([0,0,0,69,0,0,0]),"D eighth note"],
                [mkStr([0,0,0,70,0,0,0]),"E eighth note"],
                [mkStr([0,0,0,71,0,0,0]),"F eighth note"],
                [mkStr([0,0,0,72,0,0,0]),"G eighth note"],
                [mkStr([0,0,0,73,0,0,0]),"A eighth note"],
                [mkStr([0,0,0,74,0,0,0]),"B eighth note"],
                [mkStr([0,0,0,75,0,0,0]),"last character of double whole note symbol"],
                [mkStr([0,0,77,75,0,0,0]),"last character of double whole rest symbol"],
                [mkStr([0,0,0,76,0,0,0]),"barline"],
                [mkStr([0,0,0,77,0,0,0]),"whole rest"],
                [mkStr([0,0,0,78,0,0,0]),"C half note"],
                [mkStr([0,0,0,79,0,0,0]),"D half note"],
                [mkStr([0,0,0,80,0,0,0]),"E half note"],
                [mkStr([0,0,0,81,0,0,0]),"F half note"],
                [mkStr([0,0,0,82,0,0,0]),"G half note"],
                [mkStr([0,0,0,83,0,0,0]),"A half note"],
                [mkStr([0,0,0,84,0,0,0]),"B half note"],
                [mkStr([0,0,0,85,0,0,0]),"half rest"],
                [mkStr([0,0,0,86,0,0,0]),"quarter rest"],
                [mkStr([0,0,0,87,0,0,0]),"B quarter note"],
                [mkStr([0,0,0,88,0,0,0]),"eighth rest"],
                [mkStr([0,0,0,89,75,0,0]),"first character of C double whole note"],
                [mkStr([0,0,0,89,0,0,0]),"C whole note"],
                [mkStr([0,0,0,90,75,0,0]),"first character of D double whole note"],
                [mkStr([0,0,0,90,0,0,0]),"D whole note"],
                [mkStr([0,0,0,91,0,0,0]),"A quarter note"],
                [mkStr([0,0,0,92,0,0,0]),"G quarter note"],
                [mkStr([0,0,0,93,0,0,0]),"F quarter note"],
                [mkStr([0,0,0,94,0,0,0]),"second octave"],
                [mkStr([0,0,0,95,0,0,0]),"third octave"],
                [mkStr([0,0,0,133,0,0,0]),"A sixteenth note"],
                [mkStr([0,0,0,134,0,0,0]),"first character of play section number"],
                [mkStr([0,0,0,135,0,0,0]),"fourth interval"],
                [mkStr([0,0,0,136,0,0,0]),"E sixty-fourth note"],
                [mkStr([0,0,0,137,0,0,0]),"key signature sharp"],
                [mkStr([0,0,0,138,0,0,0]),"E sixteenth note"],
                [mkStr([0,0,0,139,0,0,0]),"second character of final or double bar line"],
                [mkStr([0,0,0,140,0,0,0]),"G sixteenth note"],
                [mkStr([0,0,0,141,0,0,0]),"B sixteenth note"],
                [mkStr([0,0,0,142,0,0,0]),"key signature natural"],
                [mkStr([0,0,0,143,0,0,0]),"begin repeated section"],
                [mkStr([0,0,0,144,0,0,0]),"second character of eighth octave"],
                [mkStr([0,0,0,146,0,0,0]),"first character of common time symbol"],
                [mkStr([0,0,0,148,0,0,0]),"added note at the sixth"],
                [mkStr([0,0,0,149,0,0,0]),"second character of pause"],
                [mkStr([0,0,0,150,0,0,0]),"triplet symbol"],
                [mkStr([0,0,0,151,0,0,0]),"added note at the seventh"],
                [mkStr([0,0,0,153,0,0,0]),"grace note"],
                [mkStr([0,0,0,154,0,0,0]),"trill"],
                [mkStr([0,0,0,155,0,0,0]),"measure repeat"],
                [mkStr([0,0,0,156,0,0,0]),"second character of tenuto, accent or marcato"],
                [mkStr([0,0,0,157,0,0,0]),"added note at the fifth"],
                [mkStr([0,0,0,158,0,0,0]),"D sixty-fourth note"],
                [mkStr([0,0,0,159,0,0,0]),"first character of marcato"],
                [mkStr([0,0,0,160,0,0,0]),"key signature flat"],
                [mkStr([0,0,0,161,0,0,0]),"F sixteenth note"],
                [mkStr([0,0,0,162,0,0,0]),"first character of gradual crescendo or diminuendo"],
                [mkStr([0,0,0,163,0,0,0]),"C sixty-fourth note"],
                [mkStr([0,0,0,164,0,0,0]),"second character of octave 0"],
                [mkStr([0,0,0,165,0,0,0]),"time signature top number 1"],
                [mkStr([0,0,0,166,0,0,0]),"time signature top number 2"],
                [mkStr([0,0,0,167,0,0,0]),"time signature top number 3"],
                [mkStr([0,0,0,168,0,0,0]),"time signature top number 4"],
                [mkStr([0,0,0,169,0,0,0]),"time signature top number 5"],
                [mkStr([0,0,0,170,0,0,0]),"time signature top number 6"],
                [mkStr([0,0,0,171,0,0,0]),"time signature top number 7"],
                [mkStr([0,0,0,172,0,0,0]),"time signature top number 8"],
                [mkStr([0,0,0,173,0,0,0]),"time signature top number 9"],
                [mkStr([0,0,0,174,0,0,0]),"time signature top number 0"],
                [mkStr([0,0,0,175,0,0,0]),"second character of final or double bar line symbol"],
                [mkStr([0,0,0,176,0,0,0]),"second character of fermata"],
                [mkStr([0,0,0,177,0,0,0]),"sixteenth rest"],
                [mkStr([0,0,0,178,0,0,0]),"C thirty-second note"],
                [mkStr([0,0,0,179,0,0,0]),"D thirty-second note"],
                [mkStr([0,0,0,180,0,0,0]),"E thirty-second note"],
                [mkStr([0,0,0,181,0,0,0]),"F thirty-second note"],
                [mkStr([0,0,0,182,0,0,0]),"G thirty-second note"],
                [mkStr([0,0,0,183,0,0,0]),"A thirty-second note"],
                [mkStr([0,0,0,184,0,0,0]),"B thirty-second note"],
                [mkStr([0,0,0,185,0,0,0]),"thirty-second rest"],
                [mkStr([0,0,0,186,0,0,0]),"sixty-fourth rest"],
                [mkStr([0,0,0,187,0,0,0]),"B sixty-fourth note"],
                [mkStr([0,0,0,188,0,0,0]),"one hundred twenty-eighth rest"],
                [mkStr([0,0,0,189,0,0,0]),"C sixteenth note"],
                [mkStr([0,0,0,190,0,0,0]),"D sixteenth note"],
                [mkStr([0,0,0,191,0,0,0]),"A sixty-fourth note"],
                [mkStr([0,0,0,192,0,0,0]),"G sixty-fourth note"],
                [mkStr([0,0,0,193,0,0,0]),"F sixty-fourth note"],
                [mkStr([0,0,0,194,0,0,0]),"first character of large note value sign"],
                [mkStr([0,0,0,195,0,0,0]),"first character of cut time symbol"],
                [mkStr([0,0,0,234,0,0,0]),"braille music hyphen"],
                [mkStr([0,0,0,235,0,0,0]),"key signature prefix"],
                [mkStr([0,0,0,239,0,0,0]),"last symbol of gradual dynamic, text dynamic, or hand sign"],
                [mkStr([0,0,0,242,0,0,0]),"end repeated section"],
                [mkStr([0,0,0,243,0,0,0]),"second character of play section number"],
                [mkStr([0,0,0,244,0,0,0]),"first character of small note value sign"],
                [mkStr([0,0,0,248,0,0,0]),"tuplet number zero"],
                [mkStr([0,0,0,249,0,0,0]),"tuplet number 1"],
                [mkStr([0,0,0,250,0,0,0]),"tuplet number 2"],
                [mkStr([0,0,0,251,0,0,0]),"tuplet number 3"],
                [mkStr([0,0,0,252,0,0,0]),"tuplet number 4"],
                [mkStr([0,0,0,253,0,0,0]),"tuplet number 5"],
                [mkStr([0,0,0,254,0,0,0]),"tuplet number 6"],
                [mkStr([0,0,0,255,0,0,0]),"tuplet number 7"],
                [mkStr([0,0,0,256,0,0,0]),"tuplet number 8"],
                [mkStr([0,0,0,257,0,0,0]),"tuplet number 9"],
                [mkStr([0,0,0,259,0,0,0]),"grace note slur"],
                [mkStr([0,0,0,260,175,139,0]),"first character of double bar line"],
                [mkStr([0,0,0,260,175,0,0]),"first character of final bar line"],
                [mkStr([0,0,0,260,355,0,0]),"first character of forward repeat"],
                [mkStr([0,0,0,260,350,0,0]),"first character of backward repeat"],
                [mkStr([0,0,0,260,0,0,0]),"first character of bar line symbol"],
                [mkStr([0,0,0,262,0,0,0]),"second character of hand sign"],
                [mkStr([0,0,0,265,0,0,0]),"key signature 1 accidental"],
                [mkStr([0,0,0,266,0,0,0]),"key signature 2 accidentals"],
                [mkStr([0,0,0,267,0,0,0]),"key signature 3 accidentals"],
                [mkStr([0,0,0,268,0,0,0]),"key signature 4 accidentals"],
                [mkStr([0,0,0,269,0,0,0]),"key signature 5 accidentals"],
                [mkStr([0,0,0,270,0,0,0]),"key signature 6 accidentals"],
                [mkStr([0,0,0,271,0,0,0]),"key signature 7 accidentals"],
                [mkStr([0,0,353,275,0,0,0]),"second character of approximate notehead symbol"],
                [mkStr([0,0,353,276,0,0,0]),"second character of diamond notehead symbol"],
                [mkStr([0,0,0,295,0,0,0]),"tuplet prefix"],
                [mkStr([0,0,0,334,0,0,0]),"first character of partial measure in-accord symbol"],
                [mkStr([0,0,0,335,0,0,0]),"number of measures"],
                [mkStr([0,0,0,337,0,0,0]),"second character of double sharp symbol"],
                [mkStr([0,0,664,337,0,0,0]),"second character of one-quarter sharp symbol"],
                [mkStr([0,0,694,337,0,0,0]),"second character of five-comma sharp symbol"],
                [mkStr([0,0,695,337,0,0,0]),"second character of three-quarters sharp symbol"],
                [mkStr([0,0,0,339,0,0,0]),"second character of music prefix"],
                [mkStr([0,0,0,343,0,0,0]),"plus"],
                [mkStr([0,0,0,344,0,0,0]),"first character of music prefix"],
                [mkStr([0,0,0,346,0,0,0]),"first character of accent"],
                [mkStr([0,0,660,349,0,0,0]),"second character of braille music comma"],
                [mkStr([0,0,194,349,0,0,0]),"second character of large note values symbol"],
                [mkStr([0,0,0,350,0,0,0]),"second character of end bracket slur"],
                [mkStr([0,0,0,353,275,0,0]),"first character of approximate notehead symbol"],
                [mkStr([0,0,0,353,276,0,0]),"first character of diamond notehead symbol"],
                [mkStr([0,0,0,353,765,0,0]),"first character of notehead only symbol"],
                [mkStr([0,0,0,353,766,0,0]),"first character of X notehead symbol"],
                [mkStr([0,0,0,356,0,0,0]),"staccato"],
                [mkStr([0,0,0,359,0,0,0]),"first character of begin bracket slur"],
                [mkStr([0,0,0,360,0,0,0]),"second character of double flat"],
                [mkStr([0,0,664,360,0,0,0]),"second character of one-quarter flat symbol"],
                [mkStr([0,0,694,360,0,0,0]),"second character of four-comma flat symbol"],
                [mkStr([0,0,695,360,0,0,0]),"second character of three-quarters flat symbol"],
                [mkStr([0,0,0,362,0,0,0]),"first character of pause"],
                [mkStr([0,0,0,364,0,0,0]),"first character of tie"],
                [mkStr([0,0,0,366,0,0,0]),"second character of begin bracket slur"],
                [mkStr([0,0,0,367,0,0,0]),"second character of tie"],
                [mkStr([0,0,0,368,0,0,0]),"C one hundred twenty-eighth note"],
                [mkStr([0,0,0,369,0,0,0]),"D one hundred twenty-eighth note"],
                [mkStr([0,0,0,370,0,0,0]),"E one hundred twenty-eighth note"],
                [mkStr([0,0,0,371,0,0,0]),"F one hundred twenty-eighth note"],
                [mkStr([0,0,0,372,0,0,0]),"G one hundred twenty-eighth note"],
                [mkStr([0,0,0,373,0,0,0]),"A one hundred twenty-eighth note"],
                [mkStr([0,0,0,374,0,0,0]),"B one hundred twenty-eighth note"],
                [mkStr([0,0,0,375,0,0,0]),"second character of measure division for in-accord"],
                [mkStr([0,662,447,376,0,0,0]),"last character of treble clef symbol"],
                [mkStr([0,662,643,376,0,0,0]),"last character of alto clef symbol"],
                [mkStr([662,643,634,376,0,0,0]),"last character of tenor clef symbol"],
                [mkStr([0,662,635,376,0,0,0]),"last character of bass clef symbol"],
                [mkStr([0,0,0,377,0,0,0]),"multi-measure rest suffix"],
                [mkStr([0,0,0,394,0,0,0]),"first character of end bracket slur"],
                [mkStr([0,0,0,395,0,0,0]),"first character of tenuto"],
                [mkStr([0,0,0,435,0,0,0]),"second character of equals sign for metronome markings"],
                [mkStr([0,0,0,439,0,0,0]),"tuplet suffix"],
                [mkStr([0,0,0,446,0,0,0]),"first symbol for right hand sign"],
                [mkStr([0,0,662,447,376,0,0]),"second character of treble clef symbol"],
                [mkStr([0,0,0,448,0,0,0]),"major"],
                [mkStr([0,0,0,449,0,0,0]),"fourth finger"],
                [mkStr([0,0,0,452,0,0,0]),"diminished"],
                [mkStr([0,0,0,455,0,0,0]),"first character of equals sign for metronome markings"],
                [mkStr([0,0,0,460,0,0,0]),"first character of fermata"],
                [mkStr([0,0,0,462,0,0,0]),"first character of dynamic symbol"],
                [mkStr([0,0,0,465,0,0,0]),"thumb"],
                [mkStr([0,0,0,466,0,0,0]),"index finger"],
                [mkStr([0,0,146,467,0,0,0]),"second character of common time symbol"],
                [mkStr([0,0,195,467,0,0,0]),"second character of cut time symbol"],
                [mkStr([0,0,0,475,0,0,0]),"fifth finger"],
                [mkStr([0,0,0,476,0,0,0]),"third finger"],
                [mkStr([0,0,0,495,0,0,0]),"first character of left hand sign"],
                [mkStr([0,0,0,533,0,0,0]),"text contraction the"],
                [mkStr([0,0,0,534,0,0,0]),"text contraction symbol"],
                [mkStr([0,0,0,535,0,0,0]),"number sign"],
                [mkStr([0,0,0,536,0,0,0]),"text contraction e d"],
                [mkStr([0,0,0,537,0,0,0]),"text contraction s h"],
                [mkStr([0,0,0,538,0,0,0]),"text contraction and"],
                [mkStr([0,0,0,539,0,0,0]),"apostrophe"],
                [mkStr([0,0,0,540,0,0,0]),"text contraction of"],
                [mkStr([0,0,0,541,0,0,0]),"text contraction with"],
                [mkStr([0,0,0,542,0,0,0]),"text contraction c h"],
                [mkStr([0,0,0,543,0,0,0]),"text contraction i n g"],
                [mkStr([0,0,0,544,0,0,0]),"capital sign"],
                [mkStr([0,0,0,545,0,0,0]),"hyphen"],
                [mkStr([0,0,0,546,0,0,0]),"decimal point"],
                [mkStr([0,0,0,547,0,0,0]),"text contraction s t"],
                [mkStr([0,0,0,549,0,0,0]),"comma"],
                [mkStr([0,0,0,550,0,0,0]),"semicolon"],
                [mkStr([0,0,0,551,0,0,0]),"colon"],
                [mkStr([0,0,0,552,0,0,0]),"full stop"],
                [mkStr([0,0,0,553,0,0,0]),"text contraction e n"],
                [mkStr([0,0,0,554,0,0,0]),"exclamation point"],
                [mkStr([0,0,0,555,0,0,0]),"parenthesis"],
                [mkStr([0,0,0,556,0,0,0]),"question mark"],
                [mkStr([0,0,0,557,0,0,0]),"text contraction in"],
                [mkStr([0,0,0,558,0,0,0]),"text contraction w h"],
                [mkStr([0,0,0,559,0,0,0]),"text sign"],
                [mkStr([0,0,0,560,0,0,0]),"text contractio  g h"],
                [mkStr([0,0,0,561,0,0,0]),"text contraction for"],
                [mkStr([0,0,0,562,0,0,0]),"text contraction a r"],
                [mkStr([0,0,0,563,0,0,0]),"text contraction t h"],
                [mkStr([0,0,0,565,0,0,0]),"text a"],
                [mkStr([0,0,0,566,0,0,0]),"text b"],
                [mkStr([0,0,0,567,0,0,0]),"text c"],
                [mkStr([0,0,0,568,0,0,0]),"text d"],
                [mkStr([0,0,0,569,0,0,0]),"text e"],
                [mkStr([0,0,0,570,0,0,0]),"text f"],
                [mkStr([0,0,0,571,0,0,0]),"text g"],
                [mkStr([0,0,0,572,0,0,0]),"text h"],
                [mkStr([0,0,0,573,0,0,0]),"text i"],
                [mkStr([0,0,0,574,0,0,0]),"text j"],
                [mkStr([0,0,0,575,0,0,0]),"text k"],
                [mkStr([0,0,0,576,0,0,0]),"text l"],
                [mkStr([0,0,0,577,0,0,0]),"text m"],
                [mkStr([0,0,0,578,0,0,0]),"text n"],
                [mkStr([0,0,0,579,0,0,0]),"text o"],
                [mkStr([0,0,0,580,0,0,0]),"text p"],
                [mkStr([0,0,0,581,0,0,0]),"text q"],
                [mkStr([0,0,0,582,0,0,0]),"text r"],
                [mkStr([0,0,0,583,0,0,0]),"text s"],
                [mkStr([0,0,0,584,0,0,0]),"text t"],
                [mkStr([0,0,0,585,0,0,0]),"text u"],
                [mkStr([0,0,0,586,0,0,0]),"text v"],
                [mkStr([0,0,0,587,0,0,0]),"text w"],
                [mkStr([0,0,0,588,0,0,0]),"text x"],
                [mkStr([0,0,0,589,0,0,0]),"text y"],
                [mkStr([0,0,0,590,0,0,0]),"text z"],
                [mkStr([0,0,0,591,0,0,0]),"text contraction o w"],
                [mkStr([0,0,0,592,0,0,0]),"text contraction o u"],
                [mkStr([0,0,0,593,0,0,0]),"text contraction e r"],
                [mkStr([0,0,0,594,0,0,0]),"text contraction symbol"],
                [mkStr([0,0,0,595,0,0,0]),"text contraction symbol"],
                [mkStr([0,0,534,633,0,0,0]),"last character of text contraction there"],
                [mkStr([0,0,594,633,0,0,0]),"last character of text contraction these"],
                [mkStr([0,0,595,633,0,0,0]),"last character of text contraction their"],
                [mkStr([0,662,643,634,376,0,0]),"third character of tenor clef symbol"],
                [mkStr([0,0,662,635,376,0,0]),"second character of bass clef symbol"],
                [mkStr([0,0,0,637,0,0,0]),"text contraction shall"],
                [mkStr([0,0,0,638,0,0,0]),"last character of text contraction spirit"],
                [mkStr([0,0,0,639,0,0,0]),"second character of up bow"],
                [mkStr([0,0,0,642,0,0,0]),"text contraction child"],
                [mkStr([0,0,662,643,376,0,0]),"second character of alto clef symbol"],
                [mkStr([0,0,662,643,634,376,0]),"second character of tenor clef symbol"],
                [mkStr([0,0,0,644,789,0,0]),"first character of contraction a l l y"],
                [mkStr([0,0,0,644,678,0,0]),"first character of contraction a t i o n"],
                [mkStr([0,0,0,645,0,0,0]),"text contraction com"],
                [mkStr([0,0,0,646,0,0,0]),"first character of measure division symbol for in-accord"],
                [mkStr([0,0,0,647,0,0,0]),"slash"],
                [mkStr([0,0,0,648,0,0,0]),"close quotation marks"],
                [mkStr([0,0,0,649,0,0,0]),"text contraction e a"],
                [mkStr([0,0,0,650,0,0,0]),"text contraction b b"],
                [mkStr([0,0,0,651,0,0,0]),"text contraction c c"],
                [mkStr([0,0,0,652,0,0,0]),"text contraction d d"],
                [mkStr([0,0,0,654,0,0,0]),"text contraction f f"],
                [mkStr([0,0,0,655,0,0,0]),"text contraction g g"],
                [mkStr([0,0,0,656,0,0,0]),"open quotation marks"],
                [mkStr([0,0,0,657,0,0,0]),"text contraction by"],
                [mkStr([0,0,0,658,0,0,0]),"text contraction which"],
                [mkStr([0,0,0,659,0,0,0]),"text contraction symbol"],
                [mkStr([0,0,0,660,349,0,0]),"first character of braille music comma"],
                [mkStr([0,0,194,660,0,0,0]),"second character of large note values symbol"],
                [mkStr([0,0,0,662,447,376,0]),"first character of treble clef symbol"],
                [mkStr([0,0,0,662,643,376,0]),"first character of alto clef symbol"],
                [mkStr([0,0,0,662,643,634,376]),"first character of tenor clef symbol"],
                [mkStr([0,0,0,662,635,376,0]),"first character of bass clef symbol"],
                [mkStr([0,0,0,663,0,0,0]),"text contraction this"],
                [mkStr([0,0,0,664,337,0,0]),"first character of one-quarter sharp symbol"],
                [mkStr([0,0,0,664,360,0,0]),"first character of one-quarter flat symbol"],
                [mkStr([0,0,0,665,0,0,0]),"text 1"],
                [mkStr([0,0,0,666,0,0,0]),"text 2"],
                [mkStr([0,0,0,667,0,0,0]),"text 3"],
                [mkStr([0,0,0,668,0,0,0]),"text 4"],
                [mkStr([0,0,0,669,0,0,0]),"text 5"],
                [mkStr([0,0,0,670,0,0,0]),"text 6"],
                [mkStr([0,0,0,671,0,0,0]),"text 7"],
                [mkStr([0,0,0,672,0,0,0]),"text 8"],
                [mkStr([0,0,0,673,0,0,0]),"text 9"],
                [mkStr([0,0,0,674,0,0,0]),"text 0"],
                [mkStr([0,0,0,675,0,0,0]),"last character of text contraction know"],
                [mkStr([0,0,534,676,0,0,0]),"last character of text contraction lord"],
                [mkStr([0,0,659,676,0,0,0]),"last character of text contraction f u l"],
                [mkStr([0,0,534,677,0,0,0]),"last character of text contraction mother"],
                [mkStr([0,0,595,677,0,0,0]),"last character of text contraction many"],
                [mkStr([0,0,534,678,0,0,0]),"last character of text contraction name"],
                [mkStr([0,0,644,678,0,0,0]),"last character of text contraction a t i o n"],
                [mkStr([0,0,659,678,0,0,0]),"last character of text contraction t i o n"],
                [mkStr([0,0,746,678,0,0,0]),"last character of text contraction s i o n"],
                [mkStr([0,0,0,679,0,0,0]),"last character of text contraction one"],
                [mkStr([0,0,0,680,0,0,0]),"last character of text contraction part"],
                [mkStr([0,0,0,681,0,0,0]),"last character of text contraction question"],
                [mkStr([0,0,0,682,0,0,0]),"last character of text contraction right"],
                [mkStr([0,0,534,683,0,0,0]),"last character of text contraction some"],
                [mkStr([0,0,659,683,0,0,0]),"last character of text contraction ness"],
                [mkStr([0,0,746,683,0,0,0]),"last character of text contraction less"],
                [mkStr([0,0,534,684,0,0,0]),"last character of text contraction time"],
                [mkStr([0,0,659,684,0,0,0]),"last character of text contraction m e n t"],
                [mkStr([0,0,746,684,0,0,0]),"last character of text contraction o u n t"],
                [mkStr([0,0,0,685,0,0,0]),"last character of text contraction us"],
                [mkStr([0,0,0,686,0,0,0]),"last character of text contraction very"],
                [mkStr([0,0,0,687,0,0,0]),"last character of text contraction will"],
                [mkStr([0,0,0,688,0,0,0]),"last character of text contraction it"],
                [mkStr([0,0,0,689,0,0,0]),"last character of text contraction you"],
                [mkStr([0,0,0,690,0,0,0]),"last character of text contraction as"],
                [mkStr([0,0,0,692,0,0,0]),"last character of text contraction out"],
                [mkStr([0,0,0,694,337,0,0]),"first character of five-comma sharp symbol"],
                [mkStr([0,0,0,694,360,0,0]),"first character of five-comma flat symbol"],
                [mkStr([0,0,0,695,337,0,0]),"first character of three-quarters sharp symbol"],
                [mkStr([0,0,0,695,360,0,0]),"first character of three-quarters flat symbol"],
                [mkStr([0,0,0,735,0,0,0]),"multi-measure rest prefix"],
                [mkStr([0,0,0,742,0,0,0]),"last character of text contraction character"],
                [mkStr([0,0,0,746,0,0,0]),"text contraction symbol"],
                [mkStr([0,0,0,747,0,0,0]),"text contraction still"],
                [mkStr([0,0,0,749,0,0,0]),"second character of partial measure in-accord"],
                [mkStr([0,0,0,750,0,0,0]),"text contraction be"],
                [mkStr([0,0,0,751,0,0,0]),"text contraction con"],
                [mkStr([0,0,0,752,0,0,0]),"text contraction dis"],
                [mkStr([0,0,0,753,0,0,0]),"text contraction enough"],
                [mkStr([0,0,0,754,0,0,0]),"text contraction to"],
                [mkStr([0,0,0,755,0,0,0]),"text contraction were"],
                [mkStr([0,0,0,756,0,0,0]),"text contraction his"],
                [mkStr([0,0,0,757,0,0,0]),"text contraction was"],
                [mkStr([0,0,534,758,0,0,0]),"last character of text contraction where"],
                [mkStr([0,0,594,758,0,0,0]),"last character of text contraction whose"],
                [mkStr([0,0,0,760,0,0,0]),"first character of bow marking"],
                [mkStr([0,0,0,762,0,0,0]),"second character of in-accord symbol"],
                [mkStr([0,0,534,763,0,0,0]),"last character of text contraction through"],
                [mkStr([0,0,594,763,0,0,0]),"last character of text contraction those"],
                [mkStr([0,0,353,765,0,0,0]),"second character of notehead only symbol"],
                [mkStr([0,0,353,766,0,0,0]),"second character of X notehead symbol"],
                [mkStr([0,0,0,767,0,0,0]),"change fingering"],
                [mkStr([0,0,534,768,0,0,0]),"last character of text contraction day"],
                [mkStr([0,0,746,768,0,0,0]),"last character of text contraction o u n d"],
                [mkStr([0,0,534,769,0,0,0]),"last character of text contraction ever"],
                [mkStr([0,0,659,769,0,0,0]),"last character of text contraction e n c e"],
                [mkStr([0,0,746,769,0,0,0]),"last character of text contraction a n c e"],
                [mkStr([0,0,0,770,0,0,0]),"text contraction from"],
                [mkStr([0,0,0,771,0,0,0]),"last character of text contraction o n g"],
                [mkStr([0,0,534,772,0,0,0]),"last character of text contraction here"],
                [mkStr([0,0,595,772,0,0,0]),"last character of text contraction had"],
                [mkStr([0,0,0,775,0,0,0]),"text contraction knowledge"],
                [mkStr([0,0,0,776,0,0,0]),"text contraction like"],
                [mkStr([0,0,0,777,0,0,0]),"text contraction more"],
                [mkStr([0,0,0,778,0,0,0]),"text contraction not"],
                [mkStr([0,0,0,779,0,0,0]),"text contraction people"],
                [mkStr([0,0,0,780,0,0,0]),"text contraction quite"],
                [mkStr([0,0,0,781,0,0,0]),"text contraction rather"],
                [mkStr([0,0,0,782,0,0,0]),"text contraction so"],
                [mkStr([0,0,0,783,0,0,0]),"text contraction that"],
                [mkStr([0,0,0,784,0,0,0]),"text contraction "],
                [mkStr([0,0,534,785,0,0,0]),"last character of text contraction under"],
                [mkStr([0,0,594,785,0,0,0]),"last character of text contraction upon"],
                [mkStr([0,0,534,787,0,0,0]),"last character of text contraction work"],
                [mkStr([0,0,594,787,0,0,0]),"last character of text contraction word"],
                [mkStr([0,0,595,787,0,0,0]),"last character of text contraction world"],
                [mkStr([0,0,534,789,0,0,0]),"last character of text contraction young"],
                [mkStr([0,0,644,789,0,0,0]),"last character of text contraction a l l y"],
                [mkStr([0,0,659,789,0,0,0]),"last character of text contraction i t y"],
                [mkStr([0,0,0,792,0,0,0]),"last character of text contraction ought"],
                [mkStr([0,0,0,835,0,0,0]),"text contraction b l e"],
                [mkStr([0,0,0,849,0,0,0]),"last character of half-diminished symbol"],
                [mkStr([0,0,0,854,0,0,0]),"last character of plus symbol"],
                [mkStr([0,0,0,855,0,0,0]),"last character of equals symbol"],
                [mkStr([0,0,0,860,0,0,0]),"first character of in-accord symbol"],
                [mkStr([0,0,0,866,0,0,0]),"text contraction but"],
                [mkStr([0,0,0,867,0,0,0]),"text contraction can"],
                [mkStr([0,0,0,868,0,0,0]),"text contraction do"],
                [mkStr([0,0,0,869,0,0,0]),"text contraction every"],
                [mkStr([0,0,0,870,0,0,0]),"text contraction self"],
                [mkStr([0,0,0,871,0,0,0]),"text contraction go"],
                [mkStr([0,0,0,872,0,0,0]),"text contraction have"],
                [mkStr([0,0,0,874,0,0,0]),"text contraction just"],
                [mkStr([0,0,0,967,0,0,0]),"last character of text contraction cannot"],
                [mkStr([0,0,0,970,0,0,0]),"last character of text contraction father"],
            ];

            kKeyCommands[8] = [
                "Cleared cell at line %%1 character %%2.",
                "Cleared selection."
            ];
            kKeyCommands[38] = ["Deleted row."];
            kKeyCommands[40] = ["Inserted row."];
            kKeyCommands[45] = ["Inserted empty cell"];
            kKeyCommands[46] = [
                "Deleted cell at line %%1 character %%2"
            ];
            kKeyCommands[65] = ["All cells selected."];
            kKeyCommands[66] = [
                "Visual braille interpretation disabled.",
                "Visual braille interpretation enabled."
            ];
            kKeyCommands[67] = ["Selection copied to clipboard."];
            kKeyCommands[68] = [
                "Small braille dots disabled.",
                "Small braille dots enabled."
            ];
            kKeyCommands[69] = ["File exported in embosser-ready format."];
            kKeyCommands[72] = [
                "Parsing of imported documents disabled.",
                "Parsing of imported documents enabled."
            ];
            kKeyCommands[73] = [
                "Page height reduced. Height %%1, width %%2.",
                "Page boundaries visible. Page height reduced. Height %%1, width %%2."
            ];
            kKeyCommands[74] = [
                "Page width reduced. Height %%1, width %%2.",
                "Page boundaries visible. Page height reduced. Height %%1, width %%2."
            ];
            kKeyCommands[75] = [
                "Page height increased. Height %%1, width %%2.",
                "Page boundaries visible. Page height reduced. Height %%1, width %%2."
            ];
            kKeyCommands[76] = [
                "Page width increased. Height %%1, width %%2.",
                "Page boundaries visible. Page height reduced. Height %%1, width %%2."
            ];
            kKeyCommands[78] = ["New document."];
            kKeyCommands[79] = ["Open existing document."];
            kKeyCommands[80] = [
                "Page boundaries hidden.",
                "Page boundaries visible."
            ];
            kKeyCommands[83] = ["File saved."];
            kKeyCommands[85] = [
                "Accessible output set to screen reader mode.",
                "Accessible output set to refreshable braille display mode."
            ];
            kKeyCommands[89] = ["Redo."];
            kKeyCommands[90] = ["Undo."];
            kKeyCommands[187] = ["Magnification increased to %%1."];
            kKeyCommands[189] = ["Magnification decreased to %%1."];

            kWordAbbreviations['b'] = String.fromCharCode(866);
            kWordAbbreviations['c'] = String.fromCharCode(867);
            kWordAbbreviations['d'] = String.fromCharCode(868);
            kWordAbbreviations['e'] = String.fromCharCode(869);
            kWordAbbreviations['f'] = String.fromCharCode(870);
            kWordAbbreviations['g'] = String.fromCharCode(871);
            kWordAbbreviations['h'] = String.fromCharCode(872);
            kWordAbbreviations['j'] = String.fromCharCode(874);
            kWordAbbreviations['k'] = String.fromCharCode(775);
            kWordAbbreviations['l'] = String.fromCharCode(776);
            kWordAbbreviations['m'] = String.fromCharCode(777);
            kWordAbbreviations['n'] = String.fromCharCode(778);
            kWordAbbreviations['p'] = String.fromCharCode(780);
            kWordAbbreviations['q'] = String.fromCharCode(781);
            kWordAbbreviations['r'] = String.fromCharCode(782);
            kWordAbbreviations['s'] = String.fromCharCode(783);
            kWordAbbreviations['t'] = String.fromCharCode(784);
            kWordAbbreviations['u'] = String.fromCharCode(685);
            kWordAbbreviations['v'] = String.fromCharCode(686);
            kWordAbbreviations['w'] = String.fromCharCode(687);
            kWordAbbreviations['x'] = String.fromCharCode(688);
            kWordAbbreviations['y'] = String.fromCharCode(689);
            kWordAbbreviations['z'] = String.fromCharCode(690);
            kWordAbbreviations['/'] = String.fromCharCode(747);
            kWordAbbreviations['*'] = String.fromCharCode(642);
            kWordAbbreviations[':'] = String.fromCharCode(658);
            kWordAbbreviations['%'] = String.fromCharCode(637);
            kWordAbbreviations['?'] = String.fromCharCode(663);
            kWordAbbreviations['\\'] = String.fromCharCode(692);
            kWordAbbreviations['2'] = String.fromCharCode(750);
            kWordAbbreviations['5'] = String.fromCharCode(753);
            kWordAbbreviations['7'] = String.fromCharCode(755);
            kWordAbbreviations['8'] = String.fromCharCode(756);
            kWordAbbreviations['9'] = String.fromCharCode(657);
            kWordAbbreviations['0'] = String.fromCharCode(748);

            kPrefixAbbreviations['2'] = String.fromCharCode(750);
            kPrefixAbbreviations['3'] = String.fromCharCode(751);
            kPrefixAbbreviations['4'] = String.fromCharCode(752);
            kPrefixAbbreviations['6'] = String.fromCharCode(754);
            kPrefixAbbreviations['0'] = String.fromCharCode(648);
            kPrefixAbbreviations['-'] = String.fromCharCode(645);

            kTextAbbreviations['"h'] = String.fromCharCode(534,772);
            kTextAbbreviations['"!'] = String.fromCharCode(534,633);
            kTextAbbreviations['":'] = String.fromCharCode(534,758);
            kTextAbbreviations['"e'] = String.fromCharCode(534,769);
            kTextAbbreviations['"\\'] = String.fromCharCode(534,792);
            kTextAbbreviations['"f'] = String.fromCharCode(534,970);
            kTextAbbreviations['"m'] = String.fromCharCode(534,677);
            kTextAbbreviations['"n'] = String.fromCharCode(534,678);
            kTextAbbreviations['"*'] = String.fromCharCode(534,742);
            kTextAbbreviations['"q'] = String.fromCharCode(534,681);
            kTextAbbreviations['"k'] = String.fromCharCode(534,675);
            kTextAbbreviations['"l'] = String.fromCharCode(534,676);
            kTextAbbreviations['"o'] = String.fromCharCode(534,679);
            kTextAbbreviations['"d'] = String.fromCharCode(534,768);
            kTextAbbreviations['"s'] = String.fromCharCode(534,683);
            kTextAbbreviations['"p'] = String.fromCharCode(534,680);
            kTextAbbreviations['"t'] = String.fromCharCode(534,684);
            kTextAbbreviations['"r'] = String.fromCharCode(534,682);
            kTextAbbreviations['"?'] = String.fromCharCode(534,763);
            kTextAbbreviations['"u'] = String.fromCharCode(534,785);
            kTextAbbreviations['"w'] = String.fromCharCode(534,787);
            kTextAbbreviations['"y'] = String.fromCharCode(534,789);
            kTextAbbreviations['^!'] = String.fromCharCode(594,633);
            kTextAbbreviations['^?'] = String.fromCharCode(594,763);
            kTextAbbreviations['^u'] = String.fromCharCode(594,785);
            kTextAbbreviations['^:'] = String.fromCharCode(594,758);
            kTextAbbreviations['^w'] = String.fromCharCode(594,787);
            kTextAbbreviations['_c'] = String.fromCharCode(595,967);
            kTextAbbreviations['_m'] = String.fromCharCode(595,677);
            kTextAbbreviations['_h'] = String.fromCharCode(595,772);
            kTextAbbreviations['_!'] = String.fromCharCode(595,633);
            kTextAbbreviations['_s'] = String.fromCharCode(595,683);
            kTextAbbreviations['_w'] = String.fromCharCode(595,787);
            kTextAbbreviations['.d'] = String.fromCharCode(746,768);
            kTextAbbreviations['.e'] = String.fromCharCode(746,769);
            kTextAbbreviations['.n'] = String.fromCharCode(746,678);
            kTextAbbreviations['.s'] = String.fromCharCode(746,683);
            kTextAbbreviations['.t'] = String.fromCharCode(746,684);
            kTextAbbreviations[';e'] = String.fromCharCode(659,769);
            kTextAbbreviations[';g'] = String.fromCharCode(659,771);
            kTextAbbreviations[';l'] = String.fromCharCode(659,676);
            kTextAbbreviations[';n'] = String.fromCharCode(659,678);
            kTextAbbreviations[';s'] = String.fromCharCode(659,683);
            kTextAbbreviations[';t'] = String.fromCharCode(659,684);
            kTextAbbreviations[';y'] = String.fromCharCode(659,789);
            kTextAbbreviations[',n'] = String.fromCharCode(644,678);
            kTextAbbreviations[',y'] = String.fromCharCode(644,789);

            kCommonWords = [
                ['DI6]5T','ȸȽʎɑʍɈ'],
                ['SE3D','ɇȹ˯ȸ'],
                ['2F','ˮȺ']
            ];
            break;

        case "tr":

            defaultControlModule = 'controls/tr/classic.xml';

            defaultCellFont = 'cellfonts/tr/classic.xml';

            kDotsPrefix = "Dots";
            kDropFileZoneMessage = "Drop file here to load";
            kExportFileDescription = "Export this document as an embosser-ready BRF file.";
            kExportFileLabel = "Export File";
            kFileButtonCaption = "File";
            kFileDialogTitle = "File";
            kFileNameBRF = "Untitled.brf";
            kFileNameBRM = "Untitled.brm";
            kHeightLabel = "Height:";
            kHelpButtonCaption = "Help";
            kLongestSymbol = 7;
            kNewFileDescription = "Discard current document and start with an empty one.";
            kNewFileLabel = "New File…";
            kOpenFileDescription = "Open a previously saved document from your computer.";
            kOpenFileLabel = "Open File…";
            kOptionsButtonCaption = "Options";
            kOptionsDialogTitle = "Options";
            kParseImportedFilesDescription = "Attempt to translate BRF files created by other programs.";
            kParseImportedFilesLabel = "Parse Imported Files";
            kProgramTitle = "Braille Music Notator";
            kSaveFileDescription = "Save this document in a format this utility can open.";
            kSaveFileLabel = "Save File";
            kScoreSizeLabel = "Score size:";
            kScreenReaderControlPageNumber = "Control page %%1";
            kScreenReaderTemplate = "%%1. line %%2 character %%3. %%4";
            kShowPageBoundariesDescription = "Show where page breaks occur when embossed.";
            kShowPageBoundariesLabel = "Show Page Boundaries";
            kShowSmallDotsDescription = "Fill in empty dots in braille characters.";
            kShowSmallDotsLabel = "Show Small Dots";
            kShowTranslatedBrailleDescription = "Automatically translate braille into music notation.";
            kShowTranslatedBrailleLabel = "Show Translated Braille";
            kUnrecognizedCharacterMessage = "unrecognized character";
            kUnsavedChangesDialogMessage = "Any unsaved changes will be lost. Are you sure you want to continue?";
            kVersionAndAuthor = "v%%1 by Toby W. Rush";
            kWidthLabel = "Width:";

            kCharNames = [
                [mkStr([0,0,0,32,0,0,0]),"empty"],
                [mkStr([0,0,0,33,75,0,0]),"first character of A double whole note"],
                [mkStr([0,0,0,33,0,0,0]),"A whole note"],
                [mkStr([0,0,0,34,0,0,0]),"fourth octave"],
                [mkStr([0,0,0,35,0,0,0]),"time signature prefix"],
                [mkStr([0,0,0,36,0,0,0]),"E quarter note"],
                [mkStr([0,0,0,37,337,0,0]),"first character of double sharp"],
                [mkStr([0,0,0,37,0,0,0]),"sharp"],
                [mkStr([0,0,0,38,75,0,0]),"first character of E double whole note"],
                [mkStr([0,0,0,38,0,0,0]),"E whole note"],
                [mkStr([0,0,0,39,0,0,0]),"dot"],
                [mkStr([0,0,0,40,75,0,0]),"first character of G double whole note"],
                [mkStr([0,0,0,40,0,0,0]),"G whole note"],
                [mkStr([0,0,0,41,75,0,0]),"first character of B double whole note"],
                [mkStr([0,0,0,41,0,0,0]),"B whole note"],
                [mkStr([0,0,0,42,0,0,0]),"natural"],
                [mkStr([0,0,0,43,0,0,0]),"added note at the third"],
                [mkStr([0,0,0,44,144,0,0]),"first character of eighth octave"],
                [mkStr([0,0,0,44,0,0,0]),"seventh octave"],
                [mkStr([0,0,0,45,0,0,0]),"added note at the octave"],
                [mkStr([0,0,0,46,0,0,0]),"fifth octave"],
                [mkStr([0,0,0,47,0,0,0]),"added note at the second"],
                [mkStr([0,0,0,48,0,0,0]),"time signature lower number 0"],
                [mkStr([0,0,0,49,0,0,0]),"time signature lower number 1"],
                [mkStr([0,0,0,50,0,0,0]),"time signature lower number 2"],
                [mkStr([0,0,0,51,0,0,0]),"time signature lower number 3"],
                [mkStr([0,0,0,52,0,0,0]),"time signature lower number 4"],
                [mkStr([0,0,0,53,0,0,0]),"time signature lower number 5"],
                [mkStr([0,0,0,54,0,0,0]),"time signature lower number 6"],
                [mkStr([0,0,0,55,0,0,0]),"time signature lower number 7"],
                [mkStr([0,0,0,56,0,0,0]),"time signature lower number 8"],
                [mkStr([0,0,0,57,0,0,0]),"time signature lower number 9"],
                [mkStr([0,0,0,58,0,0,0]),"D quarter note"],
                [mkStr([0,0,0,59,0,0,0]),"sixth octave"],
                [mkStr([0,0,0,60,360,0,0]),"first character of double flat"],
                [mkStr([0,0,0,60,0,0,0]),"flat"],
                [mkStr([0,0,0,61,75,0,0]),"first character of F double whole note"],
                [mkStr([0,0,0,61,0,0,0]),"F whole note"],
                [mkStr([0,0,0,62,0,0,0]),"word prefix"],
                [mkStr([0,0,0,63,0,0,0]),"C quarter note"],
                [mkStr([0,0,0,64,164,0,0]),"first character of octave 0"],
                [mkStr([0,0,0,64,0,0,0]),"first octave"],
                [mkStr([0,0,0,66,0,0,0]),"second character of down bow"],
                [mkStr([0,0,0,67,0,0,0]),"short slur"],
                [mkStr([0,0,0,68,0,0,0]),"C eighth note"],
                [mkStr([0,0,0,69,0,0,0]),"D eighth note"],
                [mkStr([0,0,0,70,0,0,0]),"E eighth note"],
                [mkStr([0,0,0,71,0,0,0]),"F eighth note"],
                [mkStr([0,0,0,72,0,0,0]),"G eighth note"],
                [mkStr([0,0,0,73,0,0,0]),"A eighth note"],
                [mkStr([0,0,0,74,0,0,0]),"B eighth note"],
                [mkStr([0,0,0,75,0,0,0]),"last character of double whole note symbol"],
                [mkStr([0,0,77,75,0,0,0]),"last character of double whole rest symbol"],
                [mkStr([0,0,0,76,0,0,0]),"barline"],
                [mkStr([0,0,0,77,0,0,0]),"whole rest"],
                [mkStr([0,0,0,78,0,0,0]),"C half note"],
                [mkStr([0,0,0,79,0,0,0]),"D half note"],
                [mkStr([0,0,0,80,0,0,0]),"E half note"],
                [mkStr([0,0,0,81,0,0,0]),"F half note"],
                [mkStr([0,0,0,82,0,0,0]),"G half note"],
                [mkStr([0,0,0,83,0,0,0]),"A half note"],
                [mkStr([0,0,0,84,0,0,0]),"B half note"],
                [mkStr([0,0,0,85,0,0,0]),"half rest"],
                [mkStr([0,0,0,86,0,0,0]),"quarter rest"],
                [mkStr([0,0,0,87,0,0,0]),"B quarter note"],
                [mkStr([0,0,0,88,0,0,0]),"eighth rest"],
                [mkStr([0,0,0,89,75,0,0]),"first character of C double whole note"],
                [mkStr([0,0,0,89,0,0,0]),"C whole note"],
                [mkStr([0,0,0,90,75,0,0]),"first character of D double whole note"],
                [mkStr([0,0,0,90,0,0,0]),"D whole note"],
                [mkStr([0,0,0,91,0,0,0]),"A quarter note"],
                [mkStr([0,0,0,92,0,0,0]),"G quarter note"],
                [mkStr([0,0,0,93,0,0,0]),"F quarter note"],
                [mkStr([0,0,0,94,0,0,0]),"second octave"],
                [mkStr([0,0,0,95,0,0,0]),"third octave"],
                [mkStr([0,0,0,133,0,0,0]),"A sixteenth note"],
                [mkStr([0,0,0,134,0,0,0]),"first character of play section number"],
                [mkStr([0,0,0,135,0,0,0]),"fourth interval"],
                [mkStr([0,0,0,136,0,0,0]),"E sixty-fourth note"],
                [mkStr([0,0,0,137,0,0,0]),"key signature sharp"],
                [mkStr([0,0,0,138,0,0,0]),"E sixteenth note"],
                [mkStr([0,0,0,139,0,0,0]),"second character of final or double bar line"],
                [mkStr([0,0,0,140,0,0,0]),"G sixteenth note"],
                [mkStr([0,0,0,141,0,0,0]),"B sixteenth note"],
                [mkStr([0,0,0,142,0,0,0]),"key signature natural"],
                [mkStr([0,0,0,143,0,0,0]),"begin repeated section"],
                [mkStr([0,0,0,144,0,0,0]),"second character of eighth octave"],
                [mkStr([0,0,0,146,0,0,0]),"first character of common time symbol"],
                [mkStr([0,0,0,148,0,0,0]),"added note at the sixth"],
                [mkStr([0,0,0,149,0,0,0]),"second character of pause"],
                [mkStr([0,0,0,150,0,0,0]),"triplet symbol"],
                [mkStr([0,0,0,151,0,0,0]),"added note at the seventh"],
                [mkStr([0,0,0,153,0,0,0]),"grace note"],
                [mkStr([0,0,0,154,0,0,0]),"trill"],
                [mkStr([0,0,0,155,0,0,0]),"measure repeat"],
                [mkStr([0,0,0,156,0,0,0]),"second character of tenuto, accent or marcato"],
                [mkStr([0,0,0,157,0,0,0]),"added note at the fifth"],
                [mkStr([0,0,0,158,0,0,0]),"D sixty-fourth note"],
                [mkStr([0,0,0,159,0,0,0]),"first character of marcato"],
                [mkStr([0,0,0,160,0,0,0]),"key signature flat"],
                [mkStr([0,0,0,161,0,0,0]),"F sixteenth note"],
                [mkStr([0,0,0,162,0,0,0]),"first character of gradual crescendo or diminuendo"],
                [mkStr([0,0,0,163,0,0,0]),"C sixty-fourth note"],
                [mkStr([0,0,0,164,0,0,0]),"second character of octave 0"],
                [mkStr([0,0,0,165,0,0,0]),"time signature top number 1"],
                [mkStr([0,0,0,166,0,0,0]),"time signature top number 2"],
                [mkStr([0,0,0,167,0,0,0]),"time signature top number 3"],
                [mkStr([0,0,0,168,0,0,0]),"time signature top number 4"],
                [mkStr([0,0,0,169,0,0,0]),"time signature top number 5"],
                [mkStr([0,0,0,170,0,0,0]),"time signature top number 6"],
                [mkStr([0,0,0,171,0,0,0]),"time signature top number 7"],
                [mkStr([0,0,0,172,0,0,0]),"time signature top number 8"],
                [mkStr([0,0,0,173,0,0,0]),"time signature top number 9"],
                [mkStr([0,0,0,174,0,0,0]),"time signature top number 0"],
                [mkStr([0,0,0,175,0,0,0]),"second character of final or double bar line symbol"],
                [mkStr([0,0,0,176,0,0,0]),"second character of fermata"],
                [mkStr([0,0,0,177,0,0,0]),"sixteenth rest"],
                [mkStr([0,0,0,178,0,0,0]),"C thirty-second note"],
                [mkStr([0,0,0,179,0,0,0]),"D thirty-second note"],
                [mkStr([0,0,0,180,0,0,0]),"E thirty-second note"],
                [mkStr([0,0,0,181,0,0,0]),"F thirty-second note"],
                [mkStr([0,0,0,182,0,0,0]),"G thirty-second note"],
                [mkStr([0,0,0,183,0,0,0]),"A thirty-second note"],
                [mkStr([0,0,0,184,0,0,0]),"B thirty-second note"],
                [mkStr([0,0,0,185,0,0,0]),"thirty-second rest"],
                [mkStr([0,0,0,186,0,0,0]),"sixty-fourth rest"],
                [mkStr([0,0,0,187,0,0,0]),"B sixty-fourth note"],
                [mkStr([0,0,0,188,0,0,0]),"one hundred twenty-eighth rest"],
                [mkStr([0,0,0,189,0,0,0]),"C sixteenth note"],
                [mkStr([0,0,0,190,0,0,0]),"D sixteenth note"],
                [mkStr([0,0,0,191,0,0,0]),"A sixty-fourth note"],
                [mkStr([0,0,0,192,0,0,0]),"G sixty-fourth note"],
                [mkStr([0,0,0,193,0,0,0]),"F sixty-fourth note"],
                [mkStr([0,0,0,194,0,0,0]),"first character of large note value sign"],
                [mkStr([0,0,0,195,0,0,0]),"first character of cut time symbol"],
                [mkStr([0,0,0,234,0,0,0]),"braille music hyphen"],
                [mkStr([0,0,0,235,0,0,0]),"key signature prefix"],
                [mkStr([0,0,0,239,0,0,0]),"last symbol of gradual dynamic, text dynamic, or hand sign"],
                [mkStr([0,0,0,242,0,0,0]),"end repeated section"],
                [mkStr([0,0,0,243,0,0,0]),"second character of play section number"],
                [mkStr([0,0,0,244,0,0,0]),"first character of small note value sign"],
                [mkStr([0,0,0,248,0,0,0]),"tuplet number zero"],
                [mkStr([0,0,0,249,0,0,0]),"tuplet number 1"],
                [mkStr([0,0,0,250,0,0,0]),"tuplet number 2"],
                [mkStr([0,0,0,251,0,0,0]),"tuplet number 3"],
                [mkStr([0,0,0,252,0,0,0]),"tuplet number 4"],
                [mkStr([0,0,0,253,0,0,0]),"tuplet number 5"],
                [mkStr([0,0,0,254,0,0,0]),"tuplet number 6"],
                [mkStr([0,0,0,255,0,0,0]),"tuplet number 7"],
                [mkStr([0,0,0,256,0,0,0]),"tuplet number 8"],
                [mkStr([0,0,0,257,0,0,0]),"tuplet number 9"],
                [mkStr([0,0,0,259,0,0,0]),"grace note slur"],
                [mkStr([0,0,0,260,175,139,0]),"first character of double bar line"],
                [mkStr([0,0,0,260,175,0,0]),"first character of final bar line"],
                [mkStr([0,0,0,260,355,0,0]),"first character of forward repeat"],
                [mkStr([0,0,0,260,350,0,0]),"first character of backward repeat"],
                [mkStr([0,0,0,260,0,0,0]),"first character of bar line symbol"],
                [mkStr([0,0,0,262,0,0,0]),"second character of hand sign"],
                [mkStr([0,0,0,265,0,0,0]),"key signature 1 accidental"],
                [mkStr([0,0,0,266,0,0,0]),"key signature 2 accidentals"],
                [mkStr([0,0,0,267,0,0,0]),"key signature 3 accidentals"],
                [mkStr([0,0,0,268,0,0,0]),"key signature 4 accidentals"],
                [mkStr([0,0,0,269,0,0,0]),"key signature 5 accidentals"],
                [mkStr([0,0,0,270,0,0,0]),"key signature 6 accidentals"],
                [mkStr([0,0,0,271,0,0,0]),"key signature 7 accidentals"],
                [mkStr([0,0,353,275,0,0,0]),"second character of approximate notehead symbol"],
                [mkStr([0,0,353,276,0,0,0]),"second character of diamond notehead symbol"],
                [mkStr([0,0,0,295,0,0,0]),"tuplet prefix"],
                [mkStr([0,0,0,334,0,0,0]),"first character of partial measure in-accord symbol"],
                [mkStr([0,0,0,335,0,0,0]),"number of measures"],
                [mkStr([0,0,0,337,0,0,0]),"second character of double sharp symbol"],
                [mkStr([0,0,664,337,0,0,0]),"second character of one-quarter sharp symbol"],
                [mkStr([0,0,694,337,0,0,0]),"second character of five-comma sharp symbol"],
                [mkStr([0,0,695,337,0,0,0]),"second character of three-quarters sharp symbol"],
                [mkStr([0,0,0,339,0,0,0]),"second character of music prefix"],
                [mkStr([0,0,0,343,0,0,0]),"plus"],
                [mkStr([0,0,0,344,0,0,0]),"first character of music prefix"],
                [mkStr([0,0,0,346,0,0,0]),"first character of accent"],
                [mkStr([0,0,660,349,0,0,0]),"second character of braille music comma"],
                [mkStr([0,0,194,349,0,0,0]),"second character of large note values symbol"],
                [mkStr([0,0,0,350,0,0,0]),"second character of end bracket slur"],
                [mkStr([0,0,0,353,275,0,0]),"first character of approximate notehead symbol"],
                [mkStr([0,0,0,353,276,0,0]),"first character of diamond notehead symbol"],
                [mkStr([0,0,0,353,765,0,0]),"first character of notehead only symbol"],
                [mkStr([0,0,0,353,766,0,0]),"first character of X notehead symbol"],
                [mkStr([0,0,0,356,0,0,0]),"staccato"],
                [mkStr([0,0,0,359,0,0,0]),"first character of begin bracket slur"],
                [mkStr([0,0,0,360,0,0,0]),"second character of double flat"],
                [mkStr([0,0,664,360,0,0,0]),"second character of one-quarter flat symbol"],
                [mkStr([0,0,694,360,0,0,0]),"second character of four-comma flat symbol"],
                [mkStr([0,0,695,360,0,0,0]),"second character of three-quarters flat symbol"],
                [mkStr([0,0,0,362,0,0,0]),"first character of pause"],
                [mkStr([0,0,0,364,0,0,0]),"first character of tie"],
                [mkStr([0,0,0,366,0,0,0]),"second character of begin bracket slur"],
                [mkStr([0,0,0,367,0,0,0]),"second character of tie"],
                [mkStr([0,0,0,368,0,0,0]),"C one hundred twenty-eighth note"],
                [mkStr([0,0,0,369,0,0,0]),"D one hundred twenty-eighth note"],
                [mkStr([0,0,0,370,0,0,0]),"E one hundred twenty-eighth note"],
                [mkStr([0,0,0,371,0,0,0]),"F one hundred twenty-eighth note"],
                [mkStr([0,0,0,372,0,0,0]),"G one hundred twenty-eighth note"],
                [mkStr([0,0,0,373,0,0,0]),"A one hundred twenty-eighth note"],
                [mkStr([0,0,0,374,0,0,0]),"B one hundred twenty-eighth note"],
                [mkStr([0,0,0,375,0,0,0]),"second character of measure division for in-accord"],
                [mkStr([0,662,447,376,0,0,0]),"last character of treble clef symbol"],
                [mkStr([0,662,643,376,0,0,0]),"last character of alto clef symbol"],
                [mkStr([662,643,634,376,0,0,0]),"last character of tenor clef symbol"],
                [mkStr([0,662,635,376,0,0,0]),"last character of bass clef symbol"],
                [mkStr([0,0,0,377,0,0,0]),"multi-measure rest suffix"],
                [mkStr([0,0,0,394,0,0,0]),"first character of end bracket slur"],
                [mkStr([0,0,0,395,0,0,0]),"first character of tenuto"],
                [mkStr([0,0,0,435,0,0,0]),"second character of equals sign for metronome markings"],
                [mkStr([0,0,0,439,0,0,0]),"tuplet suffix"],
                [mkStr([0,0,0,446,0,0,0]),"first symbol for right hand sign"],
                [mkStr([0,0,662,447,376,0,0]),"second character of treble clef symbol"],
                [mkStr([0,0,0,448,0,0,0]),"major"],
                [mkStr([0,0,0,449,0,0,0]),"fourth finger"],
                [mkStr([0,0,0,452,0,0,0]),"diminished"],
                [mkStr([0,0,0,455,0,0,0]),"first character of equals sign for metronome markings"],
                [mkStr([0,0,0,460,0,0,0]),"first character of fermata"],
                [mkStr([0,0,0,462,0,0,0]),"first character of dynamic symbol"],
                [mkStr([0,0,0,465,0,0,0]),"thumb"],
                [mkStr([0,0,0,466,0,0,0]),"index finger"],
                [mkStr([0,0,146,467,0,0,0]),"second character of common time symbol"],
                [mkStr([0,0,195,467,0,0,0]),"second character of cut time symbol"],
                [mkStr([0,0,0,475,0,0,0]),"fifth finger"],
                [mkStr([0,0,0,476,0,0,0]),"third finger"],
                [mkStr([0,0,0,495,0,0,0]),"first character of left hand sign"],
                [mkStr([0,0,0,533,0,0,0]),"text contraction the"],
                [mkStr([0,0,0,534,0,0,0]),"text contraction symbol"],
                [mkStr([0,0,0,535,0,0,0]),"number sign"],
                [mkStr([0,0,0,536,0,0,0]),"text contraction e d"],
                [mkStr([0,0,0,537,0,0,0]),"text contraction s h"],
                [mkStr([0,0,0,538,0,0,0]),"text contraction and"],
                [mkStr([0,0,0,539,0,0,0]),"apostrophe"],
                [mkStr([0,0,0,540,0,0,0]),"text contraction of"],
                [mkStr([0,0,0,541,0,0,0]),"text contraction with"],
                [mkStr([0,0,0,542,0,0,0]),"text contraction c h"],
                [mkStr([0,0,0,543,0,0,0]),"text contraction i n g"],
                [mkStr([0,0,0,544,0,0,0]),"capital sign"],
                [mkStr([0,0,0,545,0,0,0]),"hyphen"],
                [mkStr([0,0,0,546,0,0,0]),"decimal point"],
                [mkStr([0,0,0,547,0,0,0]),"text contraction s t"],
                [mkStr([0,0,0,549,0,0,0]),"comma"],
                [mkStr([0,0,0,550,0,0,0]),"semicolon"],
                [mkStr([0,0,0,551,0,0,0]),"colon"],
                [mkStr([0,0,0,552,0,0,0]),"full stop"],
                [mkStr([0,0,0,553,0,0,0]),"text contraction e n"],
                [mkStr([0,0,0,554,0,0,0]),"exclamation point"],
                [mkStr([0,0,0,555,0,0,0]),"parenthesis"],
                [mkStr([0,0,0,556,0,0,0]),"question mark"],
                [mkStr([0,0,0,557,0,0,0]),"text contraction in"],
                [mkStr([0,0,0,558,0,0,0]),"text contraction w h"],
                [mkStr([0,0,0,559,0,0,0]),"text sign"],
                [mkStr([0,0,0,560,0,0,0]),"text contractio  g h"],
                [mkStr([0,0,0,561,0,0,0]),"text contraction for"],
                [mkStr([0,0,0,562,0,0,0]),"text contraction a r"],
                [mkStr([0,0,0,563,0,0,0]),"text contraction t h"],
                [mkStr([0,0,0,565,0,0,0]),"text a"],
                [mkStr([0,0,0,566,0,0,0]),"text b"],
                [mkStr([0,0,0,567,0,0,0]),"text c"],
                [mkStr([0,0,0,568,0,0,0]),"text d"],
                [mkStr([0,0,0,569,0,0,0]),"text e"],
                [mkStr([0,0,0,570,0,0,0]),"text f"],
                [mkStr([0,0,0,571,0,0,0]),"text g"],
                [mkStr([0,0,0,572,0,0,0]),"text h"],
                [mkStr([0,0,0,573,0,0,0]),"text i"],
                [mkStr([0,0,0,574,0,0,0]),"text j"],
                [mkStr([0,0,0,575,0,0,0]),"text k"],
                [mkStr([0,0,0,576,0,0,0]),"text l"],
                [mkStr([0,0,0,577,0,0,0]),"text m"],
                [mkStr([0,0,0,578,0,0,0]),"text n"],
                [mkStr([0,0,0,579,0,0,0]),"text o"],
                [mkStr([0,0,0,580,0,0,0]),"text p"],
                [mkStr([0,0,0,581,0,0,0]),"text q"],
                [mkStr([0,0,0,582,0,0,0]),"text r"],
                [mkStr([0,0,0,583,0,0,0]),"text s"],
                [mkStr([0,0,0,584,0,0,0]),"text t"],
                [mkStr([0,0,0,585,0,0,0]),"text u"],
                [mkStr([0,0,0,586,0,0,0]),"text v"],
                [mkStr([0,0,0,587,0,0,0]),"text w"],
                [mkStr([0,0,0,588,0,0,0]),"text x"],
                [mkStr([0,0,0,589,0,0,0]),"text y"],
                [mkStr([0,0,0,590,0,0,0]),"text z"],
                [mkStr([0,0,0,591,0,0,0]),"text contraction o w"],
                [mkStr([0,0,0,592,0,0,0]),"text contraction o u"],
                [mkStr([0,0,0,593,0,0,0]),"text contraction e r"],
                [mkStr([0,0,0,594,0,0,0]),"text contraction symbol"],
                [mkStr([0,0,0,595,0,0,0]),"text contraction symbol"],
                [mkStr([0,0,534,633,0,0,0]),"last character of text contraction there"],
                [mkStr([0,0,594,633,0,0,0]),"last character of text contraction these"],
                [mkStr([0,0,595,633,0,0,0]),"last character of text contraction their"],
                [mkStr([0,662,643,634,376,0,0]),"third character of tenor clef symbol"],
                [mkStr([0,0,662,635,376,0,0]),"second character of bass clef symbol"],
                [mkStr([0,0,0,637,0,0,0]),"text contraction shall"],
                [mkStr([0,0,0,638,0,0,0]),"last character of text contraction spirit"],
                [mkStr([0,0,0,639,0,0,0]),"second character of up bow"],
                [mkStr([0,0,0,642,0,0,0]),"text contraction child"],
                [mkStr([0,0,662,643,376,0,0]),"second character of alto clef symbol"],
                [mkStr([0,0,662,643,634,376,0]),"second character of tenor clef symbol"],
                [mkStr([0,0,0,644,789,0,0]),"first character of contraction a l l y"],
                [mkStr([0,0,0,644,678,0,0]),"first character of contraction a t i o n"],
                [mkStr([0,0,0,645,0,0,0]),"text contraction com"],
                [mkStr([0,0,0,646,0,0,0]),"first character of measure division symbol for in-accord"],
                [mkStr([0,0,0,647,0,0,0]),"slash"],
                [mkStr([0,0,0,648,0,0,0]),"close quotation marks"],
                [mkStr([0,0,0,649,0,0,0]),"text contraction e a"],
                [mkStr([0,0,0,650,0,0,0]),"text contraction b b"],
                [mkStr([0,0,0,651,0,0,0]),"text contraction c c"],
                [mkStr([0,0,0,652,0,0,0]),"text contraction d d"],
                [mkStr([0,0,0,654,0,0,0]),"text contraction f f"],
                [mkStr([0,0,0,655,0,0,0]),"text contraction g g"],
                [mkStr([0,0,0,656,0,0,0]),"open quotation marks"],
                [mkStr([0,0,0,657,0,0,0]),"text contraction by"],
                [mkStr([0,0,0,658,0,0,0]),"text contraction which"],
                [mkStr([0,0,0,659,0,0,0]),"text contraction symbol"],
                [mkStr([0,0,0,660,349,0,0]),"first character of braille music comma"],
                [mkStr([0,0,194,660,0,0,0]),"second character of large note values symbol"],
                [mkStr([0,0,0,662,447,376,0]),"first character of treble clef symbol"],
                [mkStr([0,0,0,662,643,376,0]),"first character of alto clef symbol"],
                [mkStr([0,0,0,662,643,634,376]),"first character of tenor clef symbol"],
                [mkStr([0,0,0,662,635,376,0]),"first character of bass clef symbol"],
                [mkStr([0,0,0,663,0,0,0]),"text contraction this"],
                [mkStr([0,0,0,664,337,0,0]),"first character of one-quarter sharp symbol"],
                [mkStr([0,0,0,664,360,0,0]),"first character of one-quarter flat symbol"],
                [mkStr([0,0,0,665,0,0,0]),"text 1"],
                [mkStr([0,0,0,666,0,0,0]),"text 2"],
                [mkStr([0,0,0,667,0,0,0]),"text 3"],
                [mkStr([0,0,0,668,0,0,0]),"text 4"],
                [mkStr([0,0,0,669,0,0,0]),"text 5"],
                [mkStr([0,0,0,670,0,0,0]),"text 6"],
                [mkStr([0,0,0,671,0,0,0]),"text 7"],
                [mkStr([0,0,0,672,0,0,0]),"text 8"],
                [mkStr([0,0,0,673,0,0,0]),"text 9"],
                [mkStr([0,0,0,674,0,0,0]),"text 0"],
                [mkStr([0,0,0,675,0,0,0]),"last character of text contraction know"],
                [mkStr([0,0,534,676,0,0,0]),"last character of text contraction lord"],
                [mkStr([0,0,659,676,0,0,0]),"last character of text contraction f u l"],
                [mkStr([0,0,534,677,0,0,0]),"last character of text contraction mother"],
                [mkStr([0,0,595,677,0,0,0]),"last character of text contraction many"],
                [mkStr([0,0,534,678,0,0,0]),"last character of text contraction name"],
                [mkStr([0,0,644,678,0,0,0]),"last character of text contraction a t i o n"],
                [mkStr([0,0,659,678,0,0,0]),"last character of text contraction t i o n"],
                [mkStr([0,0,746,678,0,0,0]),"last character of text contraction s i o n"],
                [mkStr([0,0,0,679,0,0,0]),"last character of text contraction one"],
                [mkStr([0,0,0,680,0,0,0]),"last character of text contraction part"],
                [mkStr([0,0,0,681,0,0,0]),"last character of text contraction question"],
                [mkStr([0,0,0,682,0,0,0]),"last character of text contraction right"],
                [mkStr([0,0,534,683,0,0,0]),"last character of text contraction some"],
                [mkStr([0,0,659,683,0,0,0]),"last character of text contraction ness"],
                [mkStr([0,0,746,683,0,0,0]),"last character of text contraction less"],
                [mkStr([0,0,534,684,0,0,0]),"last character of text contraction time"],
                [mkStr([0,0,659,684,0,0,0]),"last character of text contraction m e n t"],
                [mkStr([0,0,746,684,0,0,0]),"last character of text contraction o u n t"],
                [mkStr([0,0,0,685,0,0,0]),"last character of text contraction us"],
                [mkStr([0,0,0,686,0,0,0]),"last character of text contraction very"],
                [mkStr([0,0,0,687,0,0,0]),"last character of text contraction will"],
                [mkStr([0,0,0,688,0,0,0]),"last character of text contraction it"],
                [mkStr([0,0,0,689,0,0,0]),"last character of text contraction you"],
                [mkStr([0,0,0,690,0,0,0]),"last character of text contraction as"],
                [mkStr([0,0,0,692,0,0,0]),"last character of text contraction out"],
                [mkStr([0,0,0,694,337,0,0]),"first character of five-comma sharp symbol"],
                [mkStr([0,0,0,694,360,0,0]),"first character of five-comma flat symbol"],
                [mkStr([0,0,0,695,337,0,0]),"first character of three-quarters sharp symbol"],
                [mkStr([0,0,0,695,360,0,0]),"first character of three-quarters flat symbol"],
                [mkStr([0,0,0,735,0,0,0]),"multi-measure rest prefix"],
                [mkStr([0,0,0,742,0,0,0]),"last character of text contraction character"],
                [mkStr([0,0,0,746,0,0,0]),"text contraction symbol"],
                [mkStr([0,0,0,747,0,0,0]),"text contraction still"],
                [mkStr([0,0,0,749,0,0,0]),"second character of partial measure in-accord"],
                [mkStr([0,0,0,750,0,0,0]),"text contraction be"],
                [mkStr([0,0,0,751,0,0,0]),"text contraction con"],
                [mkStr([0,0,0,752,0,0,0]),"text contraction dis"],
                [mkStr([0,0,0,753,0,0,0]),"text contraction enough"],
                [mkStr([0,0,0,754,0,0,0]),"text contraction to"],
                [mkStr([0,0,0,755,0,0,0]),"text contraction were"],
                [mkStr([0,0,0,756,0,0,0]),"text contraction his"],
                [mkStr([0,0,0,757,0,0,0]),"text contraction was"],
                [mkStr([0,0,534,758,0,0,0]),"last character of text contraction where"],
                [mkStr([0,0,594,758,0,0,0]),"last character of text contraction whose"],
                [mkStr([0,0,0,760,0,0,0]),"first character of bow marking"],
                [mkStr([0,0,0,762,0,0,0]),"second character of in-accord symbol"],
                [mkStr([0,0,534,763,0,0,0]),"last character of text contraction through"],
                [mkStr([0,0,594,763,0,0,0]),"last character of text contraction those"],
                [mkStr([0,0,353,765,0,0,0]),"second character of notehead only symbol"],
                [mkStr([0,0,353,766,0,0,0]),"second character of X notehead symbol"],
                [mkStr([0,0,0,767,0,0,0]),"change fingering"],
                [mkStr([0,0,534,768,0,0,0]),"last character of text contraction day"],
                [mkStr([0,0,746,768,0,0,0]),"last character of text contraction o u n d"],
                [mkStr([0,0,534,769,0,0,0]),"last character of text contraction ever"],
                [mkStr([0,0,659,769,0,0,0]),"last character of text contraction e n c e"],
                [mkStr([0,0,746,769,0,0,0]),"last character of text contraction a n c e"],
                [mkStr([0,0,0,770,0,0,0]),"text contraction from"],
                [mkStr([0,0,0,771,0,0,0]),"last character of text contraction o n g"],
                [mkStr([0,0,534,772,0,0,0]),"last character of text contraction here"],
                [mkStr([0,0,595,772,0,0,0]),"last character of text contraction had"],
                [mkStr([0,0,0,775,0,0,0]),"text contraction knowledge"],
                [mkStr([0,0,0,776,0,0,0]),"text contraction like"],
                [mkStr([0,0,0,777,0,0,0]),"text contraction more"],
                [mkStr([0,0,0,778,0,0,0]),"text contraction not"],
                [mkStr([0,0,0,779,0,0,0]),"text contraction people"],
                [mkStr([0,0,0,780,0,0,0]),"text contraction quite"],
                [mkStr([0,0,0,781,0,0,0]),"text contraction rather"],
                [mkStr([0,0,0,782,0,0,0]),"text contraction so"],
                [mkStr([0,0,0,783,0,0,0]),"text contraction that"],
                [mkStr([0,0,0,784,0,0,0]),"text contraction "],
                [mkStr([0,0,534,785,0,0,0]),"last character of text contraction under"],
                [mkStr([0,0,594,785,0,0,0]),"last character of text contraction upon"],
                [mkStr([0,0,534,787,0,0,0]),"last character of text contraction work"],
                [mkStr([0,0,594,787,0,0,0]),"last character of text contraction word"],
                [mkStr([0,0,595,787,0,0,0]),"last character of text contraction world"],
                [mkStr([0,0,534,789,0,0,0]),"last character of text contraction young"],
                [mkStr([0,0,644,789,0,0,0]),"last character of text contraction a l l y"],
                [mkStr([0,0,659,789,0,0,0]),"last character of text contraction i t y"],
                [mkStr([0,0,0,792,0,0,0]),"last character of text contraction ought"],
                [mkStr([0,0,0,835,0,0,0]),"text contraction b l e"],
                [mkStr([0,0,0,849,0,0,0]),"last character of half-diminished symbol"],
                [mkStr([0,0,0,854,0,0,0]),"last character of plus symbol"],
                [mkStr([0,0,0,855,0,0,0]),"last character of equals symbol"],
                [mkStr([0,0,0,860,0,0,0]),"first character of in-accord symbol"],
                [mkStr([0,0,0,866,0,0,0]),"text contraction but"],
                [mkStr([0,0,0,867,0,0,0]),"text contraction can"],
                [mkStr([0,0,0,868,0,0,0]),"text contraction do"],
                [mkStr([0,0,0,869,0,0,0]),"text contraction every"],
                [mkStr([0,0,0,870,0,0,0]),"text contraction self"],
                [mkStr([0,0,0,871,0,0,0]),"text contraction go"],
                [mkStr([0,0,0,872,0,0,0]),"text contraction have"],
                [mkStr([0,0,0,874,0,0,0]),"text contraction just"],
                [mkStr([0,0,0,967,0,0,0]),"last character of text contraction cannot"],
                [mkStr([0,0,0,970,0,0,0]),"last character of text contraction father"],
            ];

            kKeyCommands[8] = [
                "Cleared cell at line %%1 character %%2.",
                "Cleared selection."
            ];
            kKeyCommands[38] = ["Deleted row."];
            kKeyCommands[40] = ["Inserted row."];
            kKeyCommands[45] = ["Inserted empty cell"];
            kKeyCommands[46] = [
                "Deleted cell at line %%1 character %%2"
            ];
            kKeyCommands[65] = ["All cells selected."];
            kKeyCommands[66] = [
                "Visual braille interpretation disabled.",
                "Visual braille interpretation enabled."
            ];
            kKeyCommands[67] = ["Selection copied to clipboard."];
            kKeyCommands[68] = [
                "Small braille dots disabled.",
                "Small braille dots enabled."
            ];
            kKeyCommands[69] = ["File exported in embosser-ready format."];
            kKeyCommands[72] = [
                "Parsing of imported documents disabled.",
                "Parsing of imported documents enabled."
            ];
            kKeyCommands[73] = [
                "Page height reduced. Height %%1, width %%2.",
                "Page boundaries visible. Page height reduced. Height %%1, width %%2."
            ];
            kKeyCommands[74] = [
                "Page width reduced. Height %%1, width %%2.",
                "Page boundaries visible. Page height reduced. Height %%1, width %%2."
            ];
            kKeyCommands[75] = [
                "Page height increased. Height %%1, width %%2.",
                "Page boundaries visible. Page height reduced. Height %%1, width %%2."
            ];
            kKeyCommands[76] = [
                "Page width increased. Height %%1, width %%2.",
                "Page boundaries visible. Page height reduced. Height %%1, width %%2."
            ];
            kKeyCommands[78] = ["New document."];
            kKeyCommands[79] = ["Open existing document."];
            kKeyCommands[80] = [
                "Page boundaries hidden.",
                "Page boundaries visible."
            ];
            kKeyCommands[83] = ["File saved."];
            kKeyCommands[85] = [
                "Accessible output set to screen reader mode.",
                "Accessible output set to refreshable braille display mode."
            ];
            kKeyCommands[89] = ["Redo."];
            kKeyCommands[90] = ["Undo."];
            kKeyCommands[187] = ["Magnification increased to %%1."];
            kKeyCommands[189] = ["Magnification decreased to %%1."];

            kWordAbbreviations['b'] = String.fromCharCode(866);
            kWordAbbreviations['c'] = String.fromCharCode(867);
            kWordAbbreviations['d'] = String.fromCharCode(868);
            kWordAbbreviations['e'] = String.fromCharCode(869);
            kWordAbbreviations['f'] = String.fromCharCode(870);
            kWordAbbreviations['g'] = String.fromCharCode(871);
            kWordAbbreviations['h'] = String.fromCharCode(872);
            kWordAbbreviations['j'] = String.fromCharCode(874);
            kWordAbbreviations['k'] = String.fromCharCode(775);
            kWordAbbreviations['l'] = String.fromCharCode(776);
            kWordAbbreviations['m'] = String.fromCharCode(777);
            kWordAbbreviations['n'] = String.fromCharCode(778);
            kWordAbbreviations['p'] = String.fromCharCode(780);
            kWordAbbreviations['q'] = String.fromCharCode(781);
            kWordAbbreviations['r'] = String.fromCharCode(782);
            kWordAbbreviations['s'] = String.fromCharCode(783);
            kWordAbbreviations['t'] = String.fromCharCode(784);
            kWordAbbreviations['u'] = String.fromCharCode(685);
            kWordAbbreviations['v'] = String.fromCharCode(686);
            kWordAbbreviations['w'] = String.fromCharCode(687);
            kWordAbbreviations['x'] = String.fromCharCode(688);
            kWordAbbreviations['y'] = String.fromCharCode(689);
            kWordAbbreviations['z'] = String.fromCharCode(690);
            kWordAbbreviations['/'] = String.fromCharCode(747);
            kWordAbbreviations['*'] = String.fromCharCode(642);
            kWordAbbreviations['%'] = String.fromCharCode(637);
            kWordAbbreviations['?'] = String.fromCharCode(663);
            kWordAbbreviations['\\'] = String.fromCharCode(692);
            kWordAbbreviations['2'] = String.fromCharCode(750);
            kWordAbbreviations['5'] = String.fromCharCode(753);
            kWordAbbreviations['7'] = String.fromCharCode(755);
            kWordAbbreviations['8'] = String.fromCharCode(756);
            kWordAbbreviations['0'] = String.fromCharCode(748);

            kPrefixAbbreviations['2'] = String.fromCharCode(750);
            kPrefixAbbreviations['3'] = String.fromCharCode(751);
            kPrefixAbbreviations['4'] = String.fromCharCode(752);
            kPrefixAbbreviations['6'] = String.fromCharCode(754);
            kPrefixAbbreviations['0'] = String.fromCharCode(548);
            kPrefixAbbreviations['-'] = String.fromCharCode(645);

            kTextAbbreviations['"h'] = String.fromCharCode(534,772);
            kTextAbbreviations['"!'] = String.fromCharCode(534,633);
            kTextAbbreviations['":'] = String.fromCharCode(534,758);
            kTextAbbreviations['"e'] = String.fromCharCode(534,769);
            kTextAbbreviations['"\\'] = String.fromCharCode(534,792);
            kTextAbbreviations['"f'] = String.fromCharCode(534,970);
            kTextAbbreviations['"m'] = String.fromCharCode(534,677);
            kTextAbbreviations['"n'] = String.fromCharCode(534,678);
            kTextAbbreviations['"*'] = String.fromCharCode(534,742);
            kTextAbbreviations['"q'] = String.fromCharCode(534,681);
            kTextAbbreviations['"k'] = String.fromCharCode(534,675);
            kTextAbbreviations['"l'] = String.fromCharCode(534,676);
            kTextAbbreviations['"o'] = String.fromCharCode(534,679);
            kTextAbbreviations['"d'] = String.fromCharCode(534,768);
            kTextAbbreviations['"s'] = String.fromCharCode(534,683);
            kTextAbbreviations['"p'] = String.fromCharCode(534,680);
            kTextAbbreviations['"t'] = String.fromCharCode(534,684);
            kTextAbbreviations['"r'] = String.fromCharCode(534,682);
            kTextAbbreviations['"?'] = String.fromCharCode(534,763);
            kTextAbbreviations['"u'] = String.fromCharCode(534,785);
            kTextAbbreviations['"w'] = String.fromCharCode(534,787);
            kTextAbbreviations['"y'] = String.fromCharCode(534,789);
            kTextAbbreviations['^!'] = String.fromCharCode(594,633);
            kTextAbbreviations['^?'] = String.fromCharCode(594,763);
            kTextAbbreviations['^u'] = String.fromCharCode(594,785);
            kTextAbbreviations['^:'] = String.fromCharCode(594,758);
            kTextAbbreviations['^w'] = String.fromCharCode(594,787);
            kTextAbbreviations['_c'] = String.fromCharCode(595,967);
            kTextAbbreviations['_m'] = String.fromCharCode(595,677);
            kTextAbbreviations['_h'] = String.fromCharCode(595,772);
            kTextAbbreviations['_!'] = String.fromCharCode(595,633);
            kTextAbbreviations['_s'] = String.fromCharCode(595,683);
            kTextAbbreviations['_w'] = String.fromCharCode(595,787);
            kTextAbbreviations['.d'] = String.fromCharCode(746,768);
            kTextAbbreviations['.e'] = String.fromCharCode(746,769);
            kTextAbbreviations['.n'] = String.fromCharCode(746,678);
            kTextAbbreviations['.s'] = String.fromCharCode(746,683);
            kTextAbbreviations['.t'] = String.fromCharCode(746,684);
            kTextAbbreviations[';e'] = String.fromCharCode(659,769);
            kTextAbbreviations[';g'] = String.fromCharCode(659,771);
            kTextAbbreviations[';l'] = String.fromCharCode(659,676);
            kTextAbbreviations[';n'] = String.fromCharCode(659,678);
            kTextAbbreviations[';s'] = String.fromCharCode(659,683);
            kTextAbbreviations[';t'] = String.fromCharCode(659,684);
            kTextAbbreviations[';y'] = String.fromCharCode(659,789);
            kTextAbbreviations[',n'] = String.fromCharCode(644,678);
            kTextAbbreviations[',y'] = String.fromCharCode(644,789);

            break;
    }
}
