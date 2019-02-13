const router = require('koa-router')();
const Controller = require('../index');
const Event = require('../../helpers/event');
const Logger = require('../../helpers/logger');
const Render = require('../../helpers/render');
const Model = require('../../models');
const BoardModel = require('../../models/board');
const ThreadModel = require('../../models/thread');

module.exports = router;

router.paths = [];

router.render = async path => {
  // /test/res/12.html [ '', 'test', 'res', '12' ]
  let [board, _, threadNumber] = path.replace('.html', '').split('/').slice(1);

  let model = {
    board: BoardModel.getOne(board),
    thread: await ThreadModel.getOne(board, threadNumber)
  };
  let opPost = model.thread.posts[0];
  model.title = (opPost.subject)
    ? opPost.subject
    : `/${model.board.name}/${model.thread.number}`;
  return Render.renderPage('pages/thread', model);
};

router.init = () => {
  let threadNumbers = Model.getThreadNumbers();
  if (!threadNumbers) {
    return;
  }

  let boards = Object.keys(threadNumbers);

  for (let i = 0; i < boards.length; i++) {
    let threads = threadNumbers[boards[i]];
    Logger.debug(`Threads on ${boards[i]}: `, threads);
    for (let j = 0; j < threads.length; j++) {
      router.add({
        board: boards[i],
        thread: threads[j]
      });
    }
  }
};

router.add = ({board, thread} = {}) => {
  if (!board || !thread) {
    return new Error();
  }
  let pattern = `/${board}/res/${thread}.html`;
  Logger.debug(`[HTTP] Add ${pattern} to routes...`);

  if (router.paths.includes(pattern)) {
    Logger.debug(`[HTTP] Route ${pattern} is already added!`);
    return;
  }

  router.paths.push(pattern);
  router.get(pattern, async ctx => {
    Controller.success(ctx, await router.render(ctx.originalUrl));
  });
};

Event.on(`websocket.cmd.RNDR`, async ([boardName, threadNumber]) => {
  router.add({
    board: boardName,
    thread: threadNumber
  });
});
