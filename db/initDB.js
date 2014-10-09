db = db.getSiblingDB('amdocs'); //mongo kahana.mongohq.com:10056/app28614432 -u carlos -p 123 initDB.js mongo localhost:27017/max initDB.js
db.sessions.remove({});
db.sessions.insert({ token: "9URRCEPIL28RW3HHKIN5", pin : "1500", phoneID : "359300054072625" });
db.merchants.remove({});
db.merchants.insert({ id: 1, name : "amdocs Cafe 1" ,address: "Av. Mariano Escobedo esquina Lago Alberto Colonia polanco " , latitude:19.440833 , longitude:-99.185  });
db.merchants.insert({ id: 2, name : "amdocs Cafe 2" ,address: "Av. Universidad #1000, Col. Santa Cruz Atoya " , latitude:19.366944 , longitude:-99.16527  });
db.merchants.insert({ id: 3, name : "amdocs Cafe 3" ,address: "Parroquia No. 194. Col. Del Valle" , latitude:19.371944 , longitude:-99.178333 });
db.products.remove({});
// supported status for products: IN STOCK, OUT STOCK
db.products.insert({ merchantId: 1, name : "Black Cofee", description : "", "url":"https://s3-us-west-1.amazonaws.com/amdocs-images/products/black.jpg", cost : 5.00, status: "IN STOCK" });
db.products.insert({ merchantId: 1, name : "Frappucino", description : "", "url":"https://s3-us-west-1.amazonaws.com/amdocs-images/products/frapuccino.jpg", cost : 7.00, status: "IN STOCK" });
db.products.insert({ merchantId: 1, name : "Espresso ", description : "", "url":"https://s3-us-west-1.amazonaws.com/amdocs-images/products/espresso.jpg", cost : 12.00, status: "IN STOCK" });
db.products.insert({ merchantId: 1, name : "Cappuccino", description : "", "url":"https://s3-us-west-1.amazonaws.com/amdocs-images/products/capuccino.jpg", cost : 15.00, status: "OUT STOCK" });
db.products.insert({ merchantId: 1, name : "Americano", description : "", "url":"https://s3-us-west-1.amazonaws.com/amdocs-images/products/american.jpg", cost : 9.00, status: "OUT STOCK" });
db.products.insert({ merchantId: 1, name : "Latte", description : "", "url":"https://s3-us-west-1.amazonaws.com/amdocs-images/products/latte.jpg", cost : 8.00, status: "OUT STOCK" });
db.products.insert({ merchantId: 1, name : "Mocha", description : "", "url":"https://s3-us-west-1.amazonaws.com/amdocs-images/products/mocha.jpg", cost : 5.00, status: "IN STOCK" });
db.products.insert({ merchantId: 1, name : "Caramel Macchiato", description : "", "url":"https://s3-us-west-1.amazonaws.com/amdocs-images/products/machiato.jpg", cost : 4.00, status: "IN STOCK" });
db.products.insert({ merchantId: 1, name : "Coffee milk", description : "", "url":"https://s3-us-west-1.amazonaws.com/amdocs-images/products/milk.jpg", cost : 10.00, status: "IN STOCK" });
db.products.insert({ merchantId: 1, name :"Affogato", description : "", "url":"https://s3-us-west-1.amazonaws.com/amdocs-images/products/affogato.jpg", cost : 12.00, status: "IN STOCK" });
db.orders.remove({});
// supported status for orders: NEW, IN PROGRESS, READY, DELIVERED, CANCELED
db.orders.insert({ userId : 359300054072625 , merchantId: 1, customerImage: 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/359300054072625.jpg', customerName: 'jesus', products:[{name : "Black Cofee",quantity : "1",cost : 5}], total : 5, date : "2014-09-23 23:36:16" , status : "NEW"})
db.orders.insert({ userId : 359300054072625 , merchantId: 1, customerImage: 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/359300054072625.jpg', customerName: 'jesus', products:[{name : "Frappucino",quantity : "1",cost : 5}], total : 5, date : "2014-09-23 23:38:16" , status : "NEW"})
db.orders.insert({ userId : 359300054072625 , merchantId: 1, customerImage: 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/359300054072625.jpg', customerName: 'jesus', products:[{name : "Black Cofee",quantity : "1",cost : 5}], total : 5, date : "2014-09-23 23:36:16" , status : "NEW"})
db.orders.insert({ userId : 359300054072625 , merchantId: 1, customerImage: 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/359300054072625.jpg', customerName: 'jesus', products:[{name : "Americano",quantity : "1",cost : 5}], total : 5, date : "2014-09-23 23:36:16" , status : "NEW"})
db.orders.insert({ userId : 359300054072625 , merchantId: 1, customerImage: 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/359300054072625.jpg', customerName: 'jesus', products:[{name : "Black Cofee",quantity : "1",cost : 5}], total : 5, date : "2014-09-23 23:36:16" , status : "NEW"})
db.orders.insert({ userId : 359300054072625 , merchantId: 1, customerImage: 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/359300054072625.jpg', customerName: 'jesus', products:[{name : "Caramel Macchiato",quantity : "1",cost : 5}], total : 5, date : "2014-09-23 23:36:16" , status : "NEW"})
db.orders.insert({ userId : 359300054072625 , merchantId: 1, customerImage: 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/359300054072625.jpg', customerName: 'jesus', products:[{name : "Black Cofee",quantity : "1",cost : 5}], total : 5, date : "2014-09-23 23:36:16" , status : "NEW"})
db.orders.insert({ userId : 359300054072625 , merchantId: 1, customerImage: 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/359300054072625.jpg', customerName: 'jesus', products:[{name : "Coffee milk",quantity : "1",cost : 5}], total : 5, date : "2014-09-23 23:36:16" , status : "NEW"})
db.orders.insert({ userId : 359300054072625 , merchantId: 1, customerImage: 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/359300054072625.jpg', customerName: 'jesus', products:[{name : "Mocha",quantity : "1",cost : 5}], total : 5, date : "2014-09-23 23:36:16" , status : "NEW"})
db.orders.insert({ userId : 359300054072625 , merchantId: 1, customerImage: 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/359300054072625.jpg', customerName: 'jesus', products:[{name : "Black Cofee",quantity : "1",cost : 5}], total : 5, date : "2014-09-23 23:36:16" , status : "NEW"})
db.orders.insert({ userId : 359300054072625 , merchantId: 1, customerImage: 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/359300054072625.jpg', customerName: 'jesus', products:[{name : "Affogato",quantity : "1",cost : 5}], total : 5, date : "2014-09-23 23:36:16" , status : "NEW"})
db.orders.insert({ userId : 359300054072625 , merchantId: 1, customerImage: 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/359300054072625.jpg', customerName: 'jesus', products:[{name : "Frappucino",quantity : "1",cost : 5}], total : 5, date : "24/08/2014" , status : "NEW"})
db.orders.insert({ userId : 359300054072625 , merchantId: 1, customerImage: 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/359300054072625.jpg', customerName: 'jesus', products:[{name : "Americano",quantity : "1",cost : 50}], total : 5 , date : "28/08/2014" , status : "NEW"})
db.loans.remove({});
// supported status for loans: NEW, ACCEPTED, REJECTED 
db.loans.insert({ userId: 12345, merchantId: 1, customerImage: 'http://imgur.com/image.jpg', customerName: 'Jesus', status: 'NEW', date: '19/09/2014', phoneID : '3123312' });
db.loans.insert({ userId: 12345, merchantId: 2, customerImage: 'http://imgur.com/image.jpg', customerName: 'JJ', status: 'NEW', date: '19/09/2014', phoneID : '3123312' });
db.loans.insert({ userId: 12345, merchantId: 3, customerImage: 'http://imgur.com/image.jpg', customerName: 'Maximo', status: 'ACCEPTED', date: '19/09/2014', phoneID : '3123312' });
db.loans.insert({ userId: 12345, merchantId: 1, customerImage: 'http://imgur.com/image.jpg', customerName: 'Carlos', status: 'REJECTED', date: '19/09/2014', phoneID : '3123312' });
db.loans.insert({ userId: 12345, merchantId: 2, customerImage: 'http://imgur.com/image.jpg', customerName: 'Alex', status: 'ACCEPTED', date: '19/09/2014', phoneID : '3123312' });
