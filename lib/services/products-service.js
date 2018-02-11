var exchangeService = require('./exchange-service')

module.exports = function (conf) {

  var exchangeServiceInstance = exchangeService(conf)

  var theService = {}

  function _getProducts() {
    return exchangeServiceInstance.getExchange().getProducts() 
  }

  theService.getProducts = function() {
    return _getProducts()
  }

  function _getSelectedProduct() {
    var rtn = undefined

    var products = _getProducts()
    products.forEach(function (product) {
      if (product.asset === conf.selector.asset && product.currency === conf.selector.currency) {
        rtn = product
      }
    })

    return rtn
  }

  theService.getSelectedProduct = function() {
    return _getSelectedProduct()
  }

  theService.getSelectedProductId = function() {
    var sp = _getSelectedProduct()
    var rtn = undefined

    if (sp !== undefined) {
      rtn = sp.asset + '-' + sp.currency
    }

    return rtn
  }

  return theService
}