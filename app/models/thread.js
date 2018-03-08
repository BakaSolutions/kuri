const config = require('../helpers/config');
const Logger = require('../helpers/logger');
const Tools = require('../helpers/tools');
const API = require('./foxtan/websocket');

const Board = require('./board');

let Thread = module.exports = {};

Thread.threads = {};

Thread.getOne = async (board, threadNumber) => {
  if (!Board.exists(board)) {
    return new Error(`There's no board called ${board}`);
  }
  let thread = await API.getThread(board, threadNumber).catch(
    // TODO: delete rendered thread and the path
  );
  if (!thread) {
    return new Error(`There's no such thread: ${board}/${threadNumber}`);
  }
  return thread;
};
