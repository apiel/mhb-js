const types = {
    outlet: { name: 'outlet', attr: ['onOff'] },
    light: { name: 'light', attr: ['onOff', 'brightness'] },
};

module.exports = {
    types,
    devices: {
        IKEA_OUTLET_TABLE: { addr: '0xd0cf5efffe6f87e4', name: 'table', type: types.outlet.name }, // { state: 'on' }
        INNR_E14_BULB: { addr: '0x00158d00020a3941', name: 'little light', type: types.light.name }, // { brightness: 255, transition:1 };
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