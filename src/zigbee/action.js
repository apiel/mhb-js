const devices = require('./devices');
const { setOnOff, setBrightness, getBrightness } = require('./controller');
// const urls = require('../urls/urls');
// const { call } = urls;
// const { timer } = require('../utils');
// const { allFlatOff, allLivingRoomOff } = require('../scene/all');

async function hold(addr) {
    const bri = await getBrightness(addr);
    console.log('Long press', { bri });
    setBrightness(addr, bri < 200 ? 255 : 10);
}

function action(addr, payload) {
    console.log('action device', addr, payload);
    if (addr === devices.IKEA_ONOFF.addr || addr === devices.IKEA_ONOFF2.addr) {
        console.log('ikea btn', addr);
        if (payload.click === 'brightness_up') {
            hold(devices.IKEA_E27_BULB_TRIANGLE.addr);
        } else if (payload.click === 'brightness_down') {
            hold(devices.IKEA_E27_BULB_SOFA.addr);
        } else if (payload.click === 'on') {
            setOnOff(devices.IKEA_E27_BULB_TRIANGLE.addr, 'toggle');
        } else if (payload.click === 'off') {
            setOnOff(devices.IKEA_E27_BULB_SOFA.addr, 'toggle');
        }
    }
}

// let cubeSide = null;
// async function onIndMessage(ieeeAddr, payload, cmdId) {
//     console.log('# onIndMessage', ieeeAddr, payload, cmdId);
//     if (ieeeAddr === devices.XIAOMI_BTN_ENTRANCE.addr) {
//         if (cmdId === 'genMultistateInput') {
//             // console.log('XIAOMI_BTN_ENTRANCE payload', payload);
//             const { click, action } = payload;
//             if (action === 'hold') {
//                 await hold(devices.INNR_E14_BULB.addr);
//             } else if (click === 'single') {
//                 // call(urls.LIGHT_ROOM_TOGGLE);
//                 toggle(devices.INNR_E14_BULB.addr);
//             } else if (click === 'double') {
//                 // call(urls.LIGHT_WALL_ENTRANCE_TOGGLE);
//                 toggle(devices.IKEA_OUTLET_HALLWAY.addr);
//             }
//         }
//     } else if (ieeeAddr === devices.XIAOMI_BTN_ROOM.addr) { // hold not working
//         console.log('XIAOMI_BTN_ROOM payload', payload, cmdId);
//         if (cmdId === 'genOnOff') {
//             const { click, action } = payload;
//             if (click === 'single') {
//                 // call(urls.LIGHT_WALL_ENTRANCE_TOGGLE);
//                 toggle(devices.IKEA_OUTLET_HALLWAY.addr);
//             } else if (click === 'double') {
//                 allFlatOff();
//             }
//         }
//     } else if (ieeeAddr === devices.XIAOMI_CUBE.addr) {
//         const { action, side, from_side, to_side, angle } = payload;
//         if (action === 'flip90') {
//             toggle(devices.INNR_E14_BULB.addr);
//             // cubeSide = to_side;
//             // if ((from_side === 0 && to_side === 4) || (from_side === 1 && to_side === 3)) {
//             //     toggle(
//             //         devices.IKEA_OUTLET_TABLE.addr,
//             //     );
//             // } else if ((from_side === 0 && to_side === 1) || (from_side === 4 && to_side === 3)) {
//             //     toggle(
//             //         devices.INNR_E14_BULB.addr,
//             //     );
//             // // } else if ((from_side === 0 && to_side === 2) || (from_side === 3 && to_side === 2)) {
//             // } else if (to_side === 2) {
//             //     toggle(
//             //         devices.IKEA_E27_BULB_SOFA.addr,
//             //     );
//             // // } else if (from_side === 0 && to_side === 5) {
//             // } else if (to_side === 5) {
//             //     call(urls.LIGHT_KITCHEN_ON);
//             // }
//         } else if (action === 'flip180') {
//             // call(urls.LIGHT_WALL_ENTRANCE_TOGGLE);
//             toggle(devices.IKEA_OUTLET_HALLWAY.addr);
//         } else if (action === 'tap') {
//             // call(urls.LIGHT_WALL_ENTRANCE_TOGGLE);
//         } else if (action === 'shake') {
//             // allLivingRoomOff();
//             // call(urls.LIGHT_WALL_ENTRANCE_OFF);
//             zigbeeService.device.sendAction({ addr: devices.IKEA_OUTLET_HALLWAY.addr, action: actions.onOff('off') });
//             zigbeeService.device.sendAction({ addr: devices.INNR_E14_BULB.addr, action: actions.onOff('off') });
//         } else if (action === 'slide') {
//             // cubeSide = side;
//         } else if (action === 'rotate_right' || action === 'rotate_left') {
//             const direction = (action === 'rotate_right' ? 1 : -1);
//             console.log('rotate', cubeSide, direction);
//             brightness(
//                 devices.INNR_E14_BULB.addr,
//                 direction * 20,
//             );
//             // if (cubeSide === 1) {
//             //     brightness(
//             //         devices.INNR_E14_BULB.addr,
//             //         direction * 20,
//             //     );
//             // } else if (cubeSide === 2) {
//             //     brightness(
//             //         devices.IKEA_E27_BULB_SOFA.addr,
//             //         direction * 20,
//             //     );
//             // }
//         }
//     }
// }

module.exports = {
    action,
};
