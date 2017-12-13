const request = require('minimal-request-promise');
const config = require('../../../helpers/config');
const Tools = require('../../../helpers/tools');

const defaultOptions = {
  headers: {
    'User-Agent': 'Kuri/' + config('server.version'),
    //'Accept-Encoding': 'gzip, deflate, br' // TODO: Support compression
  },
  timeout: 5000
};

let Request = module.exports = {};

Request.get = async function (url, options) {
  console.log(`FXTN GET: ${url}`);
  return await defaultRequest('get', url, options);
};

Request.post = async function (url, body, options) {
  if (arguments.length > 2) {
    options.body = JSON.stringify(body);
  } else {
    options = body;
  }
  options['Content-Length'] = options.body.length;
  return await defaultRequest('post', url, options);
};

function defaultRequest(type, url, options) {
  options = Tools.merge(defaultOptions, options);

  return request[type](url, options).then(function(response){
      if (/application\/json/.test(response.headers['content-type'])) {
        try {
          response.body = JSON.parse(response.body);
        } catch (e) {
          //
        }
      }
      return response;
    })
    .catch(error => {
      //
    });
}
