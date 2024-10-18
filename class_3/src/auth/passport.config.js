import passport from 'passport';
import local from 'passport-local';
import userManager from '../dao/users.manager.js';

// import { createHash, isValidPassword } from '../utils.js';

const manager = new userManager();
const localStrategy = local.Strategy;

const initAuthStrategies = () => {
    passport.use('login', new localStrategy(
        {passReqToCallback: true, usernameField: 'username'},
        async (req, username, password, done) => {
            try {
                if (username != '' && password != '') {
                    const process = await manager.authenticate(username, password);
                    if (process) {
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
