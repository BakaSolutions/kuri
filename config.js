/**
 * You can stop tracking this file by typing:
 * git update-index --assume-unchanged config.js
 *
 * To undo and start tracking again:
 * git update-index --no-assume-unchanged config.js
*/
// Edit this file due to app/helpers/config.js.
// You can require any modules for the config.
const URL = require('url');

module.exports = {
  debug: {
    enable: false
  },
  foxtan: {
    // http: URL.parse('https://tuderi.tumba.ch:48596/'),
    http: URL.parse('https://foxtan.tuderi.tumba.ch/'),
    // websocket: URL.parse('wss://tuderi.tumba.ch:48596/ws'),
    websocket: URL.parse('wss://foxtan.tuderi.tumba.ch/ws'),
  },
  server: {
    port: 8080
  }
};
