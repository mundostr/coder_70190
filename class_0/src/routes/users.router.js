import { Router } from 'express';
import { uploader } from '../uploader.js';
// import { users } from '../config.js';
// Ya no importamos un array de prueba, sino la definición del modelo que corresponde
// a la colección de usuarios, a través del modelo realizaremos las consultas para
// enviar y obtener datos de la colección
import userModel from '../models/user.model.js';


const router = Router();

const auth = (req, res, next) => {
    console.log('Ejecuta el middleware de autenticación de usuario');
    next();

    /**
     * // Simulando la autenticación
     * if (req.body.username === 'x' && req.body.pass === 'y') {
     *  next();
     * } else {
     *  return res.status(401).send({ error: 'No tiene autorización', data: [] });
     * }
     */
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


export default router;
