const Markup = require('../helpers/markup');
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
  return await Post.markup(post);
};

Post.markup = async posts => {
  if (!Array.isArray(posts)) {
    posts = [ posts ];
 }
  for (let i = 0; i < posts.length; i++) {
    let {rawText, boardName, threadNumber, number} = posts[i];
    posts[i].text = await Markup.process(rawText, boardName, threadNumber, number);
  }
  return (posts.length === 1)
    ? posts[0]
    : posts;
};
