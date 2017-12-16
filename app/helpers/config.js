const Figurecon = require('figurecon');
const packageJSON = require('../../package.json');

let config = {
  foxtan: {
    use: 'websocket', // http | websocket
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
    enableStatic: true,
    version: packageJSON['version'],
    logger: console.log
  },
  site: {
    protocol: 'http',
    domain: '0.0.0.0:8080', // 'tuderi.tumba.ch',
    pathPrefix: '',
    locale: 'ru',
    dateFormat: 'DD.MM.YYYY HH:mm',
    timeOffset: 180
  }
};

module.exports = new Figurecon(__dirname + "/../../config.js", config);
