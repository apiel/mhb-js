const Milight = require('node-milight-promise');
const settings = require('./settings');

const { timeLimitIsOver } = require('../utils');

Milight.discoverBridges({
    type: 'v6'
}).then((results) => {
    results.forEach(result => {
        const { ip } = result;
        const light = new Milight.MilightController({
            ip,
            type: 'v6'
        });
        light.ready().then(() => {
            Object.keys(settings.devices).forEach(key => {
                const device = settings.devices[key];
                // console.log('found ip', ip);
                if (device.mac === result.mac) {
                    // console.log('set light', ip);
                    settings.devices[key].light = light;
                    settings.devices[key].ip = ip;
                }
            });
        });
    });
});

function sendAction(light, cmd) {
    if (light) {
        light.sendCommands(cmd);
    }
}

let bridgeToggleState = 'off';
function bridgeToggle() {
    if (timeLimitIsOver('MILIGHT_BRIDGE', 1000)) {
        bridgeToggleState = bridgeToggleState === 'on' ? 'off' : 'on';
        const device = settings.devices.MILIGHT_BRIDGE;
        const cmd = settings.actions.onOff(device.zone, bridgeToggleState);
        sendAction(device.light, cmd);
    }
}

module.exports = {
    ...settings,
    sendAction,
    bridgeToggle,
}
