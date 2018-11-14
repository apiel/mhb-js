var ZShepherd = require('zigbee-shepherd');
const zShepherdConverters = require('zigbee-shepherd-converters');

const settings = require('./settings.js');

const shepherd = new ZShepherd('/dev/ttyUSB0', {
    sp: { baudRate: 115200, rtscts: true },
    dbPath: './zigbee.db',
});

shepherd.on('ready', async () => {
    console.log('Server is ready.');
    // allow devices to join the network within 60 secs
    await shepherd.permitJoin(255);
    console.log('Waiting for device');
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
    ep.onAfIncomingMsg = (message) => {
        console.log('onAfIncomingMsg', addr, message.data);
    };
}

function getCoordinator() {
    const device = shepherd.list().find((d) => d.type === 'Coordinator');
    return shepherd.find(device.ieeeAddr, 1);
}

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
    console.log('ind', message);

    if (message.type === 'devIncoming') {
        const device = message.endpoints[0].device;
        const ieeeAddr = device.ieeeAddr;

        console.log('devIncoming, new device', ieeeAddr, device);
        attachDevice(device);
    }
});

function getDevice(addr) {
    const device = shepherd.list().find((d) => d.ieeeAddr === addr);
    if (!device) {
        throw(`Failed to find device with deviceID ${addr}`);
    }
    return device;
}

const getMappedModel = (addr) => {
    const device = getDevice(addr);
    const mappedModel = zShepherdConverters.findByZigbeeModel(device.modelId);
    if (!mappedModel) {
        console.log('no model found');
        return;
    }
    const epId = device.epList[0];

    return { device, mappedModel, epId };
}

const getState = async (addr) => {
    sendAction(addr, settings.actions.onOff, 'get');

    // /// use GET :D instead
    // const { device, mappedModel, epId } = getMappedModel(addr);
    // const state = {};
    // const ep = shepherd.find(device.ieeeAddr, epId);
    // console.log('mappedModel.toZigbee', mappedModel.toZigbee);
    // for(converter of mappedModel.fromZigbee) {
    //     console.log('>>>>> converter', converter);
    //     const attr = 'onOff'; // converter.attr
    //     const result = await ep.read(converter.cid, attr); // , (...props) => console.log('read from device', props)
    //     console.log('result read', result);
    // };
    // console.log('----- dumpppp', JSON.stringify(ep.dump().clusters.genOnOff, null, 4));
}

const sendAction = (addr, action, type = 'set') => {
    const { device, mappedModel, epId } = getMappedModel(addr);
    Object.keys(action).forEach((key) => {
        const converter = mappedModel.toZigbee.find((c) => c.key === key);
        if (!converter) {
            console.log(`No converter available for '${key}' (${action[key]})`);
            return;
        }

        const message = converter.convert(action[key], action, type);
        if (!message) {
            console.log('no message');
            return;
        }
        // console.log('message', message);
        sendMessage(device, epId, message);
    });
}

function sendMessage(device, epId, message) { // we could use promise instead
    const callback = (error, rsp) => {
        console.log('change state done', error, rsp);
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
    ...settings,
    sendAction,
    getState,
}
