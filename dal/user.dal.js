import User from '../models/User.model.js';

export const findUserById = async (id) => {
  return User.findById(id);
};

export const findUserByGoogleId = async (googleId) => {
  return User.findOne({ googleId });
};

export const createUser = async (userData) => {
  const user = new User(userData);
  return user.save();
};

export const searchUsers = async (query, excludeUserId) => {
  const regex = new RegExp(query, 'i');
  return User.find({
    _id: { $ne: excludeUserId },
    $or: [{ name: regex }, { email: regex }],
  })
    .select('_id name email photo')
    .limit(10);
};
