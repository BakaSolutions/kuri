const express = require('express');
const Renderer = require('../../core/templating');

let router = module.exports = express.Router();

router.paths = 'index.html';

router.render = function () {
  return Renderer.render('pages/home', {
    title: 'Home &mdash; Kuri',
    mainStylesheet: 'home.css',
    dependencies: [
      'master.js',
      'cookieTools.js',
      'themes.css',
      'theming.js',
      'draggabilly.pkgd.min.js',
      'widgets.css',
      'widgets.js',
      'notifications.css',
      'notifications.js'
    ]
  });
};
