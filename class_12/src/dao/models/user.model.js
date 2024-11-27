import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'users';

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: false },
    role: { type: String, enum: ['ADMIN', 'PREMIUM', 'USER'], default: 'USER' },
    // cart: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'carts' },
    password: { type: String, required: true }
});

const model = mongoose.model(collection, schema);

export default model;
