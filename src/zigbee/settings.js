const types = {
    outlet: { name: 'outlet', attr: ['onOff'] },
    light: { name: 'light', attr: ['onOff', 'brightness'] },
    remote: { name: 'remote', attr: [] },
};

module.exports = {
    types,
    devices: {
        // IKEA_OUTLET_TABLE: { addr: '0xd0cf5efffe6f87e4', name: 'table light', type: types.outlet.name }, // { state: 'on' }
        // INNR_E14_BULB: { addr: '0x00158d00020a3941', name: 'small light', type: types.light.name }, // { brightness: 255, transition:1 };
        IKEA_E27_BULB_SOFA: { addr: '0x000b57fffe2d9756', name: 'sofa couch light', type: types.light.name },
        IKEA_E27_BULB_TRIANGLE: { addr: '0x000b57fffe3046b8', name: 'little light', type: types.light.name },
        IKEA_DIMMER_SOFA: { addr: '0x000b57fffe150865', name: 'dimmer sofa', type: types.remote.name },
        XIAOMI_BTN_ENTRANCE: { addr: '0x00158d0002016173', name: 'entrance button', type: types.remote.name },
        XIAOMI_BTN_ROOM: { addr: '0x00158d0002131199', name: 'room button', type: types.remote.name },
        // XIAOMI_CUBE: { addr: '0x00158d0002781c40', name: 'cube', type: types.remote.name },
        IKEA_ONOFF: { addr: '0xd0cf5efffed6f665', name: 'ikea on/off', type: types.remote.name },
        IKEA_ONOFF2: { addr: '0xd0cf5efffece4941', name: 'ikea on/off (2)', type: types.remote.name },
    },
    actions: {
        onOff: (state = 'on') => ({ state }),
        brightness: (brightness = 255, transition = 0) => ({ brightness, transition }),
    },
    read: {
        onOff: { cId: 'genOnOff', attrId: 'onOff' },
        brightness: { cId: 'genLevelCtrl', attrId: 'currentLevel' },
    },
};
