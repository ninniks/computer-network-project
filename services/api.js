import mongoose from 'mongoose';
import {map} from 'lodash-es';

const Booking = mongoose.model('bookings');

export const checkAndSaveBooking = async (userID, date) => {
    console.log('test', date);
    //API call to MongoDB to check if there's a booking with this dates
    const existingBooking = await Booking.findOne({ date });


    if(existingBooking){
        return false;
    }

    await new Booking({ date, userID }).save();
    return true;

};

export const loadBookedDates = async () => {
    return Booking.find();
};


export const loadBookedHours = async (date) => {
    const dates = await Booking.find({ date });
    return map(dates, (data) => {
        return {start: data.startHour, end: data.endHour}
    });
};

export const loadAllUserBookings = async (userid) => {
    return Booking.find({userID: userid});
};
