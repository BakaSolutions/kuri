const fs = require('fs');
const path = require('path');
const merge = require('merge');
const Pledge = require('./promise');

let tools = module.exports = {},
    toString = Object.prototype.toString;

tools.moduleAvailable = function (name) {
  try {
    require.resolve(name);
    return true;
  } catch(e) {
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
tools.requireAll = async function (src, mask) {
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
tools.requireAllSync = function (src, mask) {
  let filePath = path.join(__dirname, '/../', src),
      files = fs.readdirSync(filePath);
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
  files.forEach(function (file) {
    if(mask && !mask.test(file)) {
      return false;
    }
    delete require.cache[require.resolve(path.join(filePath, file))];
    try {
      o[o.length] = tools.requireWrapper(require(path.join(filePath, file)));
    } catch (e) {
      /*const Logger = require('./logger');
      Logger.error(e);*/
    }
  });
  return o;
}

/**
 * Wraps file into a pluggable module
 * @param m
 * @returns {*}
 */
tools.requireWrapper = function (m) {
  return (m && m.default) || m;
};

/**
 * Check if a variable is an object but not a mop
 * @param obj
 * @returns {boolean}
 */
tools.isObject = function(obj) {
  return toString.call(obj) === '[object Object]';
};

/**
 * Check if a variable is a map
 * @param obj
 * @returns {boolean}
 */
tools.isMap = function(obj) {
  return toString.call(obj) === '[object Map]';
};

/**
 * Check if a variable is a number
 * @param n
 * @returns {boolean}
 */
tools.isNumber = function(n) {
  return +n === n;
  //return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * "Flattens" an array (moves all elements to the root of an array)
 * @param {Array} a
 * @returns {Array}
 */
tools.flattenArray = function(a) {
  let out = [];
  for(let i = 0; i < a.length; i++) {
    if(Array.isArray(a[i])) {
      out = out.concat(this.flattenArray(a[i]));
    } else {
      out.push(a[i]);
    }
  }
  return out;
};

/**
 * Merges two or more objects into one
 * @param {Object|Map} target
 * @param {Object|Map} theArgs
 * @return {Object|Map} target
 */
tools.merge = function (target, ...theArgs) {
  target = tools.clone(target);
  if(tools.isMap(target)) {
    let out = [...target];
    theArgs.forEach(function(arg) {
      out.push(...arg);
    });
    return new Map(out);
  }
  let sources = Array.prototype.slice.call(arguments, 1);
  sources.forEach(function (source) {
    for (let prop in source) {
      if(source.hasOwnProperty(prop)) {
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

tools.clone = function (value) {
  if (Array.isArray(value)) {
    return value.slice(0).map(val => tools.clone(val));
  } else if (tools.isObject(value)) {
    return merge.recursive(true, value);
  }
  return value;
};

tools.diffArray = function (a1, a2) {
  let a2Set = new Set(a2);
  return a1.filter(function(x) { return !a2Set.has(x); });
};

tools.diffArraySymmetric = function (a1, a2) {
  return this.diffArray(a1, a2).concat(tools.diffArray(a2, a1));
};

tools.diffObject = function (a1, a2, i = 0) {
  let add = {};
  let rem = {};
  for (let key in a1) {
    if (typeof a1[key] === 'object') {
      if (typeof a2[key] !== 'object') {
        a2[key] = {};
      }
      let krdf = this.diffObject(a1[key], a2[key], i + 1);
      if (Object.keys(krdf.rem).length) {
        rem[key] = krdf.rem;
      }
    } else {
      if (typeof a2 === 'undefined' || typeof a2[key] === 'undefined' || a1[key] !== a2[key]) {
        rem[key] = a1[key];
      }
    }
  }
  if (!i) {
    add = this.diffObject(a2, a1, -1).rem;
  }
  return {add, rem};
};

function recurseDiffObject(out = {}, item) {
  for (let key in item) {
    if (typeof item[key] === 'object') {
      if (Object.keys(item[key]).length) {
        out[key] = recurseDiffObject(out[key], item[key]);
      }
    } else {
      out[key] = item[key];
    }
  }
  return out;
}

function transformObjectPath(out = [], item, i = '') {
  for (let key in item) {
    let j = i ? i + '.' + key : key;
    if (typeof item[key] === 'object') {
      if (Object.keys(item[key]).length) {
        out.push(...transformObjectPath(out[key], item[key], j));
      }
    } else {
      let obj = {};
      obj[j] = item[key];
      out.push(obj);
    }
  }
  return out;
}

tools.diffObjectSum = function (a1, a2) {
  let {rem, add} = this.diffObject(a1, a2);
  let out = {};
  [rem, add].forEach(item => recurseDiffObject(out, item));
  return out;
};

tools.diffObjectPlain = function (a1, a2) {
  let {rem, add} = this.diffObject(a1, a2);
  let out = {};
  out.rem = transformObjectPath([], rem);
  out.add = transformObjectPath([], add);
  for (let i in out.add) {
    for (let j in out.rem) {
      let key = Object.keys(out.add[i])[0];
      if (typeof out.rem[j][key] !== 'undefined') {
        out.rem.splice(j, 1);
      }
    }
  }
  return out;
};

tools.debounce = function DebounceInstance(f, ms, context = this) {
  let timer = null;

  return function (...args) {
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
