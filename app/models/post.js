const API = require('./foxtan/websocket');

const Board = require('./board');

let Post = module.exports = {};

Post.threads = {};

Post.getOne = async (board, postNumber) => {
  if (!Board.exists(board)) {
    return new Error(`There's no board called ${board}`);
  }
  let post = await API.getPost(board, postNumber).catch(
    // TODO: update thread and pages
  );
  if (!post) {
    return new Error(`There's no such post: ${board}/${postNumber}`);
  }
  return post;
};
