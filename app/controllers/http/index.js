const express = require('express');
const Renderer = require('../../core/templating');
const FS = require('../../helpers/fs');

let router = module.exports = express.Router();

router.paths = ['/', 'index.html'];

router.render = async function () {
  let pageContent = Renderer.render('pages/home', {
    title: 'Home &mdash; Kuri',
    mainStylesheet: 'home.css',
    dependencies: `
      'master.js',
      'cookieTools.js',
      'themes.css',
      'theming.js',
      'draggabilly.pkgd.min.js',
      'widgets.css',
      'widgets.js',
      'notifications.css',
      'notifications.js'
    `
  });
  await FS.writeFile('public/index.html', pageContent);
};
