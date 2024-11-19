const getUserByEmail = (email, database) => {
  for (const newUserID in database) {
    if (database[newUserID].email === email) {
      return database[newUserID];
    }
  }
  return undefined;
};

module.exports = { getUserByEmail };