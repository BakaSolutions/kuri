const SD = require('../models/foxtan/sync')();
const Render = require('./index');

let RenderUpdate = module.exports = {};

RenderUpdate.update = async (board, thread, id) => {
  let arr = [];

  if (typeof board !== 'undefined') {
    let pattern = `/${board}`;
    arr.push(pattern);

    if (typeof thread !== 'undefined') {
      arr.push(`${pattern}/res/${thread}`);
    }

    SD.set(['threadCounts', board, thread], -1);
    SD.set(['lastPostNumbers', board], id || thread);
  } else {
    arr.push('/');
  }

  await Render.rerender(arr);
};
