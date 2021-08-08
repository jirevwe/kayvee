interface ParserOptions {
  returnReply: Function;
  returnError: Function;
}

export class Parser {
  private charStr = '+';
  private errorStr = '-';
  private intStr = ':';
  private bulkStr = '$';
  private arrayStr = '*';
  private crlfStr = '\r\n';

  returnReply: Function;
  returnError: Function;

  constructor(options: ParserOptions = null) {
    this.returnReply = options?.returnReply;
    this.returnError = options?.returnError;
  }

  /**
   * Converts a command array to a command string
   * Used when sending commands to the server
   *
   * All commands sent to the server look something like this
   * `*3\r\n$3\r\nSET\r\n$4r\r\nkey\r\n$5\r\nvalue\r\n`
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
    } else if (str[0] === this.errorStr) {
      command = this.parseError(str);
    }

    if (this.returnReply) this.returnReply(command);
    return command;
  }

  private parseArray(str: string) {
    const elems = str.split(this.crlfStr);
    elems.shift();
    elems.pop();

    const e = elems.filter((it) => !it.startsWith(this.bulkStr));

    return e.map((it) =>
      this.startsWith(it) ? this.decode(Buffer.from(it)) : it
    );
  }

  /**
   * checks if the first character is +, :, $, *
   */
  private startsWith(value: string) {
    return [this.bulkStr, this.arrayStr, this.intStr, this.charStr].includes(
      value[0]
    );
  }

  private parseSingleString(str: string) {
    return str.substr(1).split(this.crlfStr).join('');
  }

  private parseBulkString(str: string) {
    return str.startsWith('$-1') ? null : str.split(this.crlfStr)[1];
  }

  private parseInteger(str: string) {
    return Number(str.substr(1).split(this.crlfStr).join(''));
  }

  private parseError(str: string) {
    this.returnError(new Error('Generic Redis Error'));
  }
}
