const WS = require('./request');
const config = require('../../../helpers/config');
const Logger = require('../../../helpers/logger');
const Tools = require('../../../helpers/tools');

const Foxtan = config('foxtan.websocket.protocol') + '://' +
    config('foxtan.websocket.host') + ':' +
    config('foxtan.websocket.port') + '/' +
    config('foxtan.websocket.suffix');

let API = module.exports = {};

let commands = {
  sync: 'SYNC',
  getBoards: 'GET BOARDS',
  getCounters: 'GET LPN', //
  getBoard: 'BOARD $1 INFO',
  getPage: 'BOARD $1 $2',
  getPageCount: 'BOARD $1 COUNT',
  getFeed: 'BOARD $1 FEED',
  getCatalog: 'BOARD $1 CAT',
  getThread: 'THREAD $1:$2',
  getPost: 'POST $1:$2'
};

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
    Logger.debug(`[WS] Receiving ${link}...`);
    let out = await Request.send(link);
    Logger.debug(`[WS] Received: ${out}`);
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

API.getThread = (boardName, threadNumber) => {
  return APIPlaceholder(commands['getThread'])(boardName, threadNumber)
    .then(thread => {
      if (typeof thread === 'string' && thread.indexOf('410') > -1) {
        throw [boardName, threadNumber];
      }
      thread.posts = parseDateInPosts(thread.posts);
      return thread;
    })
};

API.getPage = (boardName, threadNumber) => {
  return APIPlaceholder(commands['getPage'])(boardName, threadNumber)
    .then(page => {
      let threads = page.threads;
      let threadsCount = threads.length;
      for (let i = 0; i < threadsCount; i++) {
        threads[i].posts = parseDateInPosts(threads[i].posts);
      }
      return page;
    })
};

function parseDateInPosts(posts) {
  if (!Array.isArray(posts)) {
    posts = [ posts ];
  }
  let postsCount = posts.length;
  for (let i = 0; i < postsCount; i++) {
    posts[i].createdAt = new Date(posts[i].createdAt);
    posts[i].formatted_date = Tools.parseDate(posts[i].createdAt);
  }
  return posts;
}
