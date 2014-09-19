// Configuration file
var config = {};

config.orders = {};
config.orders.status = 'Open';
config.orders.errMsg = 'Something went wrong';
config.orders.emptyMsg = 'There are no ' + config.orders.status + ' orders';

module.exports = config;