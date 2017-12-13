const config = require('../helpers/config');
const API = require('./foxtan/' + config('foxtan.use'));
const Tools = require('../helpers/tools');
const RenderUpdate = require('../render/update');
const SD = require('../models/foxtan/sync')();

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

  let localData = SD.get();

  let {add, rem} = Tools.diffObject(localData, syncData);
  if (Object.keys(Object.assign(rem, add)).length) {
    console.log('Syncing...');
    let {add, rem} = Tools.diffObjectPlain(localData, syncData);
    let diff = [...rem, ...add];

    SD.set(syncData);

    for (let i in diff) {
      let key = Object.keys(diff[i])[0];
      let [action, board, thread] = key.split('.');
      await sync(action, board, thread);
    }

    async function sync(action, board, thread) {
      switch (action) {
        case 'lastPostNumbers':
          await RenderUpdate.update(board);
          break;
        case 'threadCounts':
          if (Tools.isNumber(+thread)) {
            await RenderUpdate.update(board, thread);
          } else {
            await RenderUpdate.update(board);
          }
          break;
      }
    }

    await RenderUpdate.update(); // TODO: Убрать при создании админ-панели
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
    console.log(Tools.prettifyError(new Error('Trying to get something unexpectable!')));
    return false;
  }
  return await API.getPage(board, page);
};
