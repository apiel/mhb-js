const { promises } = require('fs');

const urls = require('../urls/urls');
const { call } = urls;
const {
    setOnOff,
    getBrightness,
    setBrightness,
} = require('../zigbee/controller');
const devices = require('../zigbee/devices');
const { allLivingRoomOff, allFlatOff } = require('../scene/all');
const {
    executeThermostatPower,
    getLogThermostat,
} = require('../thermostat/thermostat');
const { activateHeating, warmTemp } = require('../thermostat');
// .js because of some weird bug
const { stateFile } = require('../zigbee/config.js');

const rows = [];
const onoffRows = [];
const zigbeeLightRows = [];

async function stateList() {
    const content = await promises.readFile(stateFile);
    const states = JSON.parse(content);
    let html = '<ul class="stateList">';
    Object.keys(states).forEach((key) => {
        const device = Object.values(devices).find(
            (device) => device.addr === key,
        );
        if (device) {
            html += `<li><b>${device.name}:</b> ${JSON.stringify(states[key])}</li>`;
        }
    });
    html += '</ul>';
    return html;
}

Object.keys(urls.devices).forEach((key) => {
    addSonOffRow(urls.devices[key].name, key);
});

Object.keys(devices).forEach((key) => {
    const device = devices[key];
    if (device.type === 'outlet') {
        addZigbeeOnOffRow(device.name, key);
    }
});

Object.keys(devices).forEach((key) => {
    const device = devices[key];
    if (device.type === 'light') {
        addZigbeeLightRow(device.name, key);
    }
});

addRow(
    [
        btn('/ui/action?type=allOff', 'Flat off'),
        btn('/ui/action?type=livingRoomOff', 'Living room off'),
    ],
    '',
);

const ui = `
<html>
<head>
    <meta name=viewport content='width=340'>
    <style>
        html, body {
            max-width: 700px;
            overflow-x: hidden;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
        }
        a {
            text-decoration: none;
            color: #687e88;
        }
        .btn {
            padding: 7px;
            border: solid 1px #ecf5f7;
            margin: 5px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 12px;
            font-weight: bold;
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
            height: 100px;
            float: left;
            margin: 5px;
            text-align: center;
            font-size: 10px;
            padding: 10px 0;
        }

        .btns {
            margin: 17px 0 5px;
        }

        .btn img {
            width: 40px;
        }

        .card .btn {
            height: 50px;
            width: 49px;
            float: left;
            font-weight: normal;
        }

        .card.card-thermostat .btn {
            height: auto;
        }

        .stateList {
            color: #687e88;
            font-size: 12px;
            padding-left: 10px;
        }
    </style>
</head>
<body>
    <div>::ZigbeeLightRows::</div>
    <div>${onoffRows.join('')}</div>
    <div>${addThermostat()}</div>
    <div style="clear:both;"></div>
    <div style="padding-top: 15px;">${rows.join('<br />')}</div>
    <div>::StateList::</div>
    <div style="padding-top: 50px; font-size: 10px; text-align: center;">
        <a href="http://192.168.0.122:3000/journal">journal</a>
        -
        <a href="http://192.168.0.122:3000/log">log</a>
    </div>
</body>
</html>
`;

function addThermostat() {
    return `
    <div class="card card-thermostat">
        <div>
            <span>::RoomTemperature::°C</span>
        </div>
        <div class="btns">
            <a href="/ui/action?type=heatingOn" class="btn">
                ON
            </a>
            <a href="/ui/action?type=heatingOff" class="btn">
                OFF
            </a>
            <a href="/ui/action?type=heatingBoost" class="btn">
                BOOST
            </a>
            <a class="btn">
                ::ThermostatTemperature::°C
            </a>
        </div>
    </div>
`;
}

function addRow(buttons, name) {
    rows.push(`<div class="row">${buttons.join(' ')} ${name}</div>`);
}

function addSonOffRow(name, key) {
    onoffRows.push(`
    <div class="card">
        <div>
            <span>${name}</span>
        </div>
        <div class="btns">
            <a href="/ui/action?device=${key}_ON&type=call" class="btn">
                <img alt="ON" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIzLjAuNiwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkViZW5lXzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA0MzIuNCA0MzIuNCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDMyLjQgNDMyLjQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojNTRDNUZGO30KCS5zdDF7ZmlsbDojRkZDNjAwO30KPC9zdHlsZT4KPHBhdGggY2xhc3M9InN0MSIgZD0iTTIxNi4yLDg1LjZjMC4zLDAsMC42LDAsMSwwYzI2LjgsMC4zLDUxLjksMTAuOSw3MC44LDI5LjljMTguOSwxOSwyOS4zLDQ0LjMsMjkuMyw3MS4xCgljMCwxNi41LTMuOCwzMi4yLTExLjQsNDYuN2MtNy4yLDEzLjktMTcuOCwyNi0zMC41LDM1LjJjLTE1LjcsMTEuMy0yNS4xLDI5LjYtMjUuMSw0OC44VjM0N2gtNjh2LTI5LjZjMC0xOS4zLTkuMi0zNy41LTI0LjctNDguNgoJYy0xMi45LTkuMi0yMy41LTIxLjUtMzAuOS0zNS41Yy03LjYtMTQuNC0xMS41LTMwLjgtMTEuNC00Ny4yYzAuMS0yNi44LDEwLjctNTIsMjkuOS03MUMxNjQuMiw5Ni4xLDE4OS41LDg1LjYsMjE2LjIsODUuNgoJIE0yMTYuMiw3My42Yy02MS44LDAtMTEyLjcsNTAuNS0xMTMsMTEyLjVjLTAuMiwzOC4xLDE4LjUsNzEuOSw0Ny4zLDkyLjVjMTIuNSw4LjksMTkuNywyMy41LDE5LjcsMzguOFYzNTloOTJ2LTQxLjYKCWMwLTE1LjUsNy41LTMwLDIwLjEtMzkuMWMyOC40LTIwLjUsNDYuOS01My45LDQ2LjktOTEuN2MwLTYyLTUwLTExMi40LTExMS45LTExM0MyMTYuOSw3My42LDIxNi42LDczLjYsMjE2LjIsNzMuNkwyMTYuMiw3My42eiIvPgo8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMjE2LjIsMjM3LjRjLTI4LDAtNTAuOC0yMi44LTUwLjgtNTAuOHMyMi44LTUwLjgsNTAuOC01MC44czUwLjgsMjIuOCw1MC44LDUwLjhTMjQ0LjIsMjM3LjQsMjE2LjIsMjM3LjR6CgkgTTIxNi4yLDE0Ny44Yy0yMS40LDAtMzguOCwxNy40LTM4LjgsMzguOHMxNy40LDM4LjgsMzguOCwzOC44UzI1NSwyMDgsMjU1LDE4Ni42UzIzNy42LDE0Ny44LDIxNi4yLDE0Ny44eiIvPgo8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMjE2LjIsMjY5LjVjLTQ1LjcsMC04Mi45LTM3LjItODIuOS04Mi45YzAtNDUuNywzNy4yLTgyLjksODIuOS04Mi45YzQ1LjcsMCw4Mi45LDM3LjIsODIuOSw4Mi45CglDMjk5LjEsMjMyLjMsMjYxLjksMjY5LjUsMjE2LjIsMjY5LjV6IE0yMTYuMiwxMTUuN2MtMzkuMSwwLTcwLjksMzEuOC03MC45LDcwLjlzMzEuOCw3MC45LDcwLjksNzAuOWMzOS4xLDAsNzAuOS0zMS44LDcwLjktNzAuOQoJUzI1NS4zLDExNS43LDIxNi4yLDExNS43eiIvPgo8Zz4KCTxyZWN0IHg9IjE3MC4yIiB5PSIzNjcuNiIgY2xhc3M9InN0MSIgd2lkdGg9IjkyIiBoZWlnaHQ9IjExLjUiLz4KPC9nPgo8L3N2Zz4K" />
                ON
            </a>
            <a href="/ui/action?device=${key}_OFF&type=call" class="btn">
                <img alt="OFF" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIzLjAuNiwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkViZW5lXzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA0MzIuNCA0MzIuNCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDMyLjQgNDMyLjQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojNTRDNUZGO30KCS5zdDF7ZmlsbDojRkZDNjAwO30KPC9zdHlsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTIxNi4yLDg1LjZjMC4zLDAsMC42LDAsMSwwYzI2LjgsMC4zLDUxLjksMTAuOSw3MC44LDI5LjljMTguOSwxOSwyOS4zLDQ0LjMsMjkuMyw3MS4xCgljMCwxNi41LTMuOCwzMi4yLTExLjQsNDYuN2MtNy4yLDEzLjktMTcuOCwyNi0zMC41LDM1LjJjLTE1LjcsMTEuMy0yNS4xLDI5LjYtMjUuMSw0OC44VjM0N2gtNjh2LTI5LjZjMC0xOS4zLTkuMi0zNy41LTI0LjctNDguNgoJYy0xMi45LTkuMi0yMy41LTIxLjUtMzAuOS0zNS41Yy03LjYtMTQuNC0xMS41LTMwLjgtMTEuNC00Ny4yYzAuMS0yNi44LDEwLjctNTIsMjkuOS03MUMxNjQuMiw5Ni4xLDE4OS41LDg1LjYsMjE2LjIsODUuNgoJIE0yMTYuMiw3My42Yy02MS44LDAtMTEyLjcsNTAuNS0xMTMsMTEyLjVjLTAuMiwzOC4xLDE4LjUsNzEuOSw0Ny4zLDkyLjVjMTIuNSw4LjksMTkuNywyMy41LDE5LjcsMzguOFYzNTloOTJ2LTQxLjYKCWMwLTE1LjUsNy41LTMwLDIwLjEtMzkuMWMyOC40LTIwLjUsNDYuOS01My45LDQ2LjktOTEuN2MwLTYyLTUwLTExMi40LTExMS45LTExM0MyMTYuOSw3My42LDIxNi42LDczLjYsMjE2LjIsNzMuNkwyMTYuMiw3My42eiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjE2LjIsMjM3LjRjLTI4LDAtNTAuOC0yMi44LTUwLjgtNTAuOHMyMi44LTUwLjgsNTAuOC01MC44czUwLjgsMjIuOCw1MC44LDUwLjhTMjQ0LjIsMjM3LjQsMjE2LjIsMjM3LjR6CgkgTTIxNi4yLDE0Ny44Yy0yMS40LDAtMzguOCwxNy40LTM4LjgsMzguOHMxNy40LDM4LjgsMzguOCwzOC44UzI1NSwyMDgsMjU1LDE4Ni42UzIzNy42LDE0Ny44LDIxNi4yLDE0Ny44eiIvPgo8Zz4KCTxyZWN0IHg9IjE3MC4yIiB5PSIzNjcuNiIgY2xhc3M9InN0MCIgd2lkdGg9IjkyIiBoZWlnaHQ9IjExLjUiLz4KPC9nPgo8L3N2Zz4K" />
                OFF
            </a>
        </div>
    </div>
`);
}

function addZigbeeOnOffRow(name, key) {
    onoffRows.push(`
    <div class="card">
        <div>
            <span>${name}</span>
        </div>
        <div class="btns">
            <a href="/ui/action?device=${key}&type=zigbeeON" class="btn">
                <img alt="ON" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIzLjAuNiwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkViZW5lXzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA0MzIuNCA0MzIuNCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDMyLjQgNDMyLjQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojNTRDNUZGO30KCS5zdDF7ZmlsbDojRkZDNjAwO30KPC9zdHlsZT4KPHBhdGggY2xhc3M9InN0MSIgZD0iTTIxNi4yLDg1LjZjMC4zLDAsMC42LDAsMSwwYzI2LjgsMC4zLDUxLjksMTAuOSw3MC44LDI5LjljMTguOSwxOSwyOS4zLDQ0LjMsMjkuMyw3MS4xCgljMCwxNi41LTMuOCwzMi4yLTExLjQsNDYuN2MtNy4yLDEzLjktMTcuOCwyNi0zMC41LDM1LjJjLTE1LjcsMTEuMy0yNS4xLDI5LjYtMjUuMSw0OC44VjM0N2gtNjh2LTI5LjZjMC0xOS4zLTkuMi0zNy41LTI0LjctNDguNgoJYy0xMi45LTkuMi0yMy41LTIxLjUtMzAuOS0zNS41Yy03LjYtMTQuNC0xMS41LTMwLjgtMTEuNC00Ny4yYzAuMS0yNi44LDEwLjctNTIsMjkuOS03MUMxNjQuMiw5Ni4xLDE4OS41LDg1LjYsMjE2LjIsODUuNgoJIE0yMTYuMiw3My42Yy02MS44LDAtMTEyLjcsNTAuNS0xMTMsMTEyLjVjLTAuMiwzOC4xLDE4LjUsNzEuOSw0Ny4zLDkyLjVjMTIuNSw4LjksMTkuNywyMy41LDE5LjcsMzguOFYzNTloOTJ2LTQxLjYKCWMwLTE1LjUsNy41LTMwLDIwLjEtMzkuMWMyOC40LTIwLjUsNDYuOS01My45LDQ2LjktOTEuN2MwLTYyLTUwLTExMi40LTExMS45LTExM0MyMTYuOSw3My42LDIxNi42LDczLjYsMjE2LjIsNzMuNkwyMTYuMiw3My42eiIvPgo8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMjE2LjIsMjM3LjRjLTI4LDAtNTAuOC0yMi44LTUwLjgtNTAuOHMyMi44LTUwLjgsNTAuOC01MC44czUwLjgsMjIuOCw1MC44LDUwLjhTMjQ0LjIsMjM3LjQsMjE2LjIsMjM3LjR6CgkgTTIxNi4yLDE0Ny44Yy0yMS40LDAtMzguOCwxNy40LTM4LjgsMzguOHMxNy40LDM4LjgsMzguOCwzOC44UzI1NSwyMDgsMjU1LDE4Ni42UzIzNy42LDE0Ny44LDIxNi4yLDE0Ny44eiIvPgo8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMjE2LjIsMjY5LjVjLTQ1LjcsMC04Mi45LTM3LjItODIuOS04Mi45YzAtNDUuNywzNy4yLTgyLjksODIuOS04Mi45YzQ1LjcsMCw4Mi45LDM3LjIsODIuOSw4Mi45CglDMjk5LjEsMjMyLjMsMjYxLjksMjY5LjUsMjE2LjIsMjY5LjV6IE0yMTYuMiwxMTUuN2MtMzkuMSwwLTcwLjksMzEuOC03MC45LDcwLjlzMzEuOCw3MC45LDcwLjksNzAuOWMzOS4xLDAsNzAuOS0zMS44LDcwLjktNzAuOQoJUzI1NS4zLDExNS43LDIxNi4yLDExNS43eiIvPgo8Zz4KCTxyZWN0IHg9IjE3MC4yIiB5PSIzNjcuNiIgY2xhc3M9InN0MSIgd2lkdGg9IjkyIiBoZWlnaHQ9IjExLjUiLz4KPC9nPgo8L3N2Zz4K" />
                ON
            </a>
            <a href="/ui/action?device=${key}&type=zigbeeOFF" class="btn">
                <img alt="OFF" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIzLjAuNiwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkViZW5lXzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA0MzIuNCA0MzIuNCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDMyLjQgNDMyLjQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojNTRDNUZGO30KCS5zdDF7ZmlsbDojRkZDNjAwO30KPC9zdHlsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTIxNi4yLDg1LjZjMC4zLDAsMC42LDAsMSwwYzI2LjgsMC4zLDUxLjksMTAuOSw3MC44LDI5LjljMTguOSwxOSwyOS4zLDQ0LjMsMjkuMyw3MS4xCgljMCwxNi41LTMuOCwzMi4yLTExLjQsNDYuN2MtNy4yLDEzLjktMTcuOCwyNi0zMC41LDM1LjJjLTE1LjcsMTEuMy0yNS4xLDI5LjYtMjUuMSw0OC44VjM0N2gtNjh2LTI5LjZjMC0xOS4zLTkuMi0zNy41LTI0LjctNDguNgoJYy0xMi45LTkuMi0yMy41LTIxLjUtMzAuOS0zNS41Yy03LjYtMTQuNC0xMS41LTMwLjgtMTEuNC00Ny4yYzAuMS0yNi44LDEwLjctNTIsMjkuOS03MUMxNjQuMiw5Ni4xLDE4OS41LDg1LjYsMjE2LjIsODUuNgoJIE0yMTYuMiw3My42Yy02MS44LDAtMTEyLjcsNTAuNS0xMTMsMTEyLjVjLTAuMiwzOC4xLDE4LjUsNzEuOSw0Ny4zLDkyLjVjMTIuNSw4LjksMTkuNywyMy41LDE5LjcsMzguOFYzNTloOTJ2LTQxLjYKCWMwLTE1LjUsNy41LTMwLDIwLjEtMzkuMWMyOC40LTIwLjUsNDYuOS01My45LDQ2LjktOTEuN2MwLTYyLTUwLTExMi40LTExMS45LTExM0MyMTYuOSw3My42LDIxNi42LDczLjYsMjE2LjIsNzMuNkwyMTYuMiw3My42eiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjE2LjIsMjM3LjRjLTI4LDAtNTAuOC0yMi44LTUwLjgtNTAuOHMyMi44LTUwLjgsNTAuOC01MC44czUwLjgsMjIuOCw1MC44LDUwLjhTMjQ0LjIsMjM3LjQsMjE2LjIsMjM3LjR6CgkgTTIxNi4yLDE0Ny44Yy0yMS40LDAtMzguOCwxNy40LTM4LjgsMzguOHMxNy40LDM4LjgsMzguOCwzOC44UzI1NSwyMDgsMjU1LDE4Ni42UzIzNy42LDE0Ny44LDIxNi4yLDE0Ny44eiIvPgo8Zz4KCTxyZWN0IHg9IjE3MC4yIiB5PSIzNjcuNiIgY2xhc3M9InN0MCIgd2lkdGg9IjkyIiBoZWlnaHQ9IjExLjUiLz4KPC9nPgo8L3N2Zz4K" />
                OFF
            </a>
        </div>
    </div>
`);
}

function addZigbeeLightRow(name, key) {
    zigbeeLightRows.push({
        key,
        html: `
            <div class="card">
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
    const items = await Promise.all(
        zigbeeLightRows.map(async ({ html, key }) => {
            const bri = await PromiseTimeout(
                getBrightness(devices[key].addr),
                125,
            );
            return html.replace('125', bri);
        }),
    );
    const zigbeeLightRowsContent = items.join(''); // <br />
    const { thermostat_temp, room_temp } = await getLogThermostat();
    res.send(
        ui
            .replace('::ZigbeeLightRows::', zigbeeLightRowsContent)
            .replace('::RoomTemperature::', room_temp)
            .replace('::ThermostatTemperature::', thermostat_temp)
            .replace('::StateList::', await stateList()),
    );
}

async function PromiseTimeout(fn, fallbackValue, timeout = 500) {
    let value = fallbackValue;
    try {
        value = await Promise.race([
            new Promise((resolve) =>
                setTimeout(() => resolve(fallbackValue), timeout),
            ),
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
    } else if (query.type === 'heatingBoost') {
        const duration = 30;
        const temp = warmTemp + 1;
        activateHeating('UI', temp, duration);
    } else if (query.type === 'heatingOn') {
        executeThermostatPower('on');
    } else if (query.type === 'heatingOff') {
        executeThermostatPower('off');
    } else if (query.type === 'zigbeeToggle') {
        setOnOff(devices[query.device].addr, 'toggle');
    } else if (query.type === 'zigbeeON') {
        setOnOff(devices[query.device].addr, 'on');
    } else if (query.type === 'zigbeeOFF') {
        setOnOff(devices[query.device].addr, 'off');
    } else if (query.type === 'zigbeeBri') {
        setBrightness(devices[query.device].addr, parseInt(query.bri, 10));
    }

    res.send(`<script>window.history.back();</script>`);
}

module.exports = {
    handleUi,
    handleUiAction,
};
