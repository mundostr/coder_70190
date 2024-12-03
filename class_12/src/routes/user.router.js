import { Router } from 'express';

import { uploader } from '../uploader.js';
import UserController from '../controllers/user.controller.js';
import { createToken, verifyToken, handlePolicies } from '../utils.js';
import config from '../config.js';
import { notifySuccessRegistration } from '../mailer.js';

const router = Router();
const controller = new UserController();

router.param('id', async (req, res, next, id) => {
    if (!config.MONGODB_ID_REGEX.match(req.params.id)) return res.status(400).send({ error: 'Id no válido', data: [] });
    next();
})

router.get('/', async (req, res) => {
    try {
        const data = await controller.get();
        res.status(200).send({ error: null, data: data });
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

// router.post('/', verifySession, uploader.array('thumbnail', 3), (req, res) => { // gestión de múltiples archivos
// router.post('/', uploader.single('thumbnail'), async (req, res) => {
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (firstName != '' && lastName != '' && email != '' && password != '') {
            const data = { firstName, lastName, email, password };
            const process = await controller.add(data);
            res.status(200).send({ error: null, data: process });
        } else {
            res.status(400).send({ error: 'Faltan campos obligatorios', data: [] });
        }
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (firstName != '' && lastName != '' && email != '' && password != '') {
            const data = { firstName, lastName, email, password };
            const process = await controller.register(data);

            if (process) {
                res.status(200).send({ error: null, data: 'El registro ha sido aceptado, bienvenido!' });
                // Importamos esta rutina desde mailer.js para notificar por mail al usuario
                await notifySuccessRegistration();
            } else {
                res.status(400).send({ error: 'El usuario ya se encuentra registrado', data: [] });
            }
        } else {
            res.status(400).send({ error: 'Faltan campos obligatorios', data: [] });
        }
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

router.patch('/:id?', async (req, res) => {
    try {
        const id = req.params.id;
        
        if (!id) {
            res.status(400).send({ error: 'Se requiere parámetro id', data: null });
        } else {
            const { firstName, lastName, email, password } = req.body;

            const filter = { _id: id };
            const update = {};
            if (firstName) update.firstName = firstName;
            if (lastName) update.lastName = lastName;
            if (age) update.age = +age;
            if (email) update.email = email;
            if (password) update.password = password;
            const options = { new: true }; // new: true retorna el documento actualizado
            
            const process = await controller.update(filter, update, options);
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

router.delete('/:id?', verifyToken, handlePolicies(['ADMIN']), async (req, res) => {
    try {
        const id = req.params.id;
        
        if (!id) {
            res.status(400).send({ error: 'Se requiere parámetro id', data: null });
        } else {
            const filter = { _id: id };
            const options = {};
            
            const process = await controller.delete(filter, options);
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

router.post('/jwtlogin', async (req, res) => {
    const { email, password } = req.body;

    if (email != '' && password != '') {
        const process = await controller.authenticate(email, password);
        if (process) {
            const payload = { firstName: process.firstName, lastName: process.lastName, email: email, role: process.role };
            const token = createToken(payload, '1h');
            res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, secure: false, httpOnly: true, signed: true });
            res.status(200).send({ error: null, data: { authentication: 'ok via cookie' } });
        } else {
            res.status(401).send({ error: 'Usuario o clave no válidos', data: [] });
        }
    } else {
        res.status(400).send({ error: 'Faltan campos: obligatorios username, password', data: [] });
    }
});

/* router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send({ error: 'Error al cerrar sesión', data: [] });
        
        // res.status(200).send({ error: null, data: 'Sesión cerrada' });
        res.redirect('/views/login');
    });
}); */

router.all('*', async () => {
    res.status(404).send({ error: 'No se encuentra la ruta especificada', data: [] });
})

export default router;
