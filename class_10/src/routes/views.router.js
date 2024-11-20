import { Router } from 'express';
import { verifySession } from '../utils.js';


const router = Router();


router.get('/register', (req, res) => {
    const data = {};
    
    // const template = 'register';
    // res.status(200).render(template, data);
    res.status(200).render('register', data);
});

router.get('/login', (req, res) => {
    const data = {
        version: 'v3'
    };
    
    res.status(200).render('login', data);
});

router.get('/profile', verifySession, (req, res) => {
    // const data = req.session.userData;
    const data = req.session.passport.user;
    
    res.status(200).render('profile', data);
});


export default router;