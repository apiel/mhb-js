const express = require('express');
const bodyParser = require('body-parser');

const setupXML = require('./setup.xml');
const milight = require('../../milight/settings');
const { sendAction /*, getState*/ } = require('../../milight/milight');

const app = express();
app.use(bodyParser.json({
    type: (req) => req.is('application/*'), // parse any types that start by application
}));

app.get('/api/setup.xml', (req, res) => {
    res.header('Content-Type', 'text/xml');
    res.send(setupXML);
});

app.get('/api/config.json', getLightsEndpoint);
app.get('/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf', getLightsEndpoint);
app.get('/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf/lights', getLightsEndpoint);

app.get('/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf/lights/:uniqueid', async (req, res) => {
    const { uniqueid } = req.params;
    const devices = Object.values(milight.devices);
    // console.log('blahhhh', getUniqueId(devices[0]), uniqueid, req);
    const index = devices.findIndex(device => getUniqueId(device) === uniqueid);
    const device = devices[index];
    const response = await getLight(device);
    // console.log('light state', uniqueid, response);
    res.json(response);
});

app.post('/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf/lights/:uniqueid/state', setLightState);
app.put('/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf/lights/:uniqueid/state', setLightState);

app.use((req, res, next) => {
    console.log('No route for ', req.originalUrl, req.method);
    res.status(404).send('Sorry cant find that!');
});

app.listen(8079, () => console.log('Milight bridge listen on port 8079'));

function setLightState(req, res) {
    const { uniqueid } = req.params;
    const { on, bri } = req.body;

    // sendAction(
    //     uniqueid,
    //     zigbee.actions.onOff(on ? 'on' : 'off'),
    // );
    // if (bri) {
    //     sendAction(
    //         uniqueid,
    //         zigbee.actions.brightness(bri),
    //     );
    // }

    console.log('setLightState', req.params, req.body, on, bri);
    const success = {};
    success[`/lights/${uniqueid}/state/on`] = on;
    res.json([{ success }]);
}

async function getLightsEndpoint(req, res) {
    const lights = {};

    const { devices } = milight;
    for (key in devices) {
        const device = devices[key];
        const uniqueid = getUniqueId(device);
        lights[uniqueid] = await getLight(device);
    }
    res.json({ lights });
}

function getUniqueId({ mac, zone }) {
    return `${mac}-${zone || 'bridge'}`;
}

async function getLight({ mac, zone, name }) {
    let onOff = 0;
    let bri = 255;
    const uniqueid = getUniqueId({ mac, zone });
    // try {
    //     onOff = await getState(addr, zigbee.read.onOff);
    //     bri = await getState(addr, zigbee.read.brightness);
    // } catch (error) {
    //     console.error('Cant reach device', addr);
    // }
    const light = {
        uniqueid,
        state: {
            on: onOff === 1,
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
        }
    };
    // console.log('getMiLight', uniqueid, name, light.uniqueid, light);
    return light;
}
