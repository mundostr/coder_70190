import { Router } from 'express';
import passport from 'passport';

import { uploader } from '../uploader.js';
import UserManager from '../dao/users.manager.js';
import initAuthStrategies from '../auth/passport.config.js';


const router = Router();
const manager = new UserManager();
initAuthStrategies();

export const auth = (req, res, next) => {
    /**
     * Si autenticamos manualmente (sin Passport), generaremos en el login
     * un objeto dentro de req.session (por ej req.session.userData) y revisaremos
     * esos datos aquí (ver endpoint /login).
     * 
     * Si autenticamos con Passport, el propio Passport inyecta los datos luego de
     * la autenticación en req.session.passport.user, es decir, si tenemos un
     * req.session.passport.user, significa que el usuario se autenticó correctamente,
     * podríamos por supuesto verificar también su rol (admin, etc) y realizar otros pasos
     * (ver más aclaraciones en edpoint /pplogin).
     */
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

router.post('/pplogin', passport.authenticate('login', { failureRedirect: '/views/login' }), async (req, res) => {
    /**
     * Si se llega a este callback, es porque la autenticación fue exitosa.
     * Passport inyecta automáticamente un objeto req.user con los datos del done().
     * Podemos tomar datos desde allí para armar nuestro propio objeto en session:
     * req.user.admin = true;
     * req.session.userData = req.user;
     * 
     * o en el middleware auth aprovechar directamente el req.session.passport.user
     * que Passport genera (ver arriba middleware auth()).
     */

    req.session.save(err => {
        if (err) return res.status(500).send({ error: 'Error al almacenar datos de sesión', data: [] });

        // res.status(200).send({ error: null, data: 'Usuario autenticado, sesión iniciada!' });
        res.redirect('/views/profile');
    });
});

/**
 * Autenticación con Passport y servicio externo de Github
 * 
 * En este caso necesitamos DOS endpoints, uno será al que apuntemos
 * desde el cliente (por ej desde el botón Ingresar con Github en un HTML),
 * este redireccionará directamente al servicio de Github.
 * 
 * El segundo endpoint será un callback al cual retornará Github con el resultado
 * de su proceso de autenticación (ver comentarios dentro de passport.config.js).
 * 
 * Atención!!!: para que esto funcione, será necesario dar de alta una nueva app
 * en Github (https://github.com/settings/apps/new) y agregar en config.js el
 * CLIENT_ID, CLIENT_SECRET y CALLBACK_URL de la app. Este CALLBACK_URL debe coincidir
 * con el endpoint habilitado debajo (/githubcallback)
 */
router.get('/ghlogin', passport.authenticate('ghlogin', { scope: ['user:email'] }), async (req, res) => {});

router.get('/githubcallback', passport.authenticate('ghlogin', { failureRedirect: '/views/login' }), async (req, res) => {
    /**
     * Similar al login manual, podríamos elegir armar nuestro propio objeto session,
     * o bien utilizar el cargado automáticamente por Passport, en este caso no hacemos
     * más que redireccionar al profile.
     */

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
