const express = require('express');
const router = express.Router();
const Book = require('../models/bookModel');
const Member = require('../models/memberModel');

/**
 * @swagger
 * /members:
 *   get:
 *     tags: [Members]
 *     summary: Get all members
 *     description: Shows all existing members and the number of books being borrowed by each member.
 *     responses:
 *       200:
 *         description: A list of members with the number of borrowed books.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                       name:
 *                         type: string
 *                       borrowedBooksCount:
 *                         type: integer
 */
router.get('/', async (req, res) => {
    try {
      const members = await Member.findAll({
        include: {
          model: Book,
          through: {
            attributes: []
          }
        }
      });
  
      const membersInfo = members.map(member => ({
        code: member.code,
        name: member.name,
        borrowedBooksCount: member.Books.length
      }));
  
      res.json(membersInfo);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });  

module.exports = router;
