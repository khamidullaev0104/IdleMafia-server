const express = require('express');

const path = require('path');
var cors = require('cors')
const app = express();

require('dotenv').config()
console.log(process.env)

app.use(cors())
// Init Middleware
app.use(express.json());
app.use(express.static('.'));
// Define Routes
app.use('/', require('./routes/api/route'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.SERVER_PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
