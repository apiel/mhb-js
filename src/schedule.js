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
    m.utcOffset('-01:00'); // since we give time in utc+1 we have to remove 1 because new Date is utc 0
    return m.toDate();
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
    const now = new Date();
    const times = sunCalc.getTimes(now, 48.230388, 16.370070); // Vienna 1200
    if (now > times.sunsetStart && shouldTrigger('sunsetStart', now.getDate(), times.sunsetStart)) {
        call(urls.LIGHT_WALL_ENTRANCE_ON);
    }
    let next = time('23:30');
    if (now > next && shouldTrigger('entrance OFF evening', now.getDate(), next)) {
        call(urls.LIGHT_WALL_ENTRANCE_OFF);
    }
}, 60 * 1000); // every min
