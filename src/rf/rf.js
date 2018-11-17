const SerialPort = require('serialport');
const CMD = require('./command.js');

const port = new SerialPort('/dev/ttyS0', {
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
async function action(key) {
    if (key === 'CERCLE_1_UP') {
        if (getKeyRepeat(key) > 1) {
            zigbee.sendAction(
                zigbee.devices.IKEA_OUTLET_TABLE.addr,
                zigbee.actions.onOff('on'),
            );
        }
    } else if (key === 'CERCLE_1_DOWN') {
        if (getKeyRepeat(key) > 1) {
            zigbee.sendAction(
                zigbee.devices.IKEA_OUTLET_TABLE.addr,
                zigbee.actions.onOff('off'),
            );
        }
    } else if (key === 'CERCLE_2_UP') {
        if (getKeyRepeat(key) > 1) {
            zigbee.advanceActions.brightness(
                zigbee.devices.INNR_E14_BULB.addr,
                20,
            );
        }
    } else if (key === 'CERCLE_2_DOWN') {
        if (getKeyRepeat(key) > 1) {
            zigbee.advanceActions.brightness(
                zigbee.devices.INNR_E14_BULB.addr,
                -20,
            );
        }
    } else if (key === 'CERCLE_2_MILDDLE') {
        zigbee.sendAction(
            zigbee.devices.INNR_E14_BULB.addr,
            zigbee.actions.onOff('off'),
        );
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
