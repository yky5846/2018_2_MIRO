var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Notice = new Schema({
   title:  {type: String},
   author: {type: String},
   content: {type: String},
   created_at: {type: String},
   modified_at:  {type: String},
   hits: {type: Number, default: 0},
   like: {type: Number, default: 0}
});

module.exports = mongoose.model('notice', Notice);
