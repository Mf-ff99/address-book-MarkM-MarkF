// 'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config')
const { v4: uuid } = require('uuid');
const API_TOKEN = process.env.API_TOKEN

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

let bearer = function validateBearer(req, res, next) {
 
  const authVal = req.get('Authorization') || '';
  
  if (!authVal.toLowerCase().startsWith('bearer')){
    return res.status(401).json({message: "missing Bearer header!"})
  }
  
  const token = authVal.split(' ')[1];
  if (token !== API_TOKEN){
    return res.status(401).json({message: "missing token!!"})
  }
  
  next();
}


let users = [
  {
  "id": '3c8da4d5-1597-46e7-baa1-e402aed70d80',
  "firstName": 'MrGuy',
  "lastName": 'ThatGuy',
  "address1": '72 cherry picker lane',
  "address2": 'N/A',
  "city": 'Not a Real City',
  "state": 'NY',
  "zip": "01337"
  }
]


app.get('/address', (req, res) => {
    res.json(users)
})

app.post('/address', bearer, express.json(), (req, res) => {
  const { firstName, lastName, address1, address2, city, state, zip } = req.body;

  if(!firstName){
    return res.status(400).send('first name is required')
  }

  if(!lastName) {
    return res.status(400).send('last name is required')
  }
  if(!address1) {
    return res.status(400).send('address is required')
  }
  if(!city) {
    return res.status(400).send('city is required')
  }
  if(!state) {
    return res.status(400).send('state is required')
  }if(!zip) {
    return res.status(400).send('zip code is required')
  }

  if(state.length != 2 || typeof state != typeof '') {
    return res.status(400).send('use a real state abberviation please and thank you')
  }
  if(!zip.match(/^\d{5}$/)){
      return res.status(400).send('zip is not a real zip code')
  }

  const id = uuid();

  let newUser = {
    id, 
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip,
  };

  users.push(newUser)

  res.send('it worked!!!!!!')
  res
    .status(201)
    .location(`http://localhost:8000/address/${id}`)
    .json({ id: id });
})

app.delete(`/address/:id`, bearer,  (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res
      .status(404)
      .send('Person not found');
  }
  users.splice(index, 1);

  res.send('this is gone')
  res
    .status(204)
    .location(`http://localhost:8000/address`)
    .end();

})



app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});



module.exports = app;