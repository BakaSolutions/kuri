const Koa = require('koa');
const config = require('./helpers/config');
const routes = require('./routes');
const Event = require('./helpers/event');
const Logger = require('./helpers/logger');
const Render = require('./helpers/render');

const server = require('http').createServer();
let app = new Koa();

Event.emit(`websocket.online`);
Event.on('sync.synced', async () => {
  if (config('server.compileTemplatesOnStartup')) {
    await Render.compileTemplates();
  }
  await Render.loadTemplates();
  await routes.initHTTP(app);
});

let listen = [];
if (config('server.output') === 'socket') {
  listen.push(config('server.socket'), ready.bind(this, config('server.socket')));
} else {
  listen.push(
      config('server.port'), config('server.host'),
      ready.bind(this, `http://${config('server.host')}:${config('server.port')}`)
  );
}
server.on('request', app.callback());
server.listen(...listen);

function ready(address) {
  Logger.success('[HTTP] Catching requests on ' +address + '!');
}
