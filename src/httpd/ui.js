const urls = require('../urls/urls');
const { call } = urls;
const zigbee = require('../zigbee/settings');
const advanceActions = require('../zigbee/advanceActions');
const { allLivingRoomOff, allFlatOff } = require('../scene/all');

let rows = Object.keys(urls.devices).map(key => {
    const actions = urls.devices[key].actions.map(action => {
        const href = `/ui/action?device=${key}_${action}&type=call`;
        return btn(href, action);
    }).join(' ');
    return `<div>${actions} ${urls.devices[key].name}</div>`;
});

Object.keys(zigbee.devices).forEach(key => {
    const device = zigbee.devices[key];
    if (device.type === zigbee.types.light.name) {
        const buttons = [
            btn(`/ui/action?device=${key}&type=zigbeeMenos`, '-'),
            btn(`/ui/action?device=${key}&type=zigbeeToggle`, 'toggle'),
            btn(`/ui/action?device=${key}&type=zigbeePlus`, '+'),
        ].join(' ');
        rows.push(`<div>${buttons} ${device.name}</div>`);
    }
});

rows.push(`<div>${btn('/ui/action?type=allOff', 'Flat off')} ${btn('/ui/action?type=livingRoomOff', 'Living room off')}</div>`);

const ui = `<div>${rows.join('<br />')}</div>`;

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
    }

    res.send(`<script>window.history.back();</script>`);
}

module.exports = {
    handleUi,
    handleUiAction,
}