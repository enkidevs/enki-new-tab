'use strict';
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var async = require('async');

var COMPONENTS_PATH = 'node_modules/prismjs/components/';

main();

var LANGUAGES_TO_KEEP = ['bash', 'css', 'java', 'javascript', 'jsx', 'markup', 'python', 'docker', 'ruby'];
var LANGUAGES_TO_KEEP_FILES = LANGUAGES_TO_KEEP.map(getFile);

function main() {
  glob(COMPONENTS_PATH + '*.js', {}, function(err, files) {
    if(err) {
      return console.error(err);
    }
    files = files.filter(function(file) {
      // skip jsx given we use a custom file for that
      if(file.indexOf('jsx') >= 0) {
        return false;
      }

      // skip minified and core
      return file.indexOf('.min.js') === -1 && file.indexOf('-core.') === -1;
    }).filter(filterLanguages);

    // prism doesn't maintain any dependency information so we need to define
    // some by hand... without this the build will fail to work
    files = reorder(files, ['clike', 'csharp', 'aspnet', 'c', 'cpp', 'd', 'dart',
      'fsharp', 'glsl', 'groovy', 'haxe', 'nginx', 'kotlin', 'bison', 'javascript',
      'markup', 'jsx', 'parser', 'markdown', 'jade', 'handlebars', 'actionscript',
      'coffeescript', 'ruby', 'haml', 'crystal', 'css', 'css-extras', 'less', 'wiki',
      'http', 'php', 'php-extras', 'processing', 'pure', 'sass', 'scss', 'smarty']);

    async.map(files, function(file, cb) {
      fs.readFile(file, {
        encoding: 'utf-8'
      }, cb);
    }, function(err, data) {
      if(err) {
        return console.error(err);
      }

      var code = ['var Prism = require(\'prismjs\');\n'].
        concat(data).
        concat('delete Prism.languages.extend;\n').
        concat('delete Prism.languages.insertBefore;\n').
        concat('module.exports = Prism.languages;\n').
        join('');

      fs.writeFile('./index.js', code, function(err) {
        if(err) {
          return console.error(err);
        }
      });
    });
  });
}

function reorder(files, priority) {
  var priorityFiles = priority.map(getFile).filter(filterLanguages);

  return priorityFiles.concat(files.filter(function(file) {
    return priorityFiles.indexOf(file) === -1;
  }));
}

function getFile(p) {
  return COMPONENTS_PATH + 'prism-' + p + '.js';
}

function filterLanguages(p) {
  return LANGUAGES_TO_KEEP_FILES.indexOf(p) !== -1;
}
