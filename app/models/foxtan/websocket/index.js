const WS = require('./request');
const config = require('../../../helpers/config');
const Logger = require('../../../helpers/logger');
const Tools = require('../../../helpers/tools');

const Foxtan = config('foxtan.websocket.href');

let API = module.exports = {};

let commands = {
  init: 'INIT',
  sync: 'SYNC',
  getBoards: 'GET BOARDS',
  getCounters: 'GET LPN', //
  getBoard: 'BOARD $1 INFO',
  getPage: 'BOARD $1 $2 $3 $4 $5',
  getPageCount: 'BOARD $1 COUNT $2',
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
    let matches = link.match(/\$[0-9]/g) || [];
    for (let i = 0; i < matches.length; i++) {
      link = link.replace(matches[i], typeof arguments[i] === 'undefined' ? '' : arguments[i]);
    }
    Logger.debug(`[WS] Receiving ${link}...`);
    let out = await Request.send(link).catch(e => {return e});
    Logger.debug(`[WS] Received on "${link}":`);
    Logger.debug(out);
    try {
      out = JSON.parse(out);
    } catch (e) {
      Logger.debug(`JSON parse error: ${link} -> ${out}`);
    }
    return out;
  };
}

API.getThread = (boardName, threadNumber) => {
  return APIPlaceholder(commands['getThread'])(boardName, threadNumber)
    .then(thread => {
      if (typeof thread === 'string') {
        throw [boardName, threadNumber];
      }
      thread.posts = parseDateInPosts(thread.posts);
      return thread;
    })
};

API.getPage = (boardName, pageNumber, limit = config('foxtan.threadsPerPage'), lastReplies = config('foxtan.lastReplies'), lastRepliesForFixed = config('foxtan.lastRepliesFixed')) => {
  return APIPlaceholder(commands['getPage'])(boardName, pageNumber, limit, lastReplies, lastRepliesForFixed)
    .then(page => {
      let threads = page.threads;
      if (!threads) {
        return page;
      }
      let threadsCount = threads.length;
      for (let i = 0; i < threadsCount; i++) {
        parseDateInPosts(threads[i].posts);
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
    posts[i].createdAt = new Date(posts[i].createdAt).toUTCString();
    posts[i].formatted_date = Tools.parseDate(posts[i].createdAt);
  }

  return posts;
}
