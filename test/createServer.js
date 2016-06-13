const expect = require('chai').expect;
const path = require('path');
const child_process = require('child_process');
const createServer = require('../lib/createServer');
const http = require('http');
const url = require('url');

describe('createServer', () => {
  var server,
    s1,
    s2;

  before(done => {
    s1 = http.createServer((req, res) => {
      res.write('service 1');
      res.end();
    });
    s2 = http.createServer((req, res) => {
      res.write('service 2');
      res.end();
    });
    s1.listen(3000, () => {
      s2.listen(3001, done);
    });
  });

  after(done => {
    s1.close(() => {
      s2.close(done);
    });
  });

  afterEach(done => {
    if (server && server.close) {
      server.close(done);
    } else {
      done();
    }
  });


  it('should raise a error because argument is missing', () => {
    expect(() => {
      createServer();
    }).to.throw(Error);
  });

  it('should raise a error because no urls specified', () => {
    expect(() => {
      createServer([]);
    }).to.throw(Error);
  });

  it('should raise a error because of bad arguments type', () => {
    expect(() => {
      createServer({});
    }).to.throw(Error);
  });

  function listenAndPost() {
    server.listen(4000, () => {
      var options = url.parse('http://localhost:4000/');
      options.method = 'POST';
      var query = http.request(options);
      query.write('yolo');
      query.end();
    });
  }

  it('should forward over one service', (done) => {
    server = createServer(['http://localhost:3000/']);
    listenAndPost();
    s1.once('request', () => {
      done();
    });
  });

  it('should forward data', (done) => {
    server = createServer(['http://localhost:3000/']);
    listenAndPost();
    s1.once('request', response => {
      var body = '';
      response.on('data', chunk => body += chunk);
      response.on('end', () => {
        expect(body).to.be.equal('yolo');
        done();
      });
    });
  });

  it('should forward over 2 services', (done) => {
    var t1,
      t2;
    server = createServer(['http://localhost:3000/', 'http://localhost:3001/']);
    listenAndPost();
    s1.once('request', () => {
      t1 = true;
      if (t1 && t2) done();
    });
    s2.once('request', () => {
      t2 = true;
      if (t1 && t2) done();
    });
  });

  it('should forward over 2 services (one down)', (done) => {
    server = createServer(['http://server-down/', 'http://localhost:3001/']);
    listenAndPost();
    s2.once('request', () => {
      done();
    });
  });

  it('should conserve path', done => {
    server = createServer(['http://localhost:3000/']);
    server.listen(4000, () => {
      var options = url.parse('http://localhost:4000/custom_url');
      var query = http.request(options);
      query.end();
    });
    s1.once('request', (request) => {
      expect(request.url).to.be.equal('/custom_url');
      done();
    });
  });

  it('should conserve protocol (DELETE)', done => {
    server = createServer(['http://localhost:3000/']);
    server.listen(4000, () => {
      var options = url.parse('http://localhost:4000/custom_url');
      options.method = 'DELETE';
      var query = http.request(options);
      query.end();
    });
    s1.once('request', (request) => {
      expect(request.method).to.be.equal('DELETE');
      done();
    });
  });

  it('should get receive status 200', done => {
    server = createServer(['http://localhost:3000/']);
    server.listen(4000, () => {
      var options = url.parse('http://localhost:4000/custom_url');
      var query = http.request(options, response => {
        expect(response.statusCode).to.be.equal(200);
        done();
      });
      query.end();
    });
  });

  it('should get receive status 200 on unknow server', done => {
    server = createServer(['http://unexisting-url/']);
    server.listen(4000, () => {
      var options = url.parse('http://localhost:4000/');
      var query = http.request(options, response => {
        expect(response.statusCode).to.be.equal(200);
        done();
      });
      query.end();
    });
  });

  it.skip('should get receive an answer even if the server crash during the request', done => {
    const child = child_process.fork(path.join(__dirname, '../util/crashingServer'), [], {
      silent: true
    });
    child.once('message', message => {
      expect(message).to.be.equal('ready');
      server = createServer(['http://localhost:5000/']);
      server.listen(4000, () => {
        var options = url.parse('http://localhost:4000/');
        const query = http.request(options, response => {
          expect(response.statusCode).to.be.equal(200);
          done();
        });
        query.end();
      });
    });
  });

});
