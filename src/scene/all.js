const zigbeeService = require('./zigbeeService');
const urls = require('../urls/urls');
const { call } = urls;

function allLivingRoomOff() {
    zigbeeService.device.sendAction({ addr: devices.IKEA_E27_BULB_SOFA.addr, action: actions.onOff('off') });
    // zigbeeService.device.sendAction({ addr: devices.IKEA_OUTLET_TABLE.addr, action: actions.onOff('off') });
    zigbeeService.device.sendAction({ addr: devices.IKEA_E27_BULB_TRIANGLE.addr, action: actions.onOff('off') });
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
