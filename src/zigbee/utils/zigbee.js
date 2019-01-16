const zShepherdConverters = require('zigbee-shepherd-converters');

const shepherd = require('../shepherd');

function getCoordinator() {
    const device = shepherd.list().find((d) => d.type === 'Coordinator');
    return shepherd.find(device.ieeeAddr, 1);
}

function getDevice(addr) {
    const device = shepherd.list().find((d) => d.ieeeAddr === addr);
    if (!device) {
        throw(`Failed to find device with deviceID ${addr}`);
    }
    return device;
}

const getEndPoint = (addr) => {
    const device = getDevice(addr);
    const epId = device.epList[0];
    return {device, epId };
}

const getMappedModel = (addr) => {
    const { device, epId } = getEndPoint(addr);
    const mappedModel = zShepherdConverters.findByZigbeeModel(device.modelId);
    if (!mappedModel) {
        console.log('no model found');
        return;
    }

    return { device, mappedModel, epId };
}

const getState = (addr, { cId, attrId }) => {
    const { device, epId } = getEndPoint(addr);
    const ep = shepherd.find(addr, epId);
    return ep.read(cId, attrId);
}

const sendActionMany = (devices, action) => {
    Object.values(devices).forEach(device => {
        sendAction(device.addr, action);
    });
}

const sendAction = (addr, action, type = 'set') => {
    const { device, mappedModel, epId } = getMappedModel(addr);
    Object.keys(action).forEach((key) => {
        const converter = mappedModel.toZigbee.find((c) => c.key.includes(key));
        if (!converter) {
            console.log(`No converter available for '${key}' (${action[key]})`, mappedModel.toZigbee);
            return;
        }

        // console.log('convertetrtrtetertrte', action[key], action, type);
        const message = converter.convert(key, action[key], action, type); // we might have to handle null as message
        if (!message) {
            console.log('no message');
            return;
        }
        // console.log('message', message);
        sendMessage(device, epId, message);
    });
}

function sendMessage(device, epId, message) { // we could use promise instead
    // console.log('sendMessage', JSON.stringify(message));
    const callback = (error, rsp) => {
        console.log('change state done', rsp, 'with error:', error);
    };
    const ep = shepherd.find(device.ieeeAddr, epId);
    if (message.cmdType === 'functional') {
        ep.functional(message.cid, message.cmd, message.zclData, callback);
    } else if (message.cmdType === 'foundation') {
        ep.foundation(message.cid, message.cmd, [message.zclData], callback);
    } else {
        console.log(`Unknown zigbee publish type ${message.type}`);
    }
}

module.exports = {
    sendAction,
    sendActionMany,
    getState,
    getCoordinator,
}
