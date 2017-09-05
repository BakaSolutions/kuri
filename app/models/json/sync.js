const FS = require('../../helpers/fs');

module.exports = class SyncData {
  constructor(filePath) {
    this.filePath = filePath;
    this.get();
  }

  async get (value) {
    if (!this.dataString) {
      this.dataString = await FS.readFile(this.filePath).catch(() => '{}');
      this.data = JSON.parse(this.dataString);
    }
    return value
      ? this.data[value]
      : this.data;
  }

  set (key, value) {
    if (!Array.isArray(key)) {
      key = key.split('.');
    }
    let o = this.data;
    let j;
    for (j = 0; j < key.length - 1; j++) {
      o = o[key[j]];
    }
    o[key[j]] = value;

    FS.writeFile(this.filePath, JSON.stringify(this.data));
  }

};