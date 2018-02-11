var mock = require('mock-require')
var service = require('../../../../lib/services/products-service')
var exchangeServiceFactory = require('../../../../test/_mocks/exchangeService.mock.factory')

describe('Products Service', function() {
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

  it('returns the expected list of the current exchanges products', function() {
    var instance = service(conf)

    var rtn = instance.getProducts()

    expect(rtn.length).toBe(2)
    expect(rtn[0].asset).toBe('BTC')
    expect(rtn[0].currency).toBe('USD')
    expect(rtn[0].min_size).toBe('0.01')
    expect(rtn[0].max_size).toBe('200.0')
    expect(rtn[0].increment).toBe('0.00001')
    expect(rtn[0].label).toBe('BTC/USD')
    expect(rtn[1].asset).toBe('BTC')
    expect(rtn[1].currency).toBe('EUR')
    expect(rtn[1].min_size).toBe('0.01')
    expect(rtn[1].max_size).toBe('350.0')
    expect(rtn[1].increment).toBe('0.01')
    expect(rtn[1].label).toBe('BTC/EUR')
  })

  it('returns the selected product, as defined by the selectorObject', function() {
    var instance = service(conf)

    var rtn = instance.getSelectedProduct()

    expect(rtn.asset).toBe('BTC')
    expect(rtn.currency).toBe('USD')
    expect(rtn.min_size).toBe('0.01')
    expect(rtn.max_size).toBe('200.0')
    expect(rtn.increment).toBe('0.00001')
    expect(rtn.label).toBe('BTC/USD')
  })

  it('returns the correctly formatted ID for the selected product', function () {
    var instance = service(conf)
    var rtn = instance.getSelectedProductId()
    expect(rtn).toBe('BTC-USD')
  })
  
})