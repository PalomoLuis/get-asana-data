/**
 * @return All a single project data.
 * @author Luis Palomo
 * @description The function returns all the tasks data from a Asana project
 * @customfunction
 */

async function getProjectData () {
    const sheet = SpreadsheetApp.getActiveSpreadsheet() //Get Google Sheet project
    const configSheet = sheet.getSheetByName('config'); //Get config sheet
    if(configSheet === null) {
        Logger.log(`config sheet tab doesn't found`)
        currentsheet.getRange('A1').setValue(`config sheet tab doesn't found`)
        return
    }

    //SET CONFIGURATION FROM CONFIG SHEET
    const config = {
        projectgid: configSheet.getRange('B5').getValue(),
    }
    if(config.projectgid === '') {
        Logger.log('Please, add PROJECT ID in config sheet tab')
        return
    }

    getData(config.projectgid)
}