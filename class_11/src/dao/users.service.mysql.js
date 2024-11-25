/**
 * El servicio está implementado para Mysql, no obstante, observar la homologación
 * de nombres de propiedades (get, add, etc), gracias a ello, no tenemos necesidad
 * de tocar código en el controlador.
 */

import UserModel from './models/user.model.mysql.js';

class UserService {
    constructor() {}

    get = async (filter) => {
        try {
            // Observar que hemos quitado el llamado al getInstance() del singleton
            // porque lo realiza el propio modelo (ver user.model.mysql.js)
            if (filter) return await UserModel.findOne({ where: filter });
            return await UserModel.findAll();
        } catch (err) {
            return err.message;
        }
    }

    add = async (data) => {
        try {
            return await UserModel.create(data);
        } catch (err) {
            return err.message;
        }
    }

    update = async (filter, update) => {
        try {
            return await UserModel.update(update, { where: filter });
        } catch (err) {
            return err.message;
        }
    }

    delete = async (filter) => {
        try {
            return await UserModel.destroy({ where: filter });
        } catch (err) {
            return err.message;
        }
    }
}


export default UserService;
