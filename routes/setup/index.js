import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.get('/', (req, res) => {
    res.render('setup/index', { error: null, title: 'Identifíquese' });
});

router.post('/', (req, res) => {
    const { key } = req.body;

    if (key === process.env.KEY) {
        req.session.isAuthenticated = true;
        res.redirect('/clientes');
    } else {
        res.render('setup/index', { error: 'invalid' });
    }
});

export default router;