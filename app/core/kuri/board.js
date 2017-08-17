const API = require('../foxtan/api');
const Tools = require('../../helpers/tools');

let Board = module.exports = {};

Board.boards = {};

Board.sync = async function () {
  let input = await API.getBoards();
  if (!Tools.isObject(input)) {
    return false;
  }
  Board.boards = input;

  /*let boards = Object.keys(input);
  for (let i = 0; i < boards.length; i++) {
    let out = input[boards[i]];
    out.name = boards[i];
    Board.boards.push(out);
  }*/
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
  return 1 /* await API.getPageCount(board) */;
};

Board.getPage = async function (board, page) {
  if (!Tools.isNumber(page)) {
    console.log('Trying to get something unexpectable!');
    return false;
  }
  return await API.getPage(board, page);
};
