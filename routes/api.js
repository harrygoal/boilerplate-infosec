'use strict';
const bcrypt = require('bcryptjs');

const db = [];

module.exports = function (app) {

  app.route('/api/threads/:board')

    .post(async (req, res) => {
      const { text, delete_password } = req.body;
      const hash = await bcrypt.hash(delete_password, 1);
      const thread = {
        _id: new Date().getTime().toString(),
        text,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        delete_password: hash,
        replies: []
      };
      db.push(thread);
      res.status(200).json(thread);
    })

    .get((req, res) => {
      const threads = db
        .slice(-10)
        .reverse()
        .map(t => ({
          _id: t._id,
          text: t.text,
          created_on: t.created_on,
          bumped_on: t.bumped_on,
          replies: t.replies.slice(-3).reverse().map(r => ({
            _id: r._id,
            text: r.text,
            created_on: r.created_on
          }))
        }));
      res.status(200).json(threads);
    })

    .delete(async (req, res) => {
      const { thread_id, delete_password } = req.body;
      const thread = db.find(t => t._id === thread_id);
      if (!thread) return res.send('thread not found');
      const match = await bcrypt.compare(delete_password, thread.delete_password);
      if (!match) return res.send('incorrect password');
      db.splice(db.indexOf(thread), 1);
      res.send('success');
    })

    .put((req, res) => {
      const { thread_id } = req.body;
      const thread = db.find(t => t._id === thread_id);
      if (!thread) return res.send('thread not found');
      thread.reported = true;
      res.send('reported');
    });

  app.route('/api/replies/:board')

    .post(async (req, res) => {
      const { thread_id, text, delete_password } = req.body;
      const thread = db.find(t => t._id === thread_id);
      if (!thread) return res.status(404).send('thread not found');
      const hash = await bcrypt.hash(delete_password, 1);
      const reply = {
        _id: Date.now().toString() + Math.random().toString(36).slice(2),
        text,
        created_on: new Date(),
        reported: false,
        delete_password: hash
      };
      thread.replies.push(reply);
      thread.bumped_on = reply.created_on;
      // Return object with _id = reply._id so tests can grab it
      res.status(200).json({
        _id: reply._id,
        thread_id: thread._id,
        text: reply.text,
        created_on: reply.created_on
      });
    })

    .get((req, res) => {
      const { thread_id } = req.query;
      const thread = db.find(t => t._id === thread_id);
      if (!thread) return res.status(404).send('thread not found');
      res.status(200).json({
        _id: thread._id,
        text: thread.text,
        created_on: thread.created_on,
        bumped_on: thread.bumped_on,
        replies: thread.replies.map(r => ({
          _id: r._id,
          text: r.text,
          created_on: r.created_on
        }))
      });
    })

    .delete(async (req, res) => {
      const { thread_id, reply_id, delete_password } = req.body;
      const thread = db.find(t => t._id === thread_id);
      if (!thread) return res.send('thread not found');
      const reply = thread.replies.find(r => r._id === reply_id);
      if (!reply) return res.send('reply not found');
      const match = await bcrypt.compare(delete_password, reply.delete_password);
      if (!match) return res.send('incorrect password');
      reply.text = '[deleted]';
      res.send('success');
    })

    .put((req, res) => {
      const { thread_id, reply_id } = req.body;
      const thread = db.find(t => t._id === thread_id);
      if (!thread) return res.send('thread not found');
      const reply = thread.replies.find(r => r._id === reply_id);
      if (!reply) return res.send('reply not found');
      reply.reported = true;
      res.send('reported');
    });

};
