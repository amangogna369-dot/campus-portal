import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { IEvent } from '../db/schemaTypes.js';
import { AuthRequest } from '../middleware/auth.js';

export const getEvents = (req: Request, res: Response): void => {
  const { category, status, search, sort = 'date_asc' } = req.query;

  let list = [...db.events];

  if (category && category !== 'all') {
    list = list.filter(e => e.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (status && status !== 'all') {
    list = list.filter(e => e.status === status);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q)
    );
  }

  if (sort === 'date_desc') {
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else {
    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  res.json({ success: true, data: list });
};

export const getEventById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const event = db.events.find(e => e.id === id);

  if (!event) {
    res.status(404).json({ success: false, message: 'Event not found.' });
    return;
  }

  res.json({ success: true, data: event });
};

export const createEvent = (req: AuthRequest, res: Response): void => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'faculty')) {
    res.status(403).json({ success: false, message: 'Only faculty and administrators can create campus events.' });
    return;
  }

  const {
    title,
    description,
    category,
    date,
    startTime,
    endTime,
    venue,
    organizer,
    image,
    registrationLink,
    capacity = 100,
    isFeatured = false,
  } = req.body;

  if (!title || !description || !date || !venue) {
    res.status(400).json({ success: false, message: 'Title, description, date, and venue are required.' });
    return;
  }

  const newEvent: IEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title: title.trim(),
    description: description.trim(),
    category: category || 'Academic',
    date,
    startTime: startTime || '10:00 AM',
    endTime: endTime || '01:00 PM',
    venue: venue.trim(),
    organizer: organizer || req.user.name,
    image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    registrationLink: registrationLink || '',
    capacity: Number(capacity) || 100,
    registeredCount: 0,
    status: 'upcoming',
    isFeatured: Boolean(isFeatured),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.events.push(newEvent);
  db.save();

  db.logActivity('EVENT_CREATED', req.user.name, `Created event "${newEvent.title}"`, req.user.id, 'event', newEvent.id);

  res.status(201).json({ success: true, message: 'Campus event created successfully!', data: newEvent });
};

export const updateEvent = (req: AuthRequest, res: Response): void => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'faculty')) {
    res.status(403).json({ success: false, message: 'Permission denied.' });
    return;
  }

  const { id } = req.params;
  const event = db.events.find(e => e.id === id);

  if (!event) {
    res.status(404).json({ success: false, message: 'Event not found.' });
    return;
  }

  const {
    title,
    description,
    category,
    date,
    startTime,
    endTime,
    venue,
    organizer,
    image,
    registrationLink,
    capacity,
    status,
    isFeatured,
  } = req.body;

  if (title) event.title = title.trim();
  if (description) event.description = description.trim();
  if (category) event.category = category;
  if (date) event.date = date;
  if (startTime) event.startTime = startTime;
  if (endTime) event.endTime = endTime;
  if (venue) event.venue = venue.trim();
  if (organizer) event.organizer = organizer.trim();
  if (image) event.image = image;
  if (registrationLink !== undefined) event.registrationLink = registrationLink;
  if (capacity !== undefined) event.capacity = Number(capacity);
  if (status) event.status = status;
  if (isFeatured !== undefined) event.isFeatured = Boolean(isFeatured);

  event.updatedAt = new Date().toISOString();
  db.save();

  db.logActivity('EVENT_UPDATED', req.user.name, `Updated event "${event.title}"`, req.user.id, 'event', event.id);

  res.json({ success: true, message: 'Event updated successfully.', data: event });
};

export const deleteEvent = (req: AuthRequest, res: Response): void => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'faculty')) {
    res.status(403).json({ success: false, message: 'Permission denied.' });
    return;
  }

  const { id } = req.params;
  const index = db.events.findIndex(e => e.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Event not found.' });
    return;
  }

  const [removed] = db.events.splice(index, 1);
  db.save();

  db.logActivity('EVENT_DELETED', req.user.name, `Deleted event "${removed.title}"`, req.user.id, 'event', id);

  res.json({ success: true, message: 'Event deleted successfully.' });
};

export const registerForEvent = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Please log in to register for events.' });
    return;
  }

  const { id } = req.params;
  const event = db.events.find(e => e.id === id);

  if (!event) {
    res.status(404).json({ success: false, message: 'Event not found.' });
    return;
  }

  if (event.registeredCount >= event.capacity) {
    res.status(400).json({ success: false, message: 'Event capacity reached. Registrations are full.' });
    return;
  }

  event.registeredCount += 1;
  db.save();

  db.createNotification(
    req.user.id,
    'Event Registration Confirmed!',
    `You have successfully registered for "${event.title}" scheduled on ${event.date} at ${event.venue}.`,
    'system'
  );

  res.json({
    success: true,
    message: `Successfully registered for ${event.title}!`,
    data: { registeredCount: event.registeredCount, capacity: event.capacity },
  });
};
