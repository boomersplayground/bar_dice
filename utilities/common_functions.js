export const areYouCheating = ({ localDice, dice }) => {

  for (let i = 0; i < dice.length; i++) {
    if (dice[i].value !== localDice[i].value) {
      return true
    }
  }

  return false
}

export const getPlayerScore = ({ user }) => {
  const { dice, hasQualified, numOfRolls } = user

  console.log('user ', user)
  if (!hasQualified) return `You didn't qualify this round!`
  const diceCount = {}
  dice.forEach(die => {
    // console.log('a ', die.value)
    if (diceCount[die.value]) {
      diceCount[die.value]++
    } else {
      diceCount[die.value] = 1
    }
  })

  const howManyAces = diceCount[1]
  const howManySixes = diceCount[6] || 0
  const howManyFives = diceCount[5] || 0
  const howManyFours = diceCount[4] || 0
  const howManyThrees = diceCount[3] || 0
  const howManyTwos = diceCount[2] || 0

  if (howManySixes >= howManyFives && howManySixes >= howManyFours && howManySixes >= howManyThrees && howManySixes >= howManyTwos) {
    console.log('6 ', `You your score was ${howManyAces + howManySixes} ${numOfRolls === 3 ? 'all day' : 'in ${numOfRolls}'}`)
    return `You your score was ${howManyAces + howManySixes} ${numOfRolls === 3 ? 'all day' : 'in ${numOfRolls}'}`
  }

  if (howManyFives > howManySixes && howManyFives > howManyFours && howManyFives > howManyThrees && howManyFives > howManyTwos) {
    console.log('5 ', `You your score was ${howManyAces + howManyFives} ${numOfRolls === 3 ? 'all day' : 'in ${numOfRolls}'}`)
    return `You your score was ${howManyAces + howManyFives} ${numOfRolls === 3 ? 'all day' : 'in ${numOfRolls}'}`
  }

  if (howManyFours > howManySixes && howManyFours > howManyFives && howManyFours > howManyThrees && howManyFours > howManyTwos) {
    console.log('4 ', `You your score was ${howManyAces + howManyFours} ${numOfRolls === 3 ? 'all day' : 'in ${numOfRolls}'}`)
    return `You your score was ${howManyAces + howManyFours} ${numOfRolls === 3 ? 'all day' : 'in ${numOfRolls}'}`
  }

  if (howManyThrees > howManySixes && howManyThrees > howManyFives && howManyThrees > howManyFours && howManyThrees > howManyTwos) {
    console.log('3 ', `You your score was ${howManyAces + howManyThrees} ${numOfRolls === 3 ? 'all day' : 'in ${numOfRolls}'}`)
    return `You your score was ${howManyAces + howManyThrees} ${numOfRolls === 3 ? 'all day' : 'in ${numOfRolls}'}`
  }

  if (howManyTwos > howManySixes && howManyTwos > howManyFives && howManyTwos > howManyFours && howManyTwos > howManyThrees) {
    console.log('2 ', `You your score was ${howManyAces + howManyTwos} ${numOfRolls === 3 ? 'all day' : 'in ${numOfRolls}'}`)
    return `You your score was ${howManyAces + howManyTwos} ${numOfRolls === 3 ? 'all day' : 'in ${numOfRolls}'}`
  }
}
