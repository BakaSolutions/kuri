const router = require('koa-router')();
const Controller = require('../index');
const Logger = require('../../helpers/logger');
const Render = require('../../helpers/render');

module.exports = router;

router.paths = ['/', '/index.html'];

router.render = async path => {
  return Render.renderPage('pages/home', {
    title: 'Home &mdash; Kuri',
    mainStylesheet: 'home.css'
  });
};

router.init = () => {
  Logger.debug(`[HTTP] Add ${router.paths.join(', ')} to routes...`);
  router.get(router.paths, async ctx => {
    Controller.success(ctx, await router.render(ctx.originalUrl));
  });
};
