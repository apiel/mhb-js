const { writeFile, readFile } = require('fs');
const { promisify } = require('util');
const moment = require('moment');
const {
    execSync,
} = require('child_process');

const warmTemp = 21.0;
const awayTemp = 18.0;

const config = {
    start: { temp: warmTemp, start_hour: 6, start_minute: 0 },
    end: { temp: awayTemp, start_hour: 8, start_minute: 0 },
};

const baseCmd = 'cd ../broadlink-thermostat-cli/ && ./broadlink-thermostat-cli.py';

function parseResult(result) {
    const results = result.split("\n");
    if (results.length === 12) {
        const data = JSON.parse(results[9]);
        // console.log('getThermostatData', data);
        writeFile('thermostat-temp.txt', data.thermostat_temp, () => { });
        return data;
    }
}

function getLogTemperature() {
    return promisify(readFile)('thermostat-temp.txt');
}

function getThermostatData() {
    const result = execSync(baseCmd, { encoding: 'utf8' });
    return parseResult(result);
}

function executeThermostatSchedules(schedules) {
    const cmd = `${baseCmd} --schedule='${JSON.stringify(schedules)}'`;
    const result = execSync(cmd, { encoding: 'utf8' });
    console.log('executeThermostatSchedules', result);
}

function executeThermostatPower(power = 'off') {
    const cmd = `${baseCmd} --power='${power}'`;
    const result = execSync(cmd, { encoding: 'utf8' });
    console.log('executeThermostatPower', result);
}

function setNextSchedule(currentTime, duration = 30, temp = warmTemp) {
    const nextTime = currentTime.add(1, 'minutes');
    const nextSchedule = { temp, start_hour: nextTime.hours(), start_minute: nextTime.minutes() };

    const endTime = currentTime.add(duration, 'minutes');
    const endSchedule = { temp: awayTemp, start_hour: endTime.hours(), start_minute: endTime.minutes() };

    const schedules = [[
        config.start,
        config.start,
        config.end,
        config.end,
        nextSchedule,
        endSchedule,
    ], [nextSchedule, endSchedule]];

    console.log('new schedules', schedules);
    executeThermostatSchedules(schedules);
}

function setDefaultSchedules() {
    const schedules = [[
        config.start,
        config.start,
        config.start,
        config.end,
        config.end,
        config.end,
    ], [config.start, config.end]];

    console.log('set default schedules', schedules);
    executeThermostatSchedules(schedules);
}

let failedDeviceRetry = 0;
function onFailedToGetDevice() {
    console.log('Failed to get devices...');
    failedDeviceRetry++;
    if (failedDeviceRetry > 10) {
        setDefaultSchedules();
    }
}

function thermostatActivate(duration = 30, temp = warmTemp) {
    const data = getThermostatData();
    if (!data) {
        console.log('Cannot access thermostat to get data');
    } else {
        try {
            const { hour, min, thermostat_temp, auto_mode } = data;
            if (!auto_mode) {
                console.log('Manual mode, do nothing...');
            } else {
                const currentTime = moment({ hour, minute: min });
                console.log('Update thermostat schedule.');
                setNextSchedule(currentTime, duration, temp);
            }
            failedDeviceRetry = 0;
        } catch (error) {
            if (error === 'failed to get devices') {
                onFailedToGetDevice();
            } else {
                console.error('Error:', error);
            }
        }
    }
}

module.exports = {
    thermostatActivate,
    executeThermostatPower,
    getLogTemperature,
    config,
}