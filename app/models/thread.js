const API = require('./foxtan/websocket');

const Board = require('./board');
const Post = require('./post');

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
  await Post.markup(thread.posts);
  return thread;
};
