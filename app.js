const express = require('express');
const { specs, swaggerUi } = require('./swagger');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const Book = require('./models/bookModel');
const Member = require('./models/memberModel');

Book.associate({ Member });
Member.associate({ Book });

const app = express();
app.use(bodyParser.json());

// Import routes
const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require('./routes/memberRoutes');

// Use routes
app.use('/books', bookRoutes);
app.use('/members', memberRoutes);

// Sync database and start the server
sequelize.sync().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database: ', err);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
