import net from 'net';

const PORT = Number(process.env.PORT) || 10101;

// const commands = ['ping', 'get', 'set'];

const server = net.createServer(function (socket) {
  socket.on('data', (data) => {
    const payload = decode(data);
    if (payload === 'PING') socket.write(encode('+PONG\r\n'));
  });
});

const decode = (data: Buffer): string => {
  const str = data.toString('utf8');

  //this data is a plain string
  if (str[0] === '+') {
    return str.split('\r\n')[0].substr(1);
  }

  return '';
};

const encode = (str: string): Buffer => {
  return Buffer.from(str);
};

server.on('error', (err) => console.error(err));
server.on('close', () => console.log('Sever stopped with error code 0'));
server.listen(PORT, () => console.log(`server started on ${PORT}`));
