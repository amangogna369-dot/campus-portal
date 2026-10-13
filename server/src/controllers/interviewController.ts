import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { IInterview } from '../db/schemaTypes.js';
import { AuthRequest } from '../middleware/auth.js';

export const getInterviews = (req: Request, res: Response): void => {
  const { search } = req.query;
  let list = [...db.interviews];

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      i =>
        i.interviewee.toLowerCase().includes(q) ||
        i.designation.toLowerCase().includes(q) ||
        i.department.toLowerCase().includes(q) ||
        i.introduction.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, data: list });
};

export const getInterviewById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const interview = db.interviews.find(i => i.id === id);

  if (!interview) {
    res.status(404).json({ success: false, message: 'Interview not found.' });
    return;
  }

  res.json({ success: true, data: interview });
};

export const createInterview = (req: AuthRequest, res: Response): void => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'faculty')) {
    res.status(403).json({ success: false, message: 'Admin or faculty privileges required.' });
    return;
  }

  const {
    interviewee,
    designation,
    department,
    course,
    profileImage,
    batchOrTenure,
    introduction,
    quote,
    questionsAndAnswers,
    interviewDate,
  } = req.body;

  if (!interviewee || !designation || !introduction || !questionsAndAnswers) {
    res.status(400).json({
      success: false,
      message: 'Interviewee name, designation, introduction, and questions are required.',
    });
    return;
  }

  const newInterview: IInterview = {
    id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    interviewee: interviewee.trim(),
    designation: designation.trim(),
    department: department?.trim() || 'Academic Affairs',
    course,
    profileImage: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    batchOrTenure,
    introduction: introduction.trim(),
    quote: quote?.trim() || 'Curiosity and dedication open every door in higher learning.',
    questionsAndAnswers: Array.isArray(questionsAndAnswers) ? questionsAndAnswers : [],
    authorId: req.user.id,
    authorName: req.user.name,
    interviewDate: interviewDate || new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.interviews.unshift(newInterview);
  db.save();

  db.logActivity('INTERVIEW_CREATED', req.user.name, `Created spotlight interview with "${newInterview.interviewee}"`, req.user.id, 'article', newInterview.id);

  res.status(201).json({ success: true, message: 'Interview published successfully!', data: newInterview });
};

export const updateInterview = (req: AuthRequest, res: Response): void => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'faculty')) {
    res.status(403).json({ success: false, message: 'Permission denied.' });
    return;
  }

  const { id } = req.params;
  const interview = db.interviews.find(i => i.id === id);

  if (!interview) {
    res.status(404).json({ success: false, message: 'Interview not found.' });
    return;
  }

  const {
    interviewee,
    designation,
    department,
    course,
    profileImage,
    batchOrTenure,
    introduction,
    quote,
    questionsAndAnswers,
    interviewDate,
  } = req.body;

  if (interviewee) interview.interviewee = interviewee.trim();
  if (designation) interview.designation = designation.trim();
  if (department) interview.department = department.trim();
  if (course !== undefined) interview.course = course;
  if (profileImage) interview.profileImage = profileImage;
  if (batchOrTenure !== undefined) interview.batchOrTenure = batchOrTenure;
  if (introduction) interview.introduction = introduction.trim();
  if (quote) interview.quote = quote.trim();
  if (questionsAndAnswers) interview.questionsAndAnswers = questionsAndAnswers;
  if (interviewDate) interview.interviewDate = interviewDate;

  interview.updatedAt = new Date().toISOString();
  db.save();

  db.logActivity('INTERVIEW_UPDATED', req.user.name, `Updated interview for "${interview.interviewee}"`, req.user.id, 'article', interview.id);

  res.json({ success: true, message: 'Interview updated successfully.', data: interview });
};

export const deleteInterview = (req: AuthRequest, res: Response): void => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'faculty')) {
    res.status(403).json({ success: false, message: 'Permission denied.' });
    return;
  }

  const { id } = req.params;
  const index = db.interviews.findIndex(i => i.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Interview not found.' });
    return;
  }

  const [removed] = db.interviews.splice(index, 1);
  db.save();

  db.logActivity('INTERVIEW_DELETED', req.user.name, `Deleted interview for "${removed.interviewee}"`, req.user.id, 'article', id);

  res.json({ success: true, message: 'Interview deleted successfully.' });
};
