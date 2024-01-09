const modbus = require('jsmodbus');
const net = require('net');
const socket = new net.Socket();
// const options = {
//     'host': '112.185.231.242',
//     'port': '5001'
// };
let options = {
    'host': '127.0.0.1',
    'port': '501'
};
const client = new modbus.client.TCP(socket);
let isConnected = false;


export function getRead(modbus_options) {
    return new Promise((resolve, reject) => {
        if(!isConnected){
            socket.connect(modbus_options);
        }

        client.readInputRegisters(11, 2)
            .then((resp) => {
                console.log('Response from Modbus server:', resp.response.body._valuesAsArray);
                resolve(resp.response.body._valuesAsArray);
                //socket.end();
            })
            .catch((err) => {
                console.error('Error:', err);
                socket.end();
                resolve(-1);
            });
    });
}

socket.on('connect', () => {
    console.log('Connected to Modbus Server.');
    isConnected = true;
});
socket.on('error', (err) => {
    console.error('Connection Error:', err);
    isConnected = false;
    socket.end();
});
socket.on('close', () => {
    console.log('Connection Closed');
    isConnected = false;
});
socket.on('end', () => {
    console.log('Connection end');
    isConnected = false;
});



if (isConnected) {
    getRead();
}
setInterval(() => {
    if (isConnected) {
        getRead();
    }
}, 1000);

export default getRead;