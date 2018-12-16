const { devices, actions } = require('./settings');
const advanceActions = require('./utils/advanceActions');
const { sendAction } = require('./utils/zigbee');

// Succeed to configure TRADFRI wireless dimmer 0x000b57fffe150865
// onAfIncomingMsg 0x000b57fffe150865 <Buffer 11 01 07>

 function onAfIncomingMsg (addr, data) {
    // console.log('onAfIncomingMsg zcl', addr, JSON.stringify(data));
    if (data.cmdId) {
        console.log('onAfIncomingMsg zcl', addr, data.cmdId, data.payload);

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
        // else if (addr === devices.XIAOMI.addr) {
        //     // genMultistateInput
        //     console.log('xiaomi btn', data);
        // }
    }
}

function allOff() {
    sendAction(devices.IKEA_E27_BULB_SOFA.addr, actions.onOff('off'));
    sendAction(devices.IKEA_OUTLET_TABLE.addr, actions.onOff('off'));
    sendAction(devices.INNR_E14_BULB.addr, actions.onOff('off'));
    // kitchen
    // under sofa
}

function onIndMessage({ ieeeAddr }, payload, cmdId) {
    if (ieeeAddr === devices.XIAOMI_BTN_KITCHEN.addr) {
        if (cmdId === 'genMultistateInput') {
            // console.log('XIAOMI_BTN_KITCHEN payload', payload);
            const { click, action } = payload;
            if (action === 'hold') {
                allOff();
            } else if (click === 'single') {
                // kitchen toggle
            } else if (click === 'double') {
                console.log('no action for double click');
            }
        }
    }
}

module.exports = {
    onAfIncomingMsg,
    onIndMessage,
};
