const urls = require('../urls/urls');
const { call } = urls;
const zigbee = require('../zigbee/settings');
const advanceActions = require('../zigbee/advanceActions');
const { allLivingRoomOff, allFlatOff } = require('../scene/all');

const rows = [];

Object.keys(urls.devices).forEach(key => {
    const buttons = urls.devices[key].actions.map(action => {
        const href = `/ui/action?device=${key}_${action}&type=call`;
        return btn(href, action);
    });
    addRow(buttons, urls.devices[key].name);
});

Object.keys(zigbee.devices).forEach(key => {
    const device = zigbee.devices[key];
    if (device.type === zigbee.types.light.name) {
        const buttons = [
            btn(`/ui/action?device=${key}&type=zigbeeMenos`, '-'),
            btn(`/ui/action?device=${key}&type=zigbeeToggle`, 'toggle'),
            btn(`/ui/action?device=${key}&type=zigbeePlus`, '+'),
            btn(`/ui/action?device=${key}&type=zigbeeCountdown&value=60`, '&gt; 60'),
            btn(`/ui/action?device=${key}&type=zigbeeCountdown&value=30`, '&gt; 30'),
            btn(`/ui/action?device=${key}&type=zigbeeCountdown&value=10`, '&gt; 10'),
            btn(`/ui/action?device=${key}&type=zigbeeCountdown&value=1`, '&gt; 1'),
        ];
        addLongRow(buttons, device.name);
    }
});

addRow([
    btn('/ui/action?type=allOff', 'Flat off'),
    btn('/ui/action?type=livingRoomOff', 'Living room off'),
], '');

const ui = `
<meta name=viewport content='width=500'>
<div>${rows.join('<br />')}</div>
`;

function addRow(buttons, name) {
    rows.push(`<div style="margin: 5px;">${buttons.join(' ')} ${name}</div>`);
}

function addLongRow(buttons, name) {
    rows.push(`<div style="margin: 5px;">${name}<br/><br/>${buttons.join(' ')}</div>`);
}

function btn(href, action) {
    return `<a href="${href}" style="padding: 7px; border: solid 1px #1e92ae; margin: 5px; text-decoration: none; border-radius: 5px;">${action}</a>`;
}

function handleUi(req, res) {
    const { params, body, query }  = req;
    console.log('>> handleUi', { params, body, query });
    res.send(ui);
}

function handleUiAction(req, res) {
    const { params, body, query }  = req;
    console.log('>> handleUiAction', { params, body, query });

    if (query.type === 'call') {
        call(urls[query.device]);
    } else if (query.type === 'allOff') {
        allFlatOff();
    } else if (query.type === 'livingRoomOff') {
        allLivingRoomOff();
    } else if (query.type === 'zigbeeToggle') {
        advanceActions.toggle(
            zigbee.devices[query.device].addr,
        );
    } else if (query.type === 'zigbeeMenos') {
        advanceActions.brightness(
            zigbee.devices[query.device].addr,
            -30,
        );
    } else if (query.type === 'zigbeePlus') {
        advanceActions.brightness(
            zigbee.devices[query.device].addr,
            30,
        );
    } else if (query.type === 'zigbeeCountdown') {
        advanceActions.countdown(
            zigbee.devices[query.device].addr,
            parseInt(query.value, 10),
        );
    }

    res.send(`<script>window.history.back();</script>`);
}

module.exports = {
    handleUi,
    handleUiAction,
}