const config = require('./config');

class Logger {

  constructor(output = console.log) {
    this.output = output;

    this.symbols = {
      red: `\x1b[31;1m`,
      yellow: `\x1b[33m`,
      green: `\x1b[32m`,
      cyan: `\x1b[36m`,
      reset: `\x1b[0m`
    }
  }

  print() {
    let messages = [].slice.call(arguments);
    let type = messages.pop();
    messages.forEach((msg) => {
      msg = this.prettify(msg, type);
      if (Logger.isWritable(this.output)) {
        return this.output.write(
          (typeof msg !== 'undefined' || msg !== null)
            ? msg + '\n'
            : null
        );
      }
      if (typeof this.output === 'function') {
        return this.output(msg);
      }
      return console.error('Logger output is broken or not set.');
    });
  }

  error() {
    return this.print(...arguments, 'red');
  }

  warn() {
    return this.print(...arguments, 'yellow');
  }

  success() {
    return this.print(...arguments, 'green');
  }

  info() {
    return this.print(...arguments, 'cyan');
  }

  prettify(msg, type) {
    if (msg instanceof Error) {
      msg = Logger.prettifyError(msg);
    } else if ({}.toString.call(msg) === '[object Object]') {
      msg = JSON.stringify(msg, '\n', ' ');
    }
    return (typeof type !== 'undefined')
      ? (typeof this.symbols[type] !== 'undefined')
        ? this.symbols[type] + msg + this.symbols.reset
        : msg
      : msg;
  }

  static prettifyError(e) {
    let stack = e.stack.split('\n');
    let title = stack.shift();
    return `\x1b[37;1m${title}\x1b[0m\n` + `\x1b[30m${stack.join('\n')}\x1b[0m`;
  };

  static isWritable(stream) {
    return stream.writable !== false
      && typeof stream._write === 'function'
      && typeof stream._writableState === 'object'
  }

}

module.exports = new Logger(config('server.logger'));
