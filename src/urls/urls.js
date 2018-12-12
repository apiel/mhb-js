const axios = require('axios');

const { timeLimitIsOver } = require('../utils');

function call(options) {
    // const now = new Date();
    // if (options.limitCall &&  now - options.limitCall < options.lastCall) {
    //     return;
    // }
    if (options.limitCall && !timeLimitIsOver(options.url, options.limitCall)) {
        return;
    }
    console.log('Call url:', options.url);
    axios(options)
        .then(() => { console.log('call url done', options.url); })
        .catch((err) => {
            // console.log('call url error', err)
        });
    // options.lastCall = now;
}

module.exports = {
    call,
    LIGHT_BATH_TOGGLE: { url: 'http://192.168.0.192/relay/1/toggle', limitCall: 2000 },
    LIGHT_BATH_TIMER: { url: 'http://192.168.0.192/relay/1/timer', limitCall: 1000 },
    LIGHT_BATH_ON: { url: 'http://192.168.0.192/relay/1/on', limitCall: 1000 },
    LIGHT_BATH_OFF: { url: 'http://192.168.0.192/relay/1/off', limitCall: 1000 },
    LIGHT_WALL_ENTRANCE_TOGGLE: { url: 'http://192.168.0.192/relay/2/toggle', limitCall: 2000 },
}
