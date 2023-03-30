const express = require('express');
const cors = require('cors')
const connectDB = require('./config/db');
require('dotenv').config()

const app = express();
const startServer = () => {
    const PORT = process.env.SERVER_PORT || 5000;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

connectDB()
    .on('error', console.log)
    .once('open', startServer)

//Middleware
app.use(express.json());
app.use(express.static('.'));
app.use(cors())

//Routes
app.use('/', require('./routes/api/route'));



