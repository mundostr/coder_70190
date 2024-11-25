/**
 * Como estamos utilizando el módulo sequelize, declaramos un modelo con la estructura de la tabla.
 * Similar a lo que sucede con Mongoose, sequelize nos brindará una serie de métodos para consultar
 * de manera cómoda, e internamente traducirá a las consultas SQL que corresponda.
 * 
 * Si preferimos ejecutar consultas SQL directas, no necesitaremos este modelo.
 */

import { DataTypes } from 'sequelize';
import MySQLSingleton from '../../dao/mysql.singleton.js';

const sequelize = await MySQLSingleton.getInstance();

const UserModel = sequelize.define(
    'users',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: false,
    }
);

export default UserModel;
