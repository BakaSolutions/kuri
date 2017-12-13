const Request = require('./request');
const config = require('../../../helpers/config');

const Foxtan = config('foxtan.http.protocol') + '://' +
    config('foxtan.http.host') + ':' +
    config('foxtan.http.port') + '/' +
    config('foxtan.http.suffix');

let API = module.exports = {};

let paths = {
  sync: 'api/v1/sync.data',
  getBoards: 'boards.json',
  getCounters: 'lastPostNumbers.json',
  getBoard: '$1/board.json',
  getPage: '$1/$2.json',
  getPageCount: '$1/pageCount.json',
  getFeed: '$1/feed/$2.json',
  getCatalog: '$1/catalog/recent/$3.json',
  getThread: '$1/res/$2.json',
  getPost: 'api/v1/post.read?board=$1&post=$2'
};

for (let path in paths) {
  API[path] = APIPlaceholder(paths[path]);
}

function APIPlaceholder(url) {
  return async function defaultFunctionForAPI() {
    let link = url;
    let args = [...arguments];
    for (let i = 0; i < args.length; i++) {
      link = link.replace('$' + (i + 1), args[i]);
    }
    let out = await Request.get(Foxtan + link);
    return out
        ? out.body
        : [];
  };
}

/**
 * Custom functions should be placed below, for example:
 *
 * API[<path>] = (url) => {}; // please, refer to the line 25
 *
 */
