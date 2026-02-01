function tap(user) {
  if (!user || user.energy <= 0) return null;

  return {
    ...user,
    energy: user.energy - 1,
    balance: user.balance + user.tap_power
  };
}

export { tap };
