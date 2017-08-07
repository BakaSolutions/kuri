'use strict';

let url = require('url');

module.exports = function MiniRoute(server, opts) {
  let self = this;
  opts = opts || {notFound: true};

  this._routes = {};

  let methods = [
    'checkout',
    'connect',
    'copy',
    'delete',
    'get',
    'head',
    'lock',
    'merge',
    'mkactivity',
    'mkcol',
    'move',
    'm-search',
    'notify',
    'options',
    'patch',
    'post',
    'propfind',
    'proppatch',
    'purge',
    'put',
    'report',
    'search',
    'subscribe',
    'trace',
    'unlock',
    'unsubscribe'
  ];

  for (let i = 0; i < methods.length; i++) {
    (function(i) {
      self._routes[methods[i]] = {};
      self[methods[i]] = function(path, handler) {
        if (!self._routes[methods[i]][path]) {
          self._routes[methods[i]][path] = [];
        }
        self._routes[methods[i]][path].push(handler);
      }
    })(i);
  }

  this.remove = function(method, path, cb) {
    if (!self._routes[method][path]) {
      if (cb) cb(new Error('no such route.'));
      return;
    }
    self._routes[method][path] = null;
    delete self._routes[method][path];
    if (cb) cb(null);
  };

  server.on('request', function(req, res) {
    let method = req.method.toLowerCase();
    let path = url.parse(req.url).pathname;
    if (self._routes[method][path]) {
      for (let i = 0; i < self._routes[method][path].length; i++) {
        self._routes[method][path][i](req, res);
      }
    }
    if (opts.notFound === true && !self._routes[method][path]) {
      res.statusCode = 404;
      res.end('404!');
    }
  });
};
