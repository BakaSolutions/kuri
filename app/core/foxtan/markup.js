const API = require('./api');
const Tools = require('../../helpers/tools');

let Markup = module.exports = {};

Markup.patterns = [
  [/&gt;&gt;(\/?.+\/)?([0-9]+)/ig, async function (capture, matches, board, thread, post) { // /&gt;&gt;([0-9]{1,24})/ig
    let [boardFromMatch, postFromMatch] = matches;
    if (boardFromMatch) board = boardFromMatch.replace(/\//g, '');
    if (+postFromMatch !== thread) {
      let query = await API.getPost(board, postFromMatch);
      if (!Tools.isObject(query)) {
        return capture;
      }
      thread = query.thread;
    }
    return `<a href="/${board}/res/${thread}.html#${postFromMatch}">${capture}</a>`;
  }],
  [/^(&gt;[^&gt;]+)$/mg, '<span class="quotation">$1</span>'], //  // /^(?:&gt;)([^\r\n]+)/mg
  [/(https?:\/\/([a-zA-Z0-9\-.]+)\/?[a-zA-Z0-9?&=.:;#\/\-_~%+]*)/ig, '<a href="$1" title="$1" target="_blank">$2</a>'],
  [/\s--\s/g, ' – '],
  [/\[b](.*)\[\/b]/ig, '<b>$1</b>'],
  [/\[i](.*)\[\/i]/ig, '<i>$1</i>'],
  [/\[u](.*)\[\/u]/ig, '<i>$1</i>'],
  [/\s?\n/ig, '<br />'],
];

Markup.process = async function (text, board, thread, post) {
  text = escape(text);

  for (let i = 0; i < Markup.patterns.length; i++) {
    if (typeof Markup.patterns[i][1] === 'function') {
      let matches = getMatches(text, Markup.patterns[i][0]);
      for (let j = 0; j < matches.capture.length; j++) {
        text = text.replace(matches.capture[j], await Markup.patterns[i][1](matches.capture[j], matches.matches[j], board, thread, post));
      }
      continue;
    }
    text = text.replace(Markup.patterns[i][0], Markup.patterns[i][1]);
  }

  return text;
};

/**
 * Replaces all dangerous symbols in text
 * @param text
 * @returns {string}
 */
function escape(text) {
  let map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

function getMatches(string, regex) {
  let capture = [];
  let matches = [];
  let match;
  while (match = regex.exec(string)) {
    capture.push(match.shift());
    matches.push(match);
  }
  return {
    capture: capture,
    matches: matches
  };
}