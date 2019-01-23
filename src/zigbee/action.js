const { devices, actions } = require('./settings');
const advanceActions = require('./utils/advanceActions');
const { sendAction } = require('./utils/zigbee');
const urls = require('../urls/urls');
const { call } = urls;
const { timer } = require('../utils');

// Succeed to configure TRADFRI wireless dimmer 0x000b57fffe150865
// onAfIncomingMsg 0x000b57fffe150865 <Buffer 11 01 07>

 function onAfIncomingMsg (addr, data) {
    // console.log('onAfIncomingMsg zcl', addr, JSON.stringify(data));
    if (data.cmdId) {
        console.log('# onAfIncomingMsg zcl', addr, data.cmdId, data.payload);

        if (addr === devices.IKEA_DIMMER_SOFA.addr) {
            if (data.cmdId === 'moveWithOnOff' || data.cmdId === 'move') {
                const { movemode } = data.payload;
                const direction = movemode ? -1 : 1;
                advanceActions.brightness(
                    devices.IKEA_E27_BULB_SOFA.addr,
                    30 * direction,
                );
            } else if (data.cmdId === 'moveToLevelWithOnOff') {
                const { level } = data.payload;
                sendAction(
                    devices.IKEA_E27_BULB_SOFA.addr,
                    actions.onOff(level ? 'on' : 'off'),
                );
            }
        }
    }
}

function allOff() {
    sendAction(devices.IKEA_E27_BULB_SOFA.addr, actions.onOff('off'));
    sendAction(devices.IKEA_OUTLET_TABLE.addr, actions.onOff('off'));
    sendAction(devices.INNR_E14_BULB.addr, actions.onOff('off'));
    call(urls.LIGHT_KITCHEN_OFF);
    call(urls.LIGHT_UNDER_OFF);
}

let cubeSide = null;
function onIndMessage({ ieeeAddr }, payload, cmdId) {
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
    } else if (ieeeAddr === devices.XIAOMI_BTN_BATHROOM.addr) { // hold not working
        console.log('XIAOMI_BTN_BATHROOM payload', payload, cmdId);
        if (cmdId === 'genOnOff') {
            const { click, action } = payload;
            if (click === 'single') {
                call(urls.LIGHT_BATH_TOGGLE);
                timer('BATH', () => call(urls.LIGHT_BATH_OFF), 5*60);
            } else if (click === 'double') {
                call(urls.LIGHT_WALL_ENTRANCE_TOGGLE);
            }
        }
    } else if (ieeeAddr === devices.XIAOMI_CUBE.addr) {
        const { action, side, from_side, to_side, angle } = payload;
        if (action === 'flip90') {
            cubeSide = to_side;
            if ((from_side === 0 && to_side === 4) || (from_side === 1 && to_side === 3)) {
                advanceActions.toggle(
                    devices.IKEA_OUTLET_TABLE.addr,
                );
            } else if ((from_side === 0 && to_side === 1) || (from_side === 4 && to_side === 3)) {
                advanceActions.toggle(
                    devices.INNR_E14_BULB.addr,
                );
            // } else if ((from_side === 0 && to_side === 2) || (from_side === 3 && to_side === 2)) {
            } else if (to_side === 2) {
                advanceActions.toggle(
                    devices.IKEA_E27_BULB_SOFA.addr,
                );
            // } else if (from_side === 0 && to_side === 5) {
            } else if (to_side === 5) {
                call(urls.LIGHT_KITCHEN_ON);
            }
        } else if (action === 'shake') {
            allOff();
        } else if (action === 'slide') {
            cubeSide = side;
        } else if (action === 'rotate_right' || action === 'rotate_left') {
            const direction = (action === 'rotate_right' ? 1 : -1);
            console.log('rotate', cubeSide, direction);
            if (cubeSide === 1) {
                advanceActions.brightness(
                    devices.INNR_E14_BULB.addr,
                    direction * 20,
                );
            } else if (cubeSide === 2) {
                advanceActions.brightness(
                    devices.IKEA_E27_BULB_SOFA.addr,
                    direction * 20,
                );
            }
        }
    }
}

module.exports = {
    onAfIncomingMsg,
    onIndMessage,
};
