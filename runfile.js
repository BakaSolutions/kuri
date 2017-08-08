const run = require('runjs').run;
const os = require('os');
const path = require('path');
const CleanCSS = require('clean-css');

const FS = require('./helpers/fs');
const build = module.exports = {};

console.log('Kuri runfile, version 0.0.1');

build.install = function () {
  let o = this.options;
  if (o) {
    if(!o['without-assets'] && o['with-assets']) {
      assets();
    }
    if(!o['without-npm'] && o['with-npm']) {
      console.log('Installing NPM packages...');
      run('npm i');
    }
    if(!o['without-build'] && o['with-build']) {
      build.build.all();
    }
    return finish();
  }
  assets();
  build.build.all();
  finish();


  function assets(){
    console.log('Copying kuri assets...');
    const PATH = ' ' + path.resolve(__dirname, 'assets') + path.sep + '.' +
        ' ' + path.resolve('.');
    let cmd = os.platform() === 'win32'
        ? 'xcopy /s' + PATH
        : 'cp -a'+ PATH;
    run(cmd);
  }
  function finish() {
    console.log('\n\nDone! Run `npm start` ^з^\n\n');
  }
};

build.build = {
  css: function() {
    let css = new CleanCSS({
      level: {
        1: {
          transform: function (propertyName, propertyValue, selector) {
            if (propertyValue.indexOf('src') > -1) {
              return propertyValue.replace('src', '');
            }
          }
        },
        2: {
          all: true
        }
      }
    });
    let exists = FS.existsSync('./src/css/');
    if (!exists) {
      build.options = {
        'only-assets': true
      };
      build.install();
    }

    console.log('Building CSS...');
    let input = FS.readdirSync(path.resolve('./src/css')).filter(function (file, i, input) {
      if (/\.css$/i.test(file))
        return file;
    });
    let output = input.map(function(string, i, input){
      return string.replace('src', 'public');
    });
    input.forEach(function(style, i, input) {
      css.minify([style], cssProgress.bind(this, output[i]));
    });

    console.log('Building custom CSS...');
    let customInput = FS.readdirSync(path.resolve('./src/css/custom'));
    css.minify(customInput, cssProgress.bind(this, path.resolve('./public/css/custom.css')));

    function cssProgress(outFile, err, out) {
      FS.writeFileSync(outFile, out.styles);
      let msg = outFile.replace(__dirname, '') + ': ' + out.stats.timeSpent + ' ms';
      if(out.inlinedStylesheets.length)
        msg += ' (' + out.inlinedStylesheets.length + ' inline CSS)';
      console.log(msg);
    }
  },
  all: function() {
    console.log('Building kuri...');
    build.build.css();
  }
};