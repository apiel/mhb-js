const events = require('events');

const emitter = new events();

function emit(topic, message) {
    emitter.emit('message', {
        topic: `zigbee2mqtt/${topic}`,
        message: JSON.stringify(message),
    });
}

module.exports = {
    emit,
    emitter,
};
