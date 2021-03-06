const { writeFile, readFile } = require('fs');
const { promisify } = require('util');
const moment = require('moment');
const { execSync } = require('child_process');

const warmTemp = 22.0;
const awayTemp = 18.0;

const config = {
    start: { temp: warmTemp, start_hour: 6, start_minute: 0 },
    end: { temp: awayTemp, start_hour: 8, start_minute: 0 },
};

const baseCmd =
    'cd ../broadlink-thermostat-cli/ && ./broadlink-thermostat-cli.py';

function parseResult(result) {
    const results = result.split('\n');
    if (results.length === 12) {
        const data = JSON.parse(results[9]);
        // console.log('getThermostatData', data);
        writeFile('log/thermostat-temp.txt', data.thermostat_temp, () => {});
        writeFile(
            'log/thermostat-data.json',
            JSON.stringify(data, null, 4),
            () => {},
        );
        return data;
    }
}

function getLogTemperature() {
    return promisify(readFile)('log/thermostat-temp.txt');
}

async function getLogThermostat() {
    try {
        const data = await promisify(readFile)('log/thermostat-data.json');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// should use exec instead of execSync... for PIR and UI call
function getThermostatData() {
    try {
        const result = execSync(baseCmd, { encoding: 'utf8' });
        return parseResult(result);
    } catch (error) {
        console.error('Error:', error);
    }
}

function executeThermostatSchedules(schedules) {
    try {
        const cmd = `${baseCmd} --schedule='${JSON.stringify(schedules)}'`;
        const result = execSync(cmd, { encoding: 'utf8' });
        console.log('executeThermostatSchedules', result);
        return parseResult(result);
    } catch (error) {
        console.error('Error:', error);
    }
}

function executeThermostatPower(power = 'off') {
    try {
        const cmd = `${baseCmd} --power='${power}'`;
        const result = execSync(cmd, { encoding: 'utf8' });
        console.log('executeThermostatPower', result);
        return parseResult(result);
    } catch (error) {
        console.error('Error:', error);
    }
}

function setNextSchedule(currentTime, duration = 30, temp = warmTemp) {
    const nextTime = currentTime.add(1, 'minutes');
    const nextSchedule = {
        temp,
        start_hour: nextTime.hours(),
        start_minute: nextTime.minutes(),
    };

    const endTime = currentTime.add(duration, 'minutes');
    const endSchedule = {
        temp: awayTemp,
        start_hour: endTime.hours(),
        start_minute: endTime.minutes(),
    };

    const schedules = [
        [
            config.start,
            config.start,
            config.end,
            config.end,
            nextSchedule,
            endSchedule,
        ],
        [nextSchedule, endSchedule],
    ];

    console.log('new schedules', schedules);
    executeThermostatSchedules(schedules);
}

function setDefaultSchedules() {
    const schedules = [
        [
            config.start,
            config.start,
            config.start,
            config.end,
            config.end,
            config.end,
        ],
        [config.start, config.end],
    ];

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
            return true;
        } catch (error) {
            if (error === 'failed to get devices') {
                onFailedToGetDevice();
            } else {
                console.error('Error:', error);
            }
        }
    }
    return false;
}

module.exports = {
    warmTemp,
    thermostatActivate,
    executeThermostatPower,
    getLogTemperature,
    getLogThermostat,
    getThermostatData,
    config,
};
