const router = require('koa-router')();
const Controller = require('../index');
const Logger = require('../../helpers/logger');
const Render = require('../../helpers/render');
const Tools = require('../../helpers/tools');
const BoardModel = require('../../models/board');

module.exports = router;

router.paths = [];

router.render = async path => {
  // /test/0.html [ '', 'test', '0.html' ]
  let [board, pageNumber] = path.replace('.html', '').split('/').slice(1);

  let model = {
    board: BoardModel.getOne(board),
    threads: []
  };
  let page = await BoardModel.getPage(board, +pageNumber || 0);
  if (Tools.isObject(page)) {
    model = Object.assign(model, page);
  }
  return Render.renderPage('pages/board', model);
};

router.init = async () => {
  let boards = BoardModel.get(true);
  boards = Object.keys(boards);
  Logger.debug('Boards: ', boards);

  for (let i = 0; i < boards.length; i++) {
    await router.add({
      board: boards[i]
    });
  }
};

router.add = async ({board} = {}) => {
  if (!BoardModel.exists(board)) {
    return new Error();
  }
  let pattern = [
    `/${board}`,
    `/${board}/`,
    `/${board}/catalog`,
    `/${board}/feed`,
  ];
  Logger.debug(`[HTTP] Add ${pattern.join(', ')} to routes...`);

  let pageCount = await BoardModel.getPageCount(board);
  for (let i = 0; i < pageCount; i++) {
    let uri = `/${board}/${i || 'index'}.html`;
    Logger.debug(`[HTTP] Add ${uri} to routes...`);
    pattern.push(uri);
  }

  router.paths.push(pattern);
  router.get(pattern, async ctx => {
    Controller.success(ctx, await router.render(ctx.originalUrl));
  });
};
