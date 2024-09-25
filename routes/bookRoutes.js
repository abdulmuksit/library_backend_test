const express = require('express');
const router = express.Router();
const Book = require('../models/bookModel');
const Member = require('../models/memberModel');
const { Op } = require('sequelize');

/**
 * @swagger
 * /books/borrow:
 *   post:
 *     tags: [Books]
 *     summary: Borrow a book
 *     description: Allows a member to borrow a book with specified conditions.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberCode:
 *                 type: string
 *               bookCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful book borrowing.
 *       400:
 *         description: Bad request with error message.
 */
router.post('/borrow', async (req, res) => {
    const { memberCode, bookCode } = req.body;
  
    try {
      const member = await Member.findOne({ where: { code: memberCode } });
      const book = await Book.findOne({ where: { code: bookCode } });
  
      if (!member) return res.status(404).json({ message: "Member not found" });
      if (!book) return res.status(404).json({ message: "Book not found" });
  
      // Check if the member is penalized
      if (member.penalty) return res.status(403).json({ message: "Member is penalized" });
  
      // Check how many books the member currently has borrowed
      const borrowedBooksCount = await member.countBooks();
      if (borrowedBooksCount >= 2) return res.status(403).json({ message: "Member cannot borrow more than 2 books" });
  
      // Check if the book is available
      const borrowedBooks = await book.getMembers();
      if (borrowedBooks.length > 0) return res.status(403).json({ message: "Book is already borrowed" });
  
      // Borrow the book
      await member.addBook(book);
      res.json({ message: "Book borrowed successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

/**
 * @swagger
 * /books/return:
 *   post:
 *     tags: [Books]
 *     summary: Return a borrowed book
 *     description: Allows a member to return a borrowed book with penalty calculation.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberCode:
 *                 type: string
 *               bookCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful book return.
 *       400:
 *         description: Bad request with error message.
 */
router.post('/return', async (req, res) => {
    const { memberCode, bookCode } = req.body;
  
    try {
      const member = await Member.findOne({ where: { code: memberCode } });
      const book = await Book.findOne({ where: { code: bookCode } });
  
      if (!member) return res.status(404).json({ message: "Member not found" });
      if (!book) return res.status(404).json({ message: "Book not found" });
  
      // Check if the member has borrowed the book
      const memberBooks = await member.getBooks({ where: { code: bookCode } });
      if (memberBooks.length === 0) return res.status(403).json({ message: "This book was not borrowed by the member" });
  
      // Get the date the book was borrowed
      const borrowedAt = memberBooks[0].MemberBooks.borrowedAt;
  
      // Calculate the duration since it was borrowed
      const daysBorrowed = (new Date() - new Date(borrowedAt)) / (1000 * 60 * 60 * 24);
  
      // Return the book
      await member.removeBook(book);
  
      // Check for penalty
      if (daysBorrowed > 7) {
        member.penalty = true;
        await member.save();
        return res.json({ message: "Book returned with penalty. Member is now penalized." });
      }
  
      res.json({ message: "Book returned successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

/**
 * @swagger
 * /books/available:
 *   get:
 *     tags: [Books]
 *     summary: Get all books
 *     description: Shows all existing books and quantities, excluding borrowed books.
 *     responses:
 *       200:
 *         description: A list of available books.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 books:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                       title:
 *                         type: string
 *                       author:
 *                         type: string
 *                       stock:
 *                         type: integer
 */
router.get('/available', async (req, res) => {
    try {
      const books = await Book.findAll();
      const availableBooks = await Promise.all(
        books.map(async (book) => {
          const borrowedBooks = await book.getMembers();
          return {
            code: book.code,
            title: book.title,
            author: book.author,
            stock: book.stock - borrowedBooks.length
          };
        })
      );
  
      res.json(availableBooks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;
