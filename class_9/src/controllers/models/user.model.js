import mongoose from 'mongoose';

// Esta línea nos evitará problemas de nombres si Mongoose crea alguna colección no existente
mongoose.pluralize(null);

const collection = 'users';


const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: false },
    /**
     * Agregamos la propiedad role, que nos permitirá diferenciar distintos tipos de usuario.
     * enum nos posibilita listar las opciones válidas para la propiedad, en este ejemplo,
     * role puede ser ADMIN, PREMIUM o USER; si al cargar un nuevo usuario
     * no se indica (o se coloca cualquier otro valor que no sea uno de los 3 de arriba),
     * se cargará como USER (default).
     */
    role: { type: String, enum: ['ADMIN', 'PREMIUM', 'USER'], default: 'USER' },
    cart: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'carts' },
    password: { type: String, required: true }
});

const model = mongoose.model(collection, schema);


export default model;
