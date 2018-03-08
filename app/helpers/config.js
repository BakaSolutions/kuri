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
    http: {
      host: 'tuderi.tumba.ch',
      port: 48596,
      protocol: 'https',
      suffix: ''
    },
    websocket: {
      host: 'tuderi.tumba.ch',
      port: 48596,
      protocol: 'wss',
      suffix: 'ws'
    }
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
    protocol: 'http',
    domain: '0.0.0.0:8080',
    timeOffset: 180
  }
};

module.exports = new Figurecon(__dirname + "/../../config.js", config);
