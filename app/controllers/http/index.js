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
      'theming.js',
      'widgets.css',
      'widgets.js',
      'notifications.css',
      'notifications.js'
    `
  });
  await FS.writeFile('public/index.html', pageContent);
};
