const { emit, emitter } = require('./emitter');
const { devices } = require('./devices');

function setOnOff(addr, state, brightness = null) {
    // state: on or off or toggle
    const msg = {
        state,
        ...(brightness && { brightness }),
    };
    console.log('setOnOff', addr, msg);
    emit(`${addr}/set`, msg);
}

// because brightness doesnt seem to work with setOnOff
async function setOnOffBri(addr, brightness) {
    const state = await getOnOff(addr);
    console.log('state', state);
    if (state === 'ON') {
        setOnOff(addr, 'off');
    } else {
        setBrightness(addr, 10);
    }
}

async function getOnOff(addr) {
    emit(`${addr}/get`, {
        state: '',
    });
    return new Promise((resolve, reject) => {
        setTimeout(reject, 10000);
        emitter.on('pub', ({ topic, payload }) => {
            if (topic === addr && payload.state) {
                resolve(payload.state);
            }
        });
    });
}

function setBrightness(addr, brightness) {
    // bri: 0 - 255
    console.log('setBrightness', addr, brightness);
    emit(`${addr}/set`, {
        brightness,
    });
}

function getBrightness(addr) {
    emit(`${addr}/get`, {
        brightness: '',
    });
    return new Promise((resolve, reject) => {
        setTimeout(reject, 10000);
        emitter.on('pub', ({ topic, payload }) => {
            if (topic === addr && payload.brightness) {
                resolve(payload.brightness);
            }
        });
    });
}

async function hasActiveDevices() {
    const addrs = Object.values(devices)
        .filter(({ type }) => type === 'light')
        .map(({ addr }) => addr);

    for (addr of addrs) {
        try {
            const state = await getOnOff(addr);
            if (state === 'on') {
                return addr;
            }
        } catch (e) {}
    }
}

async function toggleBri(addr) {
    const bri = await getBrightness(addr);
    console.log('Long press', { bri });
    setBrightness(addr, bri < 200 ? 255 : 10);
}

async function rotate(addr, angle) {
    const bri = await getBrightness(addr);
    const newBri = bri + angle;
    console.log('Rotate', { bri, newBri, angle });
    setBrightness(addr, newBri);
}

module.exports = {
    setOnOff,
    setOnOffBri,
    getOnOff,
    toggleBri,
    rotate,
    setBrightness,
    getBrightness,
    hasActiveDevices,
};
