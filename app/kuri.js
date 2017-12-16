const Koa = require('koa');
let app = new Koa();
const config = require('./helpers/config');
const routes = require('./routes');
const server = require('http').createServer();
const Board = require('./models/board');
const Render = require('./render');
const Logger = require('./helpers/logger');

process.on('uncaughtException', function (err) {
  console.error('uncaughtException: ', err.message);
  console.error(err.stack);
  process.exit(1);
});

async function initMaster() {
  app = await routes.initHTTP(app);
  await Render.compileTemplates();
  await Render.reloadTemplates();
  let sync = await Board.sync();
  if (!sync) {
    Logger.warn('Foxtan is unreachable. Start Foxtan and sync manually a bit later.');
  }
}

async function initWorker() {
  server.on('request', app.callback());

  let listen = [];
  if (config('server.output') === 'socket') {
    listen.push(config('server.socket'), ready.bind(this, config('server.socket')));
  } else {
    listen.push(
        config('server.port'),
        config('server.host'),
        ready.bind(this, `http://${config('server.host')}:${config('server.port')}`)
    );
  }
  server.listen(...listen);
}

function ready(address) {
  Logger.success('[HTTP] Catching requests on ' +address + '!');
}

(async function () {
  await initMaster();
  await initWorker();
})();
