const { devices, actions } = require('./settings');
const advanceActions = require('./utils/advanceActions');
const { sendAction } = require('./utils/zigbee');

// Succeed to configure TRADFRI wireless dimmer 0x000b57fffe150865
// onAfIncomingMsg 0x000b57fffe150865 <Buffer 11 01 07>

module.exports = async(addr, data) => {
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
    }
}
