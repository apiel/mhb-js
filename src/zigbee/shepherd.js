const ZShepherd = require('zigbee-shepherd');

const shepherd = new ZShepherd('/dev/ttyUSB0', {
    sp: { baudRate: 115200, rtscts: true },
    dbPath: './zigbee.db',
});

module.exports = shepherd;