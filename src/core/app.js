const express = require('express');
const routes = require('../routes');

const app = express();

// JSON parsing middleware with error handling
app.use(express.json({
  strict: true
}));

// Error handler for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format in request body' });
  }
  next(err);
});

app.use('/', routes);

module.exports = app;

