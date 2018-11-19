const zclPacket = require('zcl-packet');
const zShepherdConverters = require('zigbee-shepherd-converters');

const settings = require('./settings');
const action = require('./action');
const shepherd = require('./shepherd');
const {
    sendAction,
    sendActionMany,
    getState,
    getCoordinator,
} = require('./utils/zigbee');
const advanceActions = require('./utils/advanceActions')

shepherd.on('ready', async () => {
    console.log('Server is ready.');
    // allow devices to join the network within 60 secs
    await shepherd.permitJoin(255);
    console.log('Waiting for device');
});

shepherd.start(async (err) => {
    if (err)
        console.log(err);

    console.log('start zigbee');
    // now attachDevices
    const devices = shepherd.list().filter((device) => device.type !== 'Coordinator');
    console.log('zigbee devices', devices);

    devices.forEach((device) => {
        attachDevice(device);
    });
});

shepherd.on('error', (err) => {
    console.error('error:', err);
});

shepherd.on('ind', (message) => {
    // console.log('ind', message);
    console.log('> ind', message.type);

    if (message.type === 'devIncoming') {
        const device = message.endpoints[0].device;
        const ieeeAddr = device.ieeeAddr;

        // console.log('devIncoming, new device', ieeeAddr, device);
        console.log('devIncoming, new device', ieeeAddr);
        attachDevice(device);
    }
});

function attachDevice(device) {
    const mappedModel = zShepherdConverters.findByZigbeeModel(device.modelId);
    if (mappedModel) {
        if (mappedModel.configure) {
            mappedModel.configure(device.ieeeAddr, shepherd, getCoordinator(), (ok, msg) => {
                const result = ok ? 'Succeed' : 'Failed';
                console.log(`${result} to configure ${mappedModel.description} ${device.ieeeAddr}`);
            });
        }
        if (mappedModel.onAfIncomingMsg) {
            // device.epList.forEach((epId) => registerOnAfIncomingMsg(device.ieeeAddr, epId));
            mappedModel.onAfIncomingMsg.forEach((epId) => registerOnAfIncomingMsg(device.ieeeAddr, epId));
        }
    }
}

async function registerOnAfIncomingMsg(addr, epId) {
    const ep = shepherd.find(addr, epId);
    ep.onAfIncomingMsg = async (message) => {
        // console.log('onAfIncomingMsg', addr, message.data);
        // console.log('onAfIncomingMsg', addr, message.clusterid);
        const zclData = await zclPacket.parse(message.data, message.clusterid, (error, zclData) => {
            action(addr, zclData);
        });
    };
}

module.exports = {
    ...settings,
    sendAction,
    sendActionMany,
    getState,
    advanceActions,
}
