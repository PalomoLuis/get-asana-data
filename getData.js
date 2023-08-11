/**
 * @param {number} input the project gid.
 * @return All the data.
 * @author Luis Palomo
 * @description The function returns all the tasks data from a Asana project
 * @customfunction
 */

async function getData(projectGid) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet() //Get Google Sheet project
  const currentsheet = sheet.getActiveSheet(); //Get current sheet
  const configSheet = sheet.getSheetByName('config'); //Get config sheet
  if(configSheet === null) {
    Logger.log(`config sheet tab doesn't found`)
    currentsheet.getRange('A1').setValue(`config sheet tab doesn't found`)
    return
  }

  //SET CONFIGURATION FROM CONFIG SHEET
  const config = {
    apiKey: configSheet.getRange('B2').getValue(),
    projectgid: projectGid,
    filters: 'custom_fields,name,projects.name'
  }

  if(config.apiKey === '') {
    Logger.log('Please, add PERSONAL ACCESS TOKEN in config sheet tab')
    return
  }
  if(config.projectgid === '') {
    Logger.log('Please, add PROJECT ID in config sheet tab')
    return
  }

  currentsheet.clear();

  //API OPTINONS
  const projectsUrl = 'https://app.asana.com/api/1.0/projects/' + config.projectgid + '/tasks';
  const tasksUrl = 'https://app.asana.com/api/1.0/tasks/';
  const filter = `?opt_fields=${config.filters}`;
  const options = {
      'method' : 'get',
      'headers': {
      'Authorization': 'Bearer ' + config.apiKey
      }
  };

  //GET A LIST OF AL THE TASKS IN A PROJECT
  let responseProject = await UrlFetchApp.fetch(projectsUrl, options);
  let projectData = await JSON.parse(responseProject.getContentText());
  let project = await projectData.data;

  //GET EVERY TASKS ID IN THE PROJECT
  // Array.isArray(project) ? project.map(task => Logger.log(task.gid)) : null; 
  let tasksGids = Array.isArray(project) ? project.map(task => task.gid) : null;
  let tasksPromises = [];

  //GET ALL THE TASKS DATA OF THE PROJECT
  await Promise.all(tasksGids.map(async (gid, index) => {
    if(index < 200) {
      let taskPromise = await UrlFetchApp.fetch(tasksUrl + gid + filter, options).getContentText();
      let taskData = await JSON.parse(taskPromise);
      let task = await taskData.data;
      tasksPromises.push(task);
    } else {
      return
    }
  }));

  let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  //ARRAY OF PROJECT NAME
  let projectsName = tasksPromises.map(task => task.projects[0].name)
  projectsName.unshift('Project Name')

  //CREATE A NEW SHEET WITH THE CURRENT PROJECT
  sheet.insertSheet(projectsName[1])
  let projectSheet = sheet.getSheetByName(projectsName[1])
  projectsName.map( (value, index) => projectSheet.getRange(`${letters[0]}${index + 1}`).setValue(value) )

  //ARRAY OF TASKS NAMES
  let tasksNames = tasksPromises.map(task => task.name)
  tasksNames.unshift('Task Names')
  tasksNames.map( (value, index) => projectSheet.getRange(`${letters[1]}${index + 1}`).setValue(value) )

  //ARRAY OF VALUES OF CUSTOM FIELS
  let customFields = tasksPromises.map(task => {
    let fields = task.custom_fields.map( item => `${item.display_value !== null ? item.display_value : ' '}`)
    return fields
  })
  
  //ARRAY OF HEADER TITLES OF CUSTOM FIELDS
  let customFieldsList = tasksPromises.map(task => {
    let fields = task.custom_fields.map( item => `${item.name}`)
    return fields
  }).reduce((acum, current) => {
    if (!acum.includes(current)) acum.push(current)
    return acum
  },[])[0]
  customFieldsList.map( (value, index) => projectSheet.getRange(`${letters[index + 2]}${1}`).setValue(value) )


  customFieldsList.map( (value, index) => {
    customFields.map((v, i) => {
      projectSheet.getRange(`${letters[index + 2]}${i + 2}`).setValue(v[index])
    })
  })
}
