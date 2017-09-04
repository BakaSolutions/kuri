const doT = require('dot');
const FS = require('../../helpers/fs');
const Path = require('path');
const Tools = require('../../helpers/tools');

let Templating = module.exports = {};
let includes = {};
let templates = {};

const settings = {
  __proto__: doT.templateSettings,
  strip: false
};
const ILLEGAL_CHARACTERS_REGEXP = /[^a-zA-Z$_]/gi;

let templateFolder = 'src/views';
let destinationFolder = '.tmp/views';

Templating.reloadTemplates = function () {
  try {
    let templatePaths = FS.readdirSync(destinationFolder, true);
    templatePaths.forEach(function (templatePath) {
      if (Path.parse(templatePath).ext !== '.js') {
        return false;
      }
      let templateName = templatePath
        .replace(Path.join(__dirname, '../../../', destinationFolder, Path.sep), '')
        .split('.')
        .shift();
      if (require.cache[templatePath]) {
        delete require.cache[templatePath];
      }
      templates[templateName] = require(templatePath);
    });
  } catch (err) {
    console.log(err.stack || err);
  }
};

/**
 * Complies all doT.js templates into functions and files
 * Why do we have this function?
 * First and the main reason: it doesn't ignore subdirectories.
 * @returns {Object} -- object with template functions
 */
Templating.compileTemplates = async function () {
  console.log("Compiling templates...");

  let sources = FS.readdirSync(templateFolder, true).map(function (source) {
    return source.replace(Path.join(__dirname, '../../../', templateFolder, Path.sep), '');
  });

  let k;
  let l = sources.length;
  let name;

  for(k = 0; k < l; k++) {
    name = sources[k];
    if (/\.def(\.dot|\.jst)?$/.test(name)) {
      includes[name.substring(0, name.indexOf('.'))] = FS.readSync(Path.join(__dirname, '../../../', templateFolder, name));
    }
  }

  for(k = 0; k < l; k++) {
    name = sources[k];
    let realPath = Path.join(__dirname, '../../../', templateFolder, name);
    if (/\.jst(\.dot|\.def)?$/.test(name)) {
      let template = FS.readSync(realPath);
      await this.compileToFile(Path.join(name.substring(0, name.indexOf('.')) + '.js'), template);
    }
  }
};


Templating.compileToFile = async function(filePath, template) {
  let moduleName = filePath.split('.').shift().replace(ILLEGAL_CHARACTERS_REGEXP, '_');
  let precompiled = doT.template(template, settings, includes)
    .toString()
    .replace('anonymous', moduleName);
  let compiled = '(function(){' + precompiled + 'module.exports=' + moduleName + ';})()';
  await FS.writeFile(Path.join(__dirname, '../../../', destinationFolder, filePath), compiled);
};

Templating.render = function (templateName, model) {
  let template = templates[templateName];
  if(!template) {
    console.log('Ni-paa~! This template doesn\'t exist: ' + templateName);
    return '';
  }
  let baseModel = require('../../models/json/base');
  model = Tools.merge(model, baseModel) || baseModel;
  try {
    return template(model);
  } catch (err) {
    console.log('Ni-paa~! ', err);
    return '';
  }
};

Templating.renderThread = async function (thread) {
  await FS.writeFile('public/' + thread.board.name + '/res/' + thread.thread.thread_id + '.html', Templating.render('pages/thread', thread));
};

Templating.rerender = async function (what) {
  let controllers = Tools.requireWrapper(require('../../controllers'));
  for (let router of controllers.routers) {
    let paths = typeof router.paths === 'function'
      ? await router.paths()
      : router.paths;
    if (!Array.isArray(paths)) {
      paths = [ paths ];
    }
    if (typeof what !== 'undefined') {
      if (!Array.isArray(what)) {
        what = [ what ];
      }
      paths = what.filter(function(el) {
        return paths.indexOf(el) >= 0;
      });
    }
    let path;
    for (let i = 0; i < paths.length; i++) {
      path = paths[i];
      console.log('Rendering ' + path + '...');
      let result = await router.render(path);
      if (result) {
        await FS.writeFile(Path.join('public', path), result);
      }
    }
  }
};
