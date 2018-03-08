const Logger = require('./logger');

module.exports = class Pledge {

  constructor(executor, silent = false) {
    this.promise = new Promise(executor);
    if (!silent) {
      this.promise.then(this.defaultResolve, this.defaultReject);
    }
  }

  then(onResolve, onReject) {
    this.promise = this.promise.then(onResolve, onReject);
    if (typeof onReject !== 'function') {
      this.promise = this.promise.catch(this.defaultReject);
    }
    return this.promise;
  }

  catch(onReject) {
    return this.promise.catch(onReject);
  }

  defaultResolve(args) {
    return args;
  }

  defaultReject(e) {
    Logger.error('[Caught!] Ni-paa~!', e);
    return e;
  }
};
