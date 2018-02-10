var exchangeService = require('./collection-service')

module.exports = function (conf) {

  var exchangeServiceInstance = exchangeService(conf)

  var theService = {}

  function _getProducts() {
    return exchangeServiceInstance.getExchange().getProducts() 
  }

  theService.getProducts = function() {
    return _getProducts()
  }

  theService.getSelectedProduct = function() {
    var rtn = undefined

    var products = _getProducts()
    products.forEach(function (product) {
      if (product.asset === conf.selector.asset && product.currency === conf.selector.currency) {
        rtn = product
      }
    })

    return rtn
  }

  return theService
}