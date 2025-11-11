const Comment = require('../models/comment');

exports.getAllComments = async (_req, res) => {
  try {
    const rows = await Comment.getAllComments();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const rows = await Comment.getCommentById(req.params.id);
    if (!rows.length) return res.status(404).json({ msg: 'Comment not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getCommentsByRecipeId = async (req, res) => {
  try {
    const rows = await Comment.getCommentsByRecipeId(req.params.recipe_id);
    res.status(200).json(rows); // empty array if none
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.createComment = async (req, res) => {
  const { recipe_id, user_id, content } = req.body;
  try {
    const id = await Comment.createComment({
      recipe_id,
      user_id,
      content,
      date_commented: new Date()
    });
    res.json({ comment_id: id });
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).send('Server error');
  }
};

exports.updateComment = async (req, res) => {
  try {
    await Comment.updateComment(req.params.id, req.body.content);
    res.json({ message: 'Comment updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.deleteComment = async (req, res) => {
  try {
    await Comment.deleteComment(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};