const express = require('express');
const Renderer = require('../../core/templating');

let router = module.exports = express.Router();

router.paths = 'index.html';

router.render = function () {
  return Renderer.render('pages/home', {
    title: 'Home &mdash; Kuri',
    dependencies: {
      css: "['../css/home.css']",
      js: "['../js/master.js', '../js/draggabilly.pkgd.min.js', '../js/ui.js']"
    }
  });
};
