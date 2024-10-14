import { Router } from 'express';


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


export default router;
