const axios = require('axios');
const { URL } = require('url');
const { timeLimitIsOver } = require('../utils');

const urls = {
    LIGHT_WALL_ENTRANCE_TOGGLE: { url: 'http://192.168.0.220/toggle', limitCall: 2000 },
    LIGHT_WALL_ENTRANCE_ON: { url: 'http://192.168.0.220/on', limitCall: 2000 },
    LIGHT_WALL_ENTRANCE_OFF: { url: 'http://192.168.0.220/off', limitCall: 2000 },
    LIGHT_KITCHEN_TOGGLE: { url: 'http://192.168.0.94/toggle', limitCall: 2000 },
    LIGHT_KITCHEN_OFF: { url: 'http://192.168.0.94/off', limitCall: 2000 },
    LIGHT_KITCHEN_ON: { url: 'http://192.168.0.94/on', limitCall: 2000 },
    LIGHT_UNDER_TOGGLE: { url: 'http://192.168.0.178/toggle', limitCall: 2000 },
    LIGHT_UNDER_OFF: { url: 'http://192.168.0.178/off', limitCall: 2000 },
    LIGHT_UNDER_ON: { url: 'http://192.168.0.178/on', limitCall: 2000 },
    SWITCH_TOGGLE: { url: 'http://192.168.0.227/toggle', limitCall: 2000 },
    SWITCH_ON: { url: 'http://192.168.0.227/on', limitCall: 2000 },
    SWITCH_OFF: { url: 'http://192.168.0.227/off', limitCall: 2000 },
    LIGHT_LIVING_ROOM_TOGGLE: { url: 'http://192.168.0.192/toggle', limitCall: 2000 },
    LIGHT_LIVING_ROOM_OFF: { url: 'http://192.168.0.192/off', limitCall: 2000 },
    LIGHT_LIVING_ROOM_ON: { url: 'http://192.168.0.192/on', limitCall: 2000 },
    LIGHT_ROOM_TOGGLE: { url: 'http://192.168.0.101/toggle', limitCall: 2000 },
    LIGHT_ROOM_OFF: { url: 'http://192.168.0.101/off', limitCall: 2000 },
    LIGHT_ROOM_ON: { url: 'http://192.168.0.101/on', limitCall: 2000 },
};

const devices = {
    LIGHT_LIVING_ROOM: {
        actions: ['ON', 'OFF'],
        name: 'light living room',
    },
    LIGHT_KITCHEN: {
        actions: ['ON', 'OFF'],
        name: 'light kitchen',
    },
    // LIGHT_WALL_ENTRANCE: {
    //     actions: ['ON', 'OFF'],
    //     name: 'light entrance',
    // },
    LIGHT_UNDER: {
        actions: ['ON', 'OFF'],
        name: 'small light room??',
    },
    SWITCH: {
        actions: ['ON', 'OFF'],
        name: 'small light room',
    },
}

const uniqOriginUrls = [...new Set(Object.values(urls).map(({ url }) => new URL(url).origin))];
// call every minute url to keep awake connection
const pingUrls = uniqOriginUrls.map(({ url }) => `${url}/ping`);
setInterval(() => {
    pingUrls.forEach(url => axios({ url }).catch(() => {}));
}, 60000);

function call(options) {
    if (options.limitCall && !timeLimitIsOver(options.url, options.limitCall)) {
        return;
    }

    console.log('Call url:', options.url);

    axios(options)
        .then(() => { console.log('call url done', options.url); })
        .catch(console.error);
}

async function hasActiveDevices() {
    const skip = ['http://192.168.0.220']; // entrance
    const urls = uniqOriginUrls.filter(url => !skip.includes(url));
    for(url of urls) {
        try {
            const { data } = await axios({ url });
            if (data.includes('relay status: ON')) {
                return url;
            }
        } catch (e) {}
    }
}

module.exports = {
    hasActiveDevices,
    call,
    devices,
    ...urls,
}
