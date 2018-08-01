const express     = require('express'),
      app         = express(),
      bodyParser  = require('body-parser'),
      request     = require('request'),
      mongoose    = require('mongoose');

require('dotenv').config();

mongoose.connect(process.env.DATABASE)

const Stock       = require('./models/Stock');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/test', (req, res) => {
  res.json({ ...req.query })
})

app.get('/seed', (req, res) => {
  Stock.remove({}, (err) => {
    if (err) {
      console.log(err);
      res.json({ err })
    } else {
      Stock.create({
        stock: 'GOOG',
        price: 528,
        likes: ['168.401.28.5']
      }, (err, createdStock) => {
        if (err) {
          console.log(err);
          res.json({ err })
        } else {
          res.json({ createdStock })
        }
      })
    }
  })
})

app.get('/api/stock-prices', (req, res) => {

  console.log(typeof req.query.stock);

  if (!req.query.stock) {
    console.log('NO PARAM ITEMs')

    res.json({
      error: 'please provide one or two stock symbols in this format',
      extensionSample: '/api/stock-prices?stock=goog'
    })
  } else {
    var stock = typeof req.query.stock === 'string' ? req.query.stock : req.query.stock.join(',');
    const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : '194.168.0.104';
    console.log(ip);

    request(`https://api.iextrading.com/1.0/stock/market/batch?symbols=${stock}&types=quote`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }, function (error, responce, body) {
      const data  = JSON.parse(body);

      if (typeof req.query.stock === 'string') {
        stock = stock.toUpperCase();
        console.log('One param');
        Stock.count({ stock }, (err, count) => {
          if (err) {
            console.log(err);
            res.json({ err })
          } else {
            console.log(stock)
            if (count > 0) {
              console.log('already in db');
              Stock.findOne({ stock }, (err, foundStock) => {
                if (err) {
                  console.log(err);
                  res.json({ err })
                } else {
                  foundStock.price = data[stock].quote.latestPrice;
                  if (req.query.like) {
                    console.log('toggling user like');
                    if (foundStock.likes.includes(ip)) {
                      //remove
                      foundStock.likes.remove(ip);
                      foundStock.save();
                    } else {
                      //add
                      foundStock.likes.push(ip);
                      foundStock.save();
                    }
                  }
                  foundStock.save();
                  console.log('finished')
                  res.json({
                    stockData: {
                      stock,
                      price: data[stock].quote.latestPrice,
                      likes: foundStock.likes.length
                    }
                  })
                }
              })
            } else {
              console.log('not in db');
              let newStock = {
                stock,
                price: data[stock].quote.latestPrice,
                likes: []
              }
              console.log(newStock)
              if (req.query.like) {
                //save with like
                console.log('...tacking on like');
                newStock.likes.push(ip);
              }
              Stock.create(newStock, (err, createdStock) => {
                if (err) {
                  console.log(err);
                  res.json({ err })
                } else {
                  console.log('responding')
                  res.json({
                      stockData: {
                      stock: createdStock.stock,
                      price: createdStock.price,
                      likes: createdStock.likes.length
                    }
                  })

                }
              })

            }
          }
        })

      } else if (req.query.stock.length === 2) {

        const stockOne = req.query.stock[0].toUpperCase();
        const stockTwo = req.query.stock[1].toUpperCase();

        Stock.count({ stock: stockOne }, (err, count) => {
          if (err) {
            console.log(err);
            res.json({ err })
          } else {

            Stock.findOrCreate({ stock: stockOne }, {likes: []}, (err, foundStockOne, created) => {
              if (err) {
                console.log(err);
                res.json({ err })
              } else {
                if (req.query.like) {
                  if (foundStockOne.likes.includes(ip)) {
                    foundStockOne.likes.remove(ip)
                  } else {
                    foundStockOne.likes.push(ip)
                  }
                }
                foundStockOne.price = data[stockOne].quote.latestPrice;
                foundStockOne.save();

                let oneObject = {
                  stock: stockOne,
                  price: data[stockOne].quote.latestPrice,
                  likes: foundStockOne.likes.length
                }

                Stock.findOrCreate({ stock: stockTwo }, (err, foundStockTwo, created) => {
                  if (err) {
                    console.log(err);
                    res.json({ err })
                  } else {
                    if (req.query.like) {
                      if (foundStockTwo.likes.includes(ip)) {
                        foundStockTwo.likes.remove(ip)
                      } else {
                        foundStockTwo.likes.push(ip)
                      }
                    }
                    foundStockTwoprice = data[stockTwo].quote.latestPrice;
                    foundStockTwo.save();

                    let twoObject = {
                      stock: stockTwo,
                      price: data[stockTwo].quote.latestPrice,
                      likes: foundStockTwo.likes.length
                    }
                    res.json({
                      stockData: [oneObject, twoObject]
                    })
                  }
                })


              }
            })

          }
        })

      } else {
        var multiData = req.query.stock.map(each => ({
          stock: data[each.toUpperCase()].quote.symbol.toUpperCase(),
          price: data[each.toUpperCase()].quote.latestPrice
        }))

        res.json({
          stockData: multiData,
          message: 'To add likes, use one or two querys'
        })
      }

    });

  }
})



const PORT = process.env.PORT || 3000
var listener = app.listen(PORT, () => console.log(`${new Date().toLocaleTimeString()}: Server initialized on port ${PORT}`))
