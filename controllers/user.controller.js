import * as userDal from '../dal/user.dal.js';

export const searchUsers = async (req, res) => {
  const { q } = req.query;
  const users = await userDal.searchUsers(q, req.user._id);
  res.json(users);
};
