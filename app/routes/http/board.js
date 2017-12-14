const router = require('koa-router')();
const Render = require('../../render');
const config = require('../../helpers/config');
const API = require('../../models/foxtan/' + config('foxtan.use'));
const Tools = require('../../helpers/tools');
const Board = require('../../models/board');
const FS = require('../../helpers/fs');
const SD = require('../../models/foxtan/sync')();

module.exports = router;

router.paths = async function () {
  let data = SD.get('threadCounts');
  let boards = Board.get();
  let out = [];
  for (let i = 0; i < boards.length; i++) {
    let boardName = boards[i].name;
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

async function renderPage(boardName, pageNumber) {
  let board = Board.getOne(boardName);
  if (!board) {
    throw new Error('Invalid board');
  }
  let page = await Board.getPage(boardName, pageNumber);
  if (!Tools.isObject(page)) {
     throw new Error('Foxtan problem!');
  }
  for (let a = 0; a < page.threads.length; a++) {
    let thread = page.threads[a];
    for (let b = 0; b < thread.posts.length; b++) {
      thread.posts[b].createdAt = new Date(thread.posts[b].createdAt);
      thread.posts[b].formatted_date = parseDate(thread.posts[b].createdAt);
      //thread.lastPosts[b].body = await Markup.process(thread.lastPosts[b].body, boardName, thread['thread_id']); //TODO: Transfer markup to Foxtan
    }
  }

  let pageID = pageNumber > 0
    ? pageNumber
    : 'index';
  page.title = '/' + board.name + '/ — ' + board.title;
  page.board = board;
  await FS.writeFile('public/' + boardName + '/' + pageID + '.html', Render.renderPage('pages/board', page));
}

async function renderThread(boardName, threadNumber) {
  try {
    let board = Board.getOne(boardName);
    if (!board) {
      throw new Error('Invalid board');
    }
    let thread = {};
    thread.thread = await API.getThread(boardName, threadNumber);
    if (!Tools.isObject(thread.thread)) {
      throw new Error('Foxtan problem! Can\'t get thread!');
    }
    let posts = thread.thread.posts;
    let pattern = ['threadCounts', boardName, thread.thread.number];
    SD.set(pattern, posts.length);
    for (let i = 0; i < posts.length; i++) {
      posts[i].createdAt = new Date(posts[i].createdAt);
      posts[i].formatted_date = parseDate(posts[i].createdAt);
    }
    thread.title = '/' + board.name + '/ — ' + board.title;
    thread.board = board;
    await FS.writeFile('public/' + thread.board.name + '/res/' + thread.thread.number + '.html', Render.renderPage('pages/thread', thread));
  } catch (e) {
    console.log(Tools.prettifyError(e));
  }
}


function parseDate(d){
  let months = ['Янв.', 'Фев.', 'Мар.', 'Апр.', 'Мая', 'Июн.', 'Июл.', 'Авг.', 'Сен.', 'Окт.', 'Ноя.', 'Дек.'];
  if (!(d instanceof Date)) d = new Date(d);

  let date = d.getDate(),
      month = months[d.getMonth()],
      year = d.getFullYear(),
      hours = d.getHours().toString().padStart(2, 0),
      minutes = d.getMinutes().toString().padStart(2, 0);

  return `${date} ${month} ${year} ${hours}:${minutes}`;
}
