const express = require('express');
const bodyParser = require('body-parser');

const setupXML = require('./setup.xml');
const { devices, setOnOff, getOnOff } = require('../../zigbee');

const devicesByPort = {};
const startPort = 8081;
let currentPort = startPort;

const app = express();
app.use(bodyParser.text({ inflate: true, limit: '100kb', type: 'text/xml' }));

app.get('/wemo/setup.xml', (req, res) => {
    const device = getDevice(req);
    res.header('Content-Type', 'text/xml');
    res.send(setupXML(device.name));
});

app.post('/upnp/control/basicevent1', basicevent);

app.use((req, res, next) => {
    console.log('No route for ', req.originalUrl, req.method);
    res.status(404).send('Sorry cant find that!');
});

function basicevent(req, res) {
    const device = getDevice(req);
    if (req.body.indexOf('SetBinaryState') !== -1) {
        setState(req, device);
    }
    genericResponse(res, device);
}

function setState(req, device) {
    // console.log('basicevent', req.method, req.body);
    const binaryState = /<BinaryState>([0-1])<\/BinaryState>/g.exec(req.body);

    if (binaryState) {
        const [match, state] = binaryState;
        console.log('wemo new state', state);
        setOnOff(device.addr, state === '1' ? 'on' : 'off');
    }
}

async function genericResponse(res, device) {
    const state = await getOnOff(device.addr);
    res.send(`
        <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
            <s:Body>
            <u:GetBinaryStateResponse xmlns:u="urn:Belkin:service:basicevent:1">
                <BinaryState>${state === 'on' ? 1 : 0}</BinaryState>
            </u:GetBinaryStateResponse>
            </s:Body>
        </s:Envelope>
    `);
}

function getDevice(req) {
    const port = req.get('host').split(':').reverse()[0];
    const device = devicesByPort[port];
    return device;
}

function start() {
    for (key in devices) {
        const device = devices[key];
        if (device.type === 'outlet') {
            const port = currentPort++;
            app.listen(port, () =>
                console.log(`Bridge listen on port ${port} for ${device.name}`),
            );
            devicesByPort[port] = devices[key];
        }
    }
}
start();

module.exports = {
    currentPort,
    startPort,
};
