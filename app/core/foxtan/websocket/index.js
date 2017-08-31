const WebSocket = require('ws');

class WSClient {
  constructor (url) {
    this.reconnects = 0;
    this.autoReconnectInterval = 0;
    this.url = url;
  }

  async open () {
    return new Promise((resolve, reject) => {
      this.instance = new WebSocket(this.url);
      this.instance.on('open', () => {
        this.onOpen();
        resolve();
      });
      this.instance.on('message', (data, flags) => {
        this.onMessage(data, flags);
      });
      this.instance.on('close', (e) => {
        switch (e) {
          case 1000:
            console.log("WebSocket: closed");
            break;
          default:
            this.reconnect(e);
            break;
        }
        this.onClose(e);
        reject(e);
      });
      this.instance.on('error', (e) => {
        if (!(e instanceof Error)) {
          let message = e.split(' ');
          let command = message.shift();
          message = message.join('');

          if (command === 'FAIL') {
            switch (+message) {
              case 'ECONNREFUSED':
                this.reconnect(e);
                break;
              case 404:
                message = 'Not found!';
              case 504:
                message = 'Timeout!';
              default:
                this.onError(message);
                break;
            }
          }
        }
        reject(e);
      });
    }).catch((e) => this.instance.emit('error', e));
  }

  async send (data) {
    return new Promise(async (resolve, reject) => {
      let id = this.generateID();
      if (!this.instance || this.instance.readyState !== WebSocket.OPEN) {
        await this.open();
      }
      this.instance.send(data + id);
      console.log('>> ' + data + id);

      let promiseWrapper = (data) => {
        this.instance.removeEventListener('message', promiseWrapper);
        if (data.indexOf(id) >= 0) {
          data = data.replace(id, '');
          return resolve(data);
        }
        reject(data);
      };
      this.instance.on('message', promiseWrapper);

      setTimeout(function () {
        reject('FAIL 504')
      }, 5000);
    }).catch((e) => {
      this.instance.emit('error', e);
    });
  }

  reconnect (e) {
    this.autoReconnectInterval = 5 * 1000 * (++this.reconnects);
    console.log(`WebSocketClient: retry in ${this.autoReconnectInterval} ms`, e);
    setTimeout(async () => {
      console.log("WebSocketClient: reconnecting...");
      await this.open(this.url);
    }, this.autoReconnectInterval);
  }

  onOpen () {
    this.reconnects = 0;
    console.log("OPENED");
  }

  onMessage (data) {
    console.log("<<", data);
  }

  onError (e) {
    console.log("ER", e);
  }

  onClose (code) {
    console.log("CLOSED", code);
  }

  generateID (length = 8) {
    let text = " @";
    const possible = "0123456789abcdef";
    for(let i = 0; i < length; i++)  {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text;
  }

}

module.exports = WSClient;
