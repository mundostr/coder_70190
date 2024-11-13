import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import config from './config.js';

/**
 * Verificamos los datos de sesión para saber si el usuario está autorizado para acceder al endpoint.
 * En caso de emplear JWT, ya no necesitamos este middleware
 */
export const verifySession = (req, res, next) => {
    if ((req.session?.userData && req.session?.userData.admin) || req.session?.passport.user) {
        next();
    } else {
        res.status(401).send({ error: 'No autorizado', data: [] });
    }
}

/**
 * Middleware que se encarga de llamar al passport.authenticate() e intercepta la devolución,
 * para responder en caso de error con el formato habitual de la API.
 */
export const passportCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, function (err, user, info) {
            if (err) return next(err);
            if (!user) return res.status(401).send({ error: 'Problemas de autenticación' , data: [] });
            req.user = user;
            next();
        })(req, res, next);
    }
}

export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (passwordToVerify, storedHash) => bcrypt.compareSync(passwordToVerify, storedHash);

export const createToken = (payload, duration) => jwt.sign(payload, config.SECRET, { expiresIn: duration });

/**
 * Este middleware chequea si llega un token JWT por alguna de las 3 vías habituales
 * (headers, cookies o query). Si todo está ok, extrae su carga útil (payload)
 * y la agrega al objeto req (req.user) para que pueda ser usada en distintos endpoints
 */
export const verifyToken = (req, res, next) => {
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;
    const cookieToken = req.signedCookies && req.signedCookies[`${config.APP_NAME}_cookie`] ? req.signedCookies[`${config.APP_NAME}_cookie`] : undefined;
    const queryToken = req.query.access_token ? req.query.access_token : undefined;
    const receivedToken = headerToken || cookieToken || queryToken;

    if (!receivedToken) return res.status(401).send({ error: 'Se requiere token', data: [] });

    jwt.verify(receivedToken, config.SECRET, (err, payload) => {
        if (err) return res.status(403).send({ error: 'Token no válido', data: [] });
        
        req.user = payload;
        next();
    });
};

/**
 * Este es nuestro primer middleware de AUTORIZACION, es decir,
 * manejo de POLITICAS de usuario.
 * 
 * Una vez que el usuario está autenticado, podemos verificar su propiedad role para
 * verificar si puede o no acceder a determinada funcionalidad.
 * 
 * La función recibe un array de roles válidos, si el rol almacenado para el usuario actual
 * está en ese array, se le permitirá continuar.
 */
export const handlePolicies = policies => (req, res, next) => {
    const role = req.user.role;
    if (!policies.includes(role)) return res.status(403).send({ error: 'No se cuenta con autorización', data: [] });
    next();
}
