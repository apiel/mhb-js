module.exports = (name) => `<?xml version="1.0"?>
<root>
    <device>
        <deviceType>urn:Belkin:device:controllee:1</deviceType>
        <friendlyName>${name}</friendlyName>
        <manufacturer>Belkin International Inc.</manufacturer>
        <modelName>Emulated Socket</modelName>
        <modelNumber>3.1415</modelNumber>
        <UDN>uuid:Socket-1_0-38323636-4558-4dda-9188-cda0e6cc3dc0</UDN>
        <serialNumber>221517K0101769</serialNumber>
        <binaryState>0</binaryState>
        <serviceList>
            <service>
                <serviceType>urn:Belkin:service:basicevent:1</serviceType>
                <serviceId>urn:Belkin:serviceId:basicevent1</serviceId>
                <controlURL>/upnp/control/basicevent1</controlURL>
                <eventSubURL>/upnp/event/basicevent1</eventSubURL>
                <SCPDURL>/eventservice.xml</SCPDURL>
            </service>
        </serviceList>
    </device>
</root>
`;