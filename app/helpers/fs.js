const path = require('path');
const fs = require('fs');
const Pledge = require('./promise');

let FS = module.exports = {};
const ROOT = path.join(__dirname, '/../../');

/**
 * Normalizes the path (removes all unnecessary "../")
 * @param {String} filePath
 * @returns {String}
 */
FS.normalize = function(filePath) {
  let rooted = filePath.indexOf(ROOT) === 0;
  return path.normalize(rooted
    ? filePath
    : path.join(ROOT, filePath));
};

/**
 * Checks if filePath matches with the engine's directory
 * @param {String} filePath
 * @returns {boolean}
 */
FS.check = function (filePath) {
  return filePath.indexOf(path.normalize(ROOT)) === 0;
};

/**
 * Read file synchronously with checking the filePath
 * @param {String} filePath
 * @returns {*}
 */
FS.readSync = function (filePath) {
  filePath = FS.normalize(filePath);
  if (!this.check(filePath)) {
    return false;
  }
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return false;
  }
};

/**
 * Delete file synchronously with checking the filePath
 * @param {String} filePath
 * @returns {boolean}
 */
FS.unlinkSync = function (filePath) {
  filePath = FS.normalize(filePath);
  if (!this.check(filePath)) {
    return false;
  }

  try {
    return fs.unlinkSync(filePath);
  } catch (e) {
    return false;
  }
};

/**
 * Write content into file synchronously with checking the filePath
 * @param {String} filePath
 * @param {String, Buffer} content
 * @returns {boolean}
 */
FS.writeFileSync = function (filePath, content) {
  filePath = FS.normalize(filePath);
  if (!this.check(filePath)) {
    return false;
  }

  let dir = path.parse(filePath).dir + path.sep;
  if (!this.existsSync(dir)) {
    this.mkdirSync(dir);
  }

  content = content || '';
  fs.writeFileSync(filePath, content);
  return true;
};

/**
 * Check if file exists directly
 * @param {String} filePath
 * @returns {boolean}
 */
FS.existsSync = function (filePath) {
  filePath = FS.normalize(filePath);
  let out;
  try {
    fs.accessSync(filePath, fs.constants.R_OK | fs.constants.W_OK);
    out = true;
  } catch (e) {
    out = false;
  }
  return out;
};

/**
 * Creates new folder _recursively_
 * @param {String|Array} dir
 * @returns {boolean}
 */
FS.mkdirSync = function (dir) {
  if (!Array.isArray(dir)) {
    dir = [ dir ];
  }
  if (this.existsSync(dir[0]) || dir.length < 1) {
    return true;
  }

  try {
    fs.mkdirSync(dir[dir.length - 1]);
  } catch (e) {
    let parent = dir[dir.length - 1].replace(/\/$/, '').split('/');
    parent.pop();
    parent = parent.join('/');
    dir[dir.length] = parent;
    return this.mkdirSync(dir);
  }
  dir.pop();
  if (dir.length < 1) {
    return true;
  }
  return this.mkdirSync(dir);
};

FS.readdirSync = function(dir, recursive) {
  dir = FS.normalize(dir);
  if(!this.check(dir)) {
    return false;
  }

  let results = [];
  let list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    let stat = fs.statSync(file);
    if (recursive && stat && stat.isDirectory()) {
      results = results.concat(FS.readdirSync(file, true));
    } else {
      results.push(file);
    }
  });
  return results;
};

FS.readFileStream = function (source, res) {
  source = FS.normalize(source);
  if(!this.check(source)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }
  source = fs.createReadStream(source, {encoding: 'utf8'});
  source.pipe(res);
  source.on('error', function(err) {
    res.statusCode = 500;
    res.end('Server Error');
  });
};

FS.copyFile = function (source, target) {
  return new Pledge(function(resolve, reject) {
    source = FS.normalize(source);
    if(!this.check(source)) {
      reject(new Error('Forbidden'));
    }
    let rd = fs.createReadStream(source);
    rd.on('error', rejectCleanup);
    let wr = fs.createWriteStream(target);
    wr.on('error', rejectCleanup);
    function rejectCleanup(err) {
      rd.destroy();
      wr.end();
      reject(err);
    }
    wr.on('finish', resolve);
    rd.pipe(wr);
  });
};

FS.readFile = async function (filePath) {
  return new Pledge((resolve, reject) => {
    filePath = FS.normalize(filePath);
    if (!this.check(filePath)) {
      return reject('Forbidden');
    }
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err && err.code !== 'ENOENT') return reject(err);
      resolve(data);
    });
  });
};

FS.writeFile = function (filePath, content) {
  return new Pledge((resolve, reject) => {
    filePath = FS.normalize(filePath);
    if (!this.check(filePath)) {
      return false;
    }

    let dir = path.parse(filePath).dir + path.sep;
    if (!this.existsSync(dir)) {
      this.mkdirSync(dir);
    }

    content = content || '';
    fs.writeFile(filePath, content, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};
