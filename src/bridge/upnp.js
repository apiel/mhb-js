const ssdp = require("peer-ssdp");

const peer = ssdp.createPeer();

peer.on('ready', () => {
    console.log('SSDP::ssdpStart(peer-ready)');
});

peer.on('search', (headers, address) => {
    console.log('peer search', headers, address);
    peer.reply({
        NT: 'urn:schemas-upnp-org:device:basic:1',
        ST: 'urn:schemas-upnp-org:device:basic:1',
        SERVER: 'node.js/0.10.28 UPnP/1.1',
        USN: 'uuid:Socket-1_0-221438K0100073::urn:Belkin:device:**',
        LOCATION: 'http://{{networkInterfaceAddress}}:8080/api/setup.xml',
    }, address);

    peer.reply({
        NT: 'urn:schemas-upnp-org:device:basic:1',
        ST: 'urn:schemas-upnp-org:device:basic:1',
        SERVER: 'node.js/0.10.28 UPnP/1.1',
        USN: 'uuid:Socket-1_0-221438K0100073::urn:Belkin:device:**',
        LOCATION: 'http://{{networkInterfaceAddress}}:8080/wemo/setup.xml',
    }, address);
});

peer.start();