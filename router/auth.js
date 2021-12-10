const express = require('express');
var bodyParser = require('body-parser');
const router = express.Router();
const User = require('../models/firebase')
const jwt = require('jsonwebtoken');
require('dotenv').config()
var KEY = process.env.KEY;
var cors = require('cors')
router.use(cors())
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.post('/signup',  urlencodedParser, async (req, res) => {
   const {username, fname, lname, email, phone, password} = req.query; //getting data by object destructuring
   if (!username || !fname || !lname || !email || !phone || !password) { 
      return res.status(422).json({ error: "Plz fill all the parameters" })
   }
   
   try {
      const userExist = await User.findone(username)

      if (userExist) {
         return res.status(422).json({ error: "Username already exists" })
      }
      else {
        token = await User.storedata(username, fname, lname, email, phone, password);
        res.json({
         cookie: token,
         message: "user signin sucessfully" })
      }
   } catch (error) {
      res.json(error);
   }
})
   
router.post("/signin", urlencodedParser, async (req, res) => {
      try {
         const username = req.query.username;
         const password = req.query.password;

         if (!username || !password) {
            return res.status(400).json({ error: "Plz fill the parameters" })
         }
         const userLogin = await User.findone(username);
         if (userLogin) {
            const token = await User.signin(username, password);   
            if (!token) {
               res.status(400).json({ message: "Invalid Credentials " })
            }
            else {
               res.json({
                  cookie: token,
                  message: "User signin sucessfully" })
            }
         } else {
            res.status(400).json({ error: "Invalid Credentials" })
         }
      } catch (error) {
         res.json(error);
      }
   })

 router.get('/authenticate', urlencodedParser, async (req,res)=>{
   const token = req.query.cookie;
   try {
      const verifyToken = jwt.verify(token, KEY);

      const rootUser = await User.auth(verifyToken.username, token);
      if (!rootUser) {
          throw new Error('User not found')
      }
      else{
         const usn = verifyToken.username;
         const info = await User.info(usn);
         res.send(JSON.stringify(info));
      }
  } catch (error) {
      res.status(401).send('Unauthorized: No token provided')
      console.log(error);      
  } 
});
module.exports = router;