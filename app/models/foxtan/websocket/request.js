const http = require('http');
const WebSocket = require('ws');
const Logger = require('../../../helpers/logger');
const Pledge = require('../../../helpers/promise');
const Event = require('../../../helpers/event');

class WSClient {

  constructor (url) {
    this.reconnects = 0;
    this.autoReconnectInterval = 0;
    this.url = url;
    this.opened = () => {
      if (!this.instance || this.instance.readyState === WebSocket.CONNECTING) {
        return false;
      }
      return this.instance.readyState === WebSocket.OPEN;
    };

    Event.on('websocket.online', () => this.open());
    Event.on('websocket.offline', () => this.close());
  }

  async open () {
    if (this.opened()) {
      return true;
    }
    return new Pledge(resolve => {
      this.instance = new WebSocket(this.url);
      this.instance.on('open', async data => {
        await this.onOpen();
        Event.emit('websocket.open', data);
        resolve();
      });
      this.instance.on('message', async data => {
        Event.emit('websocket.message', data);
        await this.onMessage(data);
      });
      this.instance.on('close', async e => {
        Event.emit('websocket.close', e);
        await this.onClose(e);
      });
      this.instance.on('error', e => this.onError);
    }).catch(e => this.onError);
  }

  async close() {
    this.instance.close(1000, 'SHUTDOWN');
  }

  async send (data) {
    return new Pledge(async (resolve, reject) => {
      setTimeout(() => {
        reject('FAIL 504')
      }, 5000);

      if (!this.opened()) {
        await this.open();
      }

      let id = this.generateID();

      try {
        this.instance.send(data + id);
      } catch (e) {
        reject(e);
      }

      let promiseWrapper = data => {
        if (data.includes(id)) {
          data = data.replace(id, '');
          this.instance.removeEventListener('message', promiseWrapper);
          if (data.includes('FAIL', 0)) {
            return reject(data);
          }
          return resolve(data);
        }
      };
      this.instance.on('message', promiseWrapper);

    }, true).catch(e => {
      if (e instanceof Error) {
        setTimeout(() => {
          this.send(data);
        }, 2500);
      }
      return this.onError(e);
    });
  }

  reconnect (code) {
    this.autoReconnectInterval = 5 * 1000 * (++this.reconnects);
    Logger.warn(`[WS] Code ${code}, reconnect in ${this.autoReconnectInterval} ms...`);
    setTimeout(async () => {
      Logger.info("[WS] Reconnecting...");
      await this.open();
    }, this.autoReconnectInterval);
  }

  async onOpen () {
    this.reconnects = 0;
    Logger.success(`[WS] Connection to ${this.url} is opened.`);
  }

  async onMessage (message) {
    if (typeof message === 'undefined' || message.match(/@[0-9a-f]+$/)) {
      return false;
    }
    let probe = message.split(' ');
    let command = probe.shift();
    message = probe.shift();

    let board, thread, id;
    try {
      [board, thread, id] = JSON.parse(message);
      Logger.debug(`Command from Foxtan: ${command} ${[board, thread, id]}`);
      Event.emit(`websocket.cmd.${command}`, [board, thread, id]);
    } catch (e) {
      Logger.debug(`Command parsing error: ${command} ${[board, thread, id]}`);
    }
  }

  onError (e) {
    let silent;
    if (!(e instanceof Error)) {
      let message = e.split(' ');
      let command = message.shift();
      message = message.join(' ');
      let status = +message;
      if (status < 500) {
        silent = true;
      }
      if (command === 'FAIL') {
        switch (status) {
          case 404:
            message = 'Not found!';
            break;
          case 410:
            message = 'Gone!';
            break;
          case 504:
            message = 'Timeout!';
            break;
        }
      }
      let error = http.STATUS_CODES[status];
      e = { status, message, error };
    }
    if (!silent) {
      Logger.error(e.message || e);
    }
    return e;
  }

  onClose (code) {
    Logger.info(`[WS] Connection to ${this.url} is closed with ${code} code.`);
    if (code !== 1000) {
      this.reconnect(code);
    }
  }

  generateID (length = 4) {
    let text = " @";
    const possible = "0123456789abcdef";
    for (let i = 0; i < length; i++)  {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text;
  }

}

module.exports = WSClient;
