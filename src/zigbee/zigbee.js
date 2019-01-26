const { ZigbeeAndDevice, eventType } = require('zigbee-service');

const settings = require('./settings');
const zigbeeService = require('./zigbeeService');
const { onAfIncomingMsg, onIndMessage } = require('./action');

zigbeeService.device.on('error', (payload) => {
    console.error('DEVICE ERROR', payload);
});

zigbeeService.zigbee.on(eventType.indMessage, (payload) => {
    onIndMessage(payload.addr, payload.data, payload.cmd);
});
zigbeeService.zigbee.on(eventType.devIncoming, (payload) => {
    console.log('devIncoming, new device', payload);
});
zigbeeService.zigbee.on(eventType.afIncomingMsg, (payload) => {
    onAfIncomingMsg(payload);
});

module.exports = {
    ...settings,
    ...zigbeeService,
    zigbeeService,
}
