let API = require('../models/foxtan/websocket/');
let Tools = require('./tools');

let Markup = module.exports = {
  reduceNewLines: 4 // 4 = 1 + 3: 1 line break and 3 empty lines
};

let escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',

  '*': '&#42;',
  '_': '&#95;',
  '[': '&#91;',
  ']': '&#93;',
  '%': '&#37;',
  '&gt;': '&#62;',
  '~': '&#126;',
  '/': '&#47;',
  ':': '&#58;',
  '.': '&#46;',
  '#': '&#35;',
};

let escapeHTML = text => text.trim().replace(/[&<>"']/g, m => escapeMap[m]);
let escapeRX = exp => exp.replace(/[\-\[\]\/{}()*+?.\\^$|]/g, "\\$&");

let codeTags = [
  /\[code](?:\s*?)(.+?)(?:\s*?)\[\/code]/gi, // [code]
  /```(?:\s*?)(.+?)(?:\s*?)```/gi, // ```
  /`(.+?)`(?:\s|$)/gim // `
];

let tagMap = {
  postLink: [
    /&gt;&gt;(\/?.+\/)?([0-9]+)/gi,
  ],
  quotation: [
    /^(&gt;(?!&gt;).+)$/gim,
  ],
  bold: [
    ['[b]', '[/b]'],
    ['**', '**'],
    ['__', '__'],
  ],
  italic: [
    ['[i]', '[/i]'],
    ['*', '*'],
    ['_', '_'],
  ],
  underline: [
    ['[u]', '[/u]'],
    ['~', '~'],
  ],
  strike: [
    ['[s]', '[/s]'],
    ['~~', '~~'],
  ],
  titledLink: [
    /\[(.+)]\((.+)\)/g,
  ],
  link: [
    ['[url]', '[/url]'],
    /((?:https?|s?ftp):\/\/[a-z0-9\-.]+\/?(?:(?!%%|\[\/|\s|<\/|" ).)*)/gi,
    /(magnet:\\\?xt=urn:[a-z0-9]{20,50})/gi
  ],
  spoiler: [
    ['[spoiler]', '[/spoiler]'],
    ['%%', '%%'],
  ],
  newLine: [
    /\s?\n/g,
  ],
  reduceNewLines: [
    new RegExp(`(<br \/>){${Markup.reduceNewLines},}`, 'gi'),
  ],
};

let typeMap = {
  postLink: processPostLink,
  quotation: '<q>$1</q>',
  newLine: '<br />',
  reduceNewLines: new Array(Markup.reduceNewLines + 1).join('$1'),
  code: '<code>$1</code>',
  bold: '<b>$1</b>',
  italic: '<i>$1</i>',
  underline: '<u>$1</u>',
  strike: '<s>$1</s>',
  titledLink: processTitledURL,
  link: processURL,
  spoiler: '<span class="spoiler">$1</span>',
};

Markup.process = async (text, board, thread, post) => {
  if (!text) {
    return '';
  }

  // Step 0.
  text = escapeHTML(text);

  // Step 1. Bypass code tags.
  for (let i = 0; i < codeTags.length; i++) {
    // get all symbols in [code] => insert in a template string => escape a few chars to avoid further replacements
    text = text.replace(codeTags[i], (_, p1) => typeMap.code.replace('$1', p1.replace(/[*_\[\]%'\\/:.#]/g, m => escapeMap[m])));
  }

  // Step 2. Replace other tags.
  let tagTypes = Object.keys(tagMap); // select tag types and their template strings
  for (let i = 0; i < tagTypes.length; i++) {
    let tagType = tagTypes[i]; // bold, italic, underline...
    let tags = tagMap[tagType];
    for (let j = 0; j < tags.length; j++) {
      if (!Array.isArray(tags[j])) {
        tags[j] = [ tags[j] ];
      }

      let [opening, closing = opening, params = 'gi'] = tags[j]; // create regexp or get it
      let regex = (opening instanceof RegExp)
        ? opening
        : new RegExp(escapeRX(opening) + '(.+?)' + escapeRX(closing), params);

      if (typeof typeMap[tagType] === 'function') {
        let {matches, capture} = getMatches(text, regex);
        for (let k = 0; k < capture.length; k++) {
          text = text.replace(capture[k], await typeMap[tagType](capture[k], matches[k], board, thread, post));
        }
        continue;
      }
      text = text.replace(regex, typeMap[tagType]);
    }
  }

  return text;
};


function getMatches(string, regex) {
  let capture = [];
  let matches = [];
  let match;
  while (match = regex.exec(string)) {
    capture.push(match.shift());
    matches.push(match);
  }
  return { capture, matches };
}

async function processPostLink(capture, matches, board, thread, post) {
  let [boardFromMatch, postFromMatch] = matches;
  if (boardFromMatch) {
    board = boardFromMatch.replace(/\//g, '');
  }
  if (+postFromMatch !== thread && +postFromMatch !== post) {
    let query = await API.getPost(board, postFromMatch);
    if (!Tools.isObject(query)) {
      return capture;
    }
    thread = query.threadNumber;
  }
  return `<a class="postLink" data-board="${board}" data-number="${postFromMatch}" href="/${board}/res/${thread}.html#${postFromMatch}">${capture}</a>`;
}

function processTitledURL(_, matches) {
  let [title, href] = matches;
  href = href.replace(/[*_\[\]'\\/:.#]/g, m => escapeMap[m]);
  return `<a href="${href}" target="_blank">${title}</a>`;
}

function processURL(capture, matches) {
  if (capture.includes('[url]', 0)) { // [url]href[/url]
    matches = getMatches(capture, /((?:https?|s?ftp):\/\/[a-z0-9\-.]+\/?(?:(?!%%|\[\/|\s|<\/|" ).)*)/gi).matches[0];
  }
  let [ href ] = matches;
  href = href.replace(/[*_\[\]'\\/:.#]/g, m => escapeMap[m]);
  try {
    href = decodeURIComponent(href);
  } catch (e) {
    console.log(e, href);
  }
  return `<a href="${href}" target="_blank">${href}</a>`;
}
