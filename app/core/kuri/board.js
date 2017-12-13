const config = require('../../helpers/config');
const API = require('../foxtan/' + config('foxtan.use') + '/api');
const Tools = require('../../helpers/tools');
const Templating = require('../../core/templating');
const SyncData = require('../../models/json/sync');

let Board = module.exports = {};

Board.boards = {};

Board.sync = async function () {
  let boards = await API.getBoards();
  if (!Tools.isObject(boards)) {
    return false;
  }
  Board.boards = boards;

  let syncData = await API.sync();
  if (!Tools.isObject(syncData)) {
    return false;
  }

  let SD = SyncData('.tmp/syncData.json');
  let localData = await SD.get();

  if (JSON.stringify(syncData) !== JSON.stringify(localData)) {

    console.log('Syncing...');
    let {add, rem} = Tools.diffObjectPlain(localData, syncData);
    let diff = [...rem, ...add];

    await SD.set(Tools.diffObjectSum(localData, syncData));

    for (let i in diff) {
      let key = Object.keys(diff[i])[0];
      let [action, board, thread] = key.split('.');
      await sync(action, board, thread);
    }

    async function sync(action, board, thread) {
      switch (action) {
        case 'lastPostNumbers':
          await Templating.rerender('/' + board);
          break;
        case 'threadCounts':
          if (Tools.isNumber(+thread)) {
            await Templating.rerender('/' + board + '/res/' + thread);
          } else {
            await Templating.rerender('/' + board);
          }
          break;
      }
    }

    await Templating.rerender('/'); // TODO: Убрать при создании админ-панели
    console.log('Synced!');
  }
  return true;
};

Board.get = function (asObject, param, value) {
  if (!Object.keys(Board.boards).length) {
    (async function () {
      await Board.sync();
    })();
  }
  if (asObject) {
    return Board.boards;
  }

  let keys = Object.keys(Board.boards);
  let out = [];
  for (let key = 0; key < keys.length; key++){
    if (Board.boards[keys[key]][param] === value) {
      Board.boards[keys[key]].name = keys[key];
      out.push(Board.boards[keys[key]]);
    }
  }
  return out;
};

Board.getOne = function (board) {
  return Board.boards[board] || false;
};

Board.getPageCount = async function (board) {
  return (await API.getPageCount(board)).pageCount || 0;
};

Board.getPage = async function (board, page) {
  if (!Tools.isNumber(page)) {
    console.log('Trying to get something unexpectable!');
    return false;
  }
  return await API.getPage(board, page);
};
