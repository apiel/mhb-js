const urls = require('../urls/urls');
const { call } = urls;
const zigbee = require('../zigbee/settings');
const advanceActions = require('../zigbee/advanceActions');
const zigbeeService = require('../zigbee/zigbeeService');
const { allLivingRoomOff, allFlatOff } = require('../scene/all');

const rows = [];
const zigbeeLightRows = [];

Object.keys(urls.devices).forEach(key => {
    const buttons = urls.devices[key].actions.map(action => {
        const href = `/ui/action?device=${key}_${action}&type=call`;
        return btn(href, action); // action === 'ON' ? '💡' : action
    });
    addRow(buttons, urls.devices[key].name);
});

Object.keys(zigbee.devices).forEach(key => {
    const device = zigbee.devices[key];
    if (device.type === zigbee.types.light.name) {
        const buttons = [
            // btn(`/ui/action?device=${key}&type=zigbeeToggle`, '💡'),
            // btn(`/ui/action?device=${key}&type=zigbeeCountdown&value=60`, '&gt; 60'),
            // btn(`/ui/action?device=${key}&type=zigbeeCountdown&value=30`, '&gt; 30'),
            // btn(`/ui/action?device=${key}&type=zigbeeCountdown&value=10`, '&gt; 10'),
            // btn(`/ui/action?device=${key}&type=zigbeeCountdown&value=1`, '&gt; 1'),
        ];
        addZigbeeLightRow(buttons, device.name, key);
    }
});

addRow([
    btn('/ui/action?type=allOff', 'Flat off'),
    btn('/ui/action?type=livingRoomOff', 'Living room off'),
], '');

const ui = `
<html>
<head>
    <meta name=viewport content='width=500'>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
        }
        .btn {
            padding: 7px;
            border: solid 1px #1e92ae;
            margin: 5px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 12px;
        }
        .row {
            margin: 5px;
            font-size: 10px;
        }
        .slider {
            -webkit-appearance: none;
            background: #d3d3d3;
        }
        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 15px;
            height: 15px;
            background: #4ea4ca;
            cursor: pointer;
        }
        .bulb {
            font-size: 40px;
            margin: 10px;
            text-decoration: none;
        }
        .zigbee-bulb {
            border: solid 1px #d9dada;
            border-radius: 5px;
            width: 150px;
            float: left;
            margin: 5px;
            text-align: center;
            font-size: 10px;
            padding: 10px 0;
        }
    </style>
</head>
<body>
    <div>::ZigbeeLightRows::</div>
    <div>${rows.join('<br />')}</div>
</body>
</html>
`;

function addRow(buttons, name) {
    rows.push(`<div class="row">${buttons.join(' ')} ${name}</div>`);
}

function addZigbeeLightRow(buttons, name, key) {
    zigbeeLightRows.push({
        key,
        // <div class="row">${name}<br/><br/>${buttons.join(' ')}</div>
        html: `
            <div class="zigbee-bulb">
                <div>${name}</div>
                <div>
                    <a href="/ui/action?device=${key}&type=zigbeeToggle" class="bulb">💡</a>
                </div>
                <form method="get" action="/ui/action">
                    <input type="hidden" name="device" value="${key}" />
                    <input type="hidden" name="type" value="zigbeeBri" />
                    <input type="range" min="1" max="255" value="125" class="slider" name="bri" onchange="this.form.submit()" />
                </form>
            </div>
        `,
    });
}

function btn(href, action) {
    return `<a href="${href}" class="btn">${action}</a>`;
}

async function handleUi(req, res) {
    const { params, body, query } = req;
    console.log('>> handleUi', { params, body, query });
    const items = await Promise.all(zigbeeLightRows.map(async ({html, key}) => {
        const bri = await PromiseTimeout(advanceActions.getBrightness(zigbee.devices[key].addr), 125);
        return html.replace('125', bri);
    }));
    const content = items.join(''); // <br />
    res.send(
        ui.replace('::ZigbeeLightRows::', `${content}<div style="clear:both"></div>`)
    );
}

async function PromiseTimeout(fn, fallbackValue, timeout = 500) {
    let value = fallbackValue;
    try {
        value = await Promise.race([
            new Promise(resolve => setTimeout(() => resolve(fallbackValue), timeout)),
            fn,
        ]);
    } catch (error) {}
    return value;
}

function handleUiAction(req, res) {
    const { params, body, query } = req;
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
    } else if (query.type === 'zigbeeBri') {
        zigbeeService.device.sendAction({
            addr: zigbee.devices[query.device].addr,
            action: zigbee.actions.brightness(parseInt(query.bri, 10)),
        });
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