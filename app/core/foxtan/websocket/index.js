const WebSocket = require('ws');
const Templating = require('../../templating');
const SyncData = require('../../../models/json/sync');

let SD = new SyncData('.tmp/syncData.json');

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
        resolve(1);
      });
      this.instance.on('message', async (data) => {
        await this.onMessage(data);
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
                break;
              case 504:
                message = 'Timeout!';
                break;
            }
            return this.onError(message);
          }
        }
      });
    }).catch((e) => this.instance.emit('error', e));
  }

  async send (data) {
    return new Promise(async (resolve, reject) => {
      let id = this.generateID();
      if (!this.instance || this.instance.readyState !== WebSocket.OPEN) {
        let open = await this.open();
        if (!open) return reject('FAIL 504');
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
    }).catch((e) => this.instance.emit('error', e));
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

  async onMessage (message) {
    if (typeof message === 'undefined') {
      return false;
    }
    let probe = message.split(' ');
    let command = probe.shift();
    message = probe.shift();

    switch (command) {
      case 'LPN':
        let [ board, thread, id ] = message.split(':');
        let pattern = [ `/${board}` ];
        if (thread) pattern.push(`${pattern[0]}/res/${thread}`);
        SD.set(['lastPostNumbers', board], id || thread);
        await Templating.rerender(pattern);
        return true;
      default:
        return false;
    }
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
