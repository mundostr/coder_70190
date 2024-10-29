import { Router } from 'express';
import passport from 'passport';

import { uploader } from '../uploader.js';
import UserManager from '../dao/users.manager.js';
import initAuthStrategies from '../auth/passport.config.js';
import { createToken, verifyToken, passportCall } from '../utils.js';

import config from '../config.js';


const router = Router();
const manager = new UserManager();
initAuthStrategies();

export const auth = (req, res, next) => {
    if ((req.session?.userData && req.session?.userData.admin) || req.session?.passport.user) {
        next();
    } else {
        res.status(401).send({ error: 'No autorizado', data: [] });
    }
}

router.get('/', async (req, res) => {
    try {
        const data = await manager.get();
        res.status(200).send({ error: null, data: data });
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

// router.post('/', auth, uploader.array('thumbnail', 3), (req, res) => { // gestión de múltiples archivos
router.post('/', auth, uploader.single('thumbnail'), async (req, res) => { // gestión de archivo único
    try {
        const { name, age, email } = req.body;

        if (name != '' && age != '' && email != '') {
            const data = { name: name, age: +age, email: email };
            const process = await manager.add(data);
            res.status(200).send({ error: null, data: process });
        } else {
            res.status(400).send({ error: 'Faltan campos obligatorios', data: [] });
        }
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

router.patch('/:id?', auth, async (req, res) => {
    try {
        const id = req.params.id;
        
        if (!id) {
            res.status(400).send({ error: 'Se requiere parámetro id', data: null });
        } else {
            const { name, age, email } = req.body;
            const filter = { _id: id };
            const update = {};
            if (name) update.name = name;
            if (age) update.age = +age;
            if (email) update.email = email;
            const options = { new: true }; // new: true retorna el documento actualizado
            
            const process = await manager.update(filter, update, options);
            if (!process) {
                res.status(404).send({ error: 'No se encuentra el usuario', data: [] });
            } else {
                res.status(200).send({ error: null, data: process });
            }
        }
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

router.delete('/:id?', auth, async (req, res) => {
    try {
        const id = req.params.id;
        
        if (!id) {
            res.status(400).send({ error: 'Se requiere parámetro id', data: null });
        } else {
            const filter = { _id: id };
            const options = {};
            
            const process = await manager.delete(filter, options);
            if (!process) {
                res.status(404).send({ error: 'No se encuentra el usuario', data: [] });
            } else {
                res.status(200).send({ error: null, data: process });
            }
        }
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

router.post('/register', async (req, res) => {
    const { firstname, lastname, username, password } = req.body;

    if (firstname != '' && lastname != '' && username != '' && password != '') {
        const process = await manager.register({ firstName: firstname, lastName: lastname, email: username, password: password });

        if (process) {
            res.status(200).send({ error: null, data: 'Usuario registrado, bienvenido!' });
        } else {
            res.status(401).send({ error: 'Ya existe un usuario con ese email', data: [] });
        }
    } else {
        res.status(400).send({ error: 'Faltan campos: obligatorios firstname, lastname, email, password', data: [] });
    }
});

// Login manual contra nuestra base de datos, utilizando sessions
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (username != '' && password != '') {
        const process = await manager.authenticate(username, password);
        if (process) {
            req.session.userData = { firstName: process.firstName, lastName: process.lastName, email: process.email, admin: true };

            req.session.save(err => {
                if (err) return res.status(500).send({ error: 'Error al almacenar datos de sesión', data: [] });

                // res.status(200).send({ error: null, data: 'Usuario autenticado, sesión iniciada!' });
                res.redirect('/views/profile');
            });
        } else {
            res.status(401).send({ error: 'Usuario o clave no válidos', data: [] });
        }
    } else {
        res.status(400).send({ error: 'Faltan campos: obligatorios username, password', data: [] });
    }
});

// Login con passport, utilizando sessions
// router.post('/pplogin', passport.authenticate('login', { failureRedirect: '/views/login' }), async (req, res) => {
// En este caso, utilizamos el middleware passportCall en lugar de llamar directamente al passport.authenticate
// (ver passportCall en utils.js).
router.post('/pplogin', passportCall('login'), async (req, res) => {
    req.session.save(err => {
        if (err) return res.status(500).send({ error: 'Error al almacenar datos de sesión', data: [] });

        // res.status(200).send({ error: null, data: 'Usuario autenticado, sesión iniciada!' });
        res.redirect('/views/profile');
    });
});

// Login con passport, a través de proveedor externo (Github)
// Habilitamos 2 endpoints pq uno redirecciona al proveedor (ghlogin) y el otro vuelve con el resultado (githubcallback)
router.get('/ghlogin', passport.authenticate('ghlogin', { scope: ['user:email'] }), async (req, res) => {});

router.get('/githubcallback', passport.authenticate('ghlogin', { failureRedirect: '/views/login' }), async (req, res) => {
    req.session.save(err => {
        if (err) return res.status(500).send({ error: 'Error al almacenar datos de sesión', data: [] });

        // res.status(200).send({ error: null, data: 'Usuario autenticado, sesión iniciada!' });
        res.redirect('/views/profile');
    });
});

// Login manual contra nuestra base de datos, utilizando tokens (JWT = JSON Web Tokens)
router.post('/jwtlogin', async (req, res) => {
    const { username, password } = req.body;

    if (username != '' && password != '') {
        const process = await manager.authenticate(username, password);
        if (process) {
            const payload = { username: username, admin: true };
            const token = createToken(payload, '1h');
            // res.status(200).send({ error: null, data: { authentication: 'ok', token: token } });
            
            /**
             * En lugar de retornar el token en la respuesta, utilizamos el mecanismo de cookies
             * para que el navegador almacene el token automáticamente (res.cookie), y lo adjunte en sucesivas
             * solicitudes:
             * 
             * si usamos signed: true, estará disponible en req.signedCookies, sino en req.cookies.
             * 
             * secure: true, solo acepta transacciones de cookies por HTTPS
             * no habilitar si se prueba la API por HTTP, porque obviamente no se transmitirán las cookies
             */
            res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, secure: false, httpOnly: true, signed: true });
            res.status(200).send({ error: null, data: { authentication: 'ok via cookie' } });
        } else {
            res.status(401).send({ error: 'Usuario o clave no válidos', data: [] });
        }
    } else {
        res.status(400).send({ error: 'Faltan campos: obligatorios username, password', data: [] });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send({ error: 'Error al cerrar sesión', data: [] });
        
        // res.status(200).send({ error: null, data: 'Sesión cerrada' });
        res.redirect('/views/login');
    });
});

// Endpoint protegido por middleware propio (auth)
router.get('/private', auth, (req, res) => {
    res.status(200).send({ error: null, data: 'Este contenido solo es visible por usuarios autenticados' });
});

/**
 * Endpoint protegido por token (verifyToken)
 * 
 * En este caso no protegemos mediante control de datos de sesión, sino por token JWT.
 * Cuando el cliente realiza una solicitud a este endpoint, debe adjuntar su token (credencial),
 * y el middleware verifyToken se encargará de revisar su validez para decidir si le permite
 * continuar o no.
 */
router.get('/private2', verifyToken, (req, res) => {
    res.status(200).send({ error: null, data: 'Este contenido solo es visible por usuarios autenticados' });
});


export default router;