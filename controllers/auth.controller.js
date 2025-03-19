// controllers/auth.controller.js
const User = require('../models/user.model');
const Technician = require('../models/technician.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Predefined Admin Credentials
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

// User Registration
const userSignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword, status: 'active' });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Technician Registration
const technicianSignup = async (req, res) => {
  console.log('Request Body:', req.body);
  console.log('Uploaded File:', req.file);
  const { name, email, password, phone, skillCategory, tools } = req.body;
  const verificationDocument = req.file ? req.file.path : null;

  try {
    const existingTechnician = await Technician.findOne({ email });
    if (existingTechnician) return res.status(400).json({ msg: 'Technician already exists' });

    const hasTools = tools === 'yes' || tools === 'true' || tools === true;

    const newTechnician = new Technician({
      name,
      email,
      password, // No manual hashing - model hook handles it
      phone,
      skillCategory,
      tools: hasTools,
      verificationDocument,
      status: 'active',
      verified: false
    });

    await newTechnician.save();

    const token = jwt.sign(
      { userId: newTechnician._id, role: 'technician', skillCategory: newTechnician.skillCategory },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, technician: newTechnician });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// User, Technician, and Admin Login
const login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    console.log('Login Attempt:', { email, password, role });
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, {
        expiresIn: '2h'
      });
      return res.status(200).json({ token, role: 'admin' });
    }

    let user;
    if (role === 'user') {
      user = await User.findOne({ email });
    } else if (role === 'technician') {
      user = await Technician.findOne({ email });
    } else {
      return res.status(400).json({ msg: 'Invalid role' });
    }
    console.log('User Found:', user);
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password Match:', isMatch);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      role === 'technician'
        ? { userId: user._id, role: user.role, skillCategory: user.skillCategory }
        : { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, role: user.role, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { userSignup, technicianSignup, login };