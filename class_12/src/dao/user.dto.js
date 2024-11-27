import { createHash } from '../utils.js';

class UserDTO {
    constructor(data) {
        this.firstName = data.firstName?.trim();
        this.lastName = data.lastName?.toUpperCase().trim();
        this.email = data.email?.toLowerCase().trim();
        this.password = createHash(data.password);
    }
}

export default UserDTO;
