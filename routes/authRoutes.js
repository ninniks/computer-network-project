import passport from 'passport';

export default (app) => {
  //sending auth request to google with the scoope
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  //if I obtained the grant i redirect to /api/current_user
  app.get('/auth/google/callback', passport.authenticate('google'), (req, res) =>{
    res.redirect('http://localhost:3000');
  });

  //route to logout
  app.get('/api/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect('/');
    });
  });

  //just seeing user info
  app.get('/api/current_user', (req, res) => {
    res.send(req.user);
  });
};
