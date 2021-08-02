export class Parser {
  charStr = '+';
  errorStr = '-';
  intStr = ':';
  bulkStr = '$';
  arrayStr = '*';
  crlfStr = '\r\n';

  /**
   * convert a command array to a command string
   * used when sending commands to the server
   */
  encode(command: any[]): string {
    let commandStr = this.arrayStr + command.length + this.crlfStr;

    for (let i = 0; i < command.length; i++) {
      commandStr +=
        this.bulkStr +
        command[i].length +
        this.crlfStr +
        command[i] +
        this.crlfStr;
    }

    return commandStr;
  }

  /**
   * converts the command string to a command array
   * used when receiving the commands from the client
   */
  decode(responseBuffer: Buffer) {
    const str = responseBuffer.toString('utf8');
    let command = null;

    if (str[0] === this.arrayStr) {
      command = this.parseArray(str);
    } else if (str[0] === this.bulkStr) {
      command = this.parseBulkString(str);
    } else if (str[0] === this.charStr) {
      command = this.parseSingleString(str);
    } else if (str[0] === this.intStr) {
      command = this.parseInteger(str);
    }

    return command;
  }

  private parseArray(str: string) {
    return str.split(this.crlfStr).filter((_, i) => i !== 0 && i % 2 === 0);
  }

  private parseSingleString(str: string) {
    return str.substr(1).split(this.crlfStr).join('');
  }

  private parseBulkString(str: string) {
    const temp = str.split(this.crlfStr);
    return temp[1];
  }

  private parseInteger(str: string) {
    return Number(str.substr(1).split(this.crlfStr).join(''));
  }
}
