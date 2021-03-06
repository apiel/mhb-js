const urls = require('../urls/urls');
const { call } = urls;
const { setOnOff, setBrightness } = require('../zigbee/controller');
const devices = require('../zigbee/devices');
const { allLivingRoomOff } = require('../scene/all');
const { appendFile } = require('fs');
const { pir } = require('../thermostat');
const { execSync } = require('child_process');

const espDevices = {
    LIVING_ROOM_LIGHT: { mac: '5C:CF:7F:98:56:CD' },
    ROOM_LIGHT: { mac: '5C:CF:7F:1C:2A:C9' },
};

function handleEspButton(req, res) {
    const { params, body, query } = req;
    console.log('>> handleEspButton', { params, body, query });

    if (query.mac === espDevices.LIVING_ROOM_LIGHT.mac) {
        console.log('>> btn LIVING_ROOM_LIGHT');
        if (query.btn2 === '1') {
            call(urls.LIGHT_KITCHEN_TOGGLE);
        } else if (query.btn2 === '2') {
            call(urls.LIGHT_WALL_ENTRANCE_TOGGLE);
        } else if (query.btn1 === '2') {
            setOnOff(devices.IKEA_E27_BULB_TRIANGLE.addr, 'toggle');
        } else if (query.btn1 === '3') {
            setOnOff(devices.IKEA_E27_BULB_SOFA.addr, 'toggle');
        } else if (query.btn1 === '-1' || query.btn2 === '-1') {
            allLivingRoomOff();
        }
    }

    if (query.mac === espDevices.ROOM_LIGHT.mac) {
        console.log('>> btn ROOM_LIGHT');
        if (query.btn2 === '-1') {
            console.log('Long press, make light strong brightness');
            setBrightness(devices.INNR_E14_BULB.addr, 255);
        } else if (query.btn2 === '2') {
            console.log('4 press, toggle entrance');
            call(urls.LIGHT_WALL_ENTRANCE_TOGGLE);
        } else if (query.btn2 === '3') {
            console.log('Double press, make light low brightness');
            setBrightness(devices.INNR_E14_BULB.addr, 1);
        }
    }

    res.json([{ success: true }]);
}

function handleEspPir(req, res) {
    console.log('Handle PIR!');
    // appendFile('pir.txt', `${Date().toString()}\n`, function (err) {
    //     if (err) console.log('ERR PIR', err);
    //     console.log('Saved!');
    // });
    pir();
    res.json([{ success: true }]);
}

function handleJournal(req, res) {
    console.log('Handle Journal!');
    // might better use async?
    const result = execSync('journalctl -u mhb-js.service -n 100 --no-pager', {
        encoding: 'utf8',
    });
    res.send(`<pre>${result}</pre>`);
}

module.exports = {
    handleEspButton,
    handleEspPir,
    handleJournal,
};
