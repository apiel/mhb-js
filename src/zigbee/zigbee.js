const { ZigbeeAndDevice, eventType } = require('zigbee-service');
const { get } = require('lodash');

const settings = require('./settings');
const zigbeeService = require('./zigbeeService');
const { onAfIncomingMsg, onIndMessage, onInd } = require('./action');

zigbeeService.device.on('error', (payload) => {
    console.error('DEVICE ERROR', payload);
    if (payload === 'ccznp exit') {
        process.exit();
    }
});

zigbeeService.zigbee.on(eventType.ind, (payload) => {
    const device = get(payload, 'endpoints[0].device');
    if (device) {
        onInd(device.ieeeAddr, payload.type);
    }
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
