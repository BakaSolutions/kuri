const express = require('express');
const Renderer = require('../../core/templating');
const Board = require('../../core/kuri/board');
const FS = require('../../helpers/fs');

let router = module.exports = express.Router();

router.paths = function () {
  let out = [];
  let boards = Board.get();
  let boardName;
  for (let i = 0; i < boards.length; i++) {
    boardName = boards[i].name;
    out.push(
      '/' + boardName
    //'/' + boardName + '/catalog'
    );
  }
  return out;
};

router.render = async function (path) {
  let match = path.match(/^\/([^\/]+)$/);
  if (match) {
    return await renderPages(match[1]);
  }
/*  match = path.match(/^\/([^\/]+)\/catalog$/);
  if (match) {
    return await router.renderCatalog(match[1]);
  }
  match = path.match(/^\/([^\/]+)\/res\/(\d+)$/);
  if (match) {
    return await renderThread(match[1], +match[2]);
  }*/
};

async function renderPages(boardName) {
  let pageCount = 1; /*await Board.getPageCount(boardName);*/
  for (let i = 0; i < pageCount; i++) {
    await renderPage(boardName, i);
  }
}

async function renderPage(boardName, pageNumber) {
  let board = Board.getOne(boardName);
  if (!board) {
    throw new Error('Invalid board');
  }
  let page = {};
  page.threads = await Board.getPage(boardName, pageNumber);
  /*for (let thread of page.threads) {
    delete thread.password;
    await Renderer.renderThread(thread);
  }*/
  let pageID = pageNumber > 0
    ? pageNumber
    : 'index';
  page.title =`/${board.name}/ &mdash; ${board.title}`;
  page.board = board;
  FS.writeFileSync('public/' + boardName + '/' + pageID + '.html', Renderer.render('pages/board', page));
}
