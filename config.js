var config = {};
var winston = require('winston');

winston.colors = {
    info: 'green',
    warn: 'yellow',
    error: 'red'
};

config.sendGrid = {};
config.sendGrid.user = 'dannywf@anzen.com.mx';
config.sendGrid.password = 'Anzen7924';

config.group ={}
config.group.env = {INTERNAL: 'INTERNAL' , PUBLIC : 'PUBLIC'};

config.orders = {};
config.orders.status = {NEW : 'NEW' ,IN_PROGRESS : 'IN PROGRESS' , READY : 'READY' , DELIVERED : 'DELIVERED' , CANCELED : 'CANCELED' };
config.orders.errMsg = 'Something went wrong';
config.orders.emptyMsg = 'There are no ' + config.orders.status + ' orders';

config.loans = {};
config.loans.status = {NEW : 'NEW' ,ACCEPTED : 'ACCEPTED' , REJECTED : 'REJECTED' };
config.loans.errMsg = 'Something went wrong';
config.loans.emptyMsg = 'There are no ' + config.loans.status + ' loans';

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
config.messages.type = { TRANSFER:'TRANSFER' , GIFT : 'GIFT' , BUY :'BUY' ,LOAN :'LOAN', COUPON: 'COUPON' , REQUEST_MONEY : 'REQUEST_MONEY' , MESSAGE : 'MESSAGE' };
config.messages.transferMsg = 'You have received money from ';
config.messages.giftMsg = '[sender] has gifted you an Amdocs Café voucher';
config.messages.loanRequestMsg = 'You have requested a loan for €';
config.messages.loanRejectedMsg = 'Build up your Dox score to be elegible for a loan';
config.messages.loanRejectedOneMsg = 'Sorry,Since you recently availed a loan, you need to wait another ';
config.messages.loanRejectedTwoMsg = ' minutes to become eligible for a new loan';
config.messages.transferRejectedOneMsg = 'Sorry, you have exceded transfers in last hour, you need to wait next hour for make new transfers';
config.messages.giftRejectedOneMsg = 'Sorry, you have exceeded your number of gifts per hour';
config.messages.buyRejectedOneMsg = 'Sorry, you have exceeded your number of buys per hour. Please return home';
config.messages.loanAcceptedMsg = 'Congratulations,Your Instan-Loan is approved';
config.messages.action = {TRANSFER:1 , GIFT :2 , BUY :3 ,LOAN : 4, COUPON: 5 };
config.messages.transferFund = 'You have sent a Transfer to ';
config.messages.coupon = {};
config.messages.coupon.message = 'Congratulations You are today’s winner of “Highest DOX score of the day wins an iPhone 6” promotion! We will be in touch shortly, along with your iPhone6 ';
config.messages.coupon.title = 'Congratulations, You won an iPhone6'
config.messages.inviteError = 'Sorry, You have exceeded your number of invitations'

config.messages.twitter = { message :'I just bought a {0} from AmdocsCafe at {1}' , url :''};
config.messages.twitter1 = 'I just bought a ';
config.messages.twitter2 = ' from AmdocsCafe at ';
config.messages.twitterURL = '';
config.messages.twitterMsg = 'Having a great time at #MWC15 in Barcelona, enjoying the delicious coffee bought with my #AmdocsWallet';
config.messages.facebook =	{
								name:'Amdocs Wallet',
								caption:'I just bought a coffee',
								description:'Just downloaded my Amdocs Wallet at Mobile World Congress 2015 Looking forward to the delicous coffee at the fully cashless Amdocs Café, now open at Fira Gran Via, Barcelona',
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
config.mailInvite.bodyInit = 'Check out the Amdocs Mobile Wallet  - it\'s really awesome with FREE €5 to get you started with some delicious drinks at the fully cashless Amdocs Café';
config.mailInvite.bodyMid1 = 'The most active wallet user will also win an iPhone 6';
config.mailInvite.bodyMid2 = 'To download the app , simply click on below link from your mobile device - ';
config.mailInvite.bodyEnd = '(iOS and Android supported)';
config.mailInvite.footer = 'Cheers,';

config.sms = {};
config.sms.message = 'Check out the Amdocs Mobile Wallet with FREE 5 EUR to buy some drinks at the Amdocs Cafe. Download the iOS and Android app from here www.goo.gl/B8HdBj.';
config.logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ colorize: 'true', handleExceptions: true }),
        new (winston.transports.File)({ filename: 'amdocs.log', handleExceptions: true })
    ],
    exitOnError: false
});

module.exports = config;
