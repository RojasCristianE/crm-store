import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import customersRouter  from './routes/customers/index.js';
import setupRouter from './routes/setup/index.js';
import statusRouter from './routes/status/index.js';
import { apiKeyAuth } from './apiKeyAuth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use('/setup', setupRouter);

app.use(
    '/clientes',
    apiKeyAuth,
    customersRouter
);

app.use('/estado', statusRouter);

app.listen(3000, () => console.log(`App listening on port 3000`));