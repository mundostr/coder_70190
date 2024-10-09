import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
// Importamos módulos para cookies y sesiones
import cookieParser from 'cookie-parser';
import session from 'express-session';

import usersRouter from './routes/users.router.js';
import viewsRouter from './routes/views.router.js';
import cookiesRouter from './routes/cookies.router.js';
import config from './config.js';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Habilitamos el parser de cookies y pasamos secret para que pueda firmar
app.use(cookieParser(config.SECRET));
// Habilitamos el gestor de sesiones, esto inyectará el objeto req.session en la cadena de Express
app.use(session({ secret: config.SECRET, resave: true, saveUninitialized: true }));

app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine', 'handlebars');

app.use('/views', viewsRouter);
app.use('/api/users', usersRouter);
app.use('/api/cookies', cookiesRouter);
app.use('/static', express.static(`${config.DIRNAME}/public`));

// Convertimos el callback del listen en asíncrono y esperamos la conexión a la base de datos
const httpServer = app.listen(config.PORT, async() => {
    await mongoose.connect(config.MONGODB_URI);
    console.log(`Server activo en puerto ${config.PORT}, conectado a bbdd local`);
    
    const socketServer = new Server(httpServer);
    socketServer.on('connection', socket => {
        console.log(`Nuevo cliente conectado con id ${socket.id}`);
    
        socket.on('init_message', data => {
            console.log(data);
        });
    
        socket.emit('welcome', `Bienvenido cliente, estás conectado con el id ${socket.id}`);
    });
});
