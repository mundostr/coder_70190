import UserService from '../dao/user.dao.js';
import UserDTO from '../dao/user.dto.js';
import { isValidPassword } from '../utils.js';

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
            const foundUser = await service.get(filter);

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
            const filter = { email: data.email };
            const user = await service.get(filter);
            return user === null ? await this.add(data): null;
        } catch (err) {
            return err.message;
        }
    }
}

export default UserController;
