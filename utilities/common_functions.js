export const areYouCheating = ({ localDice, dice }) => {

  for (let i = 0; i < dice.length; i++) {
    if (dice[i].value !== localDice[i].value) {
      return true
    }
  }

  return false
}

export const getPlayerScore = ({ user }) => {
  if (!user.hasOneBeenFound) {
    return `You didn't qualify!`
  }
  const { dice } = user
  const countOfNumbers = {
    '0': 0
  }
  let biggestNumber = 0

  for (const die of dice) {
    if (countOfNumbers[die.value]) {
      countOfNumbers[die.value]++
    } else {
      countOfNumbers[die.value] = 1
    }
  }

  if (countOfNumbers['1'] === 5) {
    return `YOU SHOT ACES!!!  CONGRATS`
  }

  for (const number in countOfNumbers) {
    if (Number(number) !== 1 && countOfNumbers[number] >= countOfNumbers[biggestNumber] && Number(number) > biggestNumber) {
      biggestNumber = number
    }
  }

  return `${countOfNumbers["1"] + countOfNumbers[biggestNumber]}${biggestNumber}`
}
