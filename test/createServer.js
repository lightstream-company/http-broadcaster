const expect = require('chai').expect;
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

  it('should forward over one service', (done) => {
    server = createServer(['http://localhost:3000/']);
    server.listen(4000, () => {
      var options = url.parse('http://localhost:4000/');
      var query = http.request(options);
      query.end();
    });
    s1.once('request', () => {
      done();
    });
  });

  it('should forward over 2 services', (done) => {
    var t1,
      t2;
    server = createServer(['http://localhost:3000/', 'http://localhost:3001/']);
    server.listen(4000, () => {
      var options = url.parse('http://localhost:4000/');
      var query = http.request(options);
      query.end();
    });
    s1.once('request', () => {
      t1 = true;
      if (t1 && t2) done();
    });
    s1.once('request', () => {
      t2 = true;
      if (t1 && t2) done();
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

  it('should get receive status 200');

  it('should get receive status 500');

  it('should get receive status NETWORK_ERROR');

});
