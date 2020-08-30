const mock = require('mock-require');

const devices = require('./devices');
const { action } = require('./action');
const { emitter } = require('./emitter');
const { dataPath } = require('./config');

process.env.ZIGBEE2MQTT_DATA = dataPath;

const addresses = Object.values(devices).map((device) => device.addr);

class MQTT {
    constructor() {}
    on(name, value) {
        console.log('on', { name, value });
    }
    async connect() {}
    async disconnect() {}
    async publish(topic, payloadJson, ...rest) {
        const payload = JSON.parse(payloadJson);
        emitter.emit('pub', { topic, payload });
        if (addresses.includes(topic)) {
            action(topic, payload);
        } else {
            console.log('pub', { topic, payload, rest });
        }
    }
    subscribe(topic) {
        // console.log('sub', topic);
    }
    isConnected() {
        return true;
    }
    onMessage(topic, message) {
        console.log('onMessage', { topic, message });
    }
}
mock('zigbee2mqtt/lib/mqtt', MQTT);

// must stay after mock
const Controller = require('zigbee2mqtt/lib/controller');
const controller = new Controller();
controller.start();

emitter.on('message', (data) => {
    controller.onMQTTMessage(data);
});
