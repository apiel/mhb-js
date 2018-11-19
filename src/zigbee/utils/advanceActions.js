const settings = require('../settings');
const {
    sendAction,
    getState,
} = require('./zigbee.js');

const lastToggle = {};

module.exports = {
    brightness: async (addr, value) => {
        const bri = await getState(addr, settings.read.brightness);
        const brightness = Math.min(Math.max(bri + value, 0), 255);
        sendAction(addr, settings.actions.brightness(brightness));
    },
    toggle: async (addr) => {
        // console.log('toggle', addr);
        const now  = new Date();
        if ( !lastToggle[addr] || now - lastToggle[addr] > 3000 ) { // toggle if last change is more than 2 sec
            lastToggle[addr] = now;
            const state = await getState(addr, settings.read.onOff);
            const onOff = state === 1 ? 'off' : 'on';
            console.log('toggle new state', addr, state, onOff);
            sendAction(addr, settings.actions.onOff(onOff));
        }
    },
}
