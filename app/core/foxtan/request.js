const request = require('minimal-request-promise');
const config = require('../../helpers/config');
const Tools = require('../../helpers/tools');

const Foxtan = config('foxtan.protocol') + '://' + config('foxtan.host') + ':' + config('foxtan.port') + '/';
const defaultOptions = {
  headers: {
    'User-Agent': 'Kuri/' + config('server.version'),
    //'Accept-Encoding': 'gzip, deflate, br' // TODO: Support compression
  },
  timeout: 5000
};

let Request = module.exports = {};

Request.get = async function (url, options) {
  console.log('get', Foxtan + url);
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

  return request[type](Foxtan + url, options)
    .then(function(response){
      if (/application\/json/.test(response.headers['content-type'])) {
        try {
          response.body = JSON.parse(response.body);
        } catch (e) {
          //
        }
      }
      return response;
    })
    .catch(function(error) {
      //if (error instanceof Error)
        //console.log(4242424, error);
        //return Promise.reject(error);
      //return error;
    });
}
