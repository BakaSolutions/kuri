const rfc6902 = require('rfc6902');

const config = require('../helpers/config');
const Event = require('../helpers/event');
const Logger = require('../helpers/logger');
const Tools = require('../helpers/tools');

const API = require('./foxtan/websocket');

let Model = module.exports = {
  models: {
    base: {
      site: config('site'),
      foxtan: {
        host: config('foxtan.http.host'),
        port: config('foxtan.http.port'),
        protocol: config('foxtan.http.protocol')
      },
      // board: Board.get()
    },
    sync: {}
  }
};

Model.add = smth => {
  Model.models = Tools.merge(Model.models, smth);
};

Model.sync = async () => {
  Logger.info(`[SYNC] Syncing-syncing...`);

  let syncData = await API.sync();
  if (!Tools.isObject(syncData)) {
    return false;
  }

  let diff = rfc6902.createPatch(Model.models.sync, syncData);
  if (!diff.length) {
    return Logger.success(`[SYNC] Sync is not needed!`);
  }

  Event.emit('sync.diff', diff);

  return true;
};

Event.on('websocket.open', async () => {
  const BoardModel = require('../models/board');
  await Model.sync();
  await BoardModel.sync();
  Event.emit('sync.synced');
});

Event.on('sync.diff', diff => {
  if (!Array.isArray(diff)) {
    diff = [ diff ];
  }
  for (let i = 0; i < diff.length; i++) {
    let patch = diff[i];
    let parsedPath = patch.path.split('/').slice(1);

    switch (patch.op) {
      case "add":
      case "replace":
        Tools.deepSet(Model.models.sync, parsedPath, patch.value);
        break;
      case "remove":
        if (typeof patch.value === "undefined") {
          Logger.debug(`Поздравляю с прохождением теста. Но что-то тут не так...`);
        }
        Tools.deepSet(Model.models.sync, parsedPath, undefined);
        break;
      default:
        console.log(patch);
    }
  }
});

Event.on(`websocket.cmd.RNDR`, ([board, thread, id]) => {
  const BoardModel = require('../models/board');
  let threadCounts = Model.models.sync.threadCounts;
  if (!BoardModel.exists(board) || !threadCounts) {
    return false;
  }
  threadCounts[board][thread] = id;
});
