const express = require('express');
const bodyParser = require('body-parser');

const setupXML = require('./setup.xml');
const zigbee = require('../../zigbee/settings');
const zigbeeService = require('../../zigbee/zigbee');

const app = express();
app.use(bodyParser.json({
    type: (req) => req.is('application/*'), // parse any types that start by application
}));

// Nov 19 20:36:52 raspberrypi npm[949]: no message
// Nov 19 20:36:52 raspberrypi npm[949]: setLightState { uniqueid: '0x00158d00020a3941' } { on: true } true
// Nov 19 20:36:52 raspberrypi npm[949]: uniqueiduniqueiduniqueid 0x00158d00020a3941
// Nov 19 20:36:52 raspberrypi npm[949]: change state done { cmdId: 4, statusCode: 0 } with error: null
// Nov 19 20:36:52 raspberrypi npm[949]: > ind devChange
// Nov 19 20:36:52 raspberrypi npm[949]: change state done { cmdId: 1, statusCode: 0 } with error: null
// Nov 19 20:36:54 raspberrypi npm[949]: no message
// Nov 19 20:36:54 raspberrypi npm[949]: setLightState { uniqueid: '0x00158d00020a3941' } { on: false } false
// Nov 19 20:36:54 raspberrypi npm[949]: change state done { cmdId: 0, statusCode: 0 } with error: null
// Nov 19 20:36:54 raspberrypi npm[949]: uniqueiduniqueiduniqueid 0x00158d00020a3941
// Nov 19 20:36:54 raspberrypi npm[949]: change state done { cmdId: 4, statusCode: 0 } with error: null

app.get('/api/setup.xml', (req, res) => {
    res.header('Content-Type', 'text/xml');
    res.send(setupXML);
});

app.get('/api/config.json', getLightsEndpoint);
app.get('/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf', getLightsEndpoint);
app.get('/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf/lights', getLightsEndpoint);

app.get('/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf/lights/:uniqueid', async (req, res) => {
    const { uniqueid } = req.params;
    const devices = Object.values(zigbee.devices);
    const index = devices.findIndex(device => device.addr === uniqueid);
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

app.listen(8080, () => console.log('Hue bridge listen on port 8080'));

function setLightState(req, res) {
    const { uniqueid } = req.params;
    const { on, bri } = req.body;

    zigbeeService.device.sendAction({
        addr: uniqueid,
        action: zigbee.actions.onOff(on ? 'on' : 'off'),
    });
    if (bri) {
        // to fix
        console.log('uniqueid', uniqueid);
        zigbeeService.device.sendAction({
            addr: uniqueid,
            action: zigbee.actions.brightness(bri),
        });
    }

    console.log('setLightState', req.params, req.body, on, bri);
    const success = {};
    success[`/lights/${uniqueid}/state/on`] = on;
    res.json([{ success }]);
}

async function getLightsEndpoint(req, res) {
    const lights = {
        // '5102d46c-50d5-4bc7-a180-38623e4bbb08': light('5102d46c-50d5-4bc7-a180-38623e4bbb08'),
    }

    const { devices, types } = zigbee;
    for (key in devices) {
        const device = devices[key];
        if (device.type === types.light.name) {
            lights[device.addr] = await getLight(device);
        }
    }
    res.json({ lights });
}

async function getLight({ addr, name }) {
    let onOff = 0;
    let bri = 255;
    try {
        let props = zigbee.read.onOff;
        onOff = await zigbeeService.device.getState(addr, props.cId, props.attrId);

        props = zigbee.read.brightness;
        bri = await zigbeeService.device.getState(addr, props.cId, props.attrId);
    } catch (error) {
        console.error('Cant reach device', addr);
    }
    return {
        uniqueid: addr,
        state: {
            on: onOff === 1,
            bri,
            hue: 15823,
            sat: 88,
            effect: 'none',
            ct: 313,
            alert: 'none',
            'colormode': 'ct',
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
}
