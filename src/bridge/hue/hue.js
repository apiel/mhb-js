const express = require('express');
const bodyParser = require('body-parser');

const setupXML = require('./setup.xml.js');

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

app.get('/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf/lights/:uniqueid', (req, res) => {
    const { uniqueid } = req.params;
    res.json(light(uniqueid));
});

app.post('/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf/lights/:uniqueid/state', setLightState);
app.put('/api/S6QJ3NqpQzsR6ZFzOBgxSRJPW58C061um8oP8uhf/lights/:uniqueid/state', setLightState);

app.use((req, res, next) => {
    console.log('No route for ', req.originalUrl, req.method);
    res.status(404).send('Sorry cant find that!');
});

app.listen(8080, () => console.log('Bridge listen on port 8080'));

function setLightState(req, res) {
    const { uniqueid } = req.params;
    const { on } = req.body;

    console.log('setLightState', req.params, req.body, on);
    const success = {};
    success[`/lights/${uniqueid}/state/on`] = on;
    res.json([{ success }]);
}

function getLightsEndpoint(req, res) {
    const lights = {
        '5102d46c-50d5-4bc7-a180-38623e4bbb08': light('5102d46c-50d5-4bc7-a180-38623e4bbb08'),
    }
    res.json({ lights });
}

function light(uniqueid) {
    return {
        uniqueid,
        state: {
            on: false,
            bri: 254,
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
        name: 'ceiling lights',
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
