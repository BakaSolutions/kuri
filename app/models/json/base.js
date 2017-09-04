const config = require('../../helpers/config');
const Board = require('../../core/kuri/board');

module.exports = {
  site: {
    protocol: config('site.protocol'),
    domain: config('site.domain'),
    pathPrefix: config('site.pathPrefix'),
    locale: config('site.locale'),
    dateFormat: config('site.dateFormat'),
    timeOffset: config('site.timeOffset'),
  },
  foxtan: {
    host: config('foxtan.http.host'),
    port: config('foxtan.http.port'),
    protocol: config('foxtan.http.protocol')
  },
  translate: function (arg) {
    return arg;
  },
  boards: Board.get(),
};