function fetchProjects() {
    const googleSheet = SpreadsheetApp.getActiveSpreadsheet() //Get Google Sheet project
    const configSheet = googleSheet.getSheetByName('config'); //Get config sheet
    if(configSheet === null) {
      Logger.log(`config sheet tab doesn't found`)
      currentsheet.getRange('A1').setValue(`config sheet tab doesn't found`)
      return
    }
  
    //SET CONFIGURATION FROM CONFIG SHEET
    const config = {
      apiKey: configSheet.getRange('B2').getValue(),
      workspaceGid: configSheet.getRange('B3').getValue(),
      startDate: new Date(configSheet.getRange('B4').getValue()),
      endDate: new Date(configSheet.getRange('B5').getValue())
    }
    if(config.workspaceGid === '') {
      Logger.log(`Please, add WORKSPACE GID in config sheet tab`)
      createAlert('NOT FOUND', 'Please, add WORKSPACE GID in config sheet tab', 'OK')
      return
    }
    if(config.apiKey === '') {
      Logger.log('Please, add PERSONAL ACCESS TOKEN in config sheet tab')
      createAlert('NOT FOUND', 'Please, add PERSONAL ACCESS TOKEN in config sheet tab', 'OK')
      return
    }
  
    //API OPTINONS
    var url = `https://app.asana.com/api/1.0/projects?limit=100&workspace=${config.workspaceGid}&archived=false`;
    var options = {
      headers: {
        'Authorization': 'Bearer ' + config.apiKey
      }
    };
  
    //GET PROJECT WITH GIDS AND DATES
    let projects = [];
    do {
      Logger.log('Obtaining projects from: ' + url);
      let response = UrlFetchApp.fetch(url, options);
      let json = JSON.parse(response.getContentText());
  
      for (let i = 0; i < json.data.length; i++) {
        let project = json.data[i];
        let projectUrl = 'https://app.asana.com/api/1.0/projects/' + project.gid;
  
        Logger.log('Obtaining details from: ' + projectUrl);
        let projectResponse = UrlFetchApp.fetch(projectUrl, options);
        let projectJson = JSON.parse(projectResponse.getContentText());
  
        //FILL PROJECTS ARRAY WITH DATA
        projects.push([
          projectJson.data.name,
          projectJson.data.gid,
          projectJson.data.created_at
        ]);
      }
  
      url = json.next_page ? json.next_page.uri : null;
    } while (url);
    
    //CREATE A NEW SHEET WITH THE CURRENT PROJECT
    if (!listSheetNames('projects')) {
      googleSheet.insertSheet('projects');
    } //Check if sheet already exist
    const projectsSheet = googleSheet.getSheetByName('projects');
  
    //MAKE SURE THE SHEET HAS ENOUGH ROWS
    let startRow = projectsSheet.getLastRow() + 1;
    let neededRows = projects.length - (projectsSheet.getMaxRows() - startRow + 1);
    if (neededRows > 0) {
      Logger.log('Adding ' + neededRows + ' to cells');
      projectsSheet.insertRowsAfter(projectsSheet.getLastRow(), neededRows);
    }
  
    //ADD THE COLUMN HEADER IF NECESSARY
    if (startRow == 1) {
      Logger.log('Adding column names');
      projectsSheet.getRange(1, 1, 1, 3).setValues([['Name', 'GID', 'Created_at']]);
      startRow++;
    }
  
    //CREATES A NEW ARRAY CHANGIN THE 'create_at' ATTRIBUTE TO A DATE INSTANCE, THE SORT IT.
    var newArray = projects.map(function(obj) {
      return [obj[0], obj[1], new Date(obj[2])] ;
    });
  
    //IF CONFIG HAVE DATES
    let projectsByStartDate = [];
    if(config.startDate !== '') {
      console.log(config.startDate)
      console.log(newArray[0][2])
      console.log(newArray[0][2] > config.startDate)
      newArray.map((value, index) => {
        if(value[2] > config.startDate) projectsByStartDate.push(value) 
      })
      newArray = projectsByStartDate
    }
  
    let projectsByEndDate = [];
    if(config.endDate !== '') {
      newArray.map((value, index) => {
        if(value[2] < config.endDate) projectsByEndDate.push(value) 
      })
      newArray = projectsByEndDate
    }
  
  
    newArray.sort(function(a, b) {
      return a[2] - b[2];
    }); 
  
    // Write the project data in the spreadsheet
    //WRITE THE PROJECT DATA IN THE SHEET
    Logger.log('Writing data');
    // for (var i = 0; i < projects.length; i++) {
    //   sheet.getRange(startRow + i, 1, 1, 3).setValues([projects[i]]);
    // }
    const columns = ['A','B','C'];
    newArray.map((value,index)=>{
      columns.map((k,j) =>{
        projectsSheet.getRange(`${k}${index+2}`).setValue(value[j])
      })
    })
  
    Logger.log('Projects collected: ' + projects.length);
  }
  