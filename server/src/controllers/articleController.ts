import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { User } from '../models/User.js';
import { IArticle, ArticleStatus } from '../db/schemaTypes.js';
import { AuthRequest } from '../middleware/auth.js';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export const getArticles = (req: AuthRequest, res: Response): void => {
  const {
    category,
    tag,
    author,
    search,
    status = 'published',
    sort = 'latest',
    page = '1',
    limit = '10',
    featured,
  } = req.query;

  let list = [...db.articles];

  // Filter by status:
  // If not admin, normal public queries only see 'published'
  const isAdmin = req.user?.role === 'admin';
  if (!isAdmin && status !== 'published' && status !== 'all') {
    list = list.filter(a => a.status === 'published');
  } else if (status !== 'all') {
    list = list.filter(a => a.status === status);
  }

  // Filter by category
  if (category && category !== 'all') {
    list = list.filter(
      a => a.categorySlug.toLowerCase() === (category as string).toLowerCase() ||
           a.category.toLowerCase() === (category as string).toLowerCase()
    );
  }

  // Filter by tag
  if (tag) {
    const t = (tag as string).toLowerCase();
    list = list.filter(a => a.tags.some(tagItem => tagItem.toLowerCase().includes(t)));
  }

  // Filter by author
  if (author) {
    const aQ = (author as string).toLowerCase();
    list = list.filter(a => a.authorName.toLowerCase().includes(aQ) || a.authorId === author);
  }

  // Filter by featured
  if (featured === 'true') {
    list = list.filter(a => a.isFeatured);
  }

  // Search filter
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      a =>
        a.title.toLowerCase().includes(q) ||
        a.shortDescription.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.authorName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sorting
  switch (sort) {
    case 'oldest':
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'most_viewed':
      list.sort((a, b) => b.views - a.views);
      break;
    case 'most_liked':
      list.sort((a, b) => b.likesCount - a.likesCount);
      break;
    case 'latest':
    default:
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 10;
  const total = list.length;
  const totalPages = Math.ceil(total / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = list.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    data: {
      articles: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasMore: pageNum < totalPages,
      },
    },
  });
};

export const getFeaturedArticles = (_req: Request, res: Response): void => {
  const featured = db.articles
    .filter(a => a.status === 'published' && a.isFeatured)
    .slice(0, 6);
  res.json({ success: true, data: featured });
};

export const getTrendingArticles = (_req: Request, res: Response): void => {
  const trending = [...db.articles]
    .filter(a => a.status === 'published')
    .sort((a, b) => (b.views + b.likesCount * 3) - (a.views + a.likesCount * 3))
    .slice(0, 6);
  res.json({ success: true, data: trending });
};

export const getArticleBySlugOrId = (req: AuthRequest, res: Response): void => {
  const { idOrSlug } = req.params;
  const article = db.articles.find(a => a.id === idOrSlug || a.slug === idOrSlug);

  if (!article) {
    res.status(404).json({ success: false, message: 'Article not found.' });
    return;
  }

  // Increment views
  article.views += 1;
  db.save();

  // Related articles
  const related = db.articles
    .filter(a => a.id !== article.id && a.status === 'published' && (a.categorySlug === article.categorySlug || a.tags.some(t => article.tags.includes(t))))
    .slice(0, 4);

  // Article comments
  const comments = db.comments
    .filter(c => c.articleId === article.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Check if current user liked or bookmarked
  const isLiked = req.user ? db.likes.some(l => l.articleId === article.id && l.userId === req.user!.id) : false;
  const isBookmarked = req.user ? db.bookmarks.some(b => b.articleId === article.id && b.userId === req.user!.id) : false;

  res.json({
    success: true,
    data: {
      ...article,
      comments,
      related,
      isLiked,
      isBookmarked,
    },
  });
};

export const createArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const {
    title,
    shortDescription,
    summary,
    content,
    featuredImage,
    category,
    tags = [],
    isFeatured = false,
    isBreaking = false,
    status: requestedStatus,
  } = req.body;

  const resolvedDescription = (shortDescription || summary || '').trim();

  if (!title || !resolvedDescription || !content || !category) {
    res.status(400).json({
      success: false,
      message: 'Title, short description, content, and category are required.',
    });
    return;
  }

  let finalStatus: ArticleStatus = 'pending';
  if (req.user.role === 'admin') {
    finalStatus = requestedStatus || 'published';
  } else if (requestedStatus === 'draft') {
    finalStatus = 'draft';
  } else {
    finalStatus = 'pending';
  }

  const baseSlug = slugify(title);
  let uniqueSlug = baseSlug;
  let counter = 1;
  while (db.articles.some(a => a.slug === uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const categoryObj = db.categories.find(
    c => c.name.toLowerCase() === category.toLowerCase() || c.slug.toLowerCase() === category.toLowerCase()
  );
  const categorySlug = categoryObj ? categoryObj.slug : slugify(category);

  // Estimate read time
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  const newArticle: IArticle = {
    id: `art_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title: title.trim(),
    slug: uniqueSlug,
    shortDescription: resolvedDescription,
    content: content.trim(),
    featuredImage: featuredImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    authorId: req.user.id,
    authorName: req.user.name,
    authorRole: req.user.role,
    authorDepartment: req.user.department,
    authorAvatar: req.user.avatar,
    category: categoryObj ? categoryObj.name : category,
    categorySlug,
    tags: Array.isArray(tags) ? tags.map(t => t.trim()).filter(Boolean) : [],
    status: finalStatus,
    isFeatured: req.user.role === 'admin' ? Boolean(isFeatured) : false,
    isBreaking: req.user.role === 'admin' ? Boolean(isBreaking) : false,
    views: 0,
    likesCount: 0,
    readTime,
    publishedAt: finalStatus === 'published' ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.articles.unshift(newArticle);
  db.save();

  db.logActivity(
    finalStatus === 'published' ? 'ARTICLE_PUBLISHED' : 'ARTICLE_SUBMITTED',
    req.user.name,
    `Article "${newArticle.title}" created with status ${finalStatus}`,
    req.user.id,
    'article',
    newArticle.id
  );

  // Notify admins if pending
  if (finalStatus === 'pending') {
    try {
      const admins = await User.find({ role: 'admin' });
      admins.forEach(admin => {
        db.createNotification(
          admin._id.toString(),
          'New Article Submitted for Review',
          `"${newArticle.title}" was submitted by ${req.user!.name} (${req.user!.role}).`,
          'editorial',
          `/admin/submissions`
        );
      });
    } catch (err) {
      console.error('Error notifying admins of article submission:', err);
    }
  }

  res.status(201).json({
    success: true,
    message:
      finalStatus === 'published'
        ? 'Article published successfully!'
        : finalStatus === 'pending'
        ? 'Article submitted for editorial approval.'
        : 'Article saved as draft.',
    data: newArticle,
  });
};

export const updateArticle = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const { id } = req.params;
  const article = db.articles.find(a => a.id === id);

  if (!article) {
    res.status(404).json({ success: false, message: 'Article not found.' });
    return;
  }

  // Authorization check: must be admin or author
  if (req.user.role !== 'admin' && article.authorId !== req.user.id) {
    res.status(403).json({ success: false, message: 'You do not have permission to edit this article.' });
    return;
  }

  const {
    title,
    shortDescription,
    content,
    featuredImage,
    category,
    tags,
    isFeatured,
    isBreaking,
    status,
  } = req.body;

  if (title) {
    article.title = title.trim();
  }
  if (shortDescription) article.shortDescription = shortDescription.trim();
  if (content) {
    article.content = content.trim();
    const wordCount = article.content.split(/\s+/).length;
    article.readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
  }
  if (featuredImage) article.featuredImage = featuredImage;
  if (category) {
    const categoryObj = db.categories.find(
      c => c.name.toLowerCase() === category.toLowerCase() || c.slug.toLowerCase() === category.toLowerCase()
    );
    article.category = categoryObj ? categoryObj.name : category;
    article.categorySlug = categoryObj ? categoryObj.slug : slugify(category);
  }
  if (tags && Array.isArray(tags)) article.tags = tags;

  if (req.user.role === 'admin') {
    if (isFeatured !== undefined) article.isFeatured = Boolean(isFeatured);
    if (isBreaking !== undefined) article.isBreaking = Boolean(isBreaking);
    if (status) {
      article.status = status;
      if (status === 'published' && !article.publishedAt) {
        article.publishedAt = new Date().toISOString();
      }
    }
  }

  article.updatedAt = new Date().toISOString();
  db.save();

  db.logActivity('ARTICLE_UPDATED', req.user.name, `Updated article "${article.title}"`, req.user.id, 'article', article.id);

  res.json({ success: true, message: 'Article updated successfully.', data: article });
};

export const updateArticleStatus = (req: AuthRequest, res: Response): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required.' });
    return;
  }

  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  const validStatuses: ArticleStatus[] = ['draft', 'pending', 'published', 'rejected', 'archived'];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  const article = db.articles.find(a => a.id === id);
  if (!article) {
    res.status(404).json({ success: false, message: 'Article not found.' });
    return;
  }

  article.status = status;
  article.updatedAt = new Date().toISOString();

  if (status === 'published') {
    article.publishedAt = new Date().toISOString();
    article.rejectionReason = undefined;
    db.createNotification(
      article.authorId,
      'Your Article Has Been Published!',
      `Great news! Your article "${article.title}" was reviewed and approved for publication on the Campus News Portal.`,
      'status_update',
      `/articles/${article.slug}`
    );
  } else if (status === 'rejected') {
    article.rejectionReason = rejectionReason || 'Does not adhere to editorial quality guidelines.';
    db.createNotification(
      article.authorId,
      'Article Revision Requested',
      `Your submission "${article.title}" was not approved: ${article.rejectionReason}`,
      'status_update',
      `/my-submissions`
    );
  }

  db.save();
  db.logActivity('ARTICLE_STATUS_CHANGED', req.user.name, `Changed article status to ${status} for "${article.title}"`, req.user.id, 'article', article.id);

  res.json({ success: true, message: `Article status changed to ${status}.`, data: article });
};

export const deleteArticle = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const { id } = req.params;
  const index = db.articles.findIndex(a => a.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Article not found.' });
    return;
  }

  const article = db.articles[index];
  if (req.user.role !== 'admin' && article.authorId !== req.user.id) {
    res.status(403).json({ success: false, message: 'Permission denied to delete this article.' });
    return;
  }

  db.articles.splice(index, 1);

  // Clean up associated comments, likes, and bookmarks
  const commentsToRemove = db.comments.filter(c => c.articleId === id);
  commentsToRemove.forEach(c => {
    const cIdx = db.comments.indexOf(c);
    if (cIdx > -1) db.comments.splice(cIdx, 1);
  });

  const likesToRemove = db.likes.filter(l => l.articleId === id);
  likesToRemove.forEach(l => {
    const lIdx = db.likes.indexOf(l);
    if (lIdx > -1) db.likes.splice(lIdx, 1);
  });

  const bookmarksToRemove = db.bookmarks.filter(b => b.articleId === id);
  bookmarksToRemove.forEach(b => {
    const bIdx = db.bookmarks.indexOf(b);
    if (bIdx > -1) db.bookmarks.splice(bIdx, 1);
  });

  db.save();
  db.logActivity('ARTICLE_DELETED', req.user.name, `Deleted article "${article.title}"`, req.user.id, 'article', id);

  res.json({ success: true, message: 'Article deleted successfully.' });
};

export const toggleLike = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Please log in to like articles.' });
    return;
  }

  const { id } = req.params;
  const article = db.articles.find(a => a.id === id || a.slug === id);

  if (!article) {
    res.status(404).json({ success: false, message: 'Article not found.' });
    return;
  }

  const existingIndex = db.likes.findIndex(l => l.articleId === article.id && l.userId === req.user!.id);
  let isLiked = false;

  if (existingIndex > -1) {
    db.likes.splice(existingIndex, 1);
    article.likesCount = Math.max(0, article.likesCount - 1);
    isLiked = false;
  } else {
    db.likes.push({
      id: `like_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      articleId: article.id,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
    });
    article.likesCount += 1;
    isLiked = true;

    // Send notification to author if author is someone else
    if (article.authorId !== req.user.id) {
      db.createNotification(
        article.authorId,
        'Someone liked your article',
        `${req.user.name} liked your article "${article.title}".`,
        'status_update',
        `/articles/${article.slug}`
      );
    }
  }

  db.save();
  res.json({
    success: true,
    data: {
      isLiked,
      likesCount: article.likesCount,
    },
  });
};

export const toggleBookmark = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Please log in to bookmark articles.' });
    return;
  }

  const { id } = req.params;
  const article = db.articles.find(a => a.id === id || a.slug === id);

  if (!article) {
    res.status(404).json({ success: false, message: 'Article not found.' });
    return;
  }

  const existingIndex = db.bookmarks.findIndex(b => b.articleId === article.id && b.userId === req.user!.id);
  let isBookmarked = false;

  if (existingIndex > -1) {
    db.bookmarks.splice(existingIndex, 1);
    isBookmarked = false;
  } else {
    db.bookmarks.push({
      id: `bm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      articleId: article.id,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
    });
    isBookmarked = true;
  }

  db.save();
  res.json({
    success: true,
    data: {
      isBookmarked,
    },
    message: isBookmarked ? 'Article saved to your bookmarks!' : 'Article removed from your bookmarks.',
  });
};

export const getUserBookmarks = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const userBookmarks = db.bookmarks.filter(b => b.userId === req.user!.id);
  const articleIds = new Set(userBookmarks.map(b => b.articleId));
  const articles = db.articles.filter(a => articleIds.has(a.id));

  res.json({
    success: true,
    data: articles,
  });
};

export const getUserSubmissions = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const submissions = db.articles
    .filter(a => a.authorId === req.user!.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    success: true,
    data: submissions,
  });
};
