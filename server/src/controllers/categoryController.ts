import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { ICategory } from '../db/schemaTypes.js';
import { AuthRequest } from '../middleware/auth.js';

export const getCategories = (_req: Request, res: Response): void => {
  const categoriesWithCounts = db.categories.map(c => {
    const articleCount = db.articles.filter(
      a => a.status === 'published' && (a.categorySlug === c.slug || a.category.toLowerCase() === c.name.toLowerCase())
    ).length;
    return {
      ...c,
      articleCount,
    };
  });

  categoriesWithCounts.sort((a, b) => a.order - b.order);

  res.json({ success: true, data: categoriesWithCounts });
};

export const createCategory = (req: AuthRequest, res: Response): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required.' });
    return;
  }

  const { name, slug, description, color, icon } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: 'Category name is required.' });
    return;
  }

  const cleanSlug = (slug || name).toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
  if (db.categories.some(c => c.slug === cleanSlug)) {
    res.status(409).json({ success: false, message: 'A category with this slug already exists.' });
    return;
  }

  const newCat: ICategory = {
    id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: name.trim(),
    slug: cleanSlug,
    description: description?.trim() || '',
    color: color || '#2563eb',
    icon: icon || 'Tag',
    order: db.categories.length + 1,
  };

  db.categories.push(newCat);
  db.save();

  db.logActivity('CATEGORY_CREATED', req.user.name, `Created category "${newCat.name}"`, req.user.id, 'category', newCat.id);

  res.status(201).json({ success: true, message: 'Category created successfully!', data: newCat });
};

export const updateCategory = (req: AuthRequest, res: Response): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required.' });
    return;
  }

  const { id } = req.params;
  const cat = db.categories.find(c => c.id === id);

  if (!cat) {
    res.status(404).json({ success: false, message: 'Category not found.' });
    return;
  }

  const { name, description, color, icon, order } = req.body;
  if (name) cat.name = name.trim();
  if (description !== undefined) cat.description = description.trim();
  if (color) cat.color = color;
  if (icon) cat.icon = icon;
  if (order !== undefined) cat.order = Number(order);

  db.save();
  db.logActivity('CATEGORY_UPDATED', req.user.name, `Updated category "${cat.name}"`, req.user.id, 'category', cat.id);

  res.json({ success: true, message: 'Category updated successfully.', data: cat });
};

export const deleteCategory = (req: AuthRequest, res: Response): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required.' });
    return;
  }

  const { id } = req.params;
  const index = db.categories.findIndex(c => c.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Category not found.' });
    return;
  }

  const [removed] = db.categories.splice(index, 1);
  db.save();

  db.logActivity('CATEGORY_DELETED', req.user.name, `Deleted category "${removed.name}"`, req.user.id, 'category', id);

  res.json({ success: true, message: 'Category deleted successfully.' });
};
