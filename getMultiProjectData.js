/**
 * @return All a single project data.
 * @author Luis Palomo
 * @description The function returns all the tasks data from a Asana projects
 * @customfunction
 */

async function getMultiProjectsData () {
    const sheet = SpreadsheetApp.getActiveSpreadsheet() //Get Google Sheet project
    const configSheet = sheet.getSheetByName('config'); //Get config sheet
    const projectSheet = sheet.getSheetByName('projects'); //Get config sheet
    if(configSheet === null) {
        Logger.log(`config sheet tab doesn't found`)
        currentsheet.getRange('A1').setValue(`config sheet tab doesn't found`)
        return
    }
    if(projectSheet === null) {
        Logger.log(`project sheet tab doesn't found`)
        currentsheet.getRange('A1').setValue(`project sheet tab doesn't found`)
        return
    }

    //SET CONFIGURATION FROM CONFIG SHEET
    const config = {
        projectgid: []
    }
    let nP = 2;
    while(projectSheet.getRange(`B${nP}`).getValue() !== '') {
      config.projectgid.push(projectSheet.getRange(`B${nP}`).getValue())
      nP++
    }

    if(config.projectgid === '') {
        Logger.log('Please, add PROJECT IDs in config sheet tab')
        return
    }

    //GET DATA FROM EVERY PROJECT
    config.projectgid.map((value, index) => {
        getData(config.projectgid[index])
    })

    return true;
}