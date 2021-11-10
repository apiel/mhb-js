const mock = require('mock-require');

const devices = require('./devices');
const { action } = require('./action');
const { emitter } = require('./emitter');
const { dataPath } = require('./config');

process.env.ZIGBEE2MQTT_DATA = dataPath;

const addresses = Object.values(devices).map((device) => device.addr);

// might have a look at https://www.zigbee2mqtt.io/advanced/more/user_extensions.html#user-extensions-list
// and just skip mqtt connect

class MQTT {
    constructor(eventBus) {
        this.eventBus = eventBus;
        emitter.on('message', ({ topic, message }) => {
            this.onMessage(topic, message);
        });
    }

    on(name, value) {
        console.log('on', { name, value });
    }
    async connect() {}
    async disconnect() {}
    subscribe(topic) {
        // console.log('sub', topic);
    }
    isConnected() {
        return true;
    }
    onMessage(topic, message) {
        console.log('onMessage', { topic, message });
        this.eventBus.emitMQTTMessage({ topic, message: message + '' });
    }

    async publish(
        topic,
        payload,
        options = {},
        ...rest
    ) {
        const myPayload = JSON.parse(payload);
        emitter.emit('pub', { topic, payload: myPayload });
        if (addresses.includes(topic)) {
            action(topic, myPayload);
        } else {
            console.log('pub', { topic, payload: myPayload, options, rest });

            // do what was zigbee2mqtt is more or less normaly doing
            const defaultOptions = { qos: 0, retain: false };
            topic = `zigbee2mqtt/${topic}`;
    
            this.eventBus.emitMQTTMessagePublished({
                topic,
                payload,
                options: { ...defaultOptions, ...options },
            });
        }
    }
}
mock('zigbee2mqtt/dist/mqtt', MQTT);

// must stay after mock
const Controller = require('zigbee2mqtt/dist/controller');
const controller = new Controller();
controller.start();
