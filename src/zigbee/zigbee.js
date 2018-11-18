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

// Succeed to configure TRADFRI wireless dimmer 0x000b57fffe150865
// onAfIncomingMsg 0x000b57fffe150865 <Buffer 11 01 07>

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
        const converter = mappedModel.toZigbee.find((c) => c.key === key);
        if (!converter) {
            console.log(`No converter available for '${key}' (${action[key]})`);
            return;
        }

        // console.log('convertetrtrtetertrte', action[key], action, type);
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
    console.log('sendMessage', JSON.stringify(message));
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

const lastToggle = {};

module.exports = {
    ...settings,
    sendAction,
    sendActionMany,
    getState,
    advanceActions: {
        brightness: async (addr, value) => {
            const bri = await getState(addr, settings.read.brightness);
            const brightness = Math.min(Math.max(bri + value, 0), 255);
            sendAction(addr, settings.actions.brightness(brightness));
        },
        toggle: async (addr) => {
            // console.log('toggle', addr);
            const now  = new Date();
            if ( !lastToggle[addr] || now - lastToggle[addr] > 3000 ) { // toggle if last change is more than 2 sec
                lastToggle[addr] = now;
                const state = await getState(addr, settings.read.onOff);
                const onOff = state === 1 ? 'off' : 'on';
                console.log('toggle new state', addr, state, onOff);
                sendAction(addr, settings.actions.onOff(onOff));
            }
        },
    }
}
