const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

var id1 = '';
var id2 = '';



suite('Functional Tests', function() {
  
  test('Every field filled in', done => {
    chai.request(server)
    .post('/api/issues/test')
    .send({
      issue_title: 'Title 1',
      issue_text: 'text',
      created_by: 'Functional Test - Every Field',
      assigned_to: 'Chai and Mocha',
      status_text: 'In QA'
    })
    .end((error, res) => {
      assert.equal(res.status, 200);

      assert.equal(res.body.issue_title, 'Title 1')
      assert.equal(res.body.issue_text, 'text')
      assert.equal(res.body.created_by, 'Functional Test - Every Field')
      assert.equal(res.body.assigned_to, 'Chai and Mocha')
      assert.equal(res.body.status_text, 'In QA')
      assert.equal(res.body.open, true)
      assert.equal(res.body.project, 'test')
      id1 = res.body._id

      console.log('id 1 is: ' + id1)

      done();
    });
  });

  test('Required fields filled in', done => {
    chai.request(server)
    .post('/api/issues/test')
    .send({
      issue_title: 'Title 2',
      issue_text: 'text',
      created_by: 'Functional Test - Required Fields'
    })
    .end((error, res) => {
      assert.equal(res.status, 200);

      assert.equal(res.body.issue_title, 'Title 2')
      assert.equal(res.body.issue_text, 'text')
      assert.equal(res.body.created_by, 'Functional Test - Required Fields')
      assert.equal(res.body.assigned_to, '')
      assert.equal(res.body.status_text, '')
      assert.equal(res.body.open, true)
      assert.equal(res.body.project, 'test')
      id2 = res.body._id

      console.log('id 2 is: ' + id2)

      done();
    });
  });

  test('Missing Required Fields', done => {
    chai.request(server)
    .post('/api/issues/test')
    .send({
      issue_title: 'Title 3'
    })
    .end((error, res) => {
      assert.equal(res.body.error, 'required field(s) missing');
      done();
    });
  });
  
  //GET - View Issues
  test("No filter", function(done) {
    chai.request(server)
    .get("/api/issues/test")
    .query({})
    .end(function(err, res) {
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      assert.property(res.body[0], "issue_title");
      assert.property(res.body[0], "issue_text");
      assert.property(res.body[0], "created_on");
      assert.property(res.body[0], "updated_on");
      assert.property(res.body[0], "created_by");
      assert.property(res.body[0], "assigned_to");
      assert.property(res.body[0], "open");
      assert.property(res.body[0], "status_text");
      assert.property(res.body[0], "_id");
      done();
    });
  });

  //GET - View Issues with 1 filter
  test("One filter", done => {
    chai.request(server)
    .get("/api/issues/test")
    .query({ created_by: "Functional Test - Every Field" })
    .end(function(err, res) {
      res.body.forEach(issueResult => {
        assert.equal(issueResult.created_by, "Functional Test - Every Field");
      });
      done();
    });
  });

  //GET - View Issues with multiple filters

  test("One filter", done => {
    chai.request(server)
    .get("/api/issues/test")
    .query({ created_by: "Functional Test - Every Field", issue_text: 'text' })
    .end(function(err, res) {
      res.body.forEach(issueResult => {
        assert.equal(issueResult.created_by, "Functional Test - Every Field");
      });
      done();
    });
  });

  //PUT - Update 1 field
  test('PUT - Update 1 field', done => {
    chai.request(server)
    .put('/api/issues/test')
    .send({
      _id: id1,
      issue_text: 'updated text'
    })
    .end((error, res) => {
      assert.equal(res.body.result, 'successfully updated');
      assert.equal(res.body._id, id1)
      done();
    })
  })

  //PUT - Update Multiple Fields
  test('PUT - Update Multiple fields', done => {
    chai.request(server)
    .put('/api/issues/test')
    .send({
      _id: id1,
      issue_text: 'updated text',
      created_by: 'updated creator'
    })
    .end((error, res) => {
      assert.equal(res.body.result, 'successfully updated');
      assert.equal(res.body._id, id1)
      done();
    })
  })

  //PUT - Missing id
  test('PUT - Missing id', done => {
    chai.request(server)
    .put('/api/issues/test')
    .send({
      _id: ''
    })
    .end((error, res) => {
      assert.equal(res.body.error, 'missing _id');
      done();
    })
  })

  //PUT = Missing Fields
  test('PUT - No fields', done => {
    chai.request(server)
    .put('/api/issues/test')
    .send({
      _id: id1
    })
    .end((error, res) => {
      assert.equal(res.body.error, 'no update field(s) sent');
      assert.equal(res.body._id, id1)
      done();
    })
  })

  //PUT - Invalid id
  test('PUT - Invalid id', done => {
    chai.request(server)
    .put('/api/issues/test')
    .send({
      _id: '12345notanid',
      issue_text: 'updated text'
    })
    .end((error, res) => {
      assert.equal(res.body.error, 'could not update');
      assert.equal(res.body._id, '12345notanid')
      done();
    })
  })

  
  //Delete - successfully delete
  test('Delete - successfully delete', done => {
    chai.request(server)
    .delete('/api/issues/test')
    .send({
      _id: id2
    })
    .end((error, res) => {
      assert.equal(res.body.result, 'successfully deleted');
      assert.equal(res.body._id, id2)
      done();
    })
  })

  //Delete - invalid id
  test('PUT - Invalid id', done => {
    chai.request(server)
    .delete('/api/issues/test')
    .send({
      _id: '12345notanid'
    })
    .end((error, res) => {
      assert.equal(res.body.error, 'could not delete');
      assert.equal(res.body._id, '12345notanid')
      done();
    })
  })

  //Delete - missing id
  test('Delete - Missing id', done => {
    chai.request(server)
    .delete('/api/issues/test')
    .send({
    })
    .end((error, res) => {
      assert.equal(res.body.error, 'missing _id');
      done();
    })
  })
  
});
