/**
 * Este controlador (manager) ya no interactúa de forma directa con la persistencia,
 * simplemente llama al método del servicio que corresponda
 * 
 * Estamos importando users.service.mongo.js, podríamos tener otros servicios de persistencia
 * también creados.
 * 
 * Si homologamos los métodos, es decir, utilizamos los mismos nombres de métodos en los
 * distintos servicios (para MongoDB, Mysql, etc), no tendremos necesidad de tocar la lógica
 * de negocio acá, el controlador simplemente instanciará un servicio y le solicitará cosas,
 * sin importarle cuál es.
 */

import UserService from '../services/users.service.mongo.js';
import { createHash, isValidPassword } from '../utils.js';


const service = new UserService();

class UserController {
    constructor() {}

    get = async () => {
        try {
            return await service.get();
        } catch (err) {
            return err.message;
        }
    }

    getOne = async (filter) => {
        try {
            return await service.get(filter);
        } catch (err) {
            return err.message;
        };
    };

    add = async (data) => {
        try {
            return await service.add(data);
        } catch (err) {
            return err.message;
        }
    }

    update = async (filter, update, options) => {
        try {
            return await service.update(filter, update, options);
        } catch (err) {
            return err.message;
        }
    }

    delete = async (filter, options) => {
        try {
            return await service.delete(filter, options);
        } catch (err) {
            return err.message;
        }
    }

    authenticate = async (user, pass) => {
        try {
            const filter = { email: user };
            const foundUser = await service.getOne(filter);

            if (foundUser && isValidPassword(pass, foundUser.password)) {
                const { password, ...filteredUser } = foundUser;

                return filteredUser;
            } else {
                return null;
            }
        } catch (err) {
            return err.message;
        }
    }

    register = async (data) => {
        try {
            const filter = { email: data.username };
            const user = await service.getOne(filter);

            if (user === null) {
                data.password = createHash(data.password);
                return await service.add(data);
            } else {
                return null;
            }
        } catch (err) {
            return err.message;
        }
    }
}


export default UserController;
