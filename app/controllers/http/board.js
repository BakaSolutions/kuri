const express = require('express');
const Renderer = require('../../core/templating');
const API = require('../../core/foxtan/http/api');
const Markup = require('../../core/foxtan/markup');
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
  }*/
  match = path.match(/^\/([^\/]+)\/res\/(\d+)$/);
  if (match) {
    return await renderThread(match[1], +match[2]);
  }
};

async function renderPages(boardName) {
  let pageCount = await Board.getPageCount(boardName);
  for (let i = 0; i < pageCount; i++) {
    await renderPage(boardName, i);
  }
}

function parseDate(d){
  if (!(d instanceof Date)) {
    d = new Date(d);
  }
  let date = d.getDate().toString().padStart(2, 0);
  let month = d.getMonth().toString().padStart(2, 0);
  let year = d.getFullYear();
  let hours = d.getHours().toString().padStart(2, 0);
  let minutes = d.getMinutes().toString().padStart(2, 0);
  return `${date}.${month}.${year} ${hours}:${minutes}`;
}

async function renderPage(boardName, pageNumber) {
  let board = Board.getOne(boardName);
  if (!board) {
    throw new Error('Invalid board');
  }
  let page = await Board.getPage(boardName, pageNumber);
  for (let a = 0; a < page.threads.length; a++) {
    let thread = page.threads[a];
    for (let b = 0; b < thread.lastPosts.length; b++) {
      thread.lastPosts[b].created_at = parseDate(thread.lastPosts[b].created_at);
      thread.lastPosts[b].body = await Markup.process(thread.lastPosts[b].body, boardName, thread['thread_id']);
    }
  }

  for (let thread of page.threads) {
    await renderThread(thread['board_name'], thread['thread_id']);
  }
  let pageID = pageNumber > 0
    ? pageNumber
    : 'index';
  page.title = '/' + board.name + '/ &mdash; ' + board.title;
  page.mainStylesheet = 'board.css';
  page.dependencies = {
    js: "['/js/master.js', '/js/draggabilly.pkgd.min.js', '/js/ui.js', '/js/truncate.js', '/js/upload.js']"
  };
  page.board = board;
  FS.writeFileSync('public/' + boardName + '/' + pageID + '.html', Renderer.render('pages/board', page));
}

async function renderThread(boardName, threadNumber) {
  try {
    let board = Board.getOne(boardName);
    if (!board) {
      throw new Error('Invalid board');
    }
    let thread = {};
    thread.thread = await API.getThread(boardName, threadNumber);
    if (Array.isArray(thread.thread) && !thread.thread.length) {
      throw new Error('Foxtan problem! Can\'t get a thread!');
    }
    let posts = thread.thread.posts;
    for (let i = 0; i < posts.length; i++) {
      posts[i].created_at = parseDate(posts[i].created_at);
      posts[i].body = await Markup.process(posts[i].body, boardName, threadNumber);
    }
    thread.board = board;
    thread.mainStylesheet = 'board.css';
    thread.dependencies = {
      js: "['/js/master.js', '/js/draggabilly.pkgd.min.js', '/js/ui.js', '/js/truncate.js', '/js/upload.js']"
    };
    return await Renderer.renderThread(thread);
  } catch (e) {
    console.log(e.message, boardName, threadNumber);
  }
}
