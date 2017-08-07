'use strict';

const zlib = require('zlib');

module.exports = module.exports.callback = function(req, data, cb) {
  let encoding = req.headers['accept-encoding'] || '';

  let match = encoding.match(/\b(gzip|deflate)\b/)[0];
  if (match) {
    zlib[match](data, function (err, out) {
      cb(err, out, match);
    })
  } else {
    cb(null, data, null);
  }
};

module.exports.promise = function (req, data) {
  let encoding = req.headers['accept-encoding'] || '';

  return new Promise(function (resolve, reject) {
    if (!encoding) {
      resolve(data, null);
    }

    let match = encoding.match(/\b(gzip|deflate)\b/)[0];
    if (match) {
      zlib[match](data, function (err, out) {
        if (err) reject(err, match);
        resolve(out, match);
      })
    }
    resolve(data, null);
  });
};
