db = db.getSiblingDB('amdocs'); //mongo kahana.mongohq.com:10056/app28614432 -u carlos -p 123 initDB.j
db.merchants.remove({});
db.merchants.insert({ _id : 1 , name : "amdocs Cafe 1" ,address: "Av. Mariano Escobedo esquina Lago Alberto Colonia polanco " , latitude:19.440833 , longitude:-99.185  });
db.merchants.insert({ _id : 2 , name : "amdocs Cafe 2" ,address: "Av. Universidad #1000, Col. Santa Cruz Atoya " , latitude:19.366944 , longitude:-99.16527  });
db.merchants.insert({ _id : 3 , name : "amdocs Cafe 3" ,address: "Parroquia No. 194. Col. Del Valle" , latitude:19.371944 , longitude:-99.178333 });
db.products.remove({});
db.products.insert({ _id : 1 ,  name : "Black Cofee", description : "", "url":"http://amdocs/img/1.jpg" , cost : 5.00 });
db.products.insert({ _id : 2 ,  name : "Frappucino", description : "","url":"http://amdocs/img/2.jpg", cost : 7.00 });
db.products.insert({ _id : 3 ,  name : "Espresso ", description : "","url":"http://amdocs/img/3.jpg", cost : 12.00 });
db.products.insert({ _id : 4 ,  name : "Cappuccino", description : "","url":"http://amdocs/img/4.jpg",cost : 15.00 });
db.products.insert({ _id : 5 ,  name : "Americano", description : "","url":"http://amdocs/img/5.jpg",cost : 9.00 });
db.products.insert({ _id : 6 ,  name : "Latte", description : "","url":"http://amdocs/img/6.jpg",cost : 8.00 });
db.products.insert({ _id : 7 ,  name : "Mocha", description : "","url":"http://amdocs/img/7.jpg",cost : 5.00 });
db.products.insert({ _id : 8 ,  name : "Caramel Macchiato", description : "","url":"http://amdocs/img/8.jpg",cost : 4.00 });
db.products.insert({ _id : 9 ,  name : "Coffee milk", description : "","url":"http://amdocs/img/9.jpg",cost : 10.00 });
db.products.insert({ _id : 10 , name :"Affogato", description : "","url":"http://amdocs/img/9.jpg", cost : 12.00 });
db.orders.remove({});
db.orders.insert({ _id : 1 , userId : 12345 , products:[{name : "Black Cofee",quantity : "2",cost : 50}], total : 100 , date : "21/08/2014" , status : "Delivered"})
db.orders.insert({ _id : 2 , userId : 12345 , products:[{name : "Frappucino",quantity : "3",cost : 50}], total : 150 , date : "24/08/2014" , status : "Delivered"})
db.orders.insert({ _id : 10 , userId : 1234 , products:[{name : "Americano",quantity : "1",cost : 50}], total : 50 , date : "28/08/2014" , status : "Delivered"})
db.orders.insert({ _id : 11 , userId : 1234 , products:[{name : "Latte",quantity : "1",cost : 50}], total : 50 , date : "28/08/2014" , status : "Delivered"})
db.orders.insert({ _id : 3 , userId : 12345 , products:[{name : "Espresso",quantity : "1",cost : 50}], total : 50 , date : "28/08/2014" , status : "Delivered"})
