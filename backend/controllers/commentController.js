const Comment = require('../models/comment');

exports.getAllComments = async (_req, res) => {
  try {
    const rows = await Comment.getAllComments();
    res.json(rows);
  } catch (err) {
    console.error('getAllComments controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const result = await Comment.getCommentDetails(req.params.id);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'Comment not found' });
      }
      console.error('getCommentById model error:', result.error);
      return res.status(500).json({ msg: 'Could not fetch comment' });
    }

    res.json(result.comment);
  } catch (err) {
    console.error('getCommentById controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.getCommentsByRecipeId = async (req, res) => {
  try {
    const result = await Comment.getCommentsForRecipe(req.params.recipe_id);
    // always success here, returns empty array if none
    res.status(200).json(result.comments);
  } catch (err) {
    console.error('getCommentsByRecipeId controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.createComment = async (req, res) => {
  const { recipe_id, user_id, content } = req.body;

  try {
    const result = await Comment.createCommentWithDefaults({
      recipe_id,
      user_id,
      content
    });

    if (!result.success) {
      if (result.error === 'INVALID_INPUT') {
        return res.status(400).json({ msg: 'Missing required fields' });
      }
      console.error('createComment model error:', result.error);
      return res.status(500).json({ msg: 'Could not create comment' });
    }

    res.json({ comment_id: result.comment_id });
  } catch (err) {
    console.error('createComment controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const result = await Comment.updateCommentIfExists(id, content);

    if (!result.success) {
      if (result.error === 'INVALID_INPUT') {
        return res.status(400).json({ msg: 'Content is required' });
      }
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'Comment not found' });
      }
      console.error('updateComment model error:', result.error);
      return res.status(500).json({ msg: 'Could not update comment' });
    }

    res.json({ message: 'Comment updated successfully' });
  } catch (err) {
    console.error('updateComment controller error:', err);
    res.status(500).send('Server error');
  }
};

exports.deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Comment.deleteCommentIfExists(id);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ msg: 'Comment not found' });
      }
      console.error('deleteComment model error:', result.error);
      return res.status(500).json({ msg: 'Could not delete comment' });
    }

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('deleteComment controller error:', err);
    res.status(500).send('Server error');
  }
};