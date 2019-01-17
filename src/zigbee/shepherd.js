const ZShepherd = require('zigbee-shepherd');

const shepherd = new ZShepherd('/dev/ttyUSB0', {
    sp: { baudRate: 115200, rtscts: true },
    dbPath: './zigbee.db',
});

shepherd.on('ZNP:CLOSE', () => {
    console.log('ZNP:CLOSE need to restart app!');
    process.exit();
});

module.exports = shepherd;