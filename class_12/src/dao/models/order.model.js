import mongoose from 'mongoose';
import userModel from './user.model.js';
import productModel from './product.model.js';

mongoose.pluralize(null);

const collection = 'orders';

const schema = new mongoose.Schema({
    // number: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
    products: { type: [{ product: mongoose.Schema.Types.ObjectId, qty: Number }], required: true, ref: 'products' },
    total: { type: Number }
});

schema.pre('find', function () {
    this.populate({ path: 'user', model: userModel, select: '-role -password' })
        .populate({ path: 'products.product', model: productModel });
});

schema.pre('findOne', function () {
    this.populate({ path: 'user', model: userModel, select: '-role -password' })
        .populate({ path: 'products.product', model: productModel });
});

const model = mongoose.model(collection, schema);

export default model;
