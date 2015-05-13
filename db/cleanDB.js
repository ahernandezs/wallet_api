db = db.getSiblingDB('amdocs'); //mmongo c128.candidate.42.mongolayer.com:10128/amdocs-barcelona -u admin -p s3cr37o cleanDB.js
db.users.remove();
db.loans.remove();
db.merchantsnotifications.remove();
db.messages.remove();
db.orders.remove();
db.orderstemporals.remove();
db.receipts.remove();
db.requestmoneys.remove();
db.sessions.remove();
db.transactions.remove();
