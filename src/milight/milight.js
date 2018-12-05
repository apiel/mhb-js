const Milight = require('node-milight-promise');
const settings = require('./settings');

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

function send(light, cmd) {
    if (light) {
        light.sendCommands(cmd);
    }
}

setTimeout(() => {
    console.log('settimeout light', settings.devices.MILIGHT_BRIDGE.ip);
    const device = settings.devices.MILIGHT_BRIDGE;
    send(device.light, settings.actions.onOff(device.zone, 'off'));
}, 1000);
