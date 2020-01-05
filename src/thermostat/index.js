const { hasActiveDevices } = require('../urls/urls');
const { hasActiveDevices: hasActiveZigbeeDevices } = require('../zigbee/advanceActions');

async function start() {
    const active = await hasActiveDevices() || await hasActiveZigbeeDevices();
    console.log('active', { active });
}
setTimeout(start, 5000);
