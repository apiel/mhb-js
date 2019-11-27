const urls = require('../urls/urls');
const { call } = urls;
const zigbee = require('../zigbee/settings');
const advanceActions = require('../zigbee/advanceActions');
const zigbeeService = require('../zigbee/zigbeeService');
const { allLivingRoomOff, allFlatOff } = require('../scene/all');

const rows = [];
const sonoffRows = [];
const zigbeeLightRows = [];

Object.keys(urls.devices).forEach(key => {
    const buttons = urls.devices[key].actions.map(action => {
        const href = `/ui/action?device=${key}_${action}&type=call`;
        return btn(href, action);
    });
    addSonoffRow(buttons, urls.devices[key].name);
});

Object.keys(zigbee.devices).forEach(key => {
    const device = zigbee.devices[key];
    if (device.type === zigbee.types.light.name) {
        addZigbeeLightRow(device.name, key);
    }
});

addRow([
    btn('/ui/action?type=allOff', 'Flat off'),
    btn('/ui/action?type=livingRoomOff', 'Living room off'),
], '');

const ui = `
<html>
<head>
    <meta name=viewport content='width=340'>
    <style>
        html, body {
            max-width: 100%;
            overflow-x: hidden;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
        }
        a {
            text-decoration: none;
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
        .bulb img {
            width: 60px;
        }
        .card {
            border: solid 1px #d9dada;
            border-radius: 5px;
            width: 150px;
            float: left;
            margin: 5px;
            text-align: center;
            font-size: 10px;
            padding: 10px 0;
        }

        .btns {
            margin: 15px 0 5px;
        }

        .dropdown {
            position: absolute;
            margin-left: 135px;
            margin-top: -8px;
            font-size: 16;
            font-weight: bold;
        }

        .dropdown-content {
            display: none;
            position: absolute;
            background-color: #f9f9f9;
            width: 150px;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
            z-index: 1;
            margin-left: -135px;
            font-size: 12;
            font-weight: none;
        }

        .dropdown-content div {
            margin: 10px;
        }

        .dropdown:hover .dropdown-content {
            display: block;
        }
    </style>
</head>
<body>
    <div>::ZigbeeLightRows::</div>
    <div>${sonoffRows.join('')}</div>
    <div style="clear:both; margin-bottom: 10px"></div>
    <div>${rows.join('<br />')}</div>
</body>
</html>
`;

function addRow(buttons, name) {
    rows.push(`<div class="row">${buttons.join(' ')} ${name}</div>`);
}

function addSonoffRow(buttons, name) {
    sonoffRows.push(`
    <div class="card">
        <div>
            <span>${name}</span>
        </div>
        <div class="btns">
            ${buttons.join(' ')}
        </div>
    </div>
`);
}

function addZigbeeLightRow(name, key) {
    zigbeeLightRows.push({
        key,
        html: `
            <div class="card">

                <div class="dropdown">
                    <span>+</span>
                    <div class="dropdown-content">
                        <div><b>Decrease brightness</b></div>
                        <div><a href="/ui/action?device=${key}&type=zigbeeCountdown&value=1">Every 1 sec</a></div>
                        <div><a href="/ui/action?device=${key}&type=zigbeeCountdown&value=10">Every 10 sec</a></div>
                        <div><a href="/ui/action?device=${key}&type=zigbeeCountdown&value=30">Every 30 sec</a></div>
                        <div><a href="/ui/action?device=${key}&type=zigbeeCountdown&value=60">Every 1 min</a></div>
                    </div>
                </div>
                <div>
                    <span>${name}</span>
                </div>
                <div>
                    <a href="/ui/action?device=${key}&type=zigbeeToggle" class="bulb">
                        <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIzLjAuNiwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iMCAwIDQzMi40IDQzMi40IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MzIuNCA0MzIuNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtkaXNwbGF5Om5vbmU7ZmlsbDojMjMxRjIwO30KCS5zdDF7ZmlsbDojNTRDNUZGO30KCS5zdDJ7ZmlsbDojRkZDNjAwO30KPC9zdHlsZT4KPGNpcmNsZSBjbGFzcz0ic3QwIiBjeD0iLTEzNTMuNiIgY3k9IjIwNC4xIiByPSIxODkiLz4KPHBhdGggY2xhc3M9InN0MSIgZD0iTTIwMC40LDg2LjZWMzQ3aC0xOC4xdi0yNy43YzAtMjAuMi05LjgtMzkuNi0yNi4zLTUxLjljLTEyLjQtOS4zLTIyLjgtMjEuNC0yOS44LTM1LjIKCWMtNy40LTE0LjQtMTEuMS0zMC0xMS00Ni40YzAuMS0yNi4yLDEwLjMtNTEsMjguOC02OS45QzE1OS40LDEwMC4yLDE3OS4xLDkwLDIwMC40LDg2LjYgTTIxMi40LDczLjRjLTYwLjEsMi0xMDksNTEuNy0xMDkuMiwxMTIuNAoJYy0wLjIsMzcuNCwxNy44LDcwLjUsNDUuNiw5MS4yYzEzLjQsMTAsMjEuNCwyNS41LDIxLjQsNDIuMlYzNTloNDIuMVY3My40TDIxMi40LDczLjR6Ii8+CjxnPgoJPHJlY3QgeD0iMjIwIiB5PSIzNjcuNiIgY2xhc3M9InN0MiIgd2lkdGg9IjQyLjIiIGhlaWdodD0iMTEuNSIvPgo8L2c+CjxnPgoJPHJlY3QgeD0iMTcwLjIiIHk9IjM2Ny42IiBjbGFzcz0ic3QxIiB3aWR0aD0iNDIuMiIgaGVpZ2h0PSIxMS41Ii8+CjwvZz4KPHBhdGggY2xhc3M9InN0MiIgZD0iTTIyMCw3My40VjM1OWg0Mi4xdi0zOS43YzAtMTYuNCw3LjYtMzIuMSwyMC45LTQxLjhjMjgtMjAuNiw0Ni4yLTUzLjcsNDYuMi05MS4yCglDMzI5LjIsMTI1LjIsMjgwLjYsNzUuNCwyMjAsNzMuNHogTTIzMiwxNTEuMWMxMy45LDYuMSwyMy4xLDE5LjksMjMuMSwzNS41YzAsMTUuNS05LjMsMjkuNC0yMy4xLDM1LjVWMTUxLjF6IE0yMzIsMjM0LjkKCWMyMC42LTYuNywzNS4xLTI2LjIsMzUuMS00OC4zYzAtMjIuMi0xNC4yLTQxLjYtMzUuMS00OC4zdi0yMC44YzMxLjksNy4yLDU1LjEsMzUuOCw1NS4xLDY5LjFjMCwzMy4zLTIzLjMsNjEuOS01NS4xLDY5LjFWMjM0Ljl6CgkgTTI3NS45LDI2Ny44Yy0xNi4xLDExLjgtMjUuOCwzMS4xLTI1LjgsNTEuNVYzNDdIMjMydi03OWMzOC42LTcuNCw2Ny4xLTQxLjYsNjcuMS04MS40YzAtMzkuOS0yOC41LTczLjktNjcuMS04MS40Vjg2LjYKCWMyMS41LDMuNCw0MS4zLDEzLjYsNTYuNywyOS41YzE4LjQsMTguOSwyOC41LDQzLjksMjguNSw3MC4zYzAsMTYuNC0zLjgsMzItMTEuMyw0Ni40QzI5OC44LDI0Ni41LDI4OC40LDI1OC42LDI3NS45LDI2Ny44eiIvPgo8L3N2Zz4K" />
                    </a>
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
    const items = await Promise.all(zigbeeLightRows.map(async ({ html, key }) => {
        const bri = await PromiseTimeout(advanceActions.getBrightness(zigbee.devices[key].addr), 125);
        return html.replace('125', bri);
    }));
    const content = items.join(''); // <br />
    res.send(
        ui.replace('::ZigbeeLightRows::', content)
    );
}

async function PromiseTimeout(fn, fallbackValue, timeout = 500) {
    let value = fallbackValue;
    try {
        value = await Promise.race([
            new Promise(resolve => setTimeout(() => resolve(fallbackValue), timeout)),
            fn,
        ]);
    } catch (error) { }
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
