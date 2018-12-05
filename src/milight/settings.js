const Milight = require('node-milight-promise');
const commands = Milight.commandsV6;

module.exports = {
    devices: {
        MILIGHT_BRIDGE: { mac: 'F0:FE:6B:CF:CB:E4', name: 'night light', zone: null, ip: null },
        MILIGHT_ZONE1: { mac: 'F0:FE:6B:CF:CB:E4', name: 'mi-bulb light', zone: 1, ip: null },
    },
    actions: {
        onOff: (zone, state = 'on') => {
            if (zone) {
                return state === 'on' ? commands.rgbw.on(zone) : commands.rgbw.off(zone);
            }
            return state === 'on' ? commands.bridge.on() : commands.bridge.off();
        },
        brightness: (zone, brightness = 255) => {
            brightness = brightness ? brightness / 255 * 100 : 0; // max brigtness is 100 but on zigbee max brightness is 255
            return zone ? commands.rgbw.brightness(zone, brightness)
                              : commands.bridge.brightness(brightness);
        },
    },
};
