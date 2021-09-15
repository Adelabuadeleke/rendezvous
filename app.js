const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieparser = require('cookie-parser');
const mongoose = require('mongoose');
const User = require('/model/User');
const { requireAuth, checkUser } = require('./middleware/auth')


const app = express();
const port = process.env.PORT || 4000;

// config
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieparser())

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code)
  let errors = { email:'', password:''};

  // incorrect email
  if(err.message === 'incorrect email') {
    errors.email = 'email is not registered'
  }

  // incorrect password
  if(err.message === 'incorrect password') {
    errors.email = 'incorrect password'
  }
  // duplicate
  if (err.code === 11000){
    errors.email = 'email is already registered'
  }

  // validation errors
  if (err.message.includes('user validation failed')){
    Object.values(err.errors).forEach(({properties})=>{
      errors[properties.path] = properties.message;
    })
  }

  return errors;
}

// create web token
const maxAge = 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({id}, 'rendezvous login',{
    expiresIn: maxAge
  })
}

app.set('view engine','ejs')
app.get('/', (req, res)=>{
  res.render('index')
})

app.get('/vote', requireAuth, (req, res)=>{
  res.send('This is the voting page!');
})

app.get('/login', (req, res)=>{
  res.send('this is the login page, please login!')
})

app.post('/register', async (req, res)=>{
  const {email, password} = req.body;

  try {
    const user = await User.create({email, password})
    // send token to user
    // const token = createToken(user._id)
    // res.cookie('rendezvous login', token, {maxAge: maxAge * 1000})

    res.status(201).json(user);
  } catch(err) {
    console.log(err);
  }
})

app.post('/login', async (req, res)=> {
  const{email, password} = req.body;

  try{
    const user = await User.login(email, password)
    // send token to user
    const token = createToken(user._id);
    res.cookie('rendezvous login', token, {maxAge:maxAge * 1000})
    res.status(200).json({user:user._id, message:'you logged in sucessfully'})
  } catch(err) {
    const errors = handleErrors(err);
    res.status(400).json({errors});
  }
})


// mongoose.connect('mongodb://localhost:27017/Rendezvous', {
//   useNewUrlParser:true,
//   useUnifiedTopology:true,
//   // useCreateIndex:true,
// })
// .then(response=>{
  
//   console.log('Database connection sucessful!')
// }).catch((err)=> {
//   console.log('database connection failed:unable to establish connections');
//   console.log(err);
// })

app.listen(port, ()=>{
  console.log('Rendezvous server is now up and running!');
})