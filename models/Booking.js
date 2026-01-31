import mongoose from 'mongoose';
const { Schema } = mongoose;

//creating user Schema with Mongoose driver
const bookingSchema = new Schema({
       date: Date,
       userID: String
});

mongoose.model('bookings', bookingSchema);
