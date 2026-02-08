import { Router } from 'express';
import passport from 'passport';
import * as authController from '../controllers/auth.controller.js';
import * as authService from '../services/auth.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();


router.get('/auth/google', (req, res, next) => {
  const { code_challenge } = req.query;

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: code_challenge
  })(req, res, next);
});


router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    const codeChallenge = req.query.state;
    const code = authService.generateAuthCode(req.user, codeChallenge);

    res.redirect(`http://localhost:3000/auth/callback?code=${code}`);
  }
);

router.post('/api/v1/auth/token', authController.tokenExchange);


router.post('/api/v1/auth/refresh', authController.refresh);


router.post('/api/v1/auth/logout', authController.logout);


router.get('/api/v1/users/me', requireAuth, authController.getCurrentUser);

export default router;
