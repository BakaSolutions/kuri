const FS = require('../../helpers/fs');
const Tools = require('../../helpers/tools');

class SyncData {
  constructor(filePath) {
    this.filePath = filePath || '.tmp/syncData.json';
    this.debounce = Tools.debounce(FS.writeFile, 10 * 1e3, FS);
    this.dataString = '{}';
    this.data = {};
    (async () => {
      if (this.dataString === '{}') {
        this.dataString = await FS.readFile(this.filePath).catch(() => '{}');
        try {
          this.data = JSON.parse(this.dataString);
        } catch (e) {
          //
        }
      }
    })();
  }

  get (key) {
    return this.split(key);
  }

  set (key, value) {
    if (Tools.isObject(key) && arguments.length === 1) {
      this.data = key;
      return this.write();
    }
    let split = this.split(key, value);
    if (typeof split !== 'undefined') {
      this.write();
    }
    return split;
  }

  split (key, value) {
    if (typeof key === 'undefined') {
      if (typeof value !== 'undefined') {
        this.data = value;
      }
      return this.data;
    }
    if (!Array.isArray(key)) {
      key = key.split('.');
    }
    let o = this.data;
    let j = 0;
    for (; j < key.length - 1; j++) {
      if (typeof value !== 'undefined' && (typeof o === 'undefined' || typeof o[key[j]] === 'undefined')) {
        o = this.set(key.slice(0, j + 1), {});
      } else {
        o = o[key[j]];
      }
    }
    if (typeof value !== 'undefined') {
      if (o[key[j]] === value) {
        return;
      }
      o[key[j]] = value;
    }
    return o[key[j]];
  }

  write () {
    this.dataString = JSON.stringify(this.data);
    console.log('write');
    this.debounce(this.filePath, this.dataString);
  }
}

let instance;

module.exports = (filePath) => {
  if (!instance) {
    instance = new SyncData(filePath);
  }
  return instance;
};
