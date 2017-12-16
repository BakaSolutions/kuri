const doT = require('dot');
const FS = require('../helpers/fs');
const Path = require('path');
const Tools = require('../helpers/tools');
const Logger = require('../helpers/logger');

let Render = module.exports = {};
let includes = {};
let templates = {};

const settings = {
  __proto__: doT.templateSettings,
  strip: false
};
const ILLEGAL_CHARACTERS_REGEXP = /[^a-zA-Z$_]/gi;

let templateFolder = 'src/views';
let destinationFolder = '.tmp/views';

Render.reloadTemplates = function () {
  try {
    let templatePaths = FS.readdirSync(destinationFolder, true);
    templatePaths.forEach(function (templatePath) {
      if (Path.parse(templatePath).ext !== '.js') {
        return false;
      }
      let templateName = templatePath
          .replace(Path.join(__dirname, '../../', destinationFolder, Path.sep), '')
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
Render.compileTemplates = async function () {
  Logger.info('[Rndr] Compiling templates...');

  let sources = FS.readdirSync(templateFolder, true).map(function (source) {
    return source.replace(Path.join(__dirname, '../../', templateFolder, Path.sep), '');
  });

  let k;
  let l = sources.length;
  let name;

  for (k = 0; k < l; k++) {
    name = sources[k];
    if (/\.def(\.dot|\.jst)?$/.test(name)) {
      includes[name.substring(0, name.indexOf('.'))] = FS.readSync(Path.join(__dirname, '../../', templateFolder, name));
    }
  }

  for (k = 0; k < l; k++) {
    name = sources[k];
    let realPath = Path.join(__dirname, '../../', templateFolder, name);
    if (/\.jst(\.dot|\.def)?$/.test(name)) {
      let template = FS.readSync(realPath);
      await this.compileToFile(Path.join(name.substring(0, name.indexOf('.')) + '.js'), template);
    }
  }
};


Render.compileToFile = async function(filePath, template) {
  let moduleName = filePath.split('.').shift().replace(ILLEGAL_CHARACTERS_REGEXP, '_');
  let precompiled = doT.template(template, settings, includes)
      .toString()
      .replace('anonymous', moduleName);
  let compiled = '(function(){' + precompiled + 'module.exports=' + moduleName + ';})()';
  await FS.writeFile(Path.join(__dirname, '../../', destinationFolder, filePath), compiled);
};

Render.renderPage = function (templateName, model) {
  try {
    let template = templates[templateName];
    if (!template) {
      return new Error('This template doesn\'t exist: ' + templateName);
    }
    let baseModel = require('../models/base');
    model = Tools.merge(model, baseModel) || baseModel;
    return template(model);
  } catch (e) {
    Logger.error(e);
    return 'Ni-paa~! Please, recompile templates.';
  }
};

Render.rerender = async function (what) {
  let routes = Tools.requireWrapper(require('../routes'));
  for (let router of routes.routers) {
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
      paths = what.filter(el => ~paths.indexOf(el));
    }
    for (let i = 0; i < paths.length; i++) {
      let path = paths[i];
      Logger.info(`[Rndr] Rendering ${path}...`);
      let result = await router.render(path);
      if (result) {
        await FS.writeFile(Path.join('public', path), result);
      }
    }
  }
};
