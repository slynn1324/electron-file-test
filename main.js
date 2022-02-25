const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');


const createWindow = () => {
	const win = new BrowserWindow({
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	});

	ipcMain.on('log', (event, msg) => {
		console.log(msg);
	});

	ipcMain.handle('open', async (event) => {
		const result = await dialog.showOpenDialog(win, {
			properties: ['openDirectory']
		})
		
		const pdPath = result.filePaths[0];

		const data = await loadData(pdPath);

		console.log(JSON.stringify(data));

		return data;
		
	});

	ipcMain.handle('save', async (event, data) => {

		console.log("received save event");
		console.log(JSON.stringify(data, null, 2));

	});

	win.loadURL('http://localhost:8000/index.html');
}

app.whenReady().then( () => {
	createWindow();
});

async function loadData(pdPath){

	const fieldsPath = pdPath + "/fields";

	const fieldData = {};

	let files = await fs.readdir(fieldsPath);
	for ( let i = 0; i < files.length; ++i ){
		let file = files[i];
		fieldData[path.basename(file)] = await parseField(fieldsPath + "/" + file);
	}

	console.log(fieldData);

	// TODO: policy isn't _always_ the root... make it dynamic
	const data = { "policy" : {"objectFields": fieldData} };

	return data;
}

async function parseField(file){	
	const yamlFile = file + "/field.yaml";
	const text = (await fs.readFile(yamlFile)).toString();
	const parsed = yaml.load(text);
	return parsed;
}