const urls = require('../urls/urls');
const { call } = urls;
const zigbee = require('../zigbee/settings');
const advanceActions = require('../zigbee/advanceActions');
const { allLivingRoomOff } = require('../scene/all');

const devices = {
    LIVING_ROOM_LIGHT: { mac: '5C:CF:7F:98:56:CD' },
    ROOM_LIGHT: { mac: '5C:CF:7F:1C:2A:C9' },
};

function handleEspButton(req, res) {
    const { params, body, query }  = req;
    console.log('>> handleEspButton', { params, body, query });

    if (query.mac === devices.LIVING_ROOM_LIGHT.mac) {
        console.log('>> btn LIVING_ROOM_LIGHT');
        if (query.btn2 === '1') {
            call(urls.LIGHT_KITCHEN_TOGGLE);
        } else if (query.btn2 === '2') {
            call(urls.LIGHT_WALL_ENTRANCE_TOGGLE);
        } else if (query.btn1 === '2') {
            advanceActions.toggle(
                zigbee.devices.IKEA_E27_BULB_TRIANGLE.addr,
            );
        } else if (query.btn1 === '3') {
            advanceActions.toggle(
                zigbee.devices.IKEA_E27_BULB_SOFA.addr,
            );
        } else if (query.btn1 === '-1' || query.btn2 === '-1') {
            allLivingRoomOff();
        }
    }

    if (query.mac === devices.ROOM_LIGHT.mac) {
        console.log('>> btn ROOM_LIGHT');
        if (query.btn2 === '-1') {
            advanceActions.brightness(zigbee.devices.INNR_E14_BULB, 255);
        } else if (query.btn2 === '2') {
            advanceActions.brightness(zigbee.devices.INNR_E14_BULB, 10);
        } else if (query.btn2 === '3') {
            advanceActions.brightness(zigbee.devices.INNR_E14_BULB, 80);
        } else if (query.btn2 === '4') {
            call(urls.LIGHT_WALL_ENTRANCE_TOGGLE);
        }
    }

    res.json([{ success: true }]);
}

module.exports = {
    handleEspButton,
}