module.exports = function ema (s, key, periodService, source_key) {
  if (!source_key) source_key = 'close'

  var length = periodService.getOption('trend_ema')
  var lookbackArr = periodService.getLookback()

  if (lookbackArr.length >= length) {
    var prev_ema = lookbackArr[0][key]
    if (typeof prev_ema === 'undefined' || isNaN(prev_ema)) {
      var sum = 0
      lookbackArr.slice(0, length).forEach(function (period) {
        sum += period[source_key]
      })
      prev_ema = sum / length
    }
    var multiplier = 2 / (length + 1)

    var currentPeriod = periodService.getCurrentPeriod()
    periodService.setFieldOnCurrentPeriod(key, (currentPeriod[source_key] - prev_ema) * multiplier + prev_ema)
  }
}

