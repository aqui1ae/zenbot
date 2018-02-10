var mock = require('mock-require')
var service = require('../../../../lib/services/period-service')
var exchangeServiceFactory = require('../../../../test/_mocks/exchangeService.mock.factory')

describe('Period Service', function() {
  var normalizedSelector = 'stub.BTC-USD'
  var exchangeId = 'stub'
  var conf = {selector: {normalized: normalizedSelector, exchange_id: exchangeId, asset: 'BTC', currency: 'USD' }}

  beforeEach(function() {
    mock('../../../../lib/services/collection-service', exchangeServiceFactory)
    service = mock.reRequire('../../../../lib/services/period-service')
  })

  it('is available', function() {
    expect(service).not.toBe(undefined)
  })

  it('returns a valid Period object from the init() method', function() {
    var instance = service(conf)

    var rtn = instance.init({trade_id:3000, price:7.55, time:1517787104900}, '3m')

    expect(rtn).toBeDefined()
    expect(rtn.period_id).toBe('3m8432150')
    expect(rtn.size).toBe('3m')
    expect(rtn.time).toBe(1517787000000)
    expect(rtn.open).toBe(7.55)
    expect(rtn.close).toBe(7.55)
    expect(rtn.high).toBe(7.55)
    expect(rtn.low).toBe(7.55)
    expect(rtn.close_time).toBe(null)
    expect(rtn.volume).toBe(0)
  })

  it('returns true if a timeInMillis falls within a given Period', function() {
    // var instance = service(conf)

    // var time = 1517787104900
    // var periodObject 

    // /*var rtn =*/ instance.isTimeWithinPeriod(time, periodObject)

    //expect(rtn).toBe(true)
  })
})