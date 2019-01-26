const zigbee = require('../zigbee/settings');
const advanceActions = require('../zigbee/advanceActions');
const { sendAction, sendActionMany } = require('../zigbee/zigbee');
const milight = require('../milight/milight');
const { saveCamToDrive } = require('../googleapi/cam');
const { timer } = require('../utils');
const { time, now } = require('../schedule');
const urls = require('../urls/urls');
const { call } = urls;

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
    }  else if (key === 'CERCLE_3_UP') {
        if (getKeyRepeat(key) > 1) {
            call(urls.LIGHT_KITCHEN_ON);
        }
    } else if (key === 'CERCLE_3_DOWN') {
        if (getKeyRepeat(key) > 1) {
            call(urls.LIGHT_KITCHEN_OFF);
        }
    } else if (key === 'CERCLE_3_MILDDLE') {
        call(urls.LIGHT_KITCHEN_OFF);
    }  else if (key === 'CERCLE_4_UP') {
        if (getKeyRepeat(key) > 1) {
            advanceActions.brightness(
                zigbee.devices.IKEA_E27_BULB_TRIANGLE.addr,
                30,
            );
        }
    } else if (key === 'CERCLE_4_DOWN') {
        if (getKeyRepeat(key) > 1) {
            advanceActions.brightness(
                zigbee.devices.IKEA_E27_BULB_TRIANGLE.addr,
                -30,
            );
        }
    } else if (key === 'CERCLE_4_MILDDLE') {
        sendAction(
            zigbee.devices.IKEA_E27_BULB_TRIANGLE.addr,
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
    }  else if (key === 'CERCLE_6_UP') {
        if (getKeyRepeat(key) > 1) {
            call(urls.LIGHT_UNDER_ON);
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
        call(urls.LIGHT_UNDER_OFF);
        sendAction(
            zigbee.devices.IKEA_E27_BULB_SOFA.addr,
            zigbee.actions.onOff('off'),
        );
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
    } else if (key === 'SWITCH_1_BTN') {
        call(urls.LIGHT_BATH_TOGGLE);
        timer('BATH', () => call(urls.LIGHT_BATH_OFF), 5*60); // keep call light off with timer
    } else if (key === 'SWITCH_3_BTN_ROOM_RIGHT') {
        call(urls.LIGHT_WALL_ENTRANCE_TOGGLE);
    } else if (key === 'SWITCH_3_BTN_ROOM_MIDDLE') {
        // milight.bridgeToggle();
    } else if (key === 'PIR_BATH') {
        // if (now() > time('6:30') && now() < time('23:30')) { // only switch one between 6:30 and 23:30
        //     call(urls.LIGHT_BATH_ON);
        // }
        timer('BATH', () => call(urls.LIGHT_BATH_OFF), 5*60);
    } else if (key === 'DOOR') {
        saveCamToDrive();
        setTimeout(saveCamToDrive, 2000);
        setTimeout(saveCamToDrive, 4000);
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
