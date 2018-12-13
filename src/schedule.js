const sunCalc = require('suncalc');
const moment = require('moment');

const urls = require('./urls/urls');
const { call } = urls;

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
    m.subtract(1, 'hours'); // since we give time in utc+1 we have to remove 1 because new Date is utc 0
    return m.toDate();
}

function now() {
    return moment().toDate();
}

const scheduleDone = {};
function shouldTrigger(id, value, time) {
    if (scheduleDone[id] && scheduleDone[id] === value) {
        return false;
    }
    scheduleDone[id] = value;
    if (time && (new Date) + 0 > time + 5* 60 * 1000) { // let s make schedule timeout of 5min
        console.log('Schedule timeout:', id);
        return false;
    }
    console.log('Schedule:', id);
    return true;
}

console.log('Start schedule, every 1 min check');
setInterval(() => {
    const _now = now();
    const times = sunCalc.getTimes(_now, 48.230388, 16.370070); // Vienna 1200
    if (_now > times.sunsetStart && shouldTrigger('sunsetStart', _now.getDate(), times.sunsetStart)) {
        call(urls.LIGHT_WALL_ENTRANCE_ON);
    }
    let next = time('23:30');
    if (_now > next && shouldTrigger('entrance OFF evening', _now.getDate(), next)) {
        call(urls.LIGHT_WALL_ENTRANCE_OFF);
    }
}, 60 * 1000); // every min

module.exports = {
    time,
    now,
}
