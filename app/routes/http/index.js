const router = require('koa-router')();
const Render = require('../../render');
const FS = require('../../helpers/fs');

module.exports = router;

router.paths = ['/', 'index.html'];

router.render = async function () {
  let pageContent = Render.renderPage('pages/home', {
    title: 'Home &mdash; Kuri',
    mainStylesheet: 'home.css'
  });
  await FS.writeFile('public/index.html', pageContent);
};
