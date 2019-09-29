const zigbeeService = require('./zigbeeService');
const settings = require('./settings');

const lastToggle = {};

const brightness = async (addr, value, min = 0) => {
    let bri = -1;
    try {
        const { cId, attrId } = settings.read.brightness;
        bri = await zigbeeService.device.getState(addr, cId, attrId);
        const brightness = Math.min(Math.max(bri + value, min), 255);
        zigbeeService.device.sendAction({ addr, action: settings.actions.brightness(brightness) });
        bri = brightness;
    } catch (error) {
        console.error('NEED TO HANDLE ERROR', error);
    }
    return bri;
};

const countdownTimers = {};
const countdown = async (addr, tick = 30) => {
    const bri = await brightness(addr, -1, 1);
    if (bri > 1) {
        console.log('countdown', addr, bri, tick);
        countdownTimers[addr] = setTimeout(() => { countdown(addr, tick); }, tick * 1000);
    }
};

function clearCountdown(addr) {
    if (countdownTimers[addr]) {
        clearTimeout(countdownTimers[addr]);
        countdownTimers[addr] = null;
    }
}

module.exports = {
    countdown,
    brightness,
    toggle: async (addr) => {
        try {
            const now  = new Date();
            if ( !lastToggle[addr] || now - lastToggle[addr] > 1000 ) { // toggle if last change is more than 2 sec
                clearCountdown(addr);
                lastToggle[addr] = now;
                const { cId, attrId } = settings.read.onOff;
                const state = await zigbeeService.device.getState(addr, cId, attrId);
                const onOff = state === 1 ? 'off' : 'on';
                console.log('toggle new state', addr, state, onOff);
                zigbeeService.device.sendAction({ addr, action: settings.actions.onOff(onOff) });
            }
        } catch (error) {
            console.error('NEED TO HANDLE ERROR', error);
        }
    },
    sendActionMany: (items, action) => {
        Object.values(items).forEach(item => {
            zigbeeService.device.sendAction({ addr: item.addr, action });
        });
    }
}
