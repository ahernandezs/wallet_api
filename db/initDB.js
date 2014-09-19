db = db.getSiblingDB('amdocs'); //mongo kahana.mongohq.com:10056/app28614432 -u carlos -p 123 initDB.js mongo localhost:27017/max initDB.js
db.merchants.remove({});
db.merchants.insert({ id: 1, name : "amdocs Cafe 1" ,address: "Av. Mariano Escobedo esquina Lago Alberto Colonia polanco " , latitude:19.440833 , longitude:-99.185  });
db.merchants.insert({ id: 2, name : "amdocs Cafe 2" ,address: "Av. Universidad #1000, Col. Santa Cruz Atoya " , latitude:19.366944 , longitude:-99.16527  });
db.merchants.insert({ id: 3, name : "amdocs Cafe 3" ,address: "Parroquia No. 194. Col. Del Valle" , latitude:19.371944 , longitude:-99.178333 });
db.products.remove({});
db.products.insert({ name : "Black Cofee", description : "", "url":"http://amdocs/img/1.jpg" , cost : 5.00 });
db.products.insert({ name : "Frappucino", description : "","url":"http://amdocs/img/2.jpg", cost : 7.00 });
db.products.insert({ name : "Espresso ", description : "","url":"http://amdocs/img/3.jpg", cost : 12.00 });
db.products.insert({ name : "Cappuccino", description : "","url":"http://amdocs/img/4.jpg",cost : 15.00 });
db.products.insert({ name : "Americano", description : "","url":"http://amdocs/img/5.jpg",cost : 9.00 });
db.products.insert({ name : "Latte", description : "","url":"http://amdocs/img/6.jpg",cost : 8.00 });
db.products.insert({ name : "Mocha", description : "","url":"http://amdocs/img/7.jpg",cost : 5.00 });
db.products.insert({ name : "Caramel Macchiato", description : "","url":"http://amdocs/img/8.jpg",cost : 4.00 });
db.products.insert({ name : "Coffee milk", description : "","url":"http://amdocs/img/9.jpg",cost : 10.00 });
db.products.insert({ name :"Affogato", description : "","url":"http://amdocs/img/9.jpg", cost : 12.00 });
db.orders.remove({});
db.orders.insert({ userId : 12345 , merchantId: 1, customerImage: 'http://imgur.com/image.jpg', customerName: 'Jesus', products:[{name : "Black Cofee",quantity : "2",cost : 50}], total : 100 , date : "21/08/2014" , status : "Open"})
db.orders.insert({ userId : 12345 , merchantId: 2, customerImage: 'http://imgur.com/image.jpg', customerName: 'Maximo', products:[{name : "Frappucino",quantity : "3",cost : 50}], total : 150 , date : "24/08/2014" , status : "Open"})
db.orders.insert({ userId : 1234 , merchantId: 1, customerImage: 'http://imgur.com/image.jpg', customerName: 'Carlos', products:[{name : "Americano",quantity : "1",cost : 50}], total : 50 , date : "28/08/2014" , status : "Delivered"})
db.orders.insert({ userId : 1234 , merchantId: 3, customerImage: 'http://imgur.com/image.jpg', customerName: 'JJ', products:[{name : "Latte",quantity : "1",cost : 50}], total : 50 , date : "28/08/2014" , status : "Delivered"})
db.orders.insert({ userId : 12345 , merchantId: 2, customerImage: 'http://imgur.com/image.jpg', customerName: 'Alex', products:[{name : "Espresso",quantity : "1",cost : 50}], total : 50 , date : "28/08/2014" , status : "Delivered"})
db.loans.remove({});
db.loans.insert({ userId: 12345, merchantId: 1, customerImage: 'http://imgur.com/image.jpg', customerName: 'Jesus', status: 'New', date: '19/09/2014' });
db.loans.insert({ userId: 12345, merchantId: 2, customerImage: 'http://imgur.com/image.jpg', customerName: 'JJ', status: 'New', date: '19/09/2014' });
db.loans.insert({ userId: 12345, merchantId: 3, customerImage: 'http://imgur.com/image.jpg', customerName: 'Maximo', status: 'Accepted', date: '19/09/2014' });
db.loans.insert({ userId: 12345, merchantId: 1, customerImage: 'http://imgur.com/image.jpg', customerName: 'Carlos', status: 'Rejected', date: '19/09/2014' });
db.loans.insert({ userId: 12345, merchantId: 2, customerImage: 'http://imgur.com/image.jpg', customerName: 'Alex', status: 'Accepted', date: '19/09/2014' });