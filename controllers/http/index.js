const express = require('express');
const Renderer = require('../../core/templating');

let router = module.exports = express.Router();

/*router.paths = function () {
  return ['/', 'index.html'];
};*/

router.paths = 'index.html';

router.render = function (path) {
  return Renderer.render('pages/home', {});
};
