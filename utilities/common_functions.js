export const areYouCheating = ({ localDice, dice }) => {

  for (let i = 0; i < dice.length; i++) {
    if (dice[i].value !== localDice[i].value) {
      return true
    }
  }

  return false
}

export const getPlayerScore = ({ user }) => {
  const { dice } = user
  return `Your score is ${dice}`
}
