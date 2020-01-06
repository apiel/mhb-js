const { hasActiveDevices } = require('../urls/urls');
const { hasActiveDevices: hasActiveZigbeeDevices } = require('../zigbee/advanceActions');
const { thermostatActivate } = require('./thermostat')

const CHECK_INTERVAL = 5 * 60 * 1000; // every 5 min
const HEATING_DURATION = 30; // 30 min
const PAUSE_DURATION = 15; // 15 min
const NEXT_CHECK = (HEATING_DURATION + PAUSE_DURATION) * 60 * 1000;

let interval = setInterval(check, CHECK_INTERVAL);

async function check() {
    const active = await hasActiveDevices() || await hasActiveZigbeeDevices();
    console.log('Check for active device', { active });
    if (active) {
        clearInterval(interval);
        interval = setTimeout(() => setInterval(check, CHECK_INTERVAL), NEXT_CHECK);
        console.log('Start thermostat', { HEATING_DURATION });
        thermostatActivate(HEATING_DURATION);
    }
}
