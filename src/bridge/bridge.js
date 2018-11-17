const wemo = require('./wemo/wemo.js');
const hue = require('./hue/hue.js');
require('./upnp.js');

module.exports = (zigbee) => {
    wemo(zigbee);
    hue(zigbee);
}