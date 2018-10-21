const config = require('../helpers/config');
const Logger = require('../helpers/logger');
const Tools = require('../helpers/tools');
const API = require('./foxtan/websocket');

const Model = require('./index');
const Post = require('./post');

let Board = module.exports = {};

Board.boards = {};

Board.sync = async () => {
  let boards = await API.getBoards();
  if (!Tools.isObject(boards)) {
    return false;
  }
  Board.boards = boards;
  Model.add({base: {boards: Board.get()}});
};

Board.exists = board => !!Board.boards[board];

Board.getOne = board => Board.boards[board] || new Error(`There's no board called ${board}`);

Board.get = (asObject = false, param, value) => {
  if (!Object.keys(Board.boards).length) {
    (async () => {
      await Board.sync();
    })();
  }

  if (asObject) {
    return Board.boards;
  }

  let keys = Object.keys(Board.boards);
  let out = [];
  for (let i = 0; i < keys.length; i++) {
    if (Board.boards[keys[i]][param] === value) {
      Board.boards[keys[i]].name = keys[i];
      out.push(Board.boards[keys[i]]);
    }
  }
  return out;
};

Board.getPageCount = async (board, threadsPerPage) => {
  if (!Board.exists(board)) {
    return new Error(`There's no board called ${board}`);
  }
  if (!threadsPerPage) {
    threadsPerPage = config('foxtan.threadsPerPage');
  }
  return (await API.getPageCount(board, threadsPerPage)) || 0;
};

Board.getPage = async (board, page = 0) => {
  if (!Board.exists(board)) {
    return new Error(`There's no board called ${board}`);
  }
  if (!Tools.isNumber(page)) {
    Logger.error(new Error('Trying to get something unexpectable!'));
    return false;
  }
  return await API.getPage(board, page).then(async page => {
    if (page.error) {
        return page;
    }
    await Promise.all(page.threads.map(thread => Post.markup(thread.posts)));
    return page;
  });
};

Board.getFeed = async (board, page = 0) => {
  if (!Board.exists(board)) {
    return new Error(`There's no board called ${board}`);
  }
  if (!Tools.isNumber(page)) {
    Logger.error(new Error('Trying to get something unexpectable!'));
    return false;
  }
  return await API.getFeed(board, page).then(async page => {
    if (page.error) {
      return page;
    }
    await Post.markup(page.feed);
    return page;
  });
};
