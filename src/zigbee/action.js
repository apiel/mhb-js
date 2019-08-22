const { devices, actions } = require('./settings');
const zigbeeService = require('./zigbeeService');
const { brightness, toggle } = require('./advanceActions');
const urls = require('../urls/urls');
const { call } = urls;
const { timer } = require('../utils');

// Succeed to configure TRADFRI wireless dimmer 0x000b57fffe150865
// onAfIncomingMsg 0x000b57fffe150865 <Buffer 11 01 07>

 function onAfIncomingMsg ({ addr, data }) {
    console.log('onAfIncomingMsg zcl', addr, JSON.stringify(data));
    if (data.cmdId) {
        console.log('# onAfIncomingMsg zcl', addr, data.cmdId, data.payload);

        if (addr === devices.IKEA_DIMMER_SOFA.addr) {
            if (data.cmdId === 'moveWithOnOff' || data.cmdId === 'move') {
                const { movemode } = data.payload;
                const direction = movemode ? -1 : 1;
                brightness(
                    devices.IKEA_E27_BULB_SOFA.addr,
                    30 * direction,
                );
            } else if (data.cmdId === 'moveToLevelWithOnOff') {
                const { level } = data.payload;
                zigbeeService.device.sendAction({
                    addr: devices.IKEA_E27_BULB_SOFA.addr,
                    action: actions.onOff(level ? 'on' : 'off'),
                });
            }
        }
    }
}

function allOff() {
    zigbeeService.device.sendAction({ addr: devices.IKEA_E27_BULB_SOFA.addr, action: actions.onOff('off') });
    // zigbeeService.device.sendAction({ addr: devices.IKEA_OUTLET_TABLE.addr, action: actions.onOff('off') });
    zigbeeService.device.sendAction({ addr: devices.IKEA_E27_BULB_TRIANGLE.addr, action: actions.onOff('off') });
    call(urls.LIGHT_KITCHEN_OFF);
}

const { IkeaOnOffDouble, IkeaOnOffLong } = require('./devices/ikeaOnOff');
// const btnDouble = new IkeaOnOffDouble(devices.IKEA_ONOFF.addr);
const btnLong = new IkeaOnOffLong(devices.IKEA_ONOFF.addr);
const btn2Long = new IkeaOnOffLong(devices.IKEA_ONOFF2.addr);

function onInd(ieeeAddr, type) {
    console.log('# onInd', ieeeAddr, type);
    // if (ieeeAddr === devices.IKEA_ONOFF.addr) {
    //     if (type === 'cmdMove') {
    //         call(urls.LIGHT_KITCHEN_TOGGLE);
    //     }
    // }
    // btnDouble.onInd(ieeeAddr, type, (_type, _lastDevice) => {
    //     console.log('ikea btn (double)', _type, _lastDevice);
    // });
    [btnLong, btn2Long].forEach((btn) => btn.onInd(ieeeAddr, type, (_type, _lastDevice) => {
        console.log('ikea btn (long)', _type, _lastDevice);
        if (_type === 'cmdMove') {
            if (_lastDevice) brightness(_lastDevice, 20);
        } else if (_type === 'cmdMoveWithOnOff') {
            if (_lastDevice) brightness(_lastDevice, -20);
        } else if (_type === 'cmdOff') {
            btnLong.setLastDevice(devices.IKEA_E27_BULB_TRIANGLE.addr);
            toggle(devices.IKEA_E27_BULB_TRIANGLE.addr);
        } else if (_type === 'cmdOn') {
            btnLong.setLastDevice(devices.IKEA_E27_BULB_SOFA.addr);
            toggle(devices.IKEA_E27_BULB_SOFA.addr);
        }
    }));
}

let cubeSide = null;
function onIndMessage(ieeeAddr, payload, cmdId) {
    console.log('# onIndMessage', ieeeAddr, payload, cmdId);
    if (ieeeAddr === devices.XIAOMI_BTN_KITCHEN.addr) {
        if (cmdId === 'genMultistateInput') {
            // console.log('XIAOMI_BTN_KITCHEN payload', payload);
            const { click, action } = payload;
            if (action === 'hold') {
                allOff();
            } else if (click === 'single') {
                call(urls.LIGHT_KITCHEN_TOGGLE);
            } else if (click === 'double') {
                call(urls.LIGHT_WALL_ENTRANCE_TOGGLE);
            }
        }
    } else if (ieeeAddr === devices.XIAOMI_BTN_ROOM.addr) { // hold not working
        console.log('XIAOMI_BTN_ROOM payload', payload, cmdId);
        if (cmdId === 'genOnOff') {
            const { click, action } = payload;
            if (click === 'single') {
                call(urls.SWITCH_TOGGLE);
            } else if (click === 'double') {
                call(urls.LIGHT_WALL_ENTRANCE_TOGGLE);
            }
        }
    // } else if (ieeeAddr === devices.XIAOMI_CUBE.addr) {
    //     const { action, side, from_side, to_side, angle } = payload;
    //     if (action === 'flip90') {
    //         cubeSide = to_side;
    //         if ((from_side === 0 && to_side === 4) || (from_side === 1 && to_side === 3)) {
    //             toggle(
    //                 devices.IKEA_OUTLET_TABLE.addr,
    //             );
    //         } else if ((from_side === 0 && to_side === 1) || (from_side === 4 && to_side === 3)) {
    //             toggle(
    //                 devices.INNR_E14_BULB.addr,
    //             );
    //         // } else if ((from_side === 0 && to_side === 2) || (from_side === 3 && to_side === 2)) {
    //         } else if (to_side === 2) {
    //             toggle(
    //                 devices.IKEA_E27_BULB_SOFA.addr,
    //             );
    //         // } else if (from_side === 0 && to_side === 5) {
    //         } else if (to_side === 5) {
    //             call(urls.LIGHT_KITCHEN_ON);
    //         }
    //     } else if (action === 'shake') {
    //         allOff();
    //     } else if (action === 'slide') {
    //         cubeSide = side;
    //     } else if (action === 'rotate_right' || action === 'rotate_left') {
    //         const direction = (action === 'rotate_right' ? 1 : -1);
    //         console.log('rotate', cubeSide, direction);
    //         if (cubeSide === 1) {
    //             brightness(
    //                 devices.INNR_E14_BULB.addr,
    //                 direction * 20,
    //             );
    //         } else if (cubeSide === 2) {
    //             brightness(
    //                 devices.IKEA_E27_BULB_SOFA.addr,
    //                 direction * 20,
    //             );
    //         }
    //     }
    }
}

module.exports = {
    onAfIncomingMsg,
    onIndMessage,
    onInd,
};
