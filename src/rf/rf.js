const SerialPort = require('serialport');
const CMD = require('./command.js');

const port = new SerialPort('/dev/ttyUSB1', {
  baudRate: 115200
});

port.on('error', (err) => {
    console.log('Error: ', err.message);
});

let data = '';
port.on('readable', () => {
    // console.log('Data:', port.read().toString('utf8'));
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

let zigbee;
module.exports = (_zigbee) => {
    zigbee = _zigbee;
}

let lastKey = '';
let countKeyRepeat = 0;
function action(key) {
    if (key === 'CERCLE_1_UP') {
        if (getKeyRepeat(key) > 2) {
            console.log('Switch on all');
            zigbee('on');
        }
    } else if (key === 'CERCLE_1_DOWN') {
        if (getKeyRepeat(key) > 2) {
            console.log('Switch on all');
            zigbee('off');
        }
    }
    lastKey = key;
}


function getKeyRepeat(key) {
    if (lastKey === key) {
        countKeyRepeat++;
    } else {
        countKeyRepeat = 1;
    }
    return countKeyRepeat;
}
