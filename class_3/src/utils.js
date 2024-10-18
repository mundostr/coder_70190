import bcrypt from 'bcrypt';

/**
 * createHash nos permite hashear una clave plana mediante brcypt, generando
 * un resultado que es el que realmente almacenaremos en la base de datos.
 * 
 * Este proceso es IRREVERSIBLE, en caso que la bbdd resulte comprometida y alguien
 * logre acceder al dato, NO podrá obtener la clave plana a partir del hash.
 */
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

/**
 * Así como el hash nos aporta una capa de seguridad, al no tener más la clave plana
 * almacenada en la bbdd, no podemos comparar de forma directa con la recibida en el body,
 * a partir de ahora tendremos que aplicar el mismo proceso de bcrypt a la recibida, y
 * comparar si coinciden los hash, esto es lo que  hace isValidPassword.
 */
export const isValidPassword = (passwordToVerify, storedHash) => bcrypt.compareSync(passwordToVerify, storedHash);
