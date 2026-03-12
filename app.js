const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set canonical URL automatically for all pages
app.use((req, res, next) => {
  res.locals.pageCanonical = 'https://mateovandamme.com' + req.path;
  next();
});

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
 
 
