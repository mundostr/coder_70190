import userModel from './models/user.model.js';
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
            await MongoSingleton.getInstance();
            return await(userModel.create(data));
        } catch (err) {
            return err.message;
        }
    }

    update = async (filter, update, options) => {
        try {
            await MongoSingleton.getInstance();
            return await userModel.findOneAndUpdate(filter, update, options);
        } catch (err) {
            return err.message;
        }
    }

    delete = async (filter, options) => {
        try {
            await MongoSingleton.getInstance();
            return await userModel.findOneAndDelete(filter, options);
        } catch (err) {
            return err.message;
        }
    }
}

export default UserService;
