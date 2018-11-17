const zigbee = require('./zigbee/zigbee.js');
const rf = require('./rf/rf.js');
const bridge = require('./bridge/bridge.js');

rf(zigbee);
bridge(zigbee);

// 0x000b57fffe277918 dimmer
// 0x00158d00020a3941 e14 bulb
