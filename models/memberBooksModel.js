const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MemberBooks = sequelize.define('MemberBooks', {
  memberId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Members',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  bookId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Books',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  borrowedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
}, {
  timestamps: false,
});

module.exports = MemberBooks;
