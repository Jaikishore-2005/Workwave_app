// middleware/verifiedTechnician.js
const Technician = require('../models/technician.model');

const verifiedTechnician = async (req, res, next) => {
  if (req.user.role !== 'technician') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  const technician = await Technician.findById(req.user.userId);
  if (!technician || !technician.verified) {
    return res.status(403).json({ msg: 'Verification required to access this feature' });
  }

  next();
};

module.exports = {verifiedTechnician};
