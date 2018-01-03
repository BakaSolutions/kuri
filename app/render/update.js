const SD = require('../models/foxtan/sync')();
const Render = require('./index');
const FS = require('../helpers/fs');
const Logger = require('../helpers/logger');

let RenderUpdate = module.exports = {};

RenderUpdate.update = async (board, thread, id, renderThreadLists = true) => {
  let arr = [];

  if (typeof board !== 'undefined') {
    let pattern = `/${board}`;

    if (renderThreadLists) {
      arr.push(pattern);
    }

    if (typeof thread !== 'undefined') {
      arr.push(`${pattern}/res/${thread}`);
      SD.set(['threadCounts', board, thread], -1);
      if ((id || thread) > SD.get(['lastPostNumbers', board])) {
        SD.set(['lastPostNumbers', board], +id || +thread);
      }
      Logger.info(`[Rndr] Updating /${board}/res/${id || thread || ''}...`);
    }
  } else {
    arr.push('/');
  }

  await Render.rerender(arr);
};

RenderUpdate.delete = async (board, thread, id, renderThreadLists = true) => {
  Logger.info(`[Rndr] Deleting /${board}/res/${id || thread}...`);

  let arr = [];
  let pattern = `/${board}`;

  if (renderThreadLists) {
    arr.push(pattern);
  }

  if (typeof thread !== 'undefined' && thread !== id) {
    arr.push(`${pattern}/res/${thread}`);
  }

  if (thread === id) {
    SD.set(['threadCounts', board, thread], /* nothing! */);
    await FS.unlinkSync(`public/${board}/res/${thread}.html`);
  }

  await Render.rerender(arr);
  return {deleted: true};
};
