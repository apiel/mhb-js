const urls = require('../urls/urls');
const { call } = urls;
const zigbee = require('../zigbee/settings');
const advanceActions = require('../zigbee/advanceActions');
const { allOff } = require('../zigbee/action');

const devices = {
    LIVING_ROOM_LIGHT: { mac: 'cd-56-98-7f-cf-5c' },
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
            allOff();
        }
    }

    res.json([{ success: true }]);
}

module.exports = {
    handleEspButton,
}