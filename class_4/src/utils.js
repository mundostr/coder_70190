import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (passwordToVerify, storedHash) => bcrypt.compareSync(passwordToVerify, storedHash);

/**
 * Nos permite crear un token JWT, indicando la carga útil (payload) y el tiempo de validez
 * Este tiempo (expiration) puede indicarse con números y letras (m = minutos, h = horas, 
 * d = días, por ej 2h = 2 horas de validez, 5 m = 5 minutos, 3d = 3 días)
 */
export const createToken = (payload, duration) => jwt.sign(payload, config.SECRET, { expiresIn: duration });

/**
 * Esta función trata de ubicar un token JWT, ya sea en los headers,
 * en el sistema de cookies o vía query en la solicitud.
 * 
 * Si lo ubica y verifica, extrae su carga útil (payload) y lo guarda en un objeto
 * req.user que puede ser reusado en otro middleware
 */
export const verifyToken = (req, res, next) => {
    /**
     * Si el token llega en los headers, debe venir bajo el nombre authorization y antecedido
     * por la palabra Bearer -> Header Authorization: Bearer <token>
     */
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;
    const cookieToken = req.cookies && req.cookies[`${config.APP_NAME}_cookie`] ? req.cookies[`${config.APP_NAME}_cookie`] : undefined;
    const queryToken = req.query.access_token ? req.query.access_token : undefined;
    const receivedToken = headerToken || cookieToken || queryToken;

    if (!receivedToken) return res.status(401).send({ error: 'Se requiere token', data: [] });

    jwt.verify(receivedToken, config.SECRET, (err, payload) => {
        if (err) return res.status(403).send({ error: 'Token no válido', data: [] });
        
        req.user = payload;
        next();
    });
};
