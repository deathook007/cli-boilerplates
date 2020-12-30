// Important module dependencies
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const flash = require('express-flash');
const chalk = require('chalk');
const dotenv = require('dotenv');
const sass = require('node-sass-middleware');
const mongoose = require('mongoose');
const lusca = require('lusca');
const MongoStore = require('connect-mongo')(session);
const errorHandler = require('errorhandler');

const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads') });

// Loading environment variables
dotenv.config({ path: '.env.example' });

// Rout handelers
const apiControl = require('./controllers/api');
const userControl = require('./controllers/user');
const homeControl = require('./controllers/home');

// Api config + Password config
const passportConfig = require('./config/passport');

// Express server
const app = express();

// Mongo db connection
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
    console.error(err);
    console.log(
        '%s MongoDB connection error. Please make sure MongoDB is running.',
        chalk.red('✗')
    );
    process.exit();
});

// Express configurations
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(
    sass({
        src: path.join(__dirname, 'public'),
        dest: path.join(__dirname, 'public'),
    })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET,
        cookie: { maxAge: 1209600000 }, // Two weeks in milliseconds
        store: new MongoStore({
            url: process.env.MONGODB_URI,
            autoReconnect: true,
        }),
    })
);
app.use(flash());
app.use((req, res, next) => {
    if (req.path === '/api/upload') {
        // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
        next();
    } else {
        lusca.csrf()(req, res, next);
    }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// After login redirect back to the intended page
app.use((req, res, next) => {
    if (!req.user &&
        req.path !== '/login' &&
        req.path !== '/signup' &&
        !req.path.match(/^\/auth/) &&
        !req.path.match(/\./)
    ) {
        req.session.returnTo = req.originalUrl;
    } else if (
        req.user &&
        (req.path === '/account' || req.path.match(/^\/api/))
    ) {
        req.session.returnTo = req.originalUrl;
    }
    next();
});

// Primary app routes
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get(
    '/account/verify',
    passportConfig.isAuthenticated,
    userController.getVerifyEmail
);
app.get(
    '/account/verify/:token',
    passportConfig.isAuthenticated,
    userController.getVerifyEmailToken
);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post(
    '/account/profile',
    passportConfig.isAuthenticated,
    userController.postUpdateProfile
);
app.post(
    '/account/password',
    passportConfig.isAuthenticated,
    userController.postUpdatePassword
);
app.post(
    '/account/delete',
    passportConfig.isAuthenticated,
    userController.postDeleteAccount
);
app.get(
    '/account/unlink/:provider',
    passportConfig.isAuthenticated,
    userController.getOauthUnlink
);

// API example routes
app.get('/api', apiController.getApi);
app.get('/api/lastfm', apiController.getLastfm);
app.get('/api/nyt', apiController.getNewYorkTimes);
app.get(
    '/api/steam',
    passportConfig.isAuthenticated,
    passportConfig.isAuthorized,
    apiController.getSteam
);
app.get('/api/stripe', apiController.getStripe);
app.post('/api/stripe', apiController.postStripe);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/twilio', apiController.getTwilio);
app.post('/api/twilio', apiController.postTwilio);
app.get(
    '/api/foursquare',
    passportConfig.isAuthenticated,
    passportConfig.isAuthorized,
    apiController.getFoursquare
);
app.get(
    '/api/tumblr',
    passportConfig.isAuthenticated,
    passportConfig.isAuthorized,
    apiController.getTumblr
);
app.get(
    '/api/facebook',
    passportConfig.isAuthenticated,
    passportConfig.isAuthorized,
    apiController.getFacebook
);
app.get(
    '/api/github',
    passportConfig.isAuthenticated,
    passportConfig.isAuthorized,
    apiController.getGithub
);
app.get(
    '/api/twitter',
    passportConfig.isAuthenticated,
    passportConfig.isAuthorized,
    apiController.getTwitter
);
app.post(
    '/api/twitter',
    passportConfig.isAuthenticated,
    passportConfig.isAuthorized,
    apiController.postTwitter
);
app.get(
    '/api/twitch',
    passportConfig.isAuthenticated,
    passportConfig.isAuthorized,
    apiController.getTwitch
);
app.get(
    '/api/instagram',
    passportConfig.isAuthenticated,
    passportConfig.isAuthorized,
    apiController.getInstagram
);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/api/lob', apiController.getLob);
app.get('/api/upload', lusca({ csrf: true }), apiController.getFileUpload);
app.post(
    '/api/upload',
    upload.single('myFile'),
    lusca({ csrf: true }),
    apiController.postFileUpload
);
app.get(
    '/api/pinterest',
    passportConfig.isAuthenticated,
    passportConfig.isAuthorized,
    apiController.getPinterest
);
app.post(
    '/api/pinterest',
    passportConfig.isAuthenticated,
    passportConfig.isAuthorized,
    apiController.postPinterest
);
app.get('/api/here-maps', apiController.getHereMaps);
app.get('/api/google-maps', apiController.getGoogleMaps);
app.get(
    '/api/google/drive',
    passportConfig.isAuthenticated,
    passportConfig.isAuthorized,
    apiController.getGoogleDrive
);
app.get('/api/chart', apiController.getChart);
app.get(
    '/api/google/sheets',
    passportConfig.isAuthenticated,
    passportConfig.isAuthorized,
    apiController.getGoogleSheets
);
app.get(
    '/api/quickbooks',
    passportConfig.isAuthenticated,
    passportConfig.isAuthorized,
    apiController.getQuickbooks
);

// OAuth authorization routes - API examples
app.get('/auth/foursquare', passport.authorize('foursquare'));
app.get(
    '/auth/foursquare/callback',
    passport.authorize('foursquare', { failureRedirect: '/api' }),
    (req, res) => {
        res.redirect('/api/foursquare');
    }
);
app.get('/auth/tumblr', passport.authorize('tumblr'));
app.get(
    '/auth/tumblr/callback',
    passport.authorize('tumblr', { failureRedirect: '/api' }),
    (req, res) => {
        res.redirect('/api/tumblr');
    }
);
app.get('/auth/steam', passport.authorize('openid', { state: 'SOME STATE' }));
app.get(
    '/auth/steam/callback',
    passport.authorize('openid', { failureRedirect: '/api' }),
    (req, res) => {
        res.redirect(req.session.returnTo);
    }
);
app.get(
    '/auth/pinterest',
    passport.authorize('pinterest', { scope: 'read_public write_public' })
);
app.get(
    '/auth/pinterest/callback',
    passport.authorize('pinterest', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/api/pinterest');
    }
);
app.get(
    '/auth/quickbooks',
    passport.authorize('quickbooks', {
        scope: ['com.intuit.quickbooks.accounting'],
        state: 'SOME STATE',
    })
);
app.get(
    '/auth/quickbooks/callback',
    passport.authorize('quickbooks', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect(req.session.returnTo);
    }
);

// Error handling
if (process.env.NODE_ENV === 'development') {
    // only use in development
    app.use(errorHandler());
} else {
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).send('Server Error');
    });
}

// Strating express server
app.listen(app.get('port'), () => {
    console.log(
        '%s App is running at http://localhost:%d in %s mode',
        chalk.green('✓'),
        app.get('port'),
        app.get('env')
    );
    console.log('  Press CTRL-C to stop\n');
});

module.exports = app;