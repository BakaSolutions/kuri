//const FSWatcher = require('./fs-watcher');
const Tools = require('./tools');
const FS = require('fs');

let config = require('./configmap');

/**
 * Figurecon -- small module for a configuration. It gets from a file `/config.js` or a map `config` if variable doesn't exists in a config file.
 * @param key
 * @param defaults
 * @constructor
 */
function Figurecon(key, defaults) {
  if(defaults && Tools.isMap(defaults)) {
    return Figurecon.init(...arguments);
  }
  return Figurecon.get(...arguments);
}

/**
 * Gets a variable or throw an error if variable doesn't exist anywhere
 * @param key
 * @param def
 * @returns {*}
 * @throws {Error}
 */
Figurecon.get = function (key, def) {
  if (typeof def === 'undefined') {
    if (typeof this.config.get(key) !== 'undefined') {
      return this.config.get(key);
    }
    return new Error('Undefined config item: "' + key + '"!')
  }
  return def;
};

/**
 * Read a config file and merges config map with it
 * @param file
 * @param defaults
 * @returns {Figurecon}
 */
Figurecon.init = function (file, defaults) {
  let exists = FS.existsSync(file);

  this.config = exists?
      Tools.merge(defaults, require(file)) :
      defaults;

  //let c = FSWatcher.createWatchedResource(file, (path) => { ... }); TODO: Real-time updates
  return this;
};

module.exports = new Figurecon(__dirname + "/../config.js", config);
//module.exports.watcher = FSWatcher;
