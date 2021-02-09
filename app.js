import path from 'path';
import url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import express from 'express';
import mongoose from 'mongoose';
const { connection } = mongoose;
import { config } from 'dotenv';
import morgan from 'morgan';
import exphbs from 'express-handlebars';
import methodOverride from 'method-override';
import passport from 'passport';
import session from 'express-session';
import connectMongo from 'connect-mongo';
const MongoStore = connectMongo(session);
import connectDB from './config/db.js';

// Load config file
config({ path: './config/config.env' });

// Passport config
// Passport config
import passportConfig from './config/passport.js';
passportConfig(passport);

connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override
app.use(methodOverride((req, res) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Handlebars Helpers
import { formatDate, stripTags, truncate, editIcon, select } from './helpers/hbs.js';

// Handlebars
app.engine('.hbs', exphbs(
  {
    helpers: { formatDate, stripTags, truncate, editIcon, select },
    defaultLayout: 'main',
    extname: '.hbs'
  }
));
app.set('view engine', '.hbs');

// Sessions
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: connection })
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global var
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
import index from './routes/index.js';
import auth from './routes/auth.js';
import stories from './routes/stories.js';
app.use('/', index);
app.use('/auth', auth);
app.use('/stories', stories);

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log('Server running in ' + process.env.NODE_ENV + ' mode on port ' + PORT));