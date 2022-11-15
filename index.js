const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const { errorHandler } = require('./middlewares/errorMiddleware');

connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//? Routes
app.use('/api/user', require('./routes/userRoutes'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server successfully running on port: ${PORT}`)
});