const { ZigbeeAndDevice } = require('zigbee-service');


const zigbeeAndDevice = new ZigbeeAndDevice();

const shepherdConfig = {
    DB_PATH: './zigbee.db',
    SERIAL_PATH: '/dev/ttyUSB0',
    ZIGBEE_PERMIT_JOIN: 255,
};
zigbeeAndDevice.init(shepherdConfig);

module.exports = zigbeeAndDevice;
