/**
 * Las consultas directas a la base de datos, que antes realizábamos desde
 * nuestro controlador (manager), ahora las encapsulamos en un servicio
 * por separado, que opera exclusivamente con MongoDB.
 * 
 * Si necesitáramos implementar otro motor de base de datos, podríamos
 * crear otro archivo de servicio (por ej para Mysql, Postgresql, etc),
 * sin tener que tocar la lógica de negocio en el controlador (ver users.controller.js)
 */

import userModel from './models/user.model.mongo.js';
import MongoSingleton from './mongo.singleton.js';


class UserService {
    constructor() {}

    get = async (filter) => {
        try {
            await MongoSingleton.getInstance();
            if (filter) return await userModel.findOne(filter).lean();
            return await userModel.find().lean();
        } catch (err) {
            return err.message;
        }
    }

    add = async (data) => {
        try {
            return await(userModel.create(data));
        } catch (err) {
            return err.message;
        }
    }

    update = async (filter, update, options) => {
        try {
            return await userModel.findOneAndUpdate(filter, update, options);
        } catch (err) {
            return err.message;
        }
    }

    delete = async (filter, options) => {
        try {
            return await userModel.findOneAndDelete(filter, options);
        } catch (err) {
            return err.message;
        }
    }
}


export default UserService;
