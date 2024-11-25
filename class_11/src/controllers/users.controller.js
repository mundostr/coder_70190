/**
 * El generar una capa de acceso a datos separada (DAO = Data Access Objects)
 * nos permite implementar de forma más organizada el soporte para distintos
 * tipos de persistencia (en este ejemplo, MongoDB y Mysql).
 * 
 * Si homologamos nombres de métodos, podremos fácilmente crear la instancia
 * de un servicio u otro, según el tipo de persistencia que deseemos utilizar.
 * 
 * Es factible también activar un servicio tipo factory, si necesitamos que
 * la app pueda cambiar automáticamente de persistencia en función de alguna
 * variable de configuración (ver factory.service.js).
 */

import UserService from '../dao/users.service.mongo.js'; // Instanciamos manualmente persistencia MongoDB
// import UserService from '../dao/users.service.mysql.js'; // Instanciamos manualmente persistencia Mysql
// import UserService from '../dao/factory.service.js'; // Instanciamos automáticamente persistencia
import { createHash, isValidPassword } from '../utils.js';
import UserDTO from '../dao/users.dto.js';


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
            /**
             * Un DTO (Data Transfer Object), es un servicio
             * intermedio encargado de la normalización de datos.
             * 
             * Antes de entregar el objeto al método add del DAO,
             * pasamos por una instancia del DTO que se encarga
             * de normalizar lo necesario (por ejemplo pasar un apellido a mayúsculas),
             * un email a minúsculas, etc.
             */
            const normalizedData = new UserDTO(data);
            return await service.add(normalizedData);
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
