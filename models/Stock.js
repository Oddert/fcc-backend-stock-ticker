const mongoose      = require('mongoose');
const findOrCreate  = require('mongoose-findorcreate');

const StockSchema   = new mongoose.Schema({
  name: {
    type: String,
    default: 'Placeholder for mongoose'
  },
  stock: String,
  price: Number,
  likes: [ String ]
})

StockSchema.plugin(findOrCreate);

module.exports = mongoose.model('fcc-backend-stock', StockSchema)
