require('dotenv').config()
var KEY = process.env.KEY;
{
  var jwt = require("jsonwebtoken");
  const admin = require('firebase-admin');
  const serviceAccount = require('./serviceAccountKey.json');
  //initialize admin SDK using serciceAcountKey

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function storedata(username, fname, lname, email, phone, password) {
  otoken = await createToken(username);
  const userData = {
    username: username,
    first_name: fname,
    last_name: lname,
    email: email,
    phone: phone,
    password: password,
    token: otoken,
  };
  db.collection('users').doc(username)
    .set(userData).then(oto => {
      console.log(otoken);
   }).catch(err => {
    console.log(err);
  });  
  return(otoken);
}

async function signin(username, password) {
  const userRef = db.collection('users').doc(username);
  const doc = await userRef.get();
  if (!doc.exists) {
    console.log('No such document!');
  } 
  else {
      if(password == doc.data().password){
        otoken = await createToken(doc.data().username);
        const usertokenUpdate = {
          token: otoken
        };
        db.collection('users').doc(username)
        .update(usertokenUpdate).then(oto => {
          console.log(otoken);
       })
       .catch(err => {
         console.log(err);
       });  
       return(otoken);
      }
    else
      return("login unsuccessful")
  }
}

async function auth(username, jwt) {
  const userRef = db.collection('users').doc(username);
  const doc = await userRef.get();
  if (!doc.exists) {
    console.log('No such document!');
  } 
  else {
    if(jwt == doc.data().token) {
      return(true)
    }
    else {
      return(false)
    }
  }
}

const createToken = async(username) => {
  const token = await jwt.sign({username:username}, KEY);
  return token;
}

async function findone(username) {
  const userRef = db.collection('users').doc(username);
  const doc = await userRef.get();
  if (!doc.exists) {
    return false;
  } 
  else {
    return true;
  }
}

async function info(username) {
  const userRef = db.collection('users').doc(username);
  const doc = await userRef.get();
  if (!doc.exists) {
    return false;
  } 
  else {
    return doc.data();
  }
}

exports.findone = findone;
exports.auth = auth;
exports.info = info;
exports.signin = signin;
exports.storedata = storedata;
}