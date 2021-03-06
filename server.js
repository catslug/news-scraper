const express = require('express')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const logger = require('morgan')
const mongoose = require('mongoose')
const request = require('request')
const cheerio = require('cheerio')

const db = require('./models')

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://heroku_pdh52s64:vg6a1ijuuhfijdeopg5hsrkiv@ds041546.mlab.com:41546/heroku_pdh52s64"

const PORT = process.env.PORT || 3000

const app = express()

app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

mongoose.Promise = Promise
mongoose.connect(MONGODB_URI, {
    useMongoClient: true
})

app.get('/', function(req, res) {
    db.Article.find({}).populate({path: 'note', select: 'body'}).sort({_id: -1}).exec(function(err, data) {
        if (err) console.log(err)
        else {
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
                result.date = $(this).parent('div').children('div.byline').children('time').attr('datetime')
                result.byline = $(this).parent('div').children('div.byline').children('a').text()
                result.excerpt = $(this).parent('div').children('p.excerpt').text()

                db.Article
                    .create(result)
                    .then(function(dbArticle) {
                        res.redirect('/')
                    })
                    .catch(function(err) {
                        res.redirect('/')
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
        .populate('note')
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
            db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: {note: dbNote._id} }, { new: true })
            return dbNote._id
        })
        .then(function(dbNoteId) {
            res.send(dbNoteId)
        })
        .catch(function(err) {
            console.log(err)
        })
})

app.get('/notes/:id', function(req, res) {
    db.Note.findByIdAndRemove(req.params.id, function(dbDeletedNote) {
        res.sendStatus(200)
    })
})

app.listen(PORT, function() {
    console.log(`App listening on port ${PORT}!`)
})