import net from 'net';
import { Parser } from './parser';

const client = new net.Socket();
client.connect(6379, '127.0.0.1', function () {
  console.log('Connected');
  // client.write('*3\r\n$3\r\nSET\r\n$3\r\nkey\r\n$2\r\n78\r\n');
  // client.write('*2\r\n$3\r\nGET\r\n$3\r\nkey\r\n');
  client.write('*1\r\n$4\r\nPING\r\n');
  // client.write('*2\r\n$4\r\nKEYS\r\n$1\r\n*\r\n');
});

client.on('data', function (data) {
  const parser = new Parser();
  console.log('Received: ' + data);
  console.log(parser.decode(data));
});

client.on('close', function () {
  console.log('Connection closed');
});
