var config = {};
var winston = require('winston');

winston.colors = {
    info: 'green',
    warn: 'yellow',
    error: 'red'
};
//set question secret for user
config.question = 'What is your mother\'s maiden name? ';
config.sendGrid = {};
config.sendGrid.user = 'dannywf@anzen.com.mx';
config.sendGrid.password = 'Anzen7924';

config.group ={}
config.group.env = {INTERNAL: 'INTERNAL' , PUBLIC : 'PUBLIC'};

config.receipt = {};
config.receipt.type = { BUY: 'BUY', COUPON: 'COUPON', GIFT:'GIFT', LOAN: 'LOAN', TRANSFER: 'TRANSFER', BILLPAYMENT: 'BILLPAYMENT',
                        AIRTIMEBUY:'AIRTIMEBUY', TICKETBUY: 'TICKETBUY', TOPUP:'TOPUP'};

config.orders = {};
config.orders.status = {NEW : 'NEW' ,IN_PROGRESS : 'IN PROGRESS' , READY : 'READY' , DELIVERED : 'DELIVERED' , CANCELED : 'CANCELED',PENDING : 'PENDING'};
config.orders.errMsg = 'Something went wrong';
config.orders.emptyMsg = 'There are no ' + config.orders.status + ' orders';

config.loans = {};
config.loans.status = {NEW : 'NEW' ,ACCEPTED : 'ACCEPTED' , REJECTED : 'REJECTED' };
config.loans.lenddoStatus = {PENDING : 'PENDING', PENDING : 'ACCEPTED' };
config.loans.errMsg = 'Something went wrong';
config.loans.emptyMsg = 'There are no ' + config.loans.status + ' loans';
config.loans.type = { GREAT:"GREAT" , GOOD:"GOOD" , OK:"OK", BAD: "BAD", DEFAULT: "BAD" };
config.loans.max_amount = { GREAT : 5000.00 , GOOD: 2500.00 , OK:1000.00, BAD: 0.00, DEFAULT: 0.00 };

config.products = {};
config.products.status = 'IN STOCK';
config.products.errMsg = 'Something went wrong';
config.products.emptyMsg = 'There are no products ' + config.products.status;
config.products.emptyInventory = 'The inventory is empty';

config.merchants = {};
config.merchants.errMsg = 'Something went wrong';
config.merchants.emptyMsg = 'merchant not found ';

config.S3 = {};
config.S3.url = process.env.AS3_IMAGES;

config.messages = {};
config.messages.status = { READ : 'READ' ,NOTREAD : 'NOTREAD', DELIVERED: 'DELIVERED'};
config.messages.type = { TRANSFER:'TRANSFER' , GIFT : 'GIFT' , BUY :'BUY' ,LOAN :'LOAN', COUPON: 'COUPON' , REQUEST_MONEY : 'REQUEST_MONEY' , MESSAGE : 'MESSAGE' ,
                         AUTHORIZATION_PURCHASE:'AUTHORIZATION_PURCHASE', BILLPAYMENT: 'BILLPAYMENT', AIRTIMEBUY: 'AIRTIMEBUY', TICKETBUY : 'TICKETBUY', TOPUP:'TOPUP'};
config.messages.transferMsg = 'You have received money from ';
config.messages.giftMsg = '[sender] has gifted you an Amdocs Café voucher';
config.messages.billPayMsg = 'You have payed bill from ';
config.messages.airtimeBuyMsg = 'You buy airtime to phone ';
config.messages.ticketBuyMsg = 'You buy a Ticket to ';
config.messages.loanRequestMsg = 'You have requested a loan for €';
config.messages.loanRejectedMsg = 'Build up your Dox score to be elegible for a loan';
config.messages.loanRejectedOneMsg = 'Sorry,Since you recently availed a loan, you need to wait another ';
config.messages.loanRejectedTwoMsg = ' minutes to become eligible for a new loan';
config.messages.transferRejectedOneMsg = 'Sorry, you have exceded transfers in last hour, you need to wait next hour for make new transfers';
config.messages.giftRejectedOneMsg = 'Sorry, you have exceeded your number of gifts per hour';
config.messages.buyRejectedOneMsg = 'Sorry, you have exceeded your number of buys per hour. Please return home';
config.messages.loanAcceptedMsg = 'Congratulations,Your Instan-Loan is approved';
config.messages.action = {TRANSFER:1 , GIFT :2 , BUY :3 ,LOAN : 4, COUPON: 5 , AUTH: 6 , LENDO : 7, BILLPAYMENT: 8, AIRTIME: 9, TICKET: 10};
config.messages.transferFund = 'You have sent a Transfer to ';
config.messages.coupon = {};
config.messages.coupon.message = 'Congratulations You are today’s winner of “Highest DOX score of the day wins a prize” promotion! We will be in touch shortly, along with your prize';
config.messages.coupon.title = 'Congratulations, You won a prize';
config.messages.inviteError = 'Sorry, You have exceeded your number of invitations';

config.messages.twitter = { message :'I just bought a {0} from AmdocsCafe at {1}' , url :''};
config.messages.twitter1 = 'I just bought a ';
config.messages.twitter2 = ' from AmdocsCafe at ';
config.messages.twitterURL = '';
config.messages.twitterMsg = 'Having a great time, enjoying the delicious coffee bought with my #AmdocsWallet';
config.messages.facebook =	{
								name:'Amdocs Wallet',
								caption:'I just bought a coffee',
								description:'Just downloaded my Amdocs Wallet  looking forward to the delicous coffee at the fully cashless Amdocs Café',
								link:'http://amdocs.com/MFS'
							};

config.requests = {};
config.requests.status = { NEW : 'NEW', ACCEPTED : 'ACCEPTED', REJECTED: 'REJECTED' };

config.doxs = {};

config.doxs.linking = 500; //link to twitter/facebook
config.doxs.social = 1000; //Invite a friend
config.doxs.p2p = 1000;	   //Transfer money to a friendAmdocs Wallet
config.doxs.profile = 1000;//Complete profile
config.doxs.pic = 1000;	   //PhotoAmdocs Wallet
config.doxs.payment = 1500;//Make a purchase
config.doxs.gift = 1000    //Send a gift to a friend
config.doxs.twitter = 1000;
config.doxs.facebook = 1000;
config.doxs.instagram = 1000;
config.doxs.invite = 1000;
config.doxs.sms = 1000;

config.prizes = {};
config.prizes.top = 1;

config.conn = {};
config.username = 'anzen_01';
config.pin = '1234';

config.mail = {};
config.mail.bodyPin= 'Thank you for registering with Amdocs wallet! Your pin number is: ';
config.mail.bodyFin='Now you can buy a coffee or just send a coffee to a friend, also you can share your buy in your social networks, all these actions give you Dox points, with Dox points you could win some amazing prizes.';
config.mail.regards='Thanks';
config.mail.footer='Amdocs wallet Team';

config.mailInvite = {};
config.mailInvite.header = 'Hey there,';
config.mailInvite.bodyInit = 'Check out the Amdocs Mobile Wallet  - it\'s really awesome with FREE $25 to get you started with some delicious drinks at the fully cashless Amdocs Café';
config.mailInvite.bodyMid1 = 'The most active wallet user will also win a prize';
config.mailInvite.bodyMid2 = 'To download the app, search it on stores as Amdocs Wallet.';
config.mailInvite.bodyEnd = '(iOS and Android supported)';
config.mailInvite.footer = 'Cheers,';

config.sms = {};
config.sms.message = 'Check out the Amdocs Mobile Wallet with FREE $25  to buy some drinks at the Amdocs Cafe. Download the app from stores as Amdocs wallet.';
config.sms.default_sms_verification_code = '11111';
config.logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ colorize: 'true', handleExceptions: true }),
        new (winston.transports.File)({ filename: 'amdocs.log', handleExceptions: true })
    ],
    exitOnError: false
});

config.currency = {};
config.currency.type ='Dollar';
config.currency.symbol='$';
config.currency.position ='L';
config.currency.proportion =1;
config.currency.decimal='true';

config.nexmo = {};
config.nexmo.key = '3168d69c';
config.nexmo.secret = '0fe0d188';
config.nexmo.from = '525549998455';
config.nexmo.api_protocol = 'http'; //Default
config.nexmo.debug_on = 'true';
config.nexmo.debug_false = 'false';
module.exports = config;



