const http = require('http');
const config = require('./helpers/config');
const Renderer = require('./core/templating');
const controllers = require('./controllers');
const Board = require('./core/kuri/board');

process.on('uncaughtException', function (err) {
  console.error('uncaughtException: ', err.message);
  console.error(err.stack);
  process.exit(1);
});

async function initMaster() {
  await Renderer.compileTemplates();
  await Renderer.reloadTemplates();
  await Board.syncBoards();
  await Renderer.rerender();
  /*if (config('system.rerenderCacheOnStartup')) {
    await Renderer.rerender();
  }*/
}

async function initWorker() {
  await Renderer.reloadTemplates();
  let server = http.createServer(controllers);
  if (config('server.output') === 'unix') {
    server.listen(config('server.socket'), onListening(config('server.socket')));
  } else {
    server.listen(config('server.port'), config('server.host'), onListening(`http://${config('server.host')}:${config('server.port')}`));
  }
}

function onListening(address) {
  console.log('Catching requests on ' +address + '!');
}

(async function () {
  controllers.initialize();
  await initMaster();
  await initWorker();
})();
