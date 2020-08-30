const sunCalc = require('suncalc');
const moment = require('moment');

const { setOnOff, devices } = require('./zigbee');

const urls = require('./urls/urls');
const { call } = urls;

const sunTime = () => sunCalc.getTimes(moment().toDate(), 48.230388, 16.370070); // Vienna 1200

// console.log('format', moment().format());
// const eg = sunCalc.getTimes(new Date(), 48.230388, 16.370070); // Vienna 1200
// console.log('example', moment(eg.sunsetStart).format());
// console.log('example to utc+1', moment(eg.sunsetStart).utcOffset('+01:00').format());
// var m = moment('13:00', 'HH:mm');
// m.utcOffset('-01:00');
// var s = m.format("YYYY-MM-DD HH:mm:ss");  // output string
// console.log('ssssss', s);
// console.log('comparison', m < new Date);

function time(str) {
    const m = moment(str, 'HH:mm');
    // m.subtract(1, 'hours'); // since we give time in utc+1 we have to remove 1 because new Date is utc 0 // not true anymore
    return m.toDate();
}

const oneMinute = 60 * 1000;
const scheduleDone = {};
function shouldTrigger(id, value, time) {
    if (scheduleDone[id] && scheduleDone[id] === value) {
        return false;
    }
    scheduleDone[id] = value;
    if (time && moment().diff(moment(time), 'm') > 5) {
        console.log('Schedule timeout:', id);
        return false;
    }
    return true;
}


console.log('Start schedule, every 1 min check');
setInterval(() => {
    const now = moment().toDate();
    if (now > sunTime().goldenHour && shouldTrigger('goldenHour', now.getDate(), sunTime().goldenHour)) {
        setOnOff(devices.IKEA_OUTLET_HALLWAY.addr, 'on');
//    } else if (now > sunTime().sunriseEnd && now < sunTime().goldenHour && shouldTrigger('sunriseEnd', now.getDate(), sunTime().sunriseEnd)) {
//        setOnOff(devices.IKEA_OUTLET_HALLWAY.addr, 'off');
    }
    let next = time('23:30');
    if (now > next && shouldTrigger('entrance OFF evening', now.getDate(), next)) {
        setOnOff(devices.IKEA_OUTLET_HALLWAY.addr, 'off');
    }
}, oneMinute); // every min

module.exports = {
    sunTime,
    time,
}
