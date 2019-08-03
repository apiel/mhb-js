class IkeaOnOffDouble {
    constructor(addr) {
        this.addr = addr;
        this.lastDevice = null;
        this.lastType = null;
        this.lastTime = new Date();
        this.timer = null;
    }

    setLastDevice(addr) {
        this.lastDevice = addr;
    }

    onInd(addr, type, callback) {
        if (addr === this.addr) {
            const now = new Date();
            const timeDiff = now - this.lastTime;
            if (type === 'cmdOff' || type === 'cmdOn') {
                if (this.lastType === type && timeDiff < 500) {
                    clearTimeout(this.timer);
                    callback(`${type}Double`, this.lastDevice)
                } else {
                    this.timer = setTimeout(() => callback(`${type}Single`, this.lastDevice), 500);
                }
                this.lastType = type;
                this.lastTime = now;
            }
        } else {
            callback(type, this.lastDevice);
        }
    }
}

class IkeaOnOffLong {
    constructor(addr) {
        this.addr = addr;
        this.lastDevice = null;
        this.timer = null;
    }

    setLastDevice(addr) {
        this.lastDevice = addr;
    }

    onInd(addr, type, callback) {
        if (type === 'cmdMove' || type === 'cmdMoveWithOnOff') {
            this.timer = setInterval(() => {
                callback(type, this.lastDevice);
            }, 300);
        } else if (type === 'cmdStopWithOnOff') {
            clearInterval(this.timer);
        }
        callback(type, this.lastDevice);
    }
}

module.exports = {
    IkeaOnOffDouble,
    IkeaOnOffLong,
};