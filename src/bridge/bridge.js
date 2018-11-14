const wemo = require('./wemo/wemo.js');
require('./hue/hue.js');
// require('./upnp.js');

module.exports = (zigbee) => {
    wemo(zigbee);
}