const router = require('koa-router')();
const Controller = require('../index');
const Logger = require('../../helpers/logger');
const Render = require('../../helpers/render');
const Tools = require('../../helpers/tools');

const Model = require('../../models');
const PostModel = require('../../models/post');

module.exports = router;

router.paths = ['/redirect'];

router.render = async (path, model) => {
  model = Object.assign(model, {
    title: `Redirect to /${model.boardName}/${model.postNumber}...`
  });
  return Render.renderPage('pages/redirect', model);
};

router.init = () => {
  Logger.debug(`[HTTP] Add ${router.paths.join(', ')} to routes...`);
  router.get(router.paths, async ctx => {
    let [boardName, postNumber] = ctx.originalUrl.replace('/redirect?i=', '').split('/');
    let refresh = 0;

    const LPN = Model.getLastPostNumbers(boardName);
    if (!LPN) {
      return Controller.fail(ctx, {
        status: 400
      });
    }

    if (LPN < +postNumber) {
      refresh = ctx.params.r++ || 1;
    } else {
      let post = await PostModel.getOne(boardName, postNumber);

      if (!Tools.isObject(post)) {
        return Controller.fail(ctx, {
          status: 404
        });
      }

      if (post.threadNumber) {
        return ctx.redirect(`/${boardName}/res/${post.threadNumber}.html#${postNumber}`);
      }
    }

    let model = {
      boardName,
      postNumber,
      refresh
    };

    Controller.success(ctx, await router.render(ctx.originalUrl, model));
  });
};
