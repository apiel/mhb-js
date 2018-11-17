const express = require('express');
const bodyParser = require('body-parser');

const setupXML = require('./setup.xml.js');

const devicesByPort = {};
let currentPort = 8081;
let zigbee;

const app = express();
app.use(bodyParser.text({ inflate: true, limit: '100kb', type: 'text/xml' }));

app.get('/wemo/setup.xml', (req, res) => {
    const device = getDevice(req);
    res.header('Content-Type', 'text/xml');
    res.send(setupXML(device.name));
});

app.post('/upnp/control/basicevent1', async (req, res) => {
    const binaryState = (/<BinaryState>([0-1])<\/BinaryState>/g).exec(req.body);
    const device = getDevice(req);

    if (binaryState) {
        const [match, state] = binaryState;
        console.log('wemo new state', state);
        zigbee.sendAction(
            device.addr,
            zigbee.actions.onOff(state === '1' ? 'on' : 'off'),
        );
    }
    const state = await zigbee.getState(device.addr, zigbee.read.onOff);
    res.send(`
        <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
            <s:Body>
            <u:GetBinaryStateResponse xmlns:u="urn:Belkin:service:basicevent:1">
                <BinaryState>${state}</BinaryState>
            </u:GetBinaryStateResponse>
            </s:Body>
        </s:Envelope>
    `);
});

function getDevice(req) {
    const port = req.get('host').split(':').reverse()[0];
    const device = devicesByPort[port];
    return device;
}

module.exports = (_zigbee) => {
    zigbee = _zigbee;
    const { devices, types } = _zigbee;
    for (key in devices) {
        const device = devices[key];
        if (device.type === types.outlet.name) {
            const port = currentPort++;
            app.listen(port, () => console.log(`Bridge listen on port ${port} for ${device.name}`));
            devicesByPort[port] = devices[key];
        }
    }
}