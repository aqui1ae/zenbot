var mock = require('mock-require')
var service = require('../../../../lib/services/selector-service')

describe('Selector Service', function() {

  var normalizedSelector

  beforeEach(function() {
    normalizedSelector = 'stub.btc-usd'
    service = mock.reRequire('../../../../lib/services/selector-service')
  })

  it('is available', function() {
    expect(service).not.toBe(undefined)
  })

  it('has an init method', function() {
    var instance = service()

    expect(instance.init).not.toBe(undefined)
  })

  it('returns a valid selector object from init() when you pass a string', function() {
    var instance = service()

    var rtn = instance.init(normalizedSelector)

    expect(rtn.exchange_id).toBe('stub')
    expect(rtn.product_id).toBe('BTC-USD')
    expect(rtn.asset).toBe('BTC')
    expect(rtn.currency).toBe('USD')
    expect(rtn.normalized).toBe('stub.BTC-USD')
  })

  it('returns the unmodifed, passed-in object from init() when you pass an object', function() {
    var instance = service()

    var rtn = instance.init({foo: 'bar'})

    expect(rtn.exchange_id).not.toBeDefined()
    expect(rtn.foo).toBe('bar')
  })

  it('returns the correct selector from getSelector()', function() {
    var instance = service()

    instance.init(normalizedSelector)

    var rtn = instance.getSelector()

    expect(rtn.exchange_id).toBe('stub')
    expect(rtn.product_id).toBe('BTC-USD')
    expect(rtn.asset).toBe('BTC')
    expect(rtn.currency).toBe('USD')
    expect(rtn.normalized).toBe('stub.BTC-USD')
  })

  it('returns undefined from getSelector() when init has not been called', function() {
    var instance = service()

    expect(instance.getSelector()).toBe(undefined)
  })

})