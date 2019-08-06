const axios = require('axios');
const { URL } = require('url');
const { timeLimitIsOver } = require('../utils');

const urls = {
    LIGHT_WALL_ENTRANCE_TOGGLE: { url: 'http://192.168.0.102/toggle', limitCall: 2000 },
    LIGHT_WALL_ENTRANCE_ON: { url: 'http://192.168.0.102/on', limitCall: 2000 },
    LIGHT_WALL_ENTRANCE_OFF: { url: 'http://192.168.0.102/off', limitCall: 2000 },
    LIGHT_KITCHEN_TOGGLE: { url: 'http://192.168.0.94/toggle', limitCall: 2000 },
    LIGHT_KITCHEN_OFF: { url: 'http://192.168.0.94/off', limitCall: 2000 },
    LIGHT_KITCHEN_ON: { url: 'http://192.168.0.94/on', limitCall: 2000 },
    LIGHT_UNDER_TOGGLE: { url: 'http://192.168.0.178/toggle', limitCall: 2000 },
    LIGHT_UNDER_OFF: { url: 'http://192.168.0.178/off', limitCall: 2000 },
    LIGHT_UNDER_ON: { url: 'http://192.168.0.178/on', limitCall: 2000 },
    SWITCH_TOGGLE: { url: 'http://192.168.0.227/toggle', limitCall: 2000 },
    SWITCH_ON: { url: 'http://192.168.0.227/on', limitCall: 2000 },
    SWITCH_OFF: { url: 'http://192.168.0.227/off', limitCall: 2000 },
};

// call every 5 seconds url to keep awake connection
/*
const uniqOriginUrls = [...new Set(Object.values(urls).map(({ url }) => (new URL(url)).origin))];
setInterval(() => {
    uniqOriginUrls.forEach(url => axios({ url }).catch(() => {}));
}, 60000);
*/

function call(options) {
    if (options.limitCall && !timeLimitIsOver(options.url, options.limitCall)) {
        return;
    }

    console.log('Call url:', options.url);

    axios(options)
        .then(() => { console.log('call url done', options.url); })
        .catch(console.error);
}

module.exports = {
    call,
    ...urls,
}
