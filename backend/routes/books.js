const express = require('express');
const multer = require('multer');
const Book = require('../models/Book');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { uploadFile } = require('../utils/cloudStorage');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', asyncHandler(async (req, res) => {
  const { search, category, author, status = 'published', page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (author) filter.authors = author;
  const books = await Book.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  res.json({ count: books.length, books });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate('author', 'name email');
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
}));

router.post('/', protect, authorize('author', 'admin'), upload.fields([{ name: 'cover' }, { name: 'file' }, { name: 'sample' }]), asyncHandler(async (req, res) => {
  const { title, authors, category, description, tags, price, status } = req.body;
  const bookData = {
    title,
    authors: Array.isArray(authors) ? authors : authors.toString().split(',').map((item) => item.trim()),
    category,
    description,
    tags: tags ? tags.toString().split(',').map((tag) => tag.trim()) : [],
    price: Number(price) || 0,
    status: status || 'draft',
    author: req.user._id,
  };

  if (req.files?.cover?.[0]) {
    bookData.coverUrl = await uploadFile({ file: req.files.cover[0], folder: 'covers' });
  }
  if (req.files?.file?.[0]) {
    bookData.fileUrl = await uploadFile({ file: req.files.file[0], folder: 'books' });
  }
  if (req.files?.sample?.[0]) {
    bookData.sampleUrl = await uploadFile({ file: req.files.sample[0], folder: 'samples' });
  }

  const book = await Book.create(bookData);
  res.status(201).json(book);
}));

router.put('/:id', protect, authorize('author', 'admin'), upload.fields([{ name: 'cover' }, { name: 'file' }, { name: 'sample' }]), asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!req.user._id.equals(book.author) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const updates = req.body;
  if (updates.authors) updates.authors = updates.authors.toString().split(',').map((item) => item.trim());
  if (updates.tags) updates.tags = updates.tags.toString().split(',').map((tag) => tag.trim());

  Object.assign(book, updates);

  if (req.files?.cover?.[0]) book.coverUrl = await uploadFile({ file: req.files.cover[0], folder: 'covers' });
  if (req.files?.file?.[0]) book.fileUrl = await uploadFile({ file: req.files.file[0], folder: 'books' });
  if (req.files?.sample?.[0]) book.sampleUrl = await uploadFile({ file: req.files.sample[0], folder: 'samples' });

  await book.save();
  res.json(book);
}));

router.get('/author/me', protect, authorize('author'), asyncHandler(async (req, res) => {
  const books = await Book.find({ author: req.user._id }).sort({ createdAt: -1 });
  res.json({ count: books.length, books });
}));

module.exports = router;
