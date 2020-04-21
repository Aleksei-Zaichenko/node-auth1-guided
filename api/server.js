const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require('express-session');
const knexSessionStore = require('connect-session-knex')(session);

const usersRouter = require("../users/users-router.js");
const authRouter = require('../auth/router.js')
const authenticator = require('../auth/authenticator.js');
const dbConnection = require('../database/dbConfig.js');

const server = express();

const sessionConfig = {
  name: 'lambda',
  secret: process.env.SESSION_SECRET || 'keep it secret',
  resave: false,
  saveUninitialized: process.env.SEND_COOKIE || false,
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: process.env.USE_SECURE_COOKIES || false,//used over https only, in production set to true
    httpOnly: true
  },
  store: new knexSessionStore({
    knex: dbConnection,
    tablename: 'sessions',
    sidfieldname: 'sid',
    createtable: true,
    clearInterval: 1000 * 60 * 60,//removes expired sessions every hour
  })
}

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.use("/api/users",authenticator, usersRouter);
server.use('/api/auth', authRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

module.exports = server;
