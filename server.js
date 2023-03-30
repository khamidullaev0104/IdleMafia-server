const express = require('express');
let cors = require('cors')

const connectDB = require('./config/db');

const app = express();
app.use(cors())

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());
// Serve static assets in production
app.use(express.static('.'));
// Define Routes
app.use('/', require('./routes/api/route'));


const PORT = process.env.SERVER_PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
