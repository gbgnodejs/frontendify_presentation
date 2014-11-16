var request = require('hyperquest');
var baseurl = 'http://studio.substack.net';
var baudio = require('baudio');
var trumpet = require('trumpet');
var vm = require('vm');

var tr = trumpet();

tr.selectAll('.row > .link', link);

request(baseurl + '/-/recent').pipe(tr);

var links = [];

function link(e) {
  links.push(e.getAttribute('href'));
}

player();

function player() {
  var href = links.shift();
  if (!href) return setTimeout(player, 1000);
  var tr = trumpet();
  tr.select('#code', function(e) {
    e.createReadStream().on('data', play);
  });
  if (href) {
    console.log('processing %s', href);
    request(baseurl + href).pipe(tr);
  }
}

function play(code) {
  var script = vm.createScript('(function() { ' + code + '})');
  var f = script.runInNewContext()();
  var b = baudio(f);
  b.play();
  setTimeout(end, 10000);
  function end() {
    b.end();
    player();
  }
}
