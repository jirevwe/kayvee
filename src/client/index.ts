import { Socket } from 'net';
import { Parser } from '../parser';
import { PromiseOperation } from '../operation';

export class Client {
  private socket: Socket;
  private options = { host: '127.0.0.1', port: 6379 };

  private commands: Array<PromiseOperation> = [];
  private ERROR_CODES = ['EALREADY', 'EPIPE', 'ECONNREFUSED'];
  private ready = false;
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      returnReply: (res: string) => {
        const operation = this.commands[0];
        operation.addResponse(res);
        if (operation.completed) this.commands.shift();
      },
      returnError: (err: Error) => {
        const operation = this.commands[0];
        operation.addError(err);
        if (operation.completed) this.commands.shift();
      }
    });
  }

  async sleep(duration = 1000) {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  private async reconnect() {
    while (true) {
      if (this.ready) break;
      await this.sleep();

      this.socket.removeAllListeners();
      this.socket.destroy();
      await this.connect();
    }
  }

  private async connect() {
    return new Promise((resolve) => {
      this.socket = new Socket();

      const connection = this.socket.connect(this.options, () => {
        this.ready = true;
        console.log('connected to server!');
        resolve(this.ready);
      });

      connection.on('data', (data) => this.parser.decode(data));

      connection.on('end', () => {
        console.log('disconnected from server');
      });

      connection.on('error', async (err) => {
        const operation = this.commands.shift();
        operation.reject(err);

        if (this.ERROR_CODES.includes(err['code'])) {
          this.ready = false;
          await this.reconnect();
        }
      });
    });
  }

  async createClient() {
    return this.connect();
  }

  send(command: string[]): Promise<string> {
    if (!this.ready) return Promise.reject(new Error('Client not ready'));

    return new Promise((resolve, reject) => {
      this.commands.push(new PromiseOperation(resolve, reject));
      const buffer = this.parser.encode(command);
      this.socket.write(buffer);
    });
  }
}
