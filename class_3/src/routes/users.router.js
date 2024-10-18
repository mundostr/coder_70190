import { Router } from 'express';
import passport from 'passport';

import { uploader } from '../uploader.js';
import UserManager from '../dao/users.manager.js';
import initAuthStrategies from '../auth/passport.config.js';


const router = Router();
const manager = new UserManager();
initAuthStrategies();

export const auth = (req, res, next) => {
    if (req.session?.userData && req.session?.userData.admin) {
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

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    /**
     * Quitamos la autenticación de usuario hardcoded que teníamos (cperren, abc123)
     * y pasamos a utilizar el método authenticate de nuestro controlador (manager).
     * 
     * Le enviamos las credenciales recibidas en el body, y esperamos el resultado,
     * si el usuario y clave son correctos, retornará un objeto, caso contrario
     * recibiremos un null
     */
    if (username != '' && password != '') {
        const process = await manager.authenticate(username, password);
        if (process) {
            req.session.userData = { firstName: process.firstName, lastName: process.lastName, email: process.email, admin: true };

            // Nos aseguramos que los datos de sesión se hayan guardado
            req.session.save(err => {
                if (err) return res.status(500).send({ error: 'Error al almacenar datos de sesión', data: [] });

                // Podemos tanto retornar respuesta como es habitual, o redireccionar a otra plantilla
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

router.post('/pplogin', passport.authenticate('login', {}), async (req, res) => {
    req.user.admin = true; // Hardcoded por ahora
    req.session.userData = req.user // Este req.user es inyectado automáticamente por passport

    req.session.save(err => {
        if (err) return res.status(500).send({ error: 'Error al almacenar datos de sesión', data: [] });

        // res.status(200).send({ error: null, data: 'Usuario autenticado, sesión iniciada!' });
        res.redirect('/views/profile');
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send({ error: 'Error al cerrar sesión', data: [] });
        
        // res.status(200).send({ error: null, data: 'Sesión cerrada' });
        res.redirect('/views/login');
    });
});

router.get('/private', auth, (req, res) => {
    res.status(200).send({ error: null, data: 'Este contenido solo es visible por usuarios autenticados' });
});


export default router;
