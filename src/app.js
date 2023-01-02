"use strict"

global.__basedir = __dirname

// imports
const express = require('express')
const bodyParser = require("body-parser")

// local imports
const util = require(__basedir + '/helpers/util')

// get cofig
const config = require(__basedir + '/config')
const {
  PORT: port,
} = config

// connect to the database
require(__basedir + '/helpers/mongoose')

// start express application
console.log(`starting application on port ${port}`)

// preparing express app
const app = express()

//parse urlencoded bodies
app.use(bodyParser.urlencoded({extended: true}));

// Parse incoming json
app.use(express.json({ limit: '50mb' }))
// CORS
const cors = require('cors')
app.use(cors())

// Routers
const movieRouter = require(__basedir + '/routers/movie')
app.use(movieRouter)

const path = require('path')
app.set('views', path.join(__dirname, 'views'))

//Static files
app.use(express.static(path.join(__dirname, "/public")));

//handlebars
const expressHandlebars = require('express-handlebars');
// An instance of the view engine and specify the helpers
const hbs = expressHandlebars.create({
  defaultLayout: 'main',
  layoutsDir:__dirname + '/views/layouts',
  helpers: {
    truncate: function(str, len, append) {
      if (str.length > len) {
        str = str.substring(0, len);
        if (append) {
          str += append;
        }
      }
      return str;
    },
    toString: function(value){
      return value.toString();
    },
    gt: function(a, b) {
      return a > b;
    },
    limit: function(arr, limit) {
      return arr.slice(0, limit);
    }
  }
});
// Set up express-handlebars as the view engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');



app.get('/', async (req, res) => {
  let pageNum = req.query.pageNum || 1
  pageNum = Number(pageNum)

  res.send({
    msg: "Welcome To The API!"
  })
})

// 404 Page
app.get('*', (req, res) => {
  res.status(404).send({
    "err": "not found!",
  })
})

//500 page
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send({
    err: "Something broke!"
  })
})

app.listen(port, () => {
  console.log(`\nServer is up:\n\n\thttp://localhost:${port}\n\n`)
})

