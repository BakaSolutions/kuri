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
    http: URL.parse('https://foxtan.tumba.ch/'),
    websocket: URL.parse('wss://foxtan.tumba.ch/ws'),
    threadsPerPage: 14,
    lastReplies: 3,
    lastRepliesFixed: 0
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
    compileTemplatesOnStartup: true,
    version: packageJSON.version,
    logger: console.log
  },
  site: {
    title: 'Kuri',
    url: URL.parse('http://0.0.0.0:8080/')
  }
};

module.exports = new Figurecon(__dirname + "/../../config.js", config);
