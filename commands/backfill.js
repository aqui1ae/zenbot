var tb = require('timebucket')
  , n = require('numbro')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var c = get('conf') || {}

  var collectionService = get('lib.collection-service')(get, set, clear)
  var markerService = get('lib.marker-service')(get, set, clear)

  return function (program) {
    program
      .command('backfill [selector]')
      .description('download historical trades for analysis')
      .option('-d, --days <days>', 'number of days to acquire (default: ' + c.days + ')', Number, c.days)
      .action(function (selector, cmd) {
        selector = get('lib.objectify-selector')(selector || c.selector)
        var exchange = get('exchanges.' + selector.exchange_id)
        if (!exchange) {
          console.error('cannot backfill ' + selector.normalized + ': exchange not implemented')
          process.exit(1)
        }

        markerService.init(exchange.historyScan, selector, cmd.days)

        var trades = collectionService.getTrades();

        var trade_counter = 0
        var day_trade_counter = 0
        var days_left = cmd.days + 1
        var mode = exchange.historyScan
        var last_batch_id, last_batch_opts
        if (!mode) {
          console.error('cannot backfill ' + selector.normalized + ': exchange does not offer historical data')
          process.exit(0)
        }

        markerService.getPreviousMarkers().then((markers) => {
          getNext()
          function getNext () {
            var marker = markerService.getMarker()
            var opts = markerService.getExchangeTradeQueryOpts(exchange)
            last_batch_opts = opts
            exchange.getTrades(opts, function (err, trades) {
              if (err) {
                console.error('err backfilling selector: ' + selector.normalized)
                console.error(err)
                if (err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND' || err.code === 'ECONNRESET') {
                  console.error('retrying...')
                  setImmediate(getNext)
                  return
                }
                console.error('aborting!')
                process.exit(1)
              }
              if (mode !== 'backward' && !trades.length) {
                if (trade_counter) {
                  console.log('\ndownload complete!\n')
                  process.exit(0)
                }
                else {
                  console.error('\ngetTrades() returned no trades, --start may be too remotely in the past.')
                  process.exit(1)
                }
              }
              else if (!trades.length) {
                console.log('\ngetTrades() returned no trades, we may have exhausted the historical data range.')
                process.exit(0)
              }
              trades.sort(function (a, b) {
                if (mode === 'backward') {
                  if (a.time > b.time) return -1
                  if (a.time < b.time) return 1
                }
                else {
                  if (a.time < b.time) return -1
                  if (a.time > b.time) return 1
                }
                return 0
              })
              if (last_batch_id && last_batch_id === trades[0].trade_id) {
                console.error('\nerror: getTrades() returned duplicate results')
                console.error(opts)
                console.error(last_batch_opts)
                process.exit(0)
              }
              last_batch_id = trades[0].trade_id
              var tasks = trades.map(function (trade) {
                return function (cb) {
                  saveTrade(trade, cb)
                }
              })
              function runTasks () {
                parallel(tasks, function (err) {
                  marker = markerService.getMarker()
                  
                  if (err) {
                    console.error(err)
                    console.error('retrying...')
                    return setTimeout(runTasks, 10000)
                  }
                  
                  // var oldest_time = marker.oldest_time 
                  // var newest_time = marker.newest_time 
                  
                  markers.forEach(function (other_marker) {
                    markerService.updateMarkerBasedOnAnotherMarker(other_marker)
                  })

                  var hrs = markerService.getNumberOfHoursOfPreviouslyCollectedDataSkipped(marker);
                  if (hrs) {
                    console.log('\nskipping ' + hrs + ' hrs of previously collected data')
                  }

                  // marker = markerService.getMarker()

                  // if (oldest_time !== marker.oldest_time) {
                  //   var diff = tb(oldest_time - marker.oldest_time).resize('1h').value
                  //   console.log('\nskipping ' + diff + ' hrs of previously collected data')
                  // }
                  // else if (newest_time !== marker.newest_time) {
                  //   var diff = tb(marker.newest_time - newest_time).resize('1h').value
                  //   console.log('\nskipping ' + diff + ' hrs of previously collected data')
                  // }

                  markerService.saveNewMarker(marker).then((err) => {
                    if (err) throw err

                    var target_time = markerService.getTargetTime()
                    var marker = markerService.getMarker()

                    trade_counter += trades.length
                    day_trade_counter += trades.length
                    var current_days_left = markerService.getCurrentDaysLeft()
                    
                    if (current_days_left >= 0 && current_days_left != days_left) {
                      console.log('\n' + selector.normalized, 'saved', day_trade_counter, 'trades', current_days_left, 'days left')
                      day_trade_counter = 0
                      days_left = current_days_left
                    }
                    else {
                      process.stdout.write('.')
                    }

                    if (markerService.isDownloadComplete()) {
                      console.log('\ndownload complete!\n')
                      process.exit(0)
                    }

                    if (exchange.backfillRateLimit) {
                      setTimeout(getNext, exchange.backfillRateLimit)
                    } else {
                      setImmediate(getNext)
                    }
                  })
                })
              }

              runTasks()
            })
          }
          
          function saveTrade (trade, cb) {
            markerService.updateMarkerBasedOnTrade(exchange.getCursor(trade), trade)
            
            trade.id = selector.normalized + '-' + String(trade.trade_id)
            trade.selector = selector.normalized

            trades.save(trade, cb)
          }

        })
      })
  }
}
