import { Router } from 'express';

import OrderController from '../controllers/order.controller.js';
import config from '../config.js';

const router = Router();
const controller = new OrderController();

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
        const { user, products, total } = req.body;

        if (user != '' && total != '' && total > 0 && Array.isArray(products) && products.length > 0) {
            const data = { user, products, total };
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
