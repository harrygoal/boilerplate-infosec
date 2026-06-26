const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../myApp.js');

const assert = chai.assert;
chai.use(chaiHttp);

suite('Functional Tests - Infosec', function() {
  this.timeout(5000);

  let threadId = '';
  let replyId = '';
  const board = 'test';

  // 1. Creating a new thread: POST request to /api/threads/{board}
  test('Creating a new thread', function(done) {
    chai.request(server)
      .post(`/api/threads/${board}`)
      .send({
        text: 'Test thread',
        delete_password: '123'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isString(res.body._id);
        threadId = res.body._id;
        done();
      });
  });

  // 2. Viewing the 10 most recent threads with 3 replies each
  test('Viewing the 10 most recent threads with 3 replies each', function(done) {
    chai.request(server)
      .get(`/api/threads/${board}`)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtMost(res.body.length, 10);
        if (res.body.length > 0) {
          assert.isAtMost(res.body[0].replies.length, 3);
        }
        done();
      });
  });

  // 3. Deleting a thread with the incorrect password
  test('Deleting a thread with the incorrect password', function(done) {
    chai.request(server)
      .delete(`/api/threads/${board}`)
      .send({
        thread_id: threadId,
        delete_password: 'wrong'
      })
      .end(function(err, res) {
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  // 4. Deleting a thread with the correct password
  test('Deleting a thread with the correct password', function(done) {
    chai.request(server)
      .delete(`/api/threads/${board}`)
      .send({
        thread_id: threadId,
        delete_password: '123'
      })
      .end(function(err, res) {
        assert.equal(res.text, 'success');
        done();
      });
  });

  // 5. Reporting a thread
  test('Reporting a thread', function(done) {
    // First create a new thread to report
    chai.request(server)
      .post(`/api/threads/${board}`)
      .send({
        text: 'Thread to report',
        delete_password: '123'
      })
      .end(function(err, res) {
        const reportId = res.body._id;
        chai.request(server)
          .put(`/api/threads/${board}`)
          .send({
            thread_id: reportId
          })
          .end(function(err, res) {
            assert.equal(res.text, 'reported');
            done();
          });
      });
  });

  // 6. Creating a new reply
  test('Creating a new reply', function(done) {
    // Create a thread first
    chai.request(server)
      .post(`/api/threads/${board}`)
      .send({
        text: 'Thread for reply',
        delete_password: '123'
      })
      .end(function(err, res) {
        const threadIdForReply = res.body._id;
        chai.request(server)
          .post(`/api/replies/${board}`)
          .send({
            thread_id: threadIdForReply,
            text: 'Test reply',
            delete_password: '123'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isString(res.body._id);
            replyId = res.body._id;
            done();
          });
      });
  });

  // 7. Viewing a single thread with all replies
  test('Viewing a single thread with all replies', function(done) {
    // Create a thread with a reply first
    chai.request(server)
      .post(`/api/threads/${board}`)
      .send({
        text: 'Thread for viewing replies',
        delete_password: '123'
      })
      .end(function(err, res) {
        const viewThreadId = res.body._id;
        chai.request(server)
          .post(`/api/replies/${board}`)
          .send({
            thread_id: viewThreadId,
            text: 'Reply for viewing',
            delete_password: '123'
          })
          .end(function(err, res) {
            chai.request(server)
              .get(`/api/replies/${board}?thread_id=${viewThreadId}`)
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body.replies);
                done();
              });
          });
      });
  });

  // 8. Deleting a reply with the incorrect password
  test('Deleting a reply with the incorrect password', function(done) {
    // Create a thread and reply first
    chai.request(server)
      .post(`/api/threads/${board}`)
      .send({
        text: 'Thread for reply delete test',
        delete_password: '123'
      })
      .end(function(err, res) {
        const threadIdForDelete = res.body._id;
        chai.request(server)
          .post(`/api/replies/${board}`)
          .send({
            thread_id: threadIdForDelete,
            text: 'Reply to delete',
            delete_password: '123'
          })
          .end(function(err, res) {
            const replyIdForDelete = res.body._id;
            chai.request(server)
              .delete(`/api/replies/${board}`)
              .send({
                thread_id: threadIdForDelete,
                reply_id: replyIdForDelete,
                delete_password: 'wrong'
              })
              .end(function(err, res) {
                assert.equal(res.text, 'incorrect password');
                done();
              });
          });
      });
  });

  // 9. Deleting a reply with the correct password
  test('Deleting a reply with the correct password', function(done) {
    // This test requires a reply to delete with correct password
    // Create a new thread and reply for this test
    chai.request(server)
      .post(`/api/threads/${board}`)
      .send({
        text: 'Thread for correct reply delete test',
        delete_password: '123'
      })
      .end(function(err, res) {
        const threadIdForCorrectDelete = res.body._id;
        chai.request(server)
          .post(`/api/replies/${board}`)
          .send({
            thread_id: threadIdForCorrectDelete,
            text: 'Reply to delete correctly',
            delete_password: '123'
          })
          .end(function(err, res) {
            const replyIdForCorrectDelete = res.body._id;
            chai.request(server)
              .delete(`/api/replies/${board}`)
              .send({
                thread_id: threadIdForCorrectDelete,
                reply_id: replyIdForCorrectDelete,
                delete_password: '123'
              })
              .end(function(err, res) {
                assert.equal(res.text, 'success');
                done();
              });
          });
      });
  });

  // 10. Reporting a reply
  test('Reporting a reply', function(done) {
    // Create a thread and reply to report
    chai.request(server)
      .post(`/api/threads/${board}`)
      .send({
        text: 'Thread for reply report test',
        delete_password: '123'
      })
      .end(function(err, res) {
        const threadIdForReport = res.body._id;
        chai.request(server)
          .post(`/api/replies/${board}`)
          .send({
            thread_id: threadIdForReport,
            text: 'Reply to report',
            delete_password: '123'
          })
          .end(function(err, res) {
            const replyIdForReport = res.body._id;
            chai.request(server)
              .put(`/api/replies/${board}`)
              .send({
                thread_id: threadIdForReport,
                reply_id: replyIdForReport
              })
              .end(function(err, res) {
                assert.equal(res.text, 'reported');
                done();
              });
          });
      });
  });
});