import { Router } from 'express';
import { auth } from './users.router.js';


const router = Router();


router.get('/chat', (req, res) => {
    const data = {};
    
    res.status(200).render('chat', data);
});

router.get('/cookies', (req, res) => {
    const data = {};
    
    res.status(200).render('cookies', data);
});

router.get('/register', (req, res) => {
    const data = {};
    
    // const template = 'register';
    // res.status(200).render(template, data);
    res.status(200).render('register', data);
});

router.get('/login', (req, res) => {
    const data = {};
    
    res.status(200).render('login', data);
});

router.get('/profile', auth, (req, res) => {
    const data = req.session.userData;
    
    res.status(200).render('profile', data);
});


export default router;
