/**
 * Aquí tenemos nuestro primer Factory.
 * 
 * Se trata de una pequeña clase, que "fabrica" una instancia de servicio
 * (en este caso de MongoDB o de Mysql), de acuerdo al valor actual de una
 * variable de configuración.
 */

import config from '../config.js';

let service;

try {
    switch (config.PERSISTENCE) {
        case 'mongodb':
            const {default: Mongo} = await import('./users.service.mongo.js');
            service = Mongo;
            break;

        case 'mysql':
            const {default: Mysql} = await import('./users.service.mysql.js');
            service = Mysql;
            break;

        default:
            throw new Error('Persistencia no soportada');
    }
} catch (err) {
    console.error('ERROR al generar servicio bbdd:', err.message);
    throw err;
}

export default service;
