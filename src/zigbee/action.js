const devices = require('./devices');
const {
    setOnOff,
    setOnOffBri,
    setBrightness,
    getBrightness,
    toggleBri,
    rotate,
} = require('./controller');
const urls = require('../urls/urls');
const { call } = urls;
const { allFlatOff, allLivingRoomOff } = require('../scene/all');

function action(addr, payload) {
    console.log('action device', addr, payload);
    // sleeping room
    if (addr === devices.IKEA_ONOFF.addr) {
        console.log('ikea btn sleeping room', addr);
        if (payload.click === 'brightness_up') {
            toggleBri(devices.INNR_E14_BULB.addr);
        } else if (payload.click === 'brightness_down') {
            setOnOff(devices.IKEA_OUTLET_HALLWAY.addr, 'toggle');
        } else if (payload.click === 'on') {
            toggleBri(devices.INNR_E14_BULB.addr);
        } else if (payload.click === 'off') {
            setOnOff(devices.INNR_E14_BULB.addr, 'toggle');
        }
    }
    // entrance
    else if (addr === devices.LINKIND_BUTTON.addr) {
        console.log('LINKIND buttom', addr, payload);
        if (payload.action === 'on' || payload.action === 'off') {
            setOnOff(devices.IKEA_OUTLET_HALLWAY.addr, 'toggle');
        // } else if (payload.action === 'brightness_stop') {
        } else if (payload.action === 'brightness_move_down' || payload.action === 'brightness_move_up') {
	    allFlatOff();
        }
    }
    // living room
    else if (addr === devices.IKEA_ONOFF2.addr) {
        console.log('ikea btn living room', addr);
        if (payload.click === 'brightness_up') {
            toggleBri(devices.IKEA_E27_BIG_BULB.addr);
        } else if (payload.click === 'brightness_down') {
            toggleBri(devices.IKEA_GU10_BULB_SOFA.addr);
        } else if (payload.click === 'on') {
            setOnOff(devices.IKEA_E27_BIG_BULB.addr, 'toggle');
        } else if (payload.click === 'off') {
            setOnOff(devices.IKEA_GU10_BULB_SOFA.addr, 'toggle');
        }
    } else if (addr === devices.AQARA_OPPLE.addr) {
        if (payload.action === 'button_1_single') {
            allLivingRoomOff();
        } else if (payload.action === 'button_1_double') {
            console.log('opple btn1 double');
        } else if (payload.action === 'button_1_hold') {
            console.log('opple btn1 hold');
        } else if (payload.action === 'button_2_single') {
            setOnOff(devices.IKEA_OUTLET_HALLWAY.addr, 'toggle');
        } else if (payload.action === 'button_3_single') {
            setOnOff(devices.IKEA_E27_BIG_BULB.addr, 'toggle');
        } else if (payload.action === 'button_3_hold') {
            toggleBri(devices.IKEA_E27_BIG_BULB.addr);
        } else if (payload.action === 'button_4_single') {
            call(urls.LIGHT_KITCHEN_TOGGLE);
        } else if (payload.action === 'button_5_single') {
            setOnOff(devices.IKEA_GU10_BULB_SOFA.addr, 'toggle');
        } else if (payload.action === 'button_5_single') {
            toggleBri(devices.IKEA_GU10_BULB_SOFA.addr);
        }
        // till 6
    } else if (addr === devices.XIAOMI_CUBE.addr) {
        if (payload.action === 'shake') {
            setOnOff(devices.IKEA_OUTLET_HALLWAY.addr, 'off');
            setOnOff(devices.INNR_E14_BULB.addr, 'off');
        } else if (payload.action === 'flip90') {
            setOnOff(devices.INNR_E14_BULB.addr, 'toggle');
        } else if (
            payload.action === 'rotate_right' ||
            payload.action === 'rotate_left'
        ) {
            rotate(devices.INNR_E14_BULB.addr, payload.angle);
        }
    } else if (addr === devices.XIAOMI_BTN_ROOM.addr) {
        if (payload.click === 'single') {
            // setOnOff(devices.INNR_E14_BULB.addr, 'toggle', 10);
            setOnOffBri(devices.INNR_E14_BULB.addr, 10);
        } else if (payload.click === 'double') {
            setOnOff(devices.IKEA_OUTLET_HALLWAY.addr, 'toggle');
        } else if (payload.action === 'hold') {
            toggleBri(devices.INNR_E14_BULB.addr);
            // setBrightness(devices.INNR_E14_BULB.addr, 255);
        }
    } else if (addr === devices.XIAOMI_BTN_ROOM_REMOTE.addr) {
        if (payload.click === 'single') {
            setOnOff(devices.LINKIND_KITCHEN_PLUG.addr, 'toggle');
            // call(urls.LIGHT_KITCHEN_TOGGLE);
        } else if (payload.click === 'double') {
            setOnOff(devices.IKEA_OUTLET_HALLWAY.addr, 'toggle');
        }
    }
}

module.exports = {
    action,
};
