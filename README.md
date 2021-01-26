# FCC Backend Message Board

API based application to query stock levels and add 'likes' based on each device's IP.

CRUD application built for one of the FreeCodeCamp Backend challanges.

Node / express app built with MongoDB / Mongoose for data persistance

Stock data provided by [IEX Trading](https://iextrading.com/)

## Live Demo
[https://oddert-fcc-backend-stock-ticker.glitch.me/](https://oddert-fcc-backend-stock-ticker.glitch.me/)

## Installation
```
$ git clone https://github.com/Oddert/fcc-backend-stock-ticker.git
$ cd fcc-backend-stock-ticker
$ npm i
```
### For development
```
$ npm run dev
```
### For a production build
```
$ npm start
```

## Scripts
| script | command                                        | action
|--------|------------------------------------------------|------------------------------------------------|
| start  | node app.js                                    | runs the server                                |
| dev | nodemon app.js                                 | runs the server with auto restart              |

# Routes
| Route  | Method | Param | Query | Body | Returns
|--------|--------|-------|-------|------|---------|
| /  | GET | | | | returns a basic html page to interact with the API |
| /seed | GET |  |  |  | Removes all stocks and seeds a fake one, returns a json response with the new stock
| /api/stock-prices | GET |  | stock {String}: use one or more times to list stock items to query. like {Boolean}: Add a like to the lsited stocks |  | Adds a 'like' to existing stock or creates a new one. Returns a variable json response with one or more stock data points or an error.
---
