const http = require('http');
const conditional = require('koa-conditional-get');
const etag = require('koa-etag');

const Controllers = module.exports = {};

const Tools = require('../helpers/tools');
const config = require('../helpers/config');
const FS = require('../helpers/fs');
const Logger = require('../helpers/logger');
const Render = require('../helpers/render');

const Model = require('../models');

/**
 * Inits controllers: requires all .js from /controllers/http/ and sets routers
 * @param app
 */
Controllers.initHTTP = async app => {
  Controllers.routers = [];

  // handler for caching
  if (!config('server.static.generate')) {
    app.use(conditional());
    app.use(etag());
  }

  if (!config('server.static.external')) {
    if (Tools.moduleAvailable('koa-static')) {
      const Static = require('koa-static');
      app.use(Static(__dirname + '/../../public', {
        //maxage: 5 * 60 * 1000 TODO: remove maxage at all
      }));
    } else {
      Logger.warn(
          'Чтобы использовать Kuri без Nginx, установите модуль koa-static:\n\n' +
          '\x1b[36m    npm i koa-static --optional \x1b[0m или \x1b[36m yarn add koa-static -O\x1b[0m\n\n'
      );
    }

    app.use(async (ctx, next) => {
      ctx.set('Access-Control-Allow-Origin', '*');
      ctx.set('Access-Control-Allow-Headers', 'X-Requested-With');
      await next();
    });
  }

  // handle errors
  app.use(async (ctx, next) => {
    try {
      await next();
      const status = ctx.status || 404;
      if (status === 404 && !ctx.body) {
        throw {
          status
        };
      }
    } catch (err) {
      return (err instanceof Error)
          ? ctx.app.emit('error', err, ctx)
          : errorHandler(err, ctx, false);
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

  app.on('error', errorHandler);

  return app;
};

function errorHandler(err, ctx, isError = true) {
  if (isError && /^E(PIPE|CONNRESET)$/.test(err.code)) {
    return;
  }

  const status = err.status || 500;

  if (status >= 500) {
    Logger.error('[ERR] ' + ctx.header.host + ctx.url + ' ' + status + '/' + ctx.status, err.message, err.stack);

    if (isError && config('debug.enable')) {
      err.stack = err.stack.replace(new RegExp(FS.ROOT, 'g'), '') || err;
    } else {
      delete err.stack;
    }
  }

  return Controllers.fail(ctx, err);
}

Controllers.isAJAXRequested = ctx => ctx.headers["X-Requested-With"] === "XMLHttpRequest";

Controllers.success = (ctx, out) => {
  if (!out) {
    return ctx.throw(404);
  }
  ctx.body = out;
};

Controllers.fail = (ctx, out, templateName = 'pages/error') => {
  ctx.status = out
    ? out.status || 500
    : 500;

  if (out instanceof Error) {
    out = Object.assign({}, out);
  }
  out.error = out.error || http.STATUS_CODES[ctx.status];

  if (!Controllers.isAJAXRequested(ctx)) {
    ctx.type = 'text/html';
    out.debug = config('debug.enable');
    return ctx.body = Render.renderPage(templateName, out);
  }
  return ctx.throw(code, out.message, out);
};
