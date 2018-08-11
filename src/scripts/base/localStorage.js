function isObject(o) {
  // [object Object], [object Date]...
  return o instanceof Object && o.constructor === Object;
}

function objectLength(o) {
  return isObject(o) && Object.keys(o).length;
}

class Storage {

  constructor({persistent = true, defaults = {}, divider = '.'} = {}) {
    this.storage = persistent ? localStorage : sessionStorage;
    this.defaults = isObject(defaults) ? defaults : {};
    this.divider = divider;
  }

  get(path) {
    if (typeof path !== 'string') {
      return this.defaults;
    }

    let fromStorage = this._find(path);
    let fromDefaults = this._find(path, true);

    if (typeof fromStorage === 'undefined') {
      return fromDefaults;
    }
    if (isObject(fromStorage) && isObject(fromDefaults)) {
      return Object.assign(fromDefaults, fromStorage);
    }
    return fromStorage;
  }

  set(path, value) {
    let [key, ...keys] = this._parsePath(path);

    if (value && !isNaN(value) && typeof value !== 'boolean') { // is [Number] or [String <containing number>]
      value = +value;
    }

    let prevValue = this._rawGet(key);
    let currValue = this._diffSet(keys, value);

    if (isObject(prevValue) && isObject(currValue)) {
      currValue = Object.assign(prevValue, currValue);
    }

    if (typeof currValue === 'undefined' || !objectLength(currValue)) {
      throw new Error('Value is undefined. Use .delete() for removing the value.');
    }

    this._rawSet(key, currValue);
  }

  delete(path) {
    let [key, ...keys] = this._parsePath(path);

    let prevValue = this._rawGet(key);
    let currValue = this._diffSet(keys);

    if (isObject(prevValue) && isObject(currValue)) {
      currValue = Object.assign(prevValue, currValue);
    }

    if (typeof currValue === 'undefined' || !objectLength(currValue)) {
      delete this.storage[key];
      return true;
    }
    this._rawSet(key, currValue);
    return true;
  }


  _rawGet(key) {
    try {
      return JSON.parse(this.storage[key]);
    } catch (e) {
      return this.storage[key];
    }
  }

  _rawSet(key, value) {
    if (isObject(value)) {
      value = JSON.stringify(value);
    }
    return this.storage[key] = value;
  }

  _parsePath(path) {
    return path.toLocaleString().split(this.divider);
  }

  _find(path, defaults) {
    let [key, ...keys] = this._parsePath(path);

    let obj = defaults ? this.defaults[key] : this._rawGet(key);

    keys.forEach(k => {
      if (!obj) {
        return obj;
      }

      obj = obj[k];
      if (!isObject(obj)) {
        try {
          obj = JSON.parse(obj);
        } catch (e) {
          //
        }
      }
    });

    return obj;
  }

  _diffSet(pathArray, value) {
    let length = pathArray.length;
    let out = {};

    if (!length) {
      return;
    }

    if (length < 2) {
      out[pathArray[0]] = value;
      return out;
    }

    for (let i = 0; i < --length; i++) {
      let n = pathArray[i];
      if (!(n in out)) {
        out[n] = {};
      }
      out = out[n];
    }
    out[pathArray[length]] = value;

    if (!Object.keys(out).length) {
      return;
    }
    return out;
  }

}

let storage = new Storage({
  defaults: {
    settings: {
      "modules": [],
      "USEAJAX": true,
      "ANIDUR": 0.3
    }
  }
});
