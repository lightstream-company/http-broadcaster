const minimist = require('minimist');
const createServer = require('./lib/createServer');

const argv = minimist(process.argv.slice(2));

var urlArg = argv.u || argv.url;
var port = argv.p || argv.port || 3000;

if (typeof urlArg === 'string') {
  urlArg = [urlArg];
}

const server = createServer(urlArg);
server.listen(port, () => {
  console.log('http-broadcaster listening on 127.0.0.1:' + port);
  console.log('forward on \r\n' + urlArg.join('\r\n'));
});
