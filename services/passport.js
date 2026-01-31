import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import mongoose from 'mongoose';

//opening USer model define in User.js
const User = mongoose.model('users');

//serializing user id (obtained by mongo id)
passport.serializeUser((user, done) =>{
    done(null, user.id);
});


//deserializing user and calling done function
passport.deserializeUser((id, done) =>{
    User.findById(id).then(user =>{
            done(null, user);
    });
});

//setting up GoogleAuthStrategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/callback"
},
    //if I find a User in the DB call done function else save the record and call done function
    async (accessToken, refreshToken, profile, done) => {
        const existingUser = await User.findOne({ googleID: profile.id});

        if(existingUser){
            //profile id existing
            return done(null, existingUser);
        }

        const user = await new User({ googleID: profile.id, name: profile.displayName, photo: profile._json.picture }).save()
        done(null, user);
    }
));
