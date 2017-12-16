const WebSocket = require('ws');
const RenderUpdate = require('../../../render/update');
const Logger = require('../../../helpers/logger');
const Pledge = require('../../../helpers/promise');

class WSClient {

  constructor (url) {
    this.reconnects = 0;
    this.autoReconnectInterval = 0;
    this.url = url;
  }

  async open () {
    return new Pledge((resolve, reject) => {
      this.instance = new WebSocket(this.url);
      this.instance.on('open', async () => {
        await this.onOpen();
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
      });
      this.instance.on('error', (e) => this.onError(e));
    }).catch(e => this.onError(e));
  }

  async send (data) {
    return new Pledge(async (resolve, reject) => {
      let id = this.generateID();
      if (!this.instance || this.instance.readyState !== WebSocket.OPEN) {
        let open = await this.open();
        if (!open) return reject('FAIL 504');
      }
      this.instance.send(data + id);

      let promiseWrapper = (data) => {
        this.instance.removeEventListener('message', promiseWrapper);
        if (~data.indexOf(id)) {
          data = data.replace(id, '');
          return resolve(data);
        }
      };
      this.instance.on('message', promiseWrapper);

      setTimeout(function () {
        reject('FAIL 504')
      }, 5000);
    }, true).catch(e => {
      if (e instanceof Error) {
        this.send(data);
      }
      this.onError(e);
    });
  }

  reconnect (e) {
    this.autoReconnectInterval = 5 * 1000 * (++this.reconnects);
    Logger.info(`[WS] Code ${e}, retry in ${this.autoReconnectInterval} ms`);
    setTimeout(async () => {
      Logger.info("[WS] Reconnecting...");
      await this.open(1);
    }, this.autoReconnectInterval);
  }

  async onOpen (sync) {
    this.reconnects = 0;
    Logger.success(`[WS] Connection to ${this.url} is opened.`);
    if (sync) {
      const Board = require('../../../models/board');
      await Board.sync();
    }
  }

  async onMessage (message) {
    if (typeof message === 'undefined') {
      return false;
    }
    message = message.replace(/@\d+$/, '');
    let probe = message.split(' ');
    let command = probe.shift();
    message = probe.shift();

    if (command === 'RNDR') {
      try {
        let [board, thread, id] = JSON.parse(message);
        await RenderUpdate.update(board, thread, id);
      } catch (e) {
        //
      }
    }
  }

  onError (e) {
    if (!(e instanceof Error)) {
      let message = e.split(' ');
      let command = message.shift();
      message = message.join(' ');

      if (command === 'FAIL') {
        switch (+message) {
          case 404:
            message = 'Not found!';
            break;
          case 504:
            message = 'Timeout!';
            break;
        }
      }
      e = message;
    }
    Logger.error(e);
  }

  onClose (code) {
    Logger.info(`[WS] Connection to ${this.url} is closed with ${code} code.`);
  }

  generateID (length = 4) {
    let text = " @";
    const possible = "0123456789abcdef";
    for(let i = 0; i < length; i++)  {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text;
  }

}

module.exports = WSClient;
