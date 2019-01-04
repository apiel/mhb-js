const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const execSync = require('child_process').execSync;

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = `${__dirname}/data/token.json`;

let counter = 0;

function saveCamToDrive() {
    const imgFileName = `cam${counter++%10}.jpeg`;
    // console.log('imgFileName', imgFileName);
    execSync(`wget -O ${__dirname}/data/${imgFileName} http://admin:admin@192.168.0.108/snapshot.cgi`);
    startUploadToDrive(imgFileName);
}

function startUploadToDrive(imgFileName) {
    fs.readFile(`${__dirname}/data/credentials.json`, (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), upFileToDrive(imgFileName));
    });
}

function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

function upFileToDrive(imgFileName) {
    return function(auth) {
        const fileId = `cam/${(new Date()).toISOString()}.jpeg`;
        const drive = google.drive({ version: 'v3', auth });
        const fileMetadata = {
            name: fileId,
        };
        const media = {
            mimeType: 'image/jpeg',
            body: fs.createReadStream(`${__dirname}/data/${imgFileName}`)
        };
        drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
            fileId,
        }, function (err, file) {
            if (err) {
                // Handle error
                console.error(err);
            } else {
                console.log('File Id: ', file.id);
            }
        });
    };
}

module.exports = {
    saveCamToDrive,
};
