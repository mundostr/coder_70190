import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import config from './config.js';

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
 * Este por su parte, se encarga de llamar al passport.authenticate() e intercepta la devolución,
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
