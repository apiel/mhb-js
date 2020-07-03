require('./zigbee2mqtt');
const devices = require('./devices');
const controller = require('./controller');

module.exports = {
    ...controller,
    devices,
};
