db = db.getSiblingDB('amdocs-barcelona'); //mongo c128.candidate.42.mongolayer.com:10128/amdocs-barcelona -u admin -p s3cr37o products_cala.js

db.products.remove({});
db.products.insert({"productID" : 1, "cost" : 8, "description" : "", "merchantId" : 1, "name" : "classic margarita", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_cala/margarita_original.jpg" , "schedule" : "AFTERNOON" });
db.products.insert({"productID" : 2, "cost" : 8, "description" : "", "merchantId" : 1, "name" : "Tamarind margarita", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_cala/margarita_tamarind.jpg", "schedule" : "AFTERNOON"});
db.products.insert({"productID" : 3, "cost" : 8, "description" : "", "merchantId" : 1, "name" : "Mango margarita", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_cala/margarita_mango.jpg" , "schedule" : "AFTERNOON"});
db.products.insert({"productID" : 4, "cost" : 3.5, "description" : "", "merchantId" : 1, "name" : "coffee classic", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_cala/cafe_classic.jpg" , "schedule" : "MORNING"});
db.products.insert({"productID" : 5, "cost" : 4.5, "description" : "", "merchantId" : 1, "name" : "mango smoothie", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_cala/mango_smoothie.jpg" , "schedule" : "MORNING"});
db.products.insert({"productID" : 6, "cost" : 4.5, "description" : "", "merchantId" : 1, "name" : "mocha smoothie", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_cala/mocha_smoothie.jpg" , "schedule" : "MORNING"});
db.products.insert({"productID" : 7, "cost" : 4.5, "description" : "", "merchantId" : 1, "name" : "lemon smoothie", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_cala/lemon.jpg" , "schedule" : "MORNING"});
db.products.insert({"productID" : 8, "cost" : 4.5, "description" : "", "merchantId" : 1, "name" : "strawberry smoothie", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_cala/strawberry_smoothie.jpg" , "schedule" : "MORNING"});
db.products.insert({"productID" : 9, "cost" : 3.5, "description" : "", "merchantId" : 1, "name" : "vanilla cappuccino", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_cala/vanilla.jpg" , "schedule" : "MORNING"});
db.products.insert({"productID" : 10, "cost" : 3.5, "description" : "", "merchantId" : 1, "name" : "irish cream", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/products_cala/irish.jpg" , "schedule" : "MORNING"});

db.discounts.remove({});
db.discounts.insert({"productID" : 1, "cost" : 4, "description" : "", "merchantId" : 1, "name" : "classic margarita", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_cala/margarita_original.jpg" , "schedule" : "AFTERNOON" });
db.discounts.insert({"productID" : 2, "cost" : 4, "description" : "", "merchantId" : 1, "name" : "Tamarind margarita", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_cala/margarita_tamarind.jpg", "schedule" : "AFTERNOON"});
db.discounts.insert({"productID" : 3, "cost" : 4, "description" : "", "merchantId" : 1, "name" : "Mango margarita", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_cala/margarita_mango.jpg" , "schedule" : "AFTERNOON"});
db.discounts.insert({"productID" : 4, "cost" : 1.75, "description" : "", "merchantId" : 1, "name" : "coffee classic", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_cala/cafe_classic.jpg" , "schedule" : "MORNING"});
db.discounts.insert({"productID" : 5, "cost" : 1.75, "description" : "", "merchantId" : 1, "name" : "mango smoothie", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_cala/mango_smoothie.jpg" , "schedule" : "MORNING"});
db.discounts.insert({"productID" : 6, "cost" : 2.25, "description" : "", "merchantId" : 1, "name" : "mocha smoothie", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_cala/mocha_smoothie.jpg" , "schedule" : "MORNING"});
db.discounts.insert({"productID" : 7, "cost" : 2.25, "description" : "", "merchantId" : 1, "name" : "lemon smoothie", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_cala/lemon.jpg" , "schedule" : "MORNING"});
db.discounts.insert({"productID" : 8, "cost" : 2.25, "description" : "", "merchantId" : 1, "name" : "strawberry smoothie", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_cala/strawberry_smoothie.jpg" , "schedule" : "MORNING"});
db.discounts.insert({"productID" : 9, "cost" : 2.25, "description" : "", "merchantId" : 1, "name" : "vanilla cappuccino", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_cala/vainilla.jpg" , "schedule" : "MORNING"});
db.discounts.insert({"productID" : 10, "cost" : 2.25, "description" : "", "merchantId" : 1, "name" : "irish cream", "status" : "IN STOCK", "url": "https://d80mkr1efvy13.cloudfront.net/discount_product_cala/irish.jpg" , "schedule" : "MORNING"});


