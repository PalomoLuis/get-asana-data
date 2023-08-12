function createAlert(title = 'Add a title here', message = 'Add a message here.', button='OK') {
    var ui = SpreadsheetApp.getUi();
    ui.alert(title, message, ui.ButtonSet[button]);
}

function listSheetNames(name) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    let result = false
    sheets.map( value => {
        if(value.getName() === name) result = true
    })
    return result;
}