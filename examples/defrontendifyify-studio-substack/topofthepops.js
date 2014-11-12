var request = require('hyperquest');
var concat = require('concat-stream');
var select = require('html-select');
var tokenize = require('html-tokenize');
var baseurl = 'http://studio.substack.net';
var baudio = require('baudio');

var s = select('.row > .link', link);

request(baseurl + '/-/recent').pipe(tokenize()).pipe(s);

var links = [];

function link(e) {
  links.push(e.getAttribute('href'));
}

s.resume();
player();

function player() {
  var href = links.shift();
  if (!href) return setTimeout(player, 1000);
  var s = select('#code', function(e) {
    e.createReadStream().on('data', function (row) {
      if (row[0] === 'text') play(row[1].toString());
    });
  });
  if (href) {
    console.log('processing %s', href);
    request(baseurl + href).pipe(tokenize()).pipe(s);
  }
}

function play(code) {
  var f = Function(code)();
  var b = baudio(f);
  b.play();
  setTimeout(end, 10000);
  function end() {
    b.end();
    player();
  }
}
