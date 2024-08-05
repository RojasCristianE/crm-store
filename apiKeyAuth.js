export function apiKeyAuth(req, res, next) {
    if (req.session.isAuthenticated) return next();

    res.redirect('/setup');
}