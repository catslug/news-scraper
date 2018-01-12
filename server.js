const express = require('express')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const logger = require('morgan')
const mongoose = require('mongoose')
const request = require('request')
const cheerio = require('cheerio')

const db = require('./models')

const PORT = 3000

const app = express()

app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

mongoose.Promise = Promise
mongoose.connect('mongodb://localhost/news-scraper', {
    useMongoClient: true
})

app.get('/', function(req, res) {
    db.Article.find({}, function(err, data) {
        if (err) console.log(err)
        else {
            console.log('cool, I got some data', data)
            res.render('index', {layout: 'main.handlebars', articles: data})
        }
    })
})

app.get('/scrape', function(req, res) {
    request.get('https://techcrunch.com/', function(err, response, body) {
        if (err) console.log(err)
        else {
            const $ = cheerio.load(response.body)

            $('h2.post-title').each(function(i, element) {
                result = {}

                result.title = $(this).children('a').text()
                result.url = $(this).children('a').attr('href')

                console.log(result)

                db.Article
                    .create(result)
                    .then(function(dbArticle) {
                        res.send('Scrape Complete')
                    })
                    .catch(function(err) {
                        res.json(err)
                    })
            })
        }
    })
})

app.get('/articles', function(req, res) {
    db.Article.find({}, function(err, data) {
        if (err) console.log(err)
        else {
            res.json(data)
        }
    })
})

app.get('/articles/:id', function(req, res) {
    db.Article
        .findOne({ _id: req.params.id })
        .populate('notes')
        .then(function(dbArticle) {
            res.json(dbArticle)
        })
        .catch(function(err) {
            console.log(err)
        })
})

app.post('/articles/:id', function(req, res) {
    db.Note.create(req.body)
        .then(function(dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true })
        })
        .then(function(dbArticle) {
            res.json(dbArticle)
        })
        .catch(function(err) {
            console.log(err)
        })
})

app.listen(PORT, function() {
    console.log(`App listening on port ${PORT}!`)
})