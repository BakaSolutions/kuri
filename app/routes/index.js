const Controllers = module.exports = {};

const Tools = require('../helpers/tools');
const config = require('../helpers/config');
const Logger = require('../helpers/logger');
const Render = require('../helpers/render');

const Model = require('../models');

/**
 * Inits controllers: requires all .js from /controllers/http/ and sets routers
 * @param app
 */
Controllers.initHTTP = async app => {
  Controllers.routers = [];

  if (!config('server.static.external')) {
    if (Tools.moduleAvailable('koa-static')) {
      const Static = require('koa-static');
      app.use(Static(__dirname + '/../../public'));
    } else {
      Logger.warn(
          'Чтобы использовать Foxtan без Nginx, установите модуль koa-static:\n\n' +
          '\x1b[36m     npm i koa-static --optional \x1b[0m или \x1b[36m yarn add koa-static -O\x1b[0m\n\n'
      );
    }
  }

  // handle errors
  app.use(async (ctx, next) => {
    try {
      if (!config('server.static.external')) {
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Headers', 'X-Requested-With');
      }
      await next();
      const status = ctx.status || 404;
      if (status === 404) {
        ctx.throw(404)
      }
    } catch (err) {
      return ctx.app.emit('error', err, ctx);
    }
  });

  // handler for timing header
  app.use(async (ctx, next) => {
    const start = +new Date;
    await next();
    const ms = +new Date - start;
    ctx.set('X-Response-Time', `${ms} ms`);
    if (config('debug.enable') && config('debug.log.requests')) {
      Logger.info(`[${ctx.method}] ${ctx.url} - ${ms}`);
    }
  });

  Logger.info('[HTTP] Initing paths...');
  let plugins = await Tools.requireAll('routes/http', /\.js$/);
  for (let i = 0; i < plugins.length; i++) {
    await plugins[i].init();
    app.use(plugins[i].routes());
    app.use(plugins[i].allowedMethods());
    Controllers.routers.push(plugins[i]);
  }
  Logger.info('[HTTP] Paths are inited.');

  app.on('error', (err, ctx) => {
    const status = err.status || 500;
    let out = '';

    if (status >= 500) {
      Logger.error('[ERR]', ctx.header.host, ctx.status, ctx.url, err.message);
    }

    if (Controllers.isAJAXRequested(ctx)) {
      out = {
        error: err.name,
        message: err.message
      };

      if (config('debug.enable') && ctx.status >= 500) {
        out.stack = err.stack || err;
      }
    } else {
      out = Render.renderPage('pages/error', err);
    }
    ctx.body = out;
  });

  return app;
};

Controllers.isAJAXRequested = ctx => ctx.headers["X-Requested-With"] === "XMLHttpRequest";

Controllers.success = (ctx, out) => {
  if (!out) {
    return ctx.throw(404);
  }
  ctx.body = out;
};

Controllers.fail = (ctx, out) => {
  let code = out
    ? out.status || 500
    : 500;
  return ctx.throw(code, out.message, out);
};
