const Controllers = module.exports = {};

const Tools = require('../helpers/tools');
const config = require('../helpers/config');

/**
 * Inits controllers: requires all .js from /controllers/http/ and sets routers
 * @param app
 */
Controllers.initHTTP = async app => {
  Controllers.routers = [];

  if (config('server.enableStatic')) {
    if (Tools.moduleAvailable('koa-static')) {
      const Static = require('koa-static');
      app.use(Static(__dirname + '/../../public'));
    } else {
      console.warn(
          '\x1b[35mЧтобы использовать Foxtan без Nginx, установите модуль koa-static:\x1b[0m\n\n' +
          '\x1b[36m    npm i koa-static --optional \x1b[0m или \x1b[36m yarn add koa-static -O\x1b[0m\n\n'
      );
    }
  }

  app.use(async (ctx, next) => {
    try {
      if (!config('server.enableStatic')) {
        ctx.set('Access-Control-Allow-Origin', '*');
      }
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = config('debug') && ctx.status >= 500
          ? '<pre>\n' + (err.stack || err) + '\n</pre>'
          : {error: err.name, message: err.message};
      ctx.app.emit('error', err, ctx);
    }
  });

  app.use(async (ctx, next) => {
    const start = +new Date;
    await next();
    const ms = +new Date - start;
    ctx.set('X-Response-Time', `${ms} ms`);
    if (config('debug') && config('debugOptions.logRequests')) {
      console.log(`[${ctx.method}] ${ctx.url} - ${ms}`);
    }
  });

  let plugins = await Tools.requireAll('routes/http', /\.js$/);
  for (let i = 0; i < plugins.length; i++) {
    app.use(plugins[i].routes());
    app.use(plugins[i].allowedMethods());
    Controllers.routers.push(plugins[i]);
  }

  app.on('error', (err, ctx) => {
    if (ctx.status >= 500) {
      console.log('[ERR]', ctx.header.host, ctx.status, ctx.url, err.message);
    }
  });

  return app;
};

Controllers.success = (ctx, out) => {
  if (out === null) {
    return ctx.throw(404);
  }
  ctx.body = out;
};

Controllers.fail = (ctx, out) => {
  return ctx.throw(500, out);
};
