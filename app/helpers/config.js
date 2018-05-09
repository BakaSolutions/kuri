const URL = require('url');
const Figurecon = require('figurecon');
const packageJSON = require('../../package.json');

let config = {
  debug: {
    enable: false,
    log: {
      requests: false
    }
  },
  foxtan: {
    http: URL.parse('https://tuderi.tumba.ch:48596/'),
    websocket: URL.parse('wss://tuderi.tumba.ch:48596/ws'),
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    output: 'port', // port | socket
    socket: '/tmp/sock',
    static: {
      generate: false,
      external: false // turn on to use nginx
    },
    version: packageJSON.version,
    logger: console.log
  },
  site: {
    url: URL.parse('http://0.0.0.0:8080/')
  }
};

module.exports = new Figurecon(__dirname + "/../../config.js", config);
