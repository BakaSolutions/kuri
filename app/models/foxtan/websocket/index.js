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
  getPageCount: 'COUNT THREADS $1 $2',
  getFeed: 'BOARD $1 FEED $2 $3',
  getFeedCount: 'COUNT POSTS $1 $2',
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
    link = link.trim();
    Logger.debug(`[WS] Requesting ${link}...`);
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

API.getThread = async (boardName, threadNumber) => {
  let out = {};
  try {
    out = await APIPlaceholder(commands['getThread'])(boardName, threadNumber);
    out.posts = parseDataInPosts(out.posts);
  } catch (e) {
    Object.assign(out, e);
  }
  return out;
};

API.getPage = async (boardName, pageNumber, limit = config('foxtan.threadsPerPage'), lastReplies = config('foxtan.lastReplies'), lastRepliesForFixed = config('foxtan.lastRepliesFixed')) => {
  let out = {};
  try {
    out = await APIPlaceholder(commands['getPage'])(boardName, pageNumber, limit, lastReplies, lastRepliesForFixed);
    let threads = out.threads;
    if (!threads) {
      return out;
    }
    let threadsCount = threads.length;
    for (let i = 0; i < threadsCount; i++) {
      parseDataInPosts(threads[i].posts);
    }
  } catch (e) {
    Object.assign(out, e);
  }
  return out;
};

API.getFeed = async (boardName, pageNumber, limit = config('foxtan.threadsPerPage')) => {
  let out = {};
  try {
    out = await APIPlaceholder(commands['getFeed'])(boardName, pageNumber, limit);
    let posts = out.feed;
    if (!posts) {
      return out;
    }
    parseDataInPosts(posts);
  } catch (e) {
    Object.assign(out, e);
  }
  return out;
};

function parseDataInPosts(posts) {
  if (!Array.isArray(posts)) {
    posts = [ posts ];
  }
  let postsCount = posts.length;
  for (let i = 0; i < postsCount; i++) {
    posts[i].createdAt = new Date(posts[i].createdAt).toUTCString();
    posts[i].formatted_date = Tools.parseDate(posts[i].createdAt);

    if (posts[i].files) {
      for (let file of posts[i].files) {
        let unit = file.size > 1048575 ? "MiB" : "KiB";
        file.size = +(file.size / (unit === "MiB" ? 1048576 : 1024)).toFixed(1) + ' ' + unit;

        if (file.nsfw) {
          delete file.thumb;
        }
      }
    }
  }

  return posts;
}
