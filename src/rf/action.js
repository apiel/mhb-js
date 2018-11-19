const zigbee = require('../zigbee/settings');
const advanceActions = require('../zigbee/utils/advanceActions');
const { sendAction, sendActionMany } = require('../zigbee/utils/zigbee');

let lastKey = '';
let countKeyRepeat = 0;
module.exports = async(key) => {
    if (key === 'SWITCH_3_BTN_RIGHT') {
        advanceActions.toggle(
            zigbee.devices.INNR_E14_BULB.addr,
        );
    } else if (key === 'SWITCH_3_BTN_MIDDLE') {
        advanceActions.toggle(
            zigbee.devices.IKEA_E27_BULB_SOFA.addr,
        );
    } else if (key === 'SWITCH_3_BTN_LEFT') {
        advanceActions.toggle(
            zigbee.devices.IKEA_OUTLET_TABLE.addr,
        );
    } else if (key === 'CERCLE_1_UP') {
        if (getKeyRepeat(key) > 1) {
            sendAction(
                zigbee.devices.IKEA_OUTLET_TABLE.addr,
                zigbee.actions.onOff('on'),
            );
        }
    } else if (key === 'CERCLE_1_DOWN') {
        if (getKeyRepeat(key) > 1) {
            sendAction(
                zigbee.devices.IKEA_OUTLET_TABLE.addr,
                zigbee.actions.onOff('off'),
            );
        }
    } else if (key === 'CERCLE_2_UP') {
        if (getKeyRepeat(key) > 1) {
            advanceActions.brightness(
                zigbee.devices.INNR_E14_BULB.addr,
                20,
            );
        }
    } else if (key === 'CERCLE_2_DOWN') {
        if (getKeyRepeat(key) > 1) {
            advanceActions.brightness(
                zigbee.devices.INNR_E14_BULB.addr,
                -20,
            );
        }
    } else if (key === 'CERCLE_2_MILDDLE') {
        sendAction(
            zigbee.devices.INNR_E14_BULB.addr,
            zigbee.actions.onOff('off'),
        );
    }  else if (key === 'CERCLE_6_UP') {
        if (getKeyRepeat(key) > 1) {
            advanceActions.brightness(
                zigbee.devices.IKEA_E27_BULB_SOFA.addr,
                30,
            );
        }
    } else if (key === 'CERCLE_6_DOWN') {
        if (getKeyRepeat(key) > 1) {
            advanceActions.brightness(
                zigbee.devices.IKEA_E27_BULB_SOFA.addr,
                -30,
            );
        }
    } else if (key === 'CERCLE_6_MILDDLE') {
        sendAction(
            zigbee.devices.IKEA_E27_BULB_SOFA.addr,
            zigbee.actions.onOff('off'),
        );
    }  else if (key === 'CERCLE_5_UP') {
        if (getKeyRepeat(key) > 1) {
            sendAction(
                zigbee.devices.IKEA_OUTLET_TABLE.addr,
                zigbee.actions.onOff('on'),
            );
            sendAction(
                zigbee.devices.INNR_E14_BULB.addr,
                zigbee.actions.onOff('on'),
            );
        }
    } else if (key === 'CERCLE_5_DOWN') {
        if (getKeyRepeat(key) > 1) {
            sendAction(
                zigbee.devices.IKEA_OUTLET_TABLE.addr,
                zigbee.actions.onOff('off'),
            );
            sendAction(
                zigbee.devices.INNR_E14_BULB.addr,
                zigbee.actions.onOff('off'),
            );
        }
    } else if (key === 'CERCLE_ALL_MILDDLE' || key === 'CERCLE_1_MILDDLE' || key === 'CERCLE_5_MILDDLE') {
        sendActionMany(
            zigbee.devices,
            zigbee.actions.onOff('off'),
        );
    } else if (key === 'CERCLE_ALL_DOWN') {
        if (getKeyRepeat(key) > 1) {
            sendActionMany(
                zigbee.devices,
                zigbee.actions.onOff('off'),
            );
        }
    } else if (key === 'CERCLE_ALL_UP') {
        if (getKeyRepeat(key) > 1) {
            sendActionMany(
                zigbee.devices,
                zigbee.actions.onOff('on'),
            );
        }
    }
    lastKey = key;
}

function getKeyRepeat(key) {
    if (lastKey === key) {
        countKeyRepeat++;
    } else {
        countKeyRepeat = 1;
    }
    return countKeyRepeat;
}
