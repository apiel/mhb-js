const { init, eventType } = require('zigbee-service');

const advanceActions = require('./advanceActions');
const settings = require('./settings');
const { onAfIncomingMsg, onIndMessage } = require('./action');

const shepherdConfig = {
    DB_PATH: './zigbee.db',
    SERIAL_PATH: '/dev/ttyUSB0',
    ZIGBEE_PERMIT_JOIN: 255,
};
const { device, zigbee } = init(shepherdConfig);

zigbee.on(eventType.indMessage, (payload) => {
    console.log('onIndMessage', payload);
    // onIndMessage { data: { action: 'flip90', from_side: 4, to_side: 0 },
    // cmd: 'genMultistateInput' }
    onIndMessage(payload.addr, payload.data, payload.cmd);
});
zigbee.on(eventType.devIncoming, (payload) => {
    console.log('devIncoming, new device', payload);
});
zigbee.on(eventType.afIncomingMsg, (payload) => {
    onAfIncomingMsg(payload);
});

module.exports = {
    ...settings,
    ...device,
    ...advanceActions,
}
