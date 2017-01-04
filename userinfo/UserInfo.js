var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserInfoSchema = new Schema({
  name: String,
  password:String,
  email:String
})

module.exports = mongoose.model('UserInfo',UserInfoSchema);
