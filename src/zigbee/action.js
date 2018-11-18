module.exports = async(addr, data) => {
    // console.log('onAfIncomingMsg zcl', addr, JSON.stringify(data));
    console.log('onAfIncomingMsg zcl', addr, data.cmdId, data.payload);
}
