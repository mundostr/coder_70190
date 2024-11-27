import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import config from './config.js';
import orderRouter from './routes/order.router.js';
import productRouter from './routes/product.router.js';
import userRouter from './routes/user.router.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.SECRET));
// app.use(cors({ origin: 'http://127.0.0.1:5550', credentials: true }));
app.use(cors({ origin: '*', credentials: true }));

app.use('/api/orders', orderRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);

const httpServer = app.listen(config.PORT, async() => {
    console.log(`Server activo en puerto ${config.PORT}`);
    
    process.on('exit', code => {
        if (code === -4) {
            console.log('Proceso finalizado por argumentación inválida en una función');
        }
    });
});
