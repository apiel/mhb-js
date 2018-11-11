module.exports = {
    devices: {
        IKEA_OUTLET_TABLE: '0xd0cf5efffe6f87e4', // { state: 'on' }
        INNR_E14_BULB: '0x00158d00020a3941', // { brightness: 255, transition:1 };
    },
    actions: {
        onOff: (state = 'on') => ({ state }),
        brightness: (brightness = 255) => ({ brightness, transition:1 }),
    }
};