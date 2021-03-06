module.exports = function (req, res, next) {
  const { email, password, username } = req.body;

  // check a valid email has been entered by using a regex function
  function validEmail(userEmail) {
    // eslint-disable-next-line no-useless-escape
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  }

  if ((![email, password].every(Boolean)) || (!username && req.path === '/signup')) {
    return res.status(400).json({ err: 'Missing Credentials' });
  }

  if (!validEmail(email)) {
    return res.status(400).json({ err: 'Invalid Email' });
  }

  next();
}
