const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');

// mongoose schema
const userSchema = new mongoose.Schema({
  email:{
    type:String,
    required:[true, 'please provide your email address'],
    trim:true,
    unique:true,
    lowercase:true,
    validate:[isEmail,'please providea valid email address']
  },
  password:{
    type:String,
    required:[true, 'please provide a password'],
    minlength:[6,'minimum password length is 6 characters']
  },
  role:{
    type:String,
    required:true, 
    enum:['admin','voter'],
    default:'admin'
  }
})

// hash password with bcrypt before saving schema
userSchema.pre('save', async function (next){
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
})

// static method to login user
userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({email});

  if(user){
    const auth = await bcrypt.compare(password, user.password)
    if (auth) {
      return user
    }
    throw Error('incorrect password')
  }
  throw Error('incorrect email')
}

const User = mongoose.model('User', userSchema);
module.exports = User;