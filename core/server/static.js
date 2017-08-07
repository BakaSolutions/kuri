'use strict';

const fs = require('fs');
const path = require('path');
const mime = require('mime');
const watch = require('node-watch');
const Compress = require('./compress');
const FS = require('../../helpers/fs');

module.exports = function(router, folder, basePath) {
  basePath = basePath || '/';

  watch(folder, { recursive: true }, function(evt, name) {
    let uri = name.replace(folder, '');
    if (evt === 'remove') {
      router.remove('get', uri);
    } else if (evt === 'update') {
      let file = {
        virt: uri,
        real: name
      };
      router.get(uri, staticRouter(file));
    }
  });

  function readdirSync(dir, serverPath) {
    let out = [{
      virt: serverPath,
      real: dir
    }];

    let files = FS.readdirSync(dir);
    console.log(files);
    files = fs.readdirSync(dir);
    console.log(files);
    let stats;

    files.forEach(function (file) {
      stats = fs.lstatSync(path.join(dir, file));
      if (file.substr(0, 1) === '.') {
        return false;
      }
      if(stats.isDirectory()) {
        let newDir = path.join(dir, file).replace(dir, '') + '/';
        out = out.concat(readdirSync(path.join(dir, file), newDir));
      } else {
        out.push({
          virt: serverPath + file,
          real: path.join(dir, file)
        });
      }
    });
    return out;
  }

  let files = readdirSync(folder, basePath);

  for (let i = 0; i < files.length; i++) {
    (function(i) {
      let file = files[i];
      router.get(file.virt, staticRouter(file));
    })(i);
  }
};

function staticRouter(file) {
  return function (req, res) {
    let getFile = file;

    if (file.virt.substr(file.length - 1) === '/') {
      getFile = {
        virt: file.virt + '/index.html',
        real: file.real + '/index.html'
      };
    }

    let headers = {
      'Content-Type': mime.lookup(getFile.real)
    };
    res.writeHead(200, headers);
    FS.readFileStream(getFile.real, res);
    /*fs.readFile(getFile.real, function (err, data) {
      if (err) {
        res.statusCode = 404;
        return res.end('404!');
      }

      Compress(req, data, function (err, compressed, encoding) {
        if (err) {
          res.statusCode = 500;
          return res.end('500!');
        }

        let headers = {
          'Content-Type': mime.lookup(getFile.real)
        };

        if (encoding) {
          headers['Content-Encoding'] = encoding;
        }

        res.writeHead(200, headers);
        res.end(compressed);
      });
    });*/
  }
}
