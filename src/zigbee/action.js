// Succeed to configure TRADFRI wireless dimmer 0x000b57fffe150865
// onAfIncomingMsg 0x000b57fffe150865 <Buffer 11 01 07>

module.exports = async(addr, data) => {
    // console.log('onAfIncomingMsg zcl', addr, JSON.stringify(data));
    console.log('onAfIncomingMsg zcl', addr, data.cmdId, data.payload);
}
