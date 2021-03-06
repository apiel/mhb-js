const express = require('express');
const bodyParser = require('body-parser');

const setupXML = require('./setup.xml');
const {
    devices,
    setOnOff,
    setBrightness,
    getOnOff,
    getBrightness,
} = require('../../zigbee');

const app = express();
app.use(
    bodyParser.json({
        type: (req) => req.is('application/*'), // parse any types that start by application
    }),
);

app.get('/api/setup.xml', (req, res) => {
    res.header('Content-Type', 'text/xml');
    res.send(setupXML);
});

app.get('/api/config.json', getLightsEndpoint);
app.get('/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf', getLightsEndpoint);
app.get(
    '/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf/lights',
    getLightsEndpoint,
);

app.get(
    '/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf/lights/:uniqueid',
    async (req, res) => {
        const { uniqueid } = req.params;
        const devicesKeys = Object.values(devices);
        const index = devicesKeys.findIndex(
            (device) => device.addr === uniqueid,
        );
        const device = devicesKeys[index];
        const response = await getLight(device);
        // console.log('light state', uniqueid, response);
        res.json(response);
    },
);

app.post(
    '/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf/lights/:uniqueid/state',
    setLightState,
);
app.put(
    '/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf/lights/:uniqueid/state',
    setLightState,
);

app.use((req, res, next) => {
    console.log('No route for ', req.originalUrl, req.method);
    res.status(404).send('Sorry cant find that!');
});

app.listen(8080, () => console.log('Hue bridge listen on port 8080'));

function setLightState(req, res) {
    const { uniqueid } = req.params;
    const { on, bri } = req.body;

    setOnOff(uniqueid, on ? 'on' : 'off');
    if (bri) {
        // to fix
        console.log('uniqueid', uniqueid);
        setBrightness(uniqueid, bri);
    }

    console.log('setLightState', req.params, req.body, on, bri);
    const success = {};
    success[`/lights/${uniqueid}/state/on`] = on;
    res.json([{ success }]);
}

async function getLightsEndpoint(req, res) {
    const lights = {
        // '5102d46c-50d5-4bc7-a180-38623e4bbb08': light('5102d46c-50d5-4bc7-a180-38623e4bbb08'),
    };

    for (key in devices) {
        const device = devices[key];
        if (device.type === 'light') {
            lights[device.addr] = await getLight(device);
        }
    }
    res.json({ lights });
}

async function getLight({ addr, name }) {
    let onOff = 0;
    let bri = 255;
    try {
        onOff = await getOnOff(addr);
        bri = await getBrightness(addr);
    } catch (error) {
        console.error('Cant reach device', addr);
    }
    return {
        uniqueid: addr,
        state: {
            on: onOff === 'on',
            bri,
            hue: 15823,
            sat: 88,
            effect: 'none',
            ct: 313,
            alert: 'none',
            colormode: 'ct',
            reachable: true,
            xy: [0.4255, 0.3998],
        },
        type: 'Extended color light',
        name,
        modelid: 'LCT001',
        manufacturername: 'Philips',
        swversion: '65003148',
        pointsymbol: {
            '1': 'none',
            '2': 'none',
            '3': 'none',
            '4': 'none',
            '5': 'none',
            '6': 'none',
            '7': 'none',
            '8': 'none',
        },
    };
}
