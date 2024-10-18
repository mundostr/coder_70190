/**
 * En este archivo cargaremos diferentes "estrategias" de Passport, es decir,
 * distintas alternativas a través de las cuales un usuario puede registrarse
 * o autenticarse (local, Github, Facebook, etc)
 */

import passport from 'passport';
import local from 'passport-local';
import userManager from '../dao/users.manager.js';

const manager = new userManager();
const localStrategy = local.Strategy;

const initAuthStrategies = () => {
    passport.use('login', new localStrategy(
        {passReqToCallback: true, usernameField: 'username'},
        async (req, username, password, done) => {
            try {
                if (username != '' && password != '') {
                    // Para simplificar el código, podemos llamar directamente al manager.authenticate(). Ver dao/users.manager.js.
                    const process = await manager.authenticate(username, password);
                    if (process) {
                        // Si el username (email) y los hash coinciden, process contendrá los datos de usuario,
                        // simplemente retornamos esos datos a través de done(), Passport los inyectará en el
                        // objeto req de Express, como req.user.
                        return done(null, process);
                    } else {
                        return done('Usuario o clave no válidos', false);
                    }
                } else {
                    return done('Faltan campos: obligatorios username, password', false);
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user);
    });
        
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};

export default initAuthStrategies;
