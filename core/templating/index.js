const doT = require('dot');
const FS = require('../../helpers/fs');
const path = require('path');
const Tools = require('../../helpers/tools');

const BaseModel = require('../../models/json/base');

let Templating = module.exports = {};
let includes = {};
let templates = {};

//Templating.__rendermodule = {};

const ILLEGAL_CHARACTERS_REGEXP = /[^a-zA-Z$_]/gi;
//const ENCODE_HTML_SOURCE = doT.encodeHTMLSource.toString();

let templateFolder = 'src/views';
let destinationFolder = '.tmp/views';



Templating.reloadTemplates = function () {
  try {
    FS.readdirSync(destinationFolder, true).map(function (source) {
      source.substring(0, source.indexOf('.'));
      return source.replace(path.join(__dirname, '../../', destinationFolder, path.sep), '');
    }).forEach(function (templateName) {
      if (path.parse(templateName).ext !== '.js')
        return false;
      templateName = templateName.split('.').shift();
      let id = require.resolve(path.join(__dirname, '../../', destinationFolder, templateName));
      if (require.cache[id]) {
        delete require.cache[id];
      }
      templates[templateName] = require(id);
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
Templating.compileTemplates = function () {
  console.log("Compiling templates...");

  let sources = FS.readdirSync(templateFolder, true).map(function (source) {
    return source.replace(path.join(__dirname, '../../', templateFolder, path.sep), '');
  });

  let k;
  let l = sources.length;
  let name;

  for(k = 0; k < l; k++) {
    name = sources[k];
    if (/\.def(\.dot|\.jst)?$/.test(name)) {
      includes[name.substring(0, name.indexOf('.'))] = FS.readSync(path.join(__dirname, '../../', templateFolder, name));
    }
  }

  for(k = 0; k < l; k++) {
    name = sources[k];
    let realPath = path.join(__dirname, '../../', templateFolder, name);
    /*if (/\.dot(\.def|\.jst)?$/.test(name)) {
      this.__rendermodule[name.substring(0, name.indexOf('.'))] = realPath;
    }*/
    if (/\.jst(\.dot|\.def)?$/.test(name)) {
      let template = FS.readSync(realPath);
      this.compileToFile(path.join(name.substring(0, name.indexOf('.')) + '.js'), template);
    }
  }
  //return this.__rendermodule;
};


Templating.compileToFile = function(filePath, template) {
  let moduleName = filePath.split('.').shift().replace(ILLEGAL_CHARACTERS_REGEXP, '_');
  let precompiled = doT.template(template, doT.templateSettings, includes)
    .toString()
    .replace('anonymous', moduleName);
  /*let compiled = '(function(){' + precompiled + 'var itself=' + moduleName + ',_encodeHTML=('
      + ENCODE_HTML_SOURCE + '());module.exports=itself;})()';*/
  let compiled = '(function(){' + precompiled + 'module.exports=' + moduleName + ';})()';
  FS.writeFileSync(path.join(__dirname, '../../', destinationFolder, filePath), compiled);
};

Templating.render = function (templateName, model) {
  let template = templates[templateName];
  if(!template) {
    console.log('Ni-paa~! This template doesn\'t exist: ' + templateName);
    return '';
  }
  let baseModel = BaseModel;
  model = Tools.merge(baseModel, model) || baseModel;
  try {
    return template(model);
  } catch (err) {
    console.log('Ni-paa~! ', err);
    return '';
  }
};

Templating.rerender = function (what) { // TODO: Optional render
  let controllers = Tools.requireWrapper(require('../../controllers'));
  controllers.routers.forEach(async function (router) {
    let paths = typeof router.paths === 'function'
      ? await router.paths()
      : router.paths;
    if (!Array.isArray(paths)) {
      paths = [ paths ];
    }
    let path_;
    for (let i = 0; i < paths.length; i++) {
      path_ = paths[i];
      console.log('Rendering ' + path_ + '...');
      let result = await router.render(path_);
      FS.writeFileSync(path.join('public', path_), result);
    }
  })
};
