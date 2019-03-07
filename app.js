const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');


//Load Keys
const keys = require('./config/keys');

//Load Handlebars helpers
const {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon
} = require('./helpers/hbs');

//Load models
require('./models/User');
require('./models/Story');

//Load Passport
require('./config/passport')(passport);

//Load routes
const index = require('./routes/index');
const auth = require('./routes/auth');
const stories = require('./routes/stories');

//Map global promise
mongoose.Promise = global.Promise;

//Mongo DB connection
mongoose.connect(keys.mongoURI, {
useNewUrlParser : true
})
.then(() => console.log('mongo DB connected'))
.catch(err => console.log(err));

const app = express();

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Method over ride Middleware
app.use(methodOverride('_method'));


// Handlebars middelware
app.engine('handlebars', exphbs({
  helpers: {
truncate: truncate,
stripTags: stripTags,
formatDate: formatDate,
select: select,
editIcon: editIcon
  },
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Use Cookie Parser
app.use(cookieParser());

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

//Passport middleware - session
app.use(passport.initialize());
app.use(passport.session());

//set global vars

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
})

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Use Routes
app.use('/', index);
app.use('/auth', auth);
app.use('/stories', stories);

const port = process.env.PORT || 5040;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});