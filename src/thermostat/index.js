const moment = require('moment');
const { appendFile } = require('fs');

const { hasActiveDevices } = require('../urls/urls');
const { hasActiveDevices: hasActiveZigbeeDevices } = require('../zigbee');
const { thermostatActivate, config, getThermostatData, warmTemp } = require('./thermostat');
const { sunTime } = require('../schedule');

const CHECK_INTERVAL = 5 * 60 * 1000; // every 5 min
const HEATING_DURATION = 30; // 30 min
const PAUSE_DURATION = 5; // 15 min

// const getThermostatDataFn = () => getThermostatData().then(() => {}).catch(() => {});
setInterval(getThermostatData, 10 * 60 * 1000); // get thermostat state for UI every 10min
// uncomment to activate thermostat
// let interval = setInterval(check, CHECK_INTERVAL);
let activated = false;

function log(type, duration) {
    appendFile('log/thermostat.txt', `${Date().toString()} ${type} ${duration}\n`, () => { });
}

function activateHeating(type, temp = config.start.temp, duration = HEATING_DURATION) {
    activated = thermostatActivate(duration, temp);
    if (activated) {
        clearInterval(interval);
        const nextCheck = (duration + PAUSE_DURATION) * 60 * 1000;
        setTimeout(() => {
            interval = setInterval(check, CHECK_INTERVAL);
            activated = false;
        }, nextCheck);
        console.log('Start thermostat', { duration });
        log(type, duration);
        setTimeout(getThermostatData, 30 * 1000); // get thermostat state for UI in next 30 sec the time thermostat update
    } else {
        log(`${type}_FAIL`, duration);
    }
}

function tryToActivateHeating(type) {
    if (!activated) {
        activateHeating(type);
    }
}

async function check() {
    let device;
    if (device = await hasActiveDevices()) {
        console.log('There is some active relay, we might need to start heating', { device });
        tryToActivateHeating(`RELAY::${device}`);
    } else if (device = await hasActiveZigbeeDevices()) {
        console.log('There is some active zigbee, we might need to start heating', { device });
        tryToActivateHeating(`ZIGBEE::${device}`);
    } else {
        console.log('There is no active device, leave heating in peace.');
    }
}

// setTimeout(check, 10000); // just for test purpose

const MIN_COUNT_MOVEMENT = 6;
const MOVEMENT_DURATION = 15;
let pirLog = [];
function pir() {
    const now = moment();
    const morningTime = moment({ hour: config.end.start_hour, minute: config.end.start_minute });
    if (now.isBetween(morningTime, sunTime().goldenHour)) {
        pirLog.push(now);
        pirLog = pirLog.slice(-MIN_COUNT_MOVEMENT);
        if (pirLog.length === MIN_COUNT_MOVEMENT && now.diff(pirLog[0], 'minutes') < MOVEMENT_DURATION) {
            console.log('PIR move...');
            pirLog = [];
            // tryToActivateHeating('PIR');
        }
    }
}

module.exports = {
    pir,
    warmTemp,
    activateHeating,
}
