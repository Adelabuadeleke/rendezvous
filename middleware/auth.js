const jwt = require('jsonwebtoken');
const User = require('../model/user')


// check and verify json web token
const requireAuth =(req, res, next)=>{
  console.log(req.cookies.jwt);
  const token = req.cookies.jwt

  // check json web token
  if(token) {
    jwt.verify(token, 'rendezvous login', (err, decodedToken)=>{
      if(err){
        console.log(err)
        console.log(err.message);
        res.redirect('/login');
      } else {
        res.redirect('/vote');
        console.log(decodedToken);
        next();
      }
    })
  } else {
    res.redirect('/login')
  }
}

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if(token){
    jwt.verify(token, 'rendezvous login',async (err, decodedToken)=>{
      if(err){
        console.log(err.message);
        res.locals.user = null
        next();
      } else {
        console.log(decodedToken);
        let user = await User.findById(decodedToken.id)
        res.locals.user = user
        next();
      }
    })
  } else {
    res.locals.user = null
    next();
  }
}

module.exports = { requireAuth, checkUser };
