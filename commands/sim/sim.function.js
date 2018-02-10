var consumeAndProcessService = require('../../lib/services/consume-and-process-service')
  , simConsumeFunction = require('./sim.consume.function')
  , simProcessFunction = require('./sim.process.function')
  // , simUpdateScreenFunction = require('./sim.update-screen.function')

module.exports = function container (conf) {

  return function (/*optsObj*/) {

    // optsObj.start, periodLength, minPeriods


    var cpService = consumeAndProcessService(conf)

    cpService.setOnConsumeFunc(simConsumeFunction(conf))
    cpService.setOnProcessFunc(simProcessFunction(conf))
    // cpService.setAfterOnProcessFunc(get(simUpdateScreenFunction(conf))

    var targetTimeInMillis = 0

    return new Promise((resolve, reject) => {
      cpService.go(targetTimeInMillis).then((finalTrade) => {
        resolve(finalTrade)
      }).catch((reason) => {
        console.log('Something bad happened while getting trades :(')
        console.log(reason)
        reject()
      })
    })

  }
}
