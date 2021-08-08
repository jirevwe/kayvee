import net, { Socket } from 'net';
import { Parser } from '../parser';

export class Server {
  private parser = new Parser();
  private server: net.Server;
  private socket: Socket;
  private port: number;
  private host: string;

  // the in-memory db
  private store = {};

  constructor(port: number = 6379, host: string = '127.0.0.1') {
    if (port) this.port = port;
    if (host) this.host = host;

    this.server = net.createServer((socket: Socket) => {
      this.socket = socket;

      socket.on('data', (data: Buffer) => {
        const payload = this.parser.decode(data);

        for (let i = 0; i < payload.length; i++) {
          const command = payload[i];

          if (['keys', 'KEYS'].includes(command)) {
            this.handlekeys(this.socket, payload[i + 1]);
            i++;
          }
          if (['ping', 'PING'].includes(command)) {
            this.handlePing(this.socket);
          }
          if (['info', 'INFO'].includes(command)) {
            this.handleInfo(this.socket);
          }
          if (['echo', 'ECHO'].includes(command)) {
            this.handleEcho(this.socket, payload[i + 1]);
            i++;
          }
          if (['get', 'GET'].includes(command)) {
            this.handleGet(this.socket, payload[i + 1]);
            i += 2;
          }
          if (['set', 'SET'].includes(command)) {
            let skip = 2;

            if (payload[i + 3] === 'px') {
              this.handleSet(
                this.socket,
                payload[i + 1],
                payload[i + 2],
                payload[i + 3],
                payload[i + 4]
              );
              skip = 4;
            } else {
              this.handleSet(this.socket, payload[i + 1], payload[i + 2]);
            }

            i += skip;
          }
        }
      });
    });

    this.server.listen(this.port, this.host);
  }

  private handlekeys = (socket: Socket, pattern: string) => {
    let searchResults = Object.keys(this.store);

    // no search applied => 'KEYS *'
    if (Array.isArray(pattern)) {
      socket.write(this.parser.encode(searchResults));
    }

    const starts = pattern.startsWith('*');
    const ends = pattern.endsWith('*');
    const seacrh = pattern.replace(/\*/gi, '');

    if (starts && ends) {
      searchResults = searchResults.filter((it) => new RegExp(seacrh).test(it));
    } else if (!starts && ends) {
      searchResults = searchResults.filter((it) => it.startsWith(seacrh));
    } else if (starts && !ends) {
      searchResults = searchResults.filter((it) => it.endsWith(seacrh));
    }

    socket.write(this.parser.encode(searchResults));
  };

  private handlePing = (socket: Socket) => {
    socket.write(this.encode('+PONG\r\n'));
  };

  private handleGet = (socket: Socket, key: string) => {
    let response = '$-1\r\n';

    if (key in this.store) response = `+${this.store[key]}\r\n`;

    socket.write(this.encode(response));
  };

  private handleSet = (
    socket: Socket,
    key: string,
    value: any,
    expireMode: string = null,
    expireDuration: number = 0
  ) => {
    let response = '+OK\r\n';

    this.store[key] = value;

    // the expire duration is in milliseconds
    if (expireMode === 'px')
      setTimeout(() => delete this.store[key], expireDuration);

    // the expire duration is in seconds
    if (expireMode === 'ex')
      setTimeout(() => delete this.store[key], expireDuration * 1000);

    socket.write(this.encode(response));
  };

  private handleInfo = (socket: Socket) => {
    socket.write(this.encode('+# Server\r\n'));
  };

  private handleEcho = (socket: Socket, value: any) => {
    socket.write(this.encode(`+${value}\r\n`));
  };

  private encode = (str: string) => Buffer.from(str);
}

new Server();
