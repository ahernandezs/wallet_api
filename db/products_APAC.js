db = db.getSiblingDB('amdocs-barcelona'); //mongo c128.candidate.42.mongolayer.com:10128/amdocs-barcelona -u admin -p s3cr37o products_cala.js

db.products.remove({});
db.products.insert({"productID" : 1, "cost" : 10, "description" : "", "merchantId" : 1, "name" : "Mocha", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_apac/mocha.jpg" , "schedule" : "MORNING", CustomerCode: "8", DemonstratorCode: "26"});
db.products.insert({"productID" : 2, "cost" : 8, "description" : "", "merchantId" : 1, "name" : "Americano", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_apac/americano.jpg" , "schedule" : "MORNING", CustomerCode: "7", DemonstratorCode: "25" });
db.products.insert({"productID" : 3, "cost" : 10, "description" : "", "merchantId" : 1, "name" : "Capuccino", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_apac/capuccino.jpg" , "schedule" : "MORNING", CustomerCode: "5", DemonstratorCode: "23" });
db.products.insert({"productID" : 4, "cost" : 10, "description" : "", "merchantId" : 1, "name" : "Ice Blended Latte", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_apac/iceblendedtea.jpg" , "schedule" : "MORNING", CustomerCode: "4", DemonstratorCode: "22" });
db.products.insert({"productID" : 5, "cost" : 8, "description" : "", "merchantId" : 1, "name" : "Iced Coffee", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_apac/icedcoffee.jpg" , "schedule" : "MORNING", CustomerCode: "6", DemonstratorCode: "24" });
db.products.insert({"productID" : 6, "cost" : 9, "description" : "", "merchantId" : 1, "name" : "Teh Tarik", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_apac/tehtarik.jpg" , "schedule" : "MORNING", CustomerCode: "10", DemonstratorCode: "28" });

db.discounts.remove({});
db.discounts.insert({"productID" : 1, "cost" : 5, "description" : "", "merchantId" : 1, "name" : "Mocha", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_apac/mocha.jpg" , "schedule" : "MORNING", CustomerCode: "8", DemonstratorCode: "26" });
db.discounts.insert({"productID" : 2, "cost" : 4, "description" : "", "merchantId" : 1, "name" : "Americano", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_apac/americano.jpg" , "schedule" : "MORNING", CustomerCode: "7", DemonstratorCode: "25" });
db.discounts.insert({"productID" : 3, "cost" : 5, "description" : "", "merchantId" : 1, "name" : "Capuccino", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_apac/capuccino.jpg" , "schedule" : "MORNING", CustomerCode: "5", DemonstratorCode: "23" });
db.discounts.insert({"productID" : 4, "cost" : 5, "description" : "", "merchantId" : 1, "name" : "Ice Blended Latte", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_apac/iceblendedtea.jpg" , "schedule" : "MORNING", CustomerCode: "4", DemonstratorCode: "22" });
db.discounts.insert({"productID" : 5, "cost" : 4, "description" : "", "merchantId" : 1, "name" : "Iced Coffee", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_apac/icedcoffee.jpg" , "schedule" : "MORNING", CustomerCode: "6", DemonstratorCode: "24" });
db.discounts.insert({"productID" : 6, "cost" : 4.5, "description" : "", "merchantId" : 1, "name" : "Teh Tarik", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_apac/tehtarik.jpg" , "schedule" : "MORNING", CustomerCode: "10", DemonstratorCode: "28" });


