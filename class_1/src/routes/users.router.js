import { Router } from 'express';
import { uploader } from '../uploader.js';
// import { users } from '../config.js';
// Ya no importamos un array de prueba, sino la definición del modelo que corresponde
// a la colección de usuarios, a través del modelo realizaremos las consultas para
// enviar y obtener datos de la colección
import userModel from '../models/user.model.js';


const router = Router();

/**
 * Middleware de autenticación
 * 
 * Aprovechamos el objeto req.session para verificar si hay datos
 * de usuario disponibles (userData). Si es así, significa que el
 * usuario ha hecho el login correctamente (ver endpoint login debajo)
 */
const auth = (req, res, next) => {
    // Si hay datos disponibles y el user es admin, lo dejamos continuar
    if (req.session?.userData && req.session?.userData.admin) {
        next();
    } else {
        // sino devolvemos un status 401 de no autorizado
        res.status(401).send({ error: 'No autorizado', data: [] });
    }
}

router.get('/', async (req, res) => {
    try {
        // Utilizamos el método find a través del modelo, para obtener la lista completa de users desde la colección
        const data = await userModel.find().lean();
        res.status(200).send({ error: null, data: data });
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

// router.post('/', auth, uploader.array('thumbnail', 3), (req, res) => { // gestión de múltiples archivos
router.post('/', auth, uploader.single('thumbnail'), async (req, res) => { // gestión de archivo único
    try {
        const { name, age, email } = req.body; // desestructuramos (extraemos) las ppdades que nos interesan del body

        if (name != '' && age != '' && email != '') {
            // Utilizamos el método create(), pasándole un objeto con los datos del nuevo usuario
            const process = await(userModel.create({ name: name, age: +age, email: email }))
            res.status(200).send({ error: null, data: process });
        } else {
            res.status(400).send({ error: 'Faltan campos obligatorios', data: [] });
        }
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

// ? indica parámetro opcional
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
            const options = { new: true }; // Retorna como resultado de la consulta el documento actualizado
            
            // Aprovechamos el método findOneAndUpdate(), filter nos permite especificar el criterio de búsqueda
            // para localizar el documento (por id por ej), update incluye solo los campos válidos que querramos
            // tomar del req.body.
            const process = await userModel.findOneAndUpdate(filter, update, options);
            if (!process) {
                res.status(404).send({ error: 'No se encuentra el usuario', data: [] });
            } else {
                // Si la consulta es exitosa, retorna el documento actualizado
                res.status(200).send({ error: null, data: process });
            }
        }
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

// ? indica parámetro opcional
router.delete('/:id?', auth, async (req, res) => {
    try {
        const id = req.params.id;
        
        if (!id) {
            res.status(400).send({ error: 'Se requiere parámetro id', data: null });
        } else {
            const filter = { _id: id };
            const options = {};
            
            // Aprovechamos el método findOneAndDelete(), filter nos permite especificar el criterio de búsqueda
            // para localizar el documento (por id por ej).
            const process = await userModel.findOneAndDelete(filter, options);
            if (!process) {
                res.status(404).send({ error: 'No se encuentra el usuario', data: [] });
            } else {
                // Si la consulta es exitosa, retorna el documento que acaba de borrarse
                res.status(200).send({ error: null, data: process });
            }
        }
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

router.get('/session', (req, res) => {
    // Podemos generar cualquier propiedad que necesitemos dentro del req.session
    req.session.counter ? req.session.counter++: req.session.counter = 1;
    res.status(200).send({ error: null, data: { visits: req.session.counter } });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    /**
     * Por ahora verificamos los datos de usuario con valores hardcodeados,
     * luego esto se realizará con una consulta a la base de datos
     */
    if (username === 'cperren' && password === 'abc123') {
        // Si está todo ok, generamos un objeto userData dentro del req.session
        // (ver middleware auth arriba)
        req.session.userData = { username: username, admin: true };
        res.status(200).send({ error: null, data: 'Usuario autenticado, sesión iniciada!' });
    } else {
        res.status(401).send({ error: 'Datos no válidos', data: [] });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send({ error: 'Error al cerrar sesión', data: [] });
        res.status(200).send({ error: null, data: 'Sesión cerrada' });
    });
});

/**
 * Como esta ruta tiene activo el middleware auth, el contenido devuelto por el callback
 * solo será visible si el usuario ha hecho login correctamente y es admin.
 */
router.get('/private', auth, (req, res) => {
    res.status(200).send({ error: null, data: 'Este contenido solo es visible por usuarios autenticados' });
});


export default router;
