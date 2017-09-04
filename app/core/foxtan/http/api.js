const Request = require('./request');
const config = require('../../../helpers/config');

let API = module.exports = {};

let paths = {
  sync: 'syncData.json',
  getBoards: 'boards.json',
  getCounters: 'lastPostNumbers.json',
  getBoard: '$1/board.json',
  getPage: '$1/$2.json',
  getPageCount: '$1/pageCount.json',
  getFeed: '$1/feed.json',
  getCatalog: '$1/catalog.json',
  getThread: '$1/res/$2.json',
  getPost: 'api/post.get?boardName=$1&postNumber=$2'
};

const Foxtan = config('foxtan.http.protocol') + '://' +
    config('foxtan.http.host') + ':' +
    config('foxtan.http.port') + '/' +
    config('foxtan.http.suffix');
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
