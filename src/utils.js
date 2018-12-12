const limits = {};
function timeLimitIsOver(id, ms) {
    const now = new Date();
    const over = !limits[id] || now - ms > limits[id];
    if (over) {
        limits[id] = now;
    }
    // console.log('timeLimitIsOver', id, ms, over, limits);
    return over;
}

const timers = {};
function timer(id, callback, second) {
    if (timers[id]) {
        clearTimeout(timers[id]);
    }
    timers[id] = setTimeout(callback, second * 1000);
}

module.exports = {
    timeLimitIsOver,
    timer,
}