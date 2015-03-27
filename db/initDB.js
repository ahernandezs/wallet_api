db = db.getSiblingDB('amdocs'); //mongo kahana.mongohq.com:10056/app28614432 -u carlos -p 123 initDB.js mongo localhost:27017/max initDB.js
db.doxinfos.remove({});
db.doxinfos.insert({ description: "Completed profile", urlImage : "https://s3-us-west-1.amazonaws.com/amdocs-images/catalog_dox/dox1.png" });
db.doxinfos.insert({ description: "Invited friend", urlImage : "https://s3-us-west-1.amazonaws.com/amdocs-images/catalog_dox/dox1.png" });
db.doxinfos.insert({ description: "Social Share, Twitter", urlImage : "https://s3-us-west-1.amazonaws.com/amdocs-images/catalog_dox/dox1.png" });
db.doxinfos.insert({ description: "Linked account, LinkedIn", urlImage : "https://s3-us-west-1.amazonaws.com/amdocs-images/catalog_dox/dox1.png" });
db.doxinfos.insert({ description: "Social Share, Instagram", urlImage : "https://s3-us-west-1.amazonaws.com/amdocs-images/catalog_dox/dox1.png" });
db.merchants.remove({});
db.merchants.insert({ id: 1, name : "amdocs Cafe 1" ,address: "Av. Mariano Escobedo esquina Lago Alberto Colonia polanco " , latitude:19.440833 , longitude:-99.185 ,appID :'29d00370-7c27-4658-8de7-90f19fcce9c4',OS:'ANDROID',distance:'5Km',schedule:'9am - 5pm',imgUrl:'' });
db.merchants.insert({ id: 2, name : "amdocs Cafe 2" ,address: "Av. Universidad #1000, Col. Santa Cruz Atoya " , latitude:19.366944 , longitude:-99.16527 ,appID :'',OS:'',distance:'',schedule:'',imgUrl:'' });
db.merchants.insert({ id: 3, name : "amdocs Cafe 3" ,address: "Parroquia No. 194. Col. Del Valle" , latitude:19.371944 , longitude:-99.178333,appID :'',OS:'',distance:'',schedule:'',imgUrl:'' });
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

db.transacctions.remove({});
db.transacctions.insert({ title:'Banamex Cafe' , type: 'MONEY' , date:'2014-10-10 07:26:47' , amount:5 , description:'Order No 1981', additionalInfo:'', operation:'BUY' , phoneID : '3123312'});
db.transacctions.insert({ title:'Gift' , type: 'MONEY' , date:'2014-10-10 08:26:47' , amount:-5 , description:'To Juan Perez', additionalInfo:'', operation:'Gift' , phoneID : '3123312' });
db.transacctions.insert({ title:'Loan Approved' , type: 'MONEY' , date:'2014-10-10 09:26:47' , amount:10 , description:'Reference No 1981', additionalInfo:'', operation:'LOAN' , phoneID : '3123312'});
db.transacctions.insert({ title:'Transfer Fund' , type: 'MONEY' , date:'2014-10-10 10:26:47' , amount:-5 , description:'To Eduardo Acevedo', additionalInfo:'', operation:'TRANSFER', phoneID : '3123312' });
db.transacctions.insert({ title:'Transfer Fund Received' , type: 'MONEY' , date:'2014-10-10 10:26:47' , amount:5 , description:'From Rocio Morales', additionalInfo:'', operation:'TRANSFER' , phoneID : '3123312'});

db.transacctions.insert({ title:'Completed profile' , type: 'DOX' , date:'2014-10-10 07:26:47' , amount:500 , description:'Order No 1981', additionalInfo:'', operation:'1' , phoneID : '3123312'});
db.transacctions.insert({ title:'Invited friend' , type: 'DOX' , date:'2014-10-10 08:26:47' , amount:500 , description:'To Juan Perez', additionalInfo:'', operation:'2' , phoneID : '3123312' });
db.transacctions.insert({ title:'Social share, Twitter' , type: 'DOX' , date:'2014-10-10 09:26:47' , amount:200 , description:'Reference No 1981', additionalInfo:'', operation:'3' , phoneID : '3123312'});
db.transacctions.insert({ title:'Linked account,LinkedIn' , type: 'DOX' , date:'2014-10-10 10:26:47' , amount:100, description:'To Eduardo Acevedo', additionalInfo:'', operation:'4', phoneID : '3123312' });
db.transacctions.insert({ title:'Social Share, Instagram' , type: 'DOX' , date:'2014-10-10 10:26:47' , amount:200 , description:'From Rocio Morales', additionalInfo:'', operation:'5', phoneID : '3123312' });

