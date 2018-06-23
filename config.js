// Edit this file due to app/helpers/config.js.

// You can require any files for the config.
const URL = require('url');

module.exports = {
  debug: {
    enable: false
  },
  foxtan: {
    http: URL.parse('https://tuderi.tumba.ch:48596/'),
    websocket: URL.parse('wss://tuderi.tumba.ch:48596/ws'),
  },
  server: {
    port: 8080
  }
};
