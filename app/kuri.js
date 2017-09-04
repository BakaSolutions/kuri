const http = require('http');
const config = require('./helpers/config');
const controllers = require('./controllers');
const Board = require('./core/kuri/board');

process.on('uncaughtException', function (err) {
  console.error('uncaughtException: ', err.message);
  console.error(err.stack);
  process.exit(1);
});

async function initMaster() {
  controllers.initialize();
  let sync = await Board.sync();
  if (!sync) {
    console.log('Foxtan is unreachable. Start Foxtan or come later.');
  }
}

async function initWorker() {
  //await Renderer.reloadTemplates();
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
  await initMaster();
  await initWorker();
})();
