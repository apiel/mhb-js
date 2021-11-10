const { setOnOff } = require('../zigbee/controller');
const devices = require('../zigbee/devices');
const urls = require('../urls/urls');
const { call } = urls;

function trylog(fn) {
    try {
       return fn();
    } catch (e) {
       console.error(e);
    }
}

function allLivingRoomOff() {
    console.log('devices', devices);
    trylog(() => setOnOff(devices.IKEA_GU10_BULB_SOFA.addr, 'off'));
    trylog(() => setOnOff(devices.IKEA_E27_BULB_SOFA.addr, 'off'));
    trylog(() => setOnOff(devices.IKEA_E27_BULB_TRIANGLE.addr, 'off'));
    trylog(() => call(urls.LIGHT_KITCHEN_OFF));
    trylog(() => call(urls.LIGHT_LIVING_ROOM_OFF));
}

function allFlatOff() {
    trylog(() => allLivingRoomOff());
    trylog(() => call(urls.LIGHT_WALL_ENTRANCE_OFF));
    trylog(() => call(urls.LIGHT_UNDER_OFF));
}

module.exports = {
    allLivingRoomOff,
    allFlatOff,
};
