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
  const countOfNumbers = {}
  let biggestNumber = 0

  for (const die of dice) {
    console.log('d ', die.value, countOfNumbers[die.value], countOfNumbers)
    if (countOfNumbers[die.value]) {
      countOfNumbers[die.value]++
    } else {
      countOfNumbers[die.value] = 1
    }
  }

  for (const number in countOfNumbers) {
    if (countOfNumbers[number] > biggestNumber) {
      biggestNumber = number
    }
  }

  return `You had ${countOfNumbers["1"] + countOfNumbers[biggestNumber]} ${biggestNumber}s`
}
