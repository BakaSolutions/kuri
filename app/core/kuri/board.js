const config = require('../../helpers/config');
const API = require('../foxtan/' + config('foxtan.use') + '/api');
const Tools = require('../../helpers/tools');
const Diff = require('deep-diff').diff;
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

  let SD = new SyncData('.tmp/syncData.json');
  let localData = await SD.get();

  if (JSON.stringify(syncData) !== JSON.stringify(localData)) {
    await Templating.compileTemplates();
    await Templating.reloadTemplates();

    console.log('Syncing...');

    let diff = Diff(localData, syncData);
    for (let i = 0; i < diff.length; i++) {
      let d = diff[i];
      let board;
      let thread;

      switch (d.kind) {
        case 'N':
          board = Object.keys(d.rhs)[0];
          break;
        case 'E':
          board = d.path[1];
          thread = d.path[2];
          break;
      }

      await syncing(d.path[0], board, thread);
      SD.set(d.path, d.rhs);
    }

    async function syncing(action, board, thread) {
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
    await Templating.rerender('/');
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
