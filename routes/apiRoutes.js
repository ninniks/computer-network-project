import * as API from '../services/api.js';

export default (app, socket) => {

    app.post('/api/book', async (req, res) => {
        let state = JSON.parse(req.body.date);

        const value = await API.checkAndSaveBooking(req.user._id, state);
        if(value){
            socket.emit("Booked", JSON.stringify({ state }));
            return res.send(true);
        }

        return res.send(false);
    });


    app.get('/api/bookings', async (req, res) => {
        const value = await API.loadBookedDates();
        res.send(value);
    });

    app.get('/api/bookedhours/:date', async (req, res) => {
        let date = req.params.date;
        const value = await API.loadBookedHours(date);
        res.send(value);
    });

    app.get('/api/mybookings', async (req, res) => {
        console.log(req.user._id);
        const value = await API.loadAllUserBookings(req.user._id);
        res.send(value);
    });
};
