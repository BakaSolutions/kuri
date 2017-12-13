const FS = require('../../helpers/fs');
const Tools = require('../../helpers/tools');

class SyncData {
  constructor(filePath) {
    this.filePath = filePath;
    this.get();

    this.timeout = null;
  }

  async get (value) {
    if (!this.dataString) {
      this.dataString = await FS.readFile(this.filePath).catch(() => '{}');
      this.data = JSON.parse(this.dataString);
    }
    if (Array.isArray(value)) {
      let o = this.data;
      let j;
      for (j = 0; j < value.length - 1; j++) {
        o = o[value[j]];
      }
      return o[value[j]];
    }
    return value
      ? this.data[value]
      : this.data;
  }

  set (key, value) {
    console.log('S: ', key, value);
    if (Tools.isObject(key) && arguments.length === 1) {
      this.data = Object.assign(this.data, key);
      return this.write();
    }
    if (!Array.isArray(key)) {
      key = key.split('.');
    }
    let o = this.data;
    let j;
    for (j = 0; j < key.length - 1; j++) {
      o = o[key[j]];
    }
    o[key[j]] = value;
    this.write();
  }

  write() {
    clearTimeout(this.timeout);
    this.timeout = null;
    this.dataString = JSON.stringify(this.data);
    this.timeout = setTimeout(() => {
      FS.writeFile(this.filePath, this.dataString);
      console.log('S: write');
    }, 2000);
  }
}

let instance;

module.exports = (filePath) => {
  if (!instance) {
    instance = new SyncData(filePath);
  }
  return instance;
};
