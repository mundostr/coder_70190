import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import FileStore from 'session-file-store';
import passport from 'passport';
import cors from 'cors';

import config from './config.js';

import usersRouter from './routes/users.router.js';
import childrensRouter from './routes/childrens.router.js';
import viewsRouter from './routes/views.router.js';
import MongoSingleton from './services/mongo.singleton.js';


const app = express();
const fileStorage = FileStore(session);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser(config.SECRET));
app.use(session({
    secret: config.SECRET,
    resave: true,
    saveUninitialized: true,
    store: new fileStorage({ path: './sessions', ttl: 60, retries: 0 }),
}));

app.use(passport.initialize());
app.use(passport.session());
/**
 * Habilitamos soporte CORS (Cross Origin Resource Sharing)
 * Este paso es importante para asegurar compatibilidad de nuestra API con
 * los diferentes navegadores, nos permite configurar desde qué orígenes
 * aceptamos solicitudes. * es un comodín para indicar que aceptamos desde
 * cualquier origen, pero por supuesto podemos indicar uno específico o
 * una lista.
 */
// app.use(cors({ origin: 'http://127.0.0.1:5550', credentials: true }));
app.use(cors({ origin: '*', credentials: true }));

app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine', 'handlebars');

app.use('/views', viewsRouter);
app.use('/api/users', usersRouter);
app.use('/api/childrens', childrensRouter);
app.use('/static', express.static(`${config.DIRNAME}/public`));

const httpServer = app.listen(config.PORT, async() => {
    // Ya no conectamos de forma directa al motor de base de datos,
    // lo hacemos a través de una clase singleton.
    await MongoSingleton.getInstance();
    console.log(`Server activo en puerto ${config.PORT}`);
    
    const socketServer = new Server(httpServer);
    socketServer.on('connection', socket => {
        console.log(`Nuevo cliente conectado con id ${socket.id}`);
    
        socket.on('init_message', data => {
            console.log(data);
        });
    
        socket.emit('welcome', `Bienvenido cliente, estás conectado con el id ${socket.id}`);
    });

    // Habilitamos un listener por salidas inesperadas del proceso
    process.on('exit', code => {
        if (code === -4) {
            console.log('Proceso finalizado por argumentación inválida en una función');
        }
    });
});
