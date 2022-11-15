const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const { errorHandler } = require('./middlewares/errorMiddleware');
const cors = require('cors');
const app = express();

const allowedOrigins = ['https://elibrary-94692.web.app', 'https://elibrary-94692.firebaseapp.com', 'http://localhost:8100']

app.use(cors({
    origin: allowedOrigins
}))

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//? Routes
app.use('/api/user', require('./routes/userRoutes'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server successfully running on port: ${PORT}`)
});