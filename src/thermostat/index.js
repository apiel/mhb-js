const moment = require('moment');
const { appendFile } = require('fs');

const { hasActiveDevices } = require('../urls/urls');
const { hasActiveDevices: hasActiveZigbeeDevices } = require('../zigbee/advanceActions');
const { thermostatActivate, config } = require('./thermostat');
const { now, sunTime } = require('../schedule');

const CHECK_INTERVAL = 5 * 60 * 1000; // every 5 min
const HEATING_DURATION = 30; // 30 min
const PAUSE_DURATION = 15; // 15 min
const NEXT_CHECK = (HEATING_DURATION + PAUSE_DURATION) * 60 * 1000;

let interval = setInterval(check, CHECK_INTERVAL);
let activated = false;

function log(type) {
    appendFile('thermostat.txt', `${Date().toString()} ${type}\n`, () => {});
}

function activate(type) {
    if (!activated) {
        clearInterval(interval);
        activated = true;
        interval = setTimeout(() => {
            setInterval(check, CHECK_INTERVAL);
            activated = false;
        }, NEXT_CHECK);
        console.log('Start thermostat', { HEATING_DURATION });
        thermostatActivate(HEATING_DURATION);
        log(type);
    }
}

async function check() {
    const someDevicesAreActive = await hasActiveDevices() || await hasActiveZigbeeDevices();
    console.log('Check for active device', { someDevicesAreActive });
    if (someDevicesAreActive) {
        activate('DEVICE');
    }
}

const MIN_COUNT_MOVEMENT = 3;
const MOVEMENT_DURATION = 15;
let pirLog = [];
const morningTime = moment({ hour: config.end.start_hour, minute: config.end.start_minute });
function pir() {
    const _now = now();
    if (_now < sunTime().goldenHour && _now > morningTime) {
        pirLog.push(moment(_now));
        pirLog = pirLog.slice(-MIN_COUNT_MOVEMENT);
        if (pirLog.length === MIN_COUNT_MOVEMENT && moment(_now).diff(pirLog[0], 'minutes') < MOVEMENT_DURATION) {
            console.log('PIR move...');
            activate('PIR');
        }
    }
}

module.exports = {
    pir,
}
