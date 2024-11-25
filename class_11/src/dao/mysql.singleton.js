/**
 * Similar al singleton de Mongo, creamos un método getInstance para verificar la conexión a la bbdd
 */

import { Sequelize } from 'sequelize';
import config from '../config.js';

export default class MySQLSingleton {
    static instance;

    static async getInstance() {
        if (!MySQLSingleton.instance) {
            MySQLSingleton.instance = new Sequelize(config.MYSQL_DB, config.MYSQL_USER, config.MYSQL_PASS, {
                host: config.MYSQL_HOST,
                dialect: 'mysql',
            });
            
            try {
                await MySQLSingleton.instance.authenticate();
                console.log('Conexión bbdd CREADA (Mysql)');
            } catch (err) {
                throw err;
            }
        }

        return MySQLSingleton.instance;
    }
}
