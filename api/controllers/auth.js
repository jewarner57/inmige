const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Media = require('../models/media')
const getSortObj = require('../util/getSortObj')

exports.user = async (req, res) => {
  const currentUser = await User.findOne({ _id: req.user._id }, '_id email username profilepic')

  return res.send({
    user: currentUser,
  })
}

// GET A USER PROFILE
exports.getuserprofile = async (req, res) => {
  // find a user with given id and return it
  const userID = req.params.id
  let query = { author: userID, private: false }
  let userFields = 'username createdAt profilepic'

  // If the current user gets their own profile
  // display their email
  if (userID === req.user._id) {
    userFields = 'username createdAt email profilepic'
    query = { author: userID }
  }

  // get the post sort obj
  const sortString = req.params.sort
  const sortObj = getSortObj(sortString)

  try {
    const user = await User.findOne({ _id: userID }, userFields)
    const media = await Media.find(query).sort(sortObj).populate('author', 'username')

    if (user) {
      return res.send({ user, media })
    }
    res.status(404).send({ err: 'No profile found.' })
  } catch (err) {
    res.status(400).send({ err: 'Something went wrong finding the profile.', message: err })
  }
}

// UPDATE PROFILE PICTURE
exports.setProfilePic = async (req, res) => {
  if (!req.body.location) return res.status(400).send({ msg: 'No image location sent.' })
  const { location } = req.body

  // get the currentUser's _id and update their pfp with the new ipfs hash location
  const user = await User.findOneAndUpdate(
    { _id: req.user._id }, { $set: { profilepic: location } }, { new: true },
  )
  updatedUser = await user.save()

  const {
    _id, email, username, profilepic,
  } = updatedUser

  return res.send({
    user: {
      _id, email, username, profilepic,
    },
  })
}

// SIGN UP POST
exports.signup = async (req, res) => {
  // Create User and JWT
  const newuser = new User(req.body);

  try {
    // Check if username exists
    const emailExists = await User.findOne({ email: newuser.email })
    if (emailExists) { return res.status(403).send({ err: 'Email already in use.' }) }
    // Check if email exists
    const usernameExists = await User.findOne({ username: newuser.username })
    if (usernameExists) { return res.status(403).send({ err: 'Username already in use.' }) }

    // save user
    await newuser.save()
    const user = await User.findOne(newuser._id, 'email username profilepic')

    // send token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: '60 days' });
    res.cookie('vfToken', token, { maxAge: 2592000, sameSite: 'none', secure: true });
    res.json({ message: 'Account Creation Successful.', user })
  } catch (err) {
    console.log(err.message);
    return res.status(400).send({ message });
  }
}

// LOGOUT
exports.signout = (req, res) => {
  res.clearCookie('vfToken', { sameSite: 'none', secure: true });
  res.json({ message: 'Logout Successful' })
}

// LOGIN
exports.signin = (req, res) => {
  const { email } = req.body;
  const { password } = req.body;
  // Find this user name
  User.findOne({ email }, 'email password username profilepic')
    .then((user) => {
      if (!user) {
        // User not found
        return res.status(403).send({ err: 'Wrong Email or Password' });
      }
      // Check the password
      user.comparePassword(password, (err, isMatch) => {
        if (!isMatch) {
          // Password does not match
          return res.status(403).send({ err: 'Wrong Email or password' });
        }
        // Create a token
        const token = jwt.sign(
          {
            _id: user._id, email: user.email, username: user.username, profilepic: user.profilepic,
          }, process.env.SECRET,
          {
            expiresIn: '30 days',
          },
        );

        // create a new user object without the password field
        const resUser = {
          _id: user._id,
          email: user.email,
          username: user.username,
          profilepic: user.profilepic,
        }

        // Set a cookie
        res.cookie('vfToken', token, { maxAge: 2592000, sameSite: 'none', secure: true });
        res.json({ message: 'Login Successful', user: resUser })
      });
    })
    .catch((err) => {
      console.log(err);
    })
}
