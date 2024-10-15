import userModel from './models/user.model.js';


class userManager {
    constructor() {}

    get = async () => {
        try {
            return await userModel.find().lean();
        } catch (err) {
            return null;
        }
    }

    add = async (data) => {
        try {
            return await(userModel.create(data));
        } catch (err) {
            return null;
        }
    }

    update = async (filter, update, options) => {
        try {
            return await userModel.findOneAndUpdate(filter, update, options);
        } catch (err) {
            return null;
        }
    }

    delete = async (filter, options) => {
        try {
            return await userModel.findOneAndDelete(filter, options);
        } catch (err) {
            return null;
        }
    }

    /**
     * Agregamos un método simple para autenticar
     * 
     * utiliza findOne para tratar de encontrar un documento que cumpla
     * con el criterio especificado en el filtro, si lo encuentra, lo
     * retorna, caso contrario devuelve null
     */
    authenticate = async (user, pass) => {
        try {
            const filter = { email: user, password: pass };
            return await userModel.findOne(filter);
        } catch (err) {
            return null;
        }
    }
}


export default userManager;
