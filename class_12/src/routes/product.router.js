import { Router } from 'express';

import ProductController from '../controllers/product.controller.js';
import config from '../config.js';

const router = Router();
const controller = new ProductController();

router.get('/', async (req, res) => {
    try {
        const data = await controller.get();
        res.status(200).send({ error: null, data: data });
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, price } = req.body;

        if (name != '' && price != '') {
            const data = { name, price };
            const process = await controller.add(data);
            res.status(200).send({ error: null, data: process });
        } else {
            res.status(400).send({ error: 'Faltan campos obligatorios', data: [] });
        }
    } catch (err) {
        res.status(500).send({ error: 'Error interno de ejecución del servidor', data: [] });
    }
});

router.all('*', async () => {
    res.status(404).send({ error: 'No se encuentra la ruta especificada', data: [] });
})

export default router;
