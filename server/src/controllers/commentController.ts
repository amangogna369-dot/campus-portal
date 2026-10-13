import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { IComment } from '../db/schemaTypes.js';
import { AuthRequest } from '../middleware/auth.js';

export const getComments = (req: Request, res: Response): void => {
  const { articleId, search } = req.query;
  let list = [...db.comments];

  if (articleId) {
    list = list.filter(c => c.articleId === articleId);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(c => c.content.toLowerCase().includes(q) || c.userName.toLowerCase().includes(q));
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Attach article title for admin convenience
  const enriched = list.map(c => {
    const article = db.articles.find(a => a.id === c.articleId);
    return {
      ...c,
      articleTitle: article ? article.title : 'Deleted Article',
      articleSlug: article ? article.slug : '',
    };
  });

  res.json({ success: true, data: enriched });
};

export const createComment = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Please log in to leave a comment.' });
    return;
  }

  const { articleId, content } = req.body;

  if (!articleId || !content || !content.trim()) {
    res.status(400).json({ success: false, message: 'Article ID and comment content are required.' });
    return;
  }

  const article = db.articles.find(a => a.id === articleId);
  if (!article) {
    res.status(404).json({ success: false, message: 'Article not found.' });
    return;
  }

  const newComment: IComment = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    articleId,
    userId: req.user.id,
    userName: req.user.name,
    userAvatar: req.user.avatar,
    userRole: req.user.role,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  db.comments.unshift(newComment);
  db.save();

  // Notify article author if someone else commented
  if (article.authorId !== req.user.id) {
    db.createNotification(
      article.authorId,
      'New Comment on Your Article',
      `${req.user.name} commented on "${article.title}".`,
      'comment',
      `/articles/${article.slug}`
    );
  }

  res.status(201).json({ success: true, message: 'Comment posted successfully!', data: newComment });
};

export const deleteComment = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const { id } = req.params;
  const index = db.comments.findIndex(c => c.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Comment not found.' });
    return;
  }

  const comment = db.comments[index];
  if (req.user.role !== 'admin' && comment.userId !== req.user.id) {
    res.status(403).json({ success: false, message: 'Permission denied to delete this comment.' });
    return;
  }

  db.comments.splice(index, 1);
  db.save();

  res.json({ success: true, message: 'Comment deleted successfully.' });
};
