const express = require('express');
const config = require('../helpers/config');
const Tools = require('../helpers/tools');
const path = require('path');

let app = express();
let router = express.Router();

app.routers = [];

function initialize() {
  console.log('Initializing controllers...');

  router.use(async function (req, res, next) {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(ms, req.url);
    res.header('X-Response-Time', ms + 'ms');
  });

  let controllers = Tools.requireAllSync('./controllers/http', /\.js$/);
  controllers.forEach(function (controller) {
    router.use('/', controller);
    app.routers.push(controller);
  });

  if(config('server.enableStatic')) {
    app.use(express.static(path.join(__dirname, '../public')));
  }

  app.use(router);

  /*app.use('*', (req, res, next) => {
    next((function create404Error(baseUrl) {
      let err = new Error();
      err.status = 404;
      err.path = baseUrl;
      return err;
    })(req.baseUrl));
  });*/

}

app.initialize = initialize;
module.exports = app;
