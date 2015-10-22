db = db.getSiblingDB('amdocs-barcelona'); //mongo c128.candidate.42.mongolayer.com:10128/camdocs-barcelona -u admin -p s3cr37o products_cala.js

db.mobileproducts.remove({});
db.mobileproducts.insert({"productID" : 1, "cost" : 5, "description" : "", "merchantId" : 1, "name" : "Cell phone cleaner", "status" : "IN STOCK", "url": "https://s3-us-west-2.amazonaws.com/amdocs-images-v2/products_mobile/cleaner.jpg" , "schedule" : "MORNING", customerCode: "37", demonstratorCode: "37"});
db.mobileproducts.insert({"productID" : 2, "cost" : 5, "description" : "", "merchantId" : 1, "name" : "Earphones", "status" : "IN STOCK", "url": "https://s3-us-west-2.amazonaws.com/amdocs-images-v2/products_mobile/earphones.png" , "schedule" : "MORNING", customerCode: "38", demonstratorCode: "38" });
db.mobileproducts.insert({"productID" : 3, "cost" : 5, "description" : "", "merchantId" : 1, "name" : "Bluetooth speaker", "status" : "IN STOCK", "url": "https://s3-us-west-2.amazonaws.com/amdocs-images-v2/products_mobile/speaker.png" , "schedule" : "MORNING", customerCode: "39", demonstratorCode: "39" });
db.mobileproducts.insert({"productID" : 3, "cost" : 5, "description" : "", "merchantId" : 1, "name" : "Selfie Stick", "status" : "IN STOCK", "url": "https://s3-us-west-2.amazonaws.com/amdocs-images-v2/products_mobile/selfie.png" , "schedule" : "MORNING", customerCode: "39", demonstratorCode: "39" });
db.mobileproducts.insert({"productID" : 3, "cost" : 5, "description" : "", "merchantId" : 1, "name" : "Universal Backup Battery", "status" : "IN STOCK", "url": "https://s3-us-west-2.amazonaws.com/amdocs-images-v2/products_mobile/backupBattery.png" , "schedule" : "MORNING", customerCode: "39", demonstratorCode: "39" });
db.ordertemporals.remove({});
