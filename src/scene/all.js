const { setOnOff } = require('../zigbee/controller');
const devices = require('../zigbee/devices');
const urls = require('../urls/urls');
const { call } = urls;

function allLivingRoomOff() {
    console.log('devices', devices);
    setOnOff(devices.IKEA_E27_BULB_SOFA.addr, 'off');
    setOnOff(devices.IKEA_E27_BULB_TRIANGLE.addr, 'off');
    call(urls.LIGHT_KITCHEN_OFF);
    call(urls.LIGHT_LIVING_ROOM_OFF);
}

function allFlatOff() {
    allLivingRoomOff();
    call(urls.LIGHT_WALL_ENTRANCE_OFF);
    call(urls.LIGHT_UNDER_OFF);
}

module.exports = {
    allLivingRoomOff,
    allFlatOff,
};
