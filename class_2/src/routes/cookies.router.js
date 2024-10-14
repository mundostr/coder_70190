import { Router } from 'express';

const router = Router();

router.get('/set', (req, res) => {
    const cookieContent = { user: 'cperren', email: 'idux.net@gmail.com' };
    res.cookie('coder70190', JSON.stringify(cookieContent), { maxAge: 30000, signed: true }); // maxAge en ms (milisegundos)
    res.status(200).send({ error: null, data: 'Cookie generada' });
});

router.get('/get', (req, res) => {
    // Cookies standard: req.cookies
    // Cookies firmadas: req.signedCookies
    if ('coder70190' in req.signedCookies) {
        const retrievedCookie = JSON.parse(req.signedCookies['coder70190']);
        res.status(200).send({ error: null, data: retrievedCookie });
    } else {
        res.status(200).send({ error: 'No hay información de cookies', data: [] });
    }
});

router.get('/delete', (req, res) => {
    res.clearCookie('coder70190');
    res.status(200).send({ error: null, data: 'Cookie eliminada' });
});

router.post('/', (req, res) => {
    const cookieContent= { user: req.body.name, email: req.body.email };
    res.cookie('coder70190', JSON.stringify(cookieContent), { maxAge: 10000, signed: true }); // maxAge en ms (milisegundos)
    res.status(200).send({ error: null, data: 'Cookie seteada' });
});

export default router;
