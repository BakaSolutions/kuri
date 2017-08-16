const Figurecon = require('figurecon');
const path = require('path');
const packageJSON = require('../package.json');

let config = {
  foxtan: {
    host: 'localhost',
    port: '1337',
    protocol: 'http'
  },
  server: {
    host: 'localhost',
    port: 8080,
    output: 'port', // port | socket
    socket: '/tmp/sock',
    enableStatic: true,
    version: packageJSON['version']
  },
  site: {
    protocol: 'https',
    domain: 'tuderi.tumba.ch',
    pathPrefix: '',
    locale: 'ru',
    dateFormat: 'DD.MM.YYYY HH:mm:ss',
    timeOffset: 180
  }
};

module.exports = new Figurecon(path.join(__dirname, "/../config.js"), config);
