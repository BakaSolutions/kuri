const WS = require('./index');
const config = require('../../../helpers/config');

let API = module.exports = {};

let commands = {
  sync: 'SYNC',
  getBoards: 'GET BOARDS',
  getCounters: 'GET LPN',
  getBoard: 'BOARD $1 INFO',
  getPage: 'BOARD $1 $2',
  getPageCount: 'BOARD $1 COUNT',
  getFeed: 'BOARD $1 FEED',
  getCatalog: 'BOARD $1 CAT',
  getThread: 'THREAD $1:$2',
  getPost: 'POST $1:$2'
};

const Foxtan = config('foxtan.websocket.protocol') + '://' +
    config('foxtan.websocket.host') + ':' +
    config('foxtan.websocket.port') + '/' +
    config('foxtan.websocket.suffix');
let Request = new WS(Foxtan);

for (let cmd in commands) {
  API[cmd] = APIPlaceholder(commands[cmd]);
}

function APIPlaceholder(url) {
  return async function defaultFunctionForAPI() {
    let link = url;
    let args = [...arguments];
    for (let i = 0; i < args.length; i++) {
      link = link.replace('$' + (i + 1), args[i]);
    }
    let out = await Request.send(link);
    try {
      out = JSON.parse(out);
    } catch (e) {
      //
    }
    return out
      ? out
      : [];
  };
}
