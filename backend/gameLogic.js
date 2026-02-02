function tap(user) {
  if (!user || user.energy <= 0) return null;

  return {
    ...user,
    energy: user.energy - 1,
    balance: user.balance + user.tap_power
  };
}

export { tap };
export function saveUser(user) {
  if (!db.users) db.users = {};
  db.users[user.id] = user;
  saveDB(db);
}
