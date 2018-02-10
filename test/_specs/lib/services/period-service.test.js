var mock = require('mock-require')
var service = require('../../../../lib/services/period-service')
var exchangeServiceFactory = require('../../../../test/_mocks/exchangeService.mock.factory')

describe('Period Service', function() {
  var normalizedSelector = 'stub.BTC-USD'
  var exchangeId = 'stub'
  var conf = {selector: {normalized: normalizedSelector, exchange_id: exchangeId, asset: 'BTC', currency: 'USD' }}

  beforeEach(function() {
    mock('../../../../lib/services/collection-service', exchangeServiceFactory)
    service = mock.reRequire('../../../../lib/services/products-service')
  })

  it('is available', function() {
    expect(service).not.toBe(undefined)
  })

  it('returns true if a timeInMillis falls within a given Period', function() {
    var instance = service(conf)

    var time
    var periodObject

    /*var rtn =*/ instance.isTimeWithinPeriod(time, periodObject)

    //expect(rtn).toBe(true)
  })
})