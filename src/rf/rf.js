const SerialPort = require('serialport');

const CMD = require('./command');
const action = require('./action');

const port = new SerialPort('/dev/ttyS0', {
  baudRate: 115200
});

port.on('error', (err) => {
    console.log('Error: ', err.message);
});

let data = '';
port.on('readable', () => {
    data += port.read().toString('utf8');
    if (data.includes("\n")) {
        data = data.trim();
        // console.log('data', data);
        parseCmd(data);
        data = '';
    }
});

function parseCmd(data) {
    Object.keys(CMD).forEach((key) => {
        if (CMD[key].includes(data)) {
            console.log('receive', key);
            action(key);
            return;
        }
    })
}