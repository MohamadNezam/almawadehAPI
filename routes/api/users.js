const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

 

// step 1
const User = require('../../models/User');

// step 2 GET ALL

// @route    GET api/users
// @desc     Get All users
// @access   Private
router.get('/', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


// step 3 POST ADD 
// @route    POST api/roles/add
// @desc     add new role
// @access   Private
 
  router.post(
    '/add/',
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('password','Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { 
        name,
        email,
        password } = req.body;
  
      try {
        let userObj = await User.findOne({ email });
  
        if (userObj) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'User already exists' }] });
        }
  
        const avatar = normalize(
          gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
          }),
          { forceHttps: true }
        );
  
        userObj = new User({
          name,
          email,
          avatar,
          password
        });
  
        const salt = await bcrypt.genSalt(10);
  
        userObj.password = await bcrypt.hash(password, salt);
  
        await userObj.save();
  
        const payload = {
          user: {
            id: userObj.id
          }
        };
  
        jwt.sign(
          payload,
          config.get('jwtSecret'),
          { expiresIn: '5 days' },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    }
  );
  

// step 4 PUT EDIT
// @route    PUT api/roles/Edit/id
// @desc     edit role
// @access   Private

router.put(
  '/edit/',
   
  check('id', 'User id is required').not().isEmpty(),
  async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      // destructure the request
      const bodyFields = {
        id,
        name,
        email,
        avatar,
        password,
        role,
      } = req.body;
      
      const salt = await bcrypt.genSalt(10);
      if(password){
        bodyFields.password = await bcrypt.hash(password, salt);
      }
       
      //@TODO check if the new email is already exist
      try {
      
          // Using upsert option (creates new doc if no match is found):
          let userObj = await User.findOneAndUpdate(
            { _id: bodyFields.id  },
            { $set: bodyFields },
            { new: true }
          );
          return res.json(userObj);


        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
});



// step 5   DELETE

// @route    Delete api/users
// @desc     Delete one user
// @access   Private


router.delete(
  '/delete/',
  
  check('id', 'User id is required').not().isEmpty(),
  async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      // destructure the request
      const bodyFields = {
        id,
      } = req.body;

      try {
      
        // Remove role
        await Role.findOneAndRemove({ _id: bodyFields.id });
        res.json({ msg: 'User deleted' });
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
});



 
module.exports = router;
