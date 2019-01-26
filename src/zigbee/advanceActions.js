const zigbeeService = require('./zigbeeService');
const settings = require('./settings');

const lastToggle = {};

module.exports = {
    brightness: async (addr, value) => {
        try {
            const { cId, attrId } = settings.read.brightness;
            const bri = await zigbeeService.device.getState(addr, cId, attrId);
            const brightness = Math.min(Math.max(bri + value, 0), 255);
            zigbeeService.device.sendAction({ addr, action: settings.actions.brightness(brightness) });
        } catch (error) {
            console.error('NEED TO HANDLE ERROR', error);
        }
    },
    toggle: async (addr) => {
        try {
            const now  = new Date();
            if ( !lastToggle[addr] || now - lastToggle[addr] > 3000 ) { // toggle if last change is more than 2 sec
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
