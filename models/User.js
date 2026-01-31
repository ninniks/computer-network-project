import mongoose from 'mongoose';
const { Schema } = mongoose;

//creating user Schema with Mongoose driver
const userSchema = new Schema({
    googleID: String,
    name: String,
    photo: String
});

mongoose.model('users', userSchema);
