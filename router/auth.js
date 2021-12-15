const express = require('express');
var bodyParser = require('body-parser');
const router = express.Router();
const User = require('../models/firebase')
const jwt = require('jsonwebtoken');
require('dotenv').config()
var KEY = process.env.KEY;
var cors = require('cors');
router.use(cors())
router.use(bodyParser.json())
var urlencodedParser = bodyParser.urlencoded({ extended: true })

router.post('/signup', urlencodedParser, async (req, res) => {
   const {username, fname, lname, email, phone, password} = req.body;
   if (!username || !fname || !lname || !email || !phone || !password) { 
      return res.status(400).json({ error: "Plz fill all the parameters" })
   }
   
   try {
      const userExist = await User.findone(username)

      if (userExist) {
         return res.status(400).json({ error: "Username already exists" })
      }
      else {
        token = await User.storedata(username, fname, lname, email, phone, password);
        res.status(200).json({
         cookie: token,
         message: "User signup sucessfully" })
      }
   } catch (error) {
      res.status(400).json(error);
   }
})
   
router.post("/signin", urlencodedParser, async (req, res) => {
      try {
         const username = req.body.username;
         const password = req.body.password;

         if (!username || !password) {
            return res.status(400).json({ error: "Plz fill the parameters" })
         }
         const userLogin = await User.findone(username);
         if (userLogin) {
            const token = await User.signin(username, password);   
            if (!token) {
               res.status(400).json({ error: "Invalid Credentials " })
            }
            else {
               res.status(200).json({
                  cookie: token,
                  message: "User signin sucessfully" })
            }
         } else {
            res.status(400).json({ error: "Invalid Credentials" })
         }
      } catch (error) {
         res.status(400).json(error);
      }
   })

 router.post('/authenticate', urlencodedParser, async (req,res)=>{
   const token = req.body.cookie;
   if (!token) {
      return res.status(400).json({ error: "Plz fill the parameters" })
   }
   try {
      const verifyToken = jwt.verify(token, KEY);

      const rootUser = await User.auth(verifyToken.username, token);
      if (!rootUser) {
          throw new Error('User not found')
      }
      else{
         const usn = verifyToken.username;
         const info = await User.info(usn);
         res.status(200).send(JSON.stringify(info));
      }
  } catch (error) {
      res.status(400).json({error: "Unauthorized"})    
  } 
});
module.exports = router;