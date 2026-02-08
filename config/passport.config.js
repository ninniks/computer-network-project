import passport from 'passport';
import {Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as authService from '../services/auth.service.js';

export const configurePassport = () => {

  passport.use("google",
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:8000/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        const user = await authService.findOrCreateUser(profile);
        done(null, user);
      }
    )
  );
};
