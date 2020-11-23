const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');


// step 1
const Role = require('../../models/Role');

// step 2 GET ALL

// @route    GET api/roles
// @desc     Get All roles
// @access   Private
router.get('/', async (req, res) => {
    try {
      const roles = await Role.find();
      res.json(roles);
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
    check('name', 'Role name is required').not().isEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
        // destructure the request
        const {
          name,
          description, 
        } = req.body;
    
        try {

            roleObj = new Role({
              name,
              description,      
            });
      
            await roleObj.save();
            res.send({ msg: 'New role added successfuly' });  
          } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
          }
  });

// step 4 PUT EDIT
// @route    PUT api/roles/Edit/id
// @desc     edit role
// @access   Private

router.put(
  '/edit/',
  //checkObjectId('id'),
  check('name', 'Role name is required').not().isEmpty(),
  async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      // destructure the request
      const bodyFields = {
        id,
        name,
        description, 
      } = req.body;
      
      console.log(id);
      try {
      
          // Using upsert option (creates new doc if no match is found):
          let roleObj = await Role.findOneAndUpdate(
            { _id: bodyFields.id   },
            { $set: bodyFields },
            { new: true }
          );
          return res.json(roleObj);


        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
});

// step 5   DELETE

// @route    Delete api/roles
// @desc     Delete one roles
// @access   Private


router.delete(
  '/delete/',
  //checkObjectId('id'),
  check('id', 'Role id is required').not().isEmpty(),
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
        res.json({ msg: 'Role deleted' });
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
});




module.exports = router;
