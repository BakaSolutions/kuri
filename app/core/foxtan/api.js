const Request = require('./request');

let API = module.exports = {};
let paths = {
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

for (let path in paths) {
  API[path] = APIPlaceholder(paths[path]);
}

function APIPlaceholder(url) {
  return async function defaultFunctionForAPI() {
    let link = url;
    let args = Array.prototype.slice.call(arguments);
    for (let i = 0; i < args.length; i++) {
      link = link.replace('$' + (i + 1), args[i]);
    }
    let out = await Request.get(link);
    return out
      ? out.body
      : [];
  };
}
