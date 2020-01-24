const fs = require('fs');
const path = require('path');
const Pledge = require('./promise');
const Logger = require('./logger');

let tools = module.exports = {};
let toString = {}.toString;

tools.moduleAvailable = name => {
  try {
    require.resolve(name);
    return true;
  } catch (e) {
    //
  }
  return false;
};

/**
 * Requires all files in a defined directory
 * @param src
 * @param [mask]
 * @returns {Promise}
 */
tools.requireAll = async (src, mask) => {
  let filePath = path.join(__dirname, '/../', src);
  return new Pledge((resolve, reject) => {
    fs.readdir(filePath, (err, files) => {
      if (err) {
        return reject(err);
      }
      resolve(requireAll(mask, files, filePath));
    });
  });
};

/**
 * Requires all files in a defined directory synchronously
 * @param src
 * @param [mask]
 * @returns {*}
 */
tools.requireAllSync = (src, mask) => {
  let filePath = path.join(__dirname, '/../', src);
  let files = fs.readdirSync(filePath);
  return requireAll(mask, files, filePath);
};

/**
 * Common function for requireAll* functions
 * @param [mask]
 * @param files
 * @param {String} filePath
 * @returns {Array}
 */
function requireAll(mask, files, filePath) {
  let o = [];
  if (typeof files === 'undefined') {
    return o;
  }
  files.forEach(file => {
    if(mask && !mask.test(file)) {
      return false;
    }
    delete require.cache[require.resolve(path.join(filePath, file))];
    try {
      o[o.length] = tools.requireWrapper(require(path.join(filePath, file)));
    } catch (e) {
      Logger.error(e);
    }
  });
  return o;
}

/**
 * Wraps file into a pluggable module
 * @param m
 * @returns {*}
 */
tools.requireWrapper = m => ((m && m.default) || m);

/**
 * Check if a variable is an object but not a mop
 * @param obj
 * @returns {boolean}
 */
tools.isObject = obj => toString.call(obj) === '[object Object]';

/**
 * Check if a variable is a map
 * @param obj
 * @returns {boolean}
 */
tools.isMap = obj => toString.call(obj) === '[object Map]';

/**
 * Check if a variable is a number
 * @param n
 * @returns {boolean}
 */
tools.isNumber = n => +n === n;
  //return !isNaN(parseFloat(n)) && isFinite(n);

/**
 * "Flattens" an array (moves all elements to the root of an array)
 * @param {Array} a
 * @returns {Array}
 */
tools.flattenArray = a => {
  return a.reduce((result, current) => {
    if (Array.isArray(current)) {
      current = tools.flattenArray(current);
    }
    return result.concat(current);
  }, []);
};

/**
 * Merges two or more objects into one
 * @param {Object|Map} target
 * @param {Object|Map} sources
 * @return {Object|Map} target
 */
tools.merge = (target, ...sources) => {
  target = Object.assign({}, target);
  if (tools.isMap(target)) {
    let out = [...target];
    sources.forEach(arg => {
      out.push(...arg);
    });
    return new Map(out);
  }
  sources.forEach(source => {
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        if (typeof target === 'undefined') {
          target = {};
        }
        target[prop] = tools.isObject(source[prop])
            ? tools.merge(target[prop], source[prop])
            : source[prop];
      }
    }
  });
  return target;
};

tools.debounce = function DebounceInstance(f, ms, context = this) {
  let timer = null;

  return (...args) => {
    const onComplete = () => {
      f.apply(context, args);
      timer = null;
    };

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(onComplete, ms);
  };
};

tools.deepSet = (obj, path, value) => {
  let a = Array.isArray(path)
      ? path
      : path.split('.');
  let o = obj;
  for (let i = 0; i < a.length - 1; i++) {
    let n = a[i];
    if (n in o) {
      o = o[n];
    } else {
      o[n] = {};
      o = o[n];
    }
  }
  o[a[a.length - 1]] = value;
  return obj;
};

tools.parseDate = (date) => {
  return (new Date(date)).toLocaleDateString("ru-RU", {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric',
    timeZone: 'UTC',
    timeZoneName: 'short'
  })
};
