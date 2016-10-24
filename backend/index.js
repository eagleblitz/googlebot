const path = require('path');
const http = require('http');
const express = require('express');
const router = express.Router();
const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const server = app.server = http.createServer(app);

app.sse = require('./sseBackend')(server, app);

app.use(require('express-session')({
  secret: 'hardcore memes',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 86400000,
    httpOnly: false
  }
}));

router.use('/', require('./routes/index'));
router.use('/panel', require('./routes/panel'));
router.use('/setting', require('./routes/setting'));

app.use(router);

const begin = (manager) => {
  app.manager = manager;
  console.log('Listening on :1337');
  server.listen(1337);
  return app;
}

module.exports = begin;
