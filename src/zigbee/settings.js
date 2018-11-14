const TYPE = {
    OUTLET: 'outlet',
    LIGHT: 'light',
}

module.exports = {
    types: TYPE,
    devices: {
        IKEA_OUTLET_TABLE: { addr: '0xd0cf5efffe6f87e4', name: 'table', type: TYPE.OUTLET }, // { state: 'on' }
        INNR_E14_BULB: { addr: '0x00158d00020a3941', name: 'little light', type: TYPE.LIGHT }, // { brightness: 255, transition:1 };
    },
    actions: {
        onOff: (state = 'on') => ({ state }),
        brightness: (brightness = 255, transition = 0) => ({ brightness, transition }),
    },
    read: {

    },
};