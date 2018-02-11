
module.exports = function (conf) {

  var theService = {}

  var selectorObj

  theService.getSelector = function() {
    return selectorObj
  }

  theService.setSelector = function(selector) {
    _initialize(selector)
  }

  function _normalizeSelector(str) {
    var parts = str.split('.')
    return parts[0].toLowerCase() + '.' + (parts[1] || '').toUpperCase()
  }

  /* initialization */
  function _initialize(selector) {
    if (typeof selector == 'string') {
      var s = _normalizeSelector(selector)

      var e_id = s.split('.')[0]
      var p_id = s.split('.')[1]
      var asset = p_id.split('-')[0]
      var currency = p_id.split('-')[1]

      selectorObj = {exchange_id: e_id, product_id: p_id, asset: asset, currency: currency, normalized: s}
    } else {
      selectorObj = conf.selector
    }
  }

  _initialize(conf.selector)

  return theService
}