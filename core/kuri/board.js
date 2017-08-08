const API = require('../foxtan/api');
const Tools = require('../../helpers/tools');

let Board = module.exports = {};

Board.boards = [];

Board.syncBoards = async function () {
  let input = await API.getBoards();
  input = input.map(function(board, i, input) {
    let out = {};
    let uri = board.uri;
    delete board.uri;
    out[uri] = board;
    return out;
  });
  Board.boards = Tools.merge(Board.boards, input);
};

Board.getBoards = async function () {
  if (!Board.boards.length) {
    return await Board.setBoards();
  }
  return Board.boards;
};

Board.getBoard = function (board) {
  return Board.boards[board] || {};
};
