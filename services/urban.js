var UA = require('urban-airship');
var ua = new UA('<z6DMkdyDQJGD3wZorFFD6g>', '<Si4Dtnk8RAuaoDhJydlAdw>', '<6T6NnUa3SBqR-sjTxdjj5g>');


var payload0 = {'android':{'alert':'Probando mensajes'},'apids':['82e96492-190f-4295-8de4-4ee6d4c6156d']}

ua.registerDevice('<82e96492-190f-4295-8de4-4ee6d4c6156d>', function(error) {
	console.log('register error ' + error);
});
ua.pushNotification('/api/push', payload0, function(error) {
	console.log('notification pushed' + error);
});
