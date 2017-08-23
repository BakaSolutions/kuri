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
  let pageCount = await Board.getPageCount(boardName);
  for (let i = 0; i < pageCount; i++) {
    await renderPage(boardName, i);
  }
}

async function pad(n, width) {
  n += '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(0) + n;
}

async function parseDates(page){
  let d;

  for (let a = 0; a < page.threads.length; a++) {
    for (let b = 0; b < page.threads[a].lastPosts.length; b++) {
      d = new Date(page.threads[a].lastPosts[b].created_at);
      page.threads[a].lastPosts[b].created_at = `${await pad(d.getDate(), 2)}.${await pad(d.getMonth(), 2)}.${d.getFullYear()} ${await pad(d.getHours(), 2)}:${await pad(d.getMinutes(), 2)}`;
    }
  }

  return page
}

async function renderPage(boardName, pageNumber) {
  let board = Board.getOne(boardName);
  if (!board) {
    throw new Error('Invalid board');
  }
  let page = await Board.getPage(boardName, pageNumber);
  page = await parseDates(page);

  /*for (let thread of page.threads) {
    await Renderer.renderThread(thread);
  }*/
  let pageID = pageNumber > 0
    ? pageNumber
    : 'index';
  page.title = '/' + board.name + '/ &mdash; ' + board.title;
  page.dependencies = {
    css: "['../css/board.css']",
    js: "['../js/master.js', '../js/draggabilly.pkgd.min.js', '../js/ui.js', '../js/truncate.js', '../js/upload.js']"
  }
  page.board = board;
  FS.writeFileSync('public/' + boardName + '/' + pageID + '.html', Renderer.render('pages/board', page));
}
