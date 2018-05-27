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
        href: config('foxtan.http.href')
      }
    },
    sync: {}
  }
};

Model.add = smth => {
  Model.models = Tools.merge(Model.models, smth);
};

Model.init = async () => {
  Logger.info(`[Init] Get paths...`);

  let data = await API.init();
  if (!Tools.isObject(data) || !data.paths) {
    return false;
  }

  Model.add({
    engine: data.engine,
    base: {
      foxtan: data.paths
    }
  });

  return true;
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

Model.getThreadNumbers = board => {
  let threadNumbers = Model.models.sync.threadCounts;
  if (!threadNumbers) {
    return false;
  }

  if (board) {
    return Object.keys(threadNumbers[board]);
  }

  let boards = Object.keys(threadNumbers);
  let out = {};

  for (let i = 0; i < boards.length; i++) {
    out[boards[i]] = [];

    let threads = Object.keys(threadNumbers[boards[i]]);
    for (let j = 0; j < threads.length; j++) {
      out[boards[i]].push(threads[j]);
    }
  }
  return out;
};

Model.getLastPostNumbers = board => {
  let lastPostNumbers = Model.models.sync.lastPostNumbers;
  if (!lastPostNumbers) {
    return false;
  }

  if (board) {
    return lastPostNumbers[board];
  }

  let boards = Object.keys(lastPostNumbers);
  let out = {};

  for (let i = 0; i < boards.length; i++) {
    out[boards[i]] = lastPostNumbers[boards[i]];
  }
  return out;
};

Event.on('websocket.open', async () => {
  const BoardModel = require('../models/board');
  await Model.init();
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

Event.on(`websocket.cmd.RNDR`, async ([boardName, threadNumber, postId]) => {
  const BoardModel = require('../models/board');
  const ThreadModel = require('../models/thread');
  let { threadCounts, lastPostNumbers } = Model.models.sync;
  if (!BoardModel.exists(boardName) || !threadCounts) {
    return false;
  }
  let thread = await ThreadModel.getOne(boardName, threadNumber);
  if (Tools.isObject(thread)) {
    if (!threadCounts[boardName]) {
      threadCounts[boardName] = {};
    }
    threadCounts[boardName][threadNumber] = thread.posts.length;
  }
  lastPostNumbers[boardName] = postId;
});
