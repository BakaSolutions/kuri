const config = require('../../helpers/config');

module.exports = {
  site: {
    protocol: config('site.protocol'),
    domain: config('site.domain'),
    pathPrefix: config('site.pathPrefix'),
    locale: config('site.locale'),
    dateFormat: config('site.dateFormat'),
    timeOffset: config('site.timeOffset'),
  },
  translate: function (arg) {
    return arg;
  },
  boards: [],
};