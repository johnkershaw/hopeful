//var COLS = {
//  "COMMENT":{"col":25}, // "text": "Comment", "width": 
//  "TABS": {"col": 26},
//  "DATE": {"col":27},
//  "EXPORTYN": {"col": 28}
//};
//Logger.log(COLS.COMMENT);

function updatePortfolios() {
 // add days absent & late 
}

function updateReportbooks() {
  var rbIds = getRbIds();
  var aaa_testerbook = "1CGQAR4QafGnC_LarUQqECY2Fy9Dv8jBkIsNlwUyuS3Y";
  var phy09copy = "1dQra-gLWOZ0oLiUCsGXPGeGNnZQaqI2rEynAYbstdS8";
  var rbIds = [aaa_testerbook, phy09copy];

  for (var i in rbIds) {
    //if (i>2) break;
    id = rbIds[i];
    var ss = SpreadsheetApp.openById(id);
    console.info("Updating " + ss.getName());
    
    //updateCommentsColumn(ss);
      //updateExportColumns(ss);
    //updateFreezeRows(ss);
    updateRBFormulas(ss);
    //updateGradeScale(ss);

    //updateConditionalFormatting(ss); // doesn't work in this scope :(
    
  //   sheet(report)
  //     // display comment
  //     .insertFormula(I4, 
  //      =iferror(index(Grades!$D$7:$Y$46, match($B$4,Grades!$D$7:$D$46,0),22),"")
  //     .chartType(scatter)
  //     .trendLines(false)
    SpreadsheetApp.flush();
  }
}


function updateCommentsColumn(ss) {
  var sheet = ss.getSheetByName(template.gradesSheetName);    
  
  // ensure we have 25 columns 'Comment' column
  var lastCol = sheet.getLastColumn();
  while (lastCol < 25) {
    sheet.insertColumnBefore(lastCol);
    lastCol ++;
  }
   
  // if last column isn't 'Comment', make it so
  var lastTitle = sheet.getRange(3, lastCol).getValue();
  Logger.log(lastTitle);
  if (lastTitle != "Comment") {
    sheet.getRange("Y3:Y4").setValues([["Comment"],[""]]);
    sheet.getRange("Y1:Y").setHorizontalAlignment("left");
    sheet.setColumnWidth(25, 250);
  }
}
// END updateCommentsColumn


function updateExportColumns(ss) {
  // not working in this scope, using Y/N for now :/
  //  var checkBoxes = 
  //    SpreadsheetApp
  //    .newDataValidation()
  //    .setAllowInvalid(false)
  //    .requireCheckbox()
  //    .build();
  
  var sheet = ss.getSheetByName("Grades");
  
  // add admin columns
  var lastCol = sheet.getLastColumn();
  while (lastCol < 28) {
    sheet.insertColumnAfter(sheet.getLastColumn());
    lastCol ++;
  }

  sheet.getRange("Y:AB")
  .setBorder(null, true, null, true, true, null, '#999999', SpreadsheetApp.BorderStyle.SOLID);

  sheet.getRange("Z1:AB5")
  .setBackground("#e8eaf6")
  .setFontColor("#303f9f");
  
  // Tabs
  sheet.setColumnWidth(27, 170);
  sheet.getRange('AA3').setValue('Tabs');
  
  sheet.getRange("Y1:Y5")
  .setBackground("#333333")
  .setFontColor("#FFFFFF");
  
  // Date
  sheet.setColumnWidth(26, 170);
  sheet.getRange('Z3').setValue('Last exported:');
  
  // Export
  //  var ss = SpreadsheetApp.openById(aaa);
  //  var sheet = ss.getSheetByName("Grades");
  var checkboxValidation = SpreadsheetApp
  .newDataValidation()
  .requireCheckbox("Y", "N")
  .build();
  sheet.getRange("AB7:AB46").setDataValidation(checkboxValidation); 

  sheet.setColumnWidth(28, 50);
  sheet.getRange('AB3').setValue('Export Y / N');
  
//  Logger.log("Setting checkboxes");
//  ss.getRange('AB7:AB')
//  .setDataValidation(checkBoxes);
  
  sheet.getRange("Y:AA")
  .setHorizontalAlignment("left");
  
  sheet.getRange("AB:AB")
  .setHorizontalAlignment("center");
  
  sheet.getRange("AA7:AA")
  .setNumberFormat('hh":"mm":"ss" "ddd" "dd" "mmm" "yyyy');

};
// END updateExportColumns

function updateConditionalFormatting(ss) {
  var conditionalFormatRules = ss.getActiveSheet().getConditionalFormatRules();
  
  ss.getActiveSheet().setConditionalFormatRules(conditionalFormatRules);
  conditionalFormatRules = ss.getActiveSheet().getConditionalFormatRules();
  conditionalFormatRules.splice(conditionalFormatRules.length - 1, 1, SpreadsheetApp.newConditionalFormatRule()
  .setRanges([ss.getRange('Z7:Z46')])
  .whenTextEqualTo('y')
  .setBackground('#FF00FF')
  .build());
   ss.getActiveSheet().setConditionalFormatRules(conditionalFormatRules);
}

function updateFreezeRows(ss) {
  ss.getSheetByName(template.gradesSheetName).setFrozenRows(6);
}


function updateRBFormulas(ss) {

  var formulas = [
    {
      // if the Last name column is empty, don't display a grade (eg E-)
      // F6=if(istext(A6), index(Grades, match($G6*100,GradeRange,-1), 1),"")
      "sheet": "Grades", 
      "cell": "F6", 
      "range": "F7:F", 
      "formula": '=if(istext(A6), index(Grades, match($G6*100,GradeRange,-1), 1),"")'
    },
    {
      // if the grade is blank, don't include it in the weighting denominator
      // G6=sum(arrayformula(iferror(($H$1:$X$1 / sumif($H6:$X6, "<>", $H$1:$X$1)) * (H6:X6 / $H$4:$X$4))))
      "sheet": "Grades", 
      "cell": "G6", 
      "range": "G7:G", 
      "formula": '=sum(arrayformula(iferror(($H$1:$X$1 / sumif($H6:$X6, "<>", $H$1:$X$1)) * (H6:X6 / $H$4:$X$4))))'
    }
  ];

  updateFormulas(ss, formulas);
}

function updateFormulas(ss, formulas) {
  for (var i=0; i<formulas.length; i++) {
    var update = formulas[i];
    
    var sheet = ss.getSheetByName(update.sheet);
    
    var oldFormula = sheet.getRange(update.cell).getFormula();
    Logger.log(oldFormula);
    
    // update to new formula
    sheet.getRange(update.cell)
    .setFormula(update.formula);
    
    // fill down
    sheet.getRange(update.cell)
    .copyTo(sheet.getRange(update.range), SpreadsheetApp.CopyPasteType.PASTE_FORMULA);
    
  }
}

function updateGradeScale(ss) {
  var sheet = ss.getSheetByName(template.overviewSheetName);
  var aplus = sheet.getRange("B8").getValue();
  
  if (aplus != 80) {
    Logger.log("Old scale: " + ss.getName() );
  } else {
    //Logger.log("Scale okay: " + ss.getName() );
  }
}

function exportButton() {
  // sheet = "Individual report";
  // sheet.copyTo(name, B4:X11
}