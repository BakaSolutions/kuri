const express = require('express');
const Renderer = require('../../core/templating');
const config = require('../../helpers/config');
const API = require('../../core/foxtan/' + config('foxtan.use') + '/api');
const Tools = require('../../helpers/tools');
const Board = require('../../core/kuri/board');
const FS = require('../../helpers/fs');
const SyncData = require('../../models/json/sync');

let router = module.exports = express.Router();

router.paths = async function () {
  let SD = new SyncData('.tmp/syncData.json');
  let data = await SD.get('threadCounts');
  let out = [];
  let boards = Board.get();
  let boardName;
  for (let i = 0; i < boards.length; i++) {
    boardName = boards[i].name;
    out.push(
      '/' + boardName
    //'/' + boardName + '/catalog'
    );
    if (!data || !data[boardName]) {
      continue;
    }
    let threads = Object.keys(data[boardName] || {}).map((thread) => {
      return '/' + boardName + '/res/' + thread;
    });
    if (threads.length) {
      out = out.concat(threads);
    }
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
  let pageCount = await Board.getPageCount(boardName) || 1;
  for (let i = 0; i < pageCount; i++) {
    await renderPage(boardName, i);
  }
}

function parseDate(d){
  let months = ['Янв.', 'Фев.', 'Мар.', 'Апр.', 'Мая', 'Июн.', 'Июл.', 'Авг.', 'Сен.', 'Окт.', 'Ноя.', 'Дек.']
  
  if (!(d instanceof Date)) {
    d = new Date(d);
  }
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();
  let hours = d.getHours().toString().padStart(2, 0);
  let minutes = d.getMinutes().toString().padStart(2, 0);
  return `${date} ${month} ${year} ${hours}:${minutes}`;
}

async function renderPage(boardName, pageNumber) {
  let board = Board.getOne(boardName);
  if (!board) {
    throw new Error('Invalid board');
  }
  let page = await Board.getPage(boardName, pageNumber);
  if (!Tools.isObject(page)) {
    page = { threads:[] };
  }
  for (let a = 0; a < page.threads.length; a++) {
    let thread = page.threads[a];
    for (let b = 0; b < thread.lastPosts.length; b++) {
      thread.lastPosts[b].created_at = new Date(thread.lastPosts[b].created_at);
      thread.lastPosts[b].formatted_date = parseDate(thread.lastPosts[b].created_at);
      //thread.lastPosts[b].body = await Markup.process(thread.lastPosts[b].body, boardName, thread['thread_id']); //TODO: Transfer markup to Foxtan
    }
  }
  for (let thread of page.threads) {
    await renderThread(thread['board_name'], thread['thread_id']);
  }


  let pageID = pageNumber > 0
    ? pageNumber
    : 'index';
  page.title = '/' + board.name + '/ — ' + board.title;
  page.board = board;
  await FS.writeFile('public/' + boardName + '/' + pageID + '.html', Renderer.render('pages/board', page));
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
      throw new Error('Foxtan problem! Can\'t get thread!');
    }
    let posts = thread.thread.posts;
    for (let i = 0; i < posts.length; i++) {
      posts[i].created_at = new Date(posts[i].created_at);
      posts[i].formatted_date = parseDate(posts[i].created_at);
      //posts[i].body = await Markup.process(posts[i].body, boardName, threadNumber);
    }
    thread.title = '/' + board.name + '/ — ' + board.title;
    thread.board = board;
    return await Renderer.renderThread(thread);
  } catch (e) {
    console.log(e.message, boardName, threadNumber);
  }
}
