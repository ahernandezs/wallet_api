var config = {};

config.sendGrid = {};
config.sendGrid.user = 'dannywf@anzen.com.mx';
config.sendGrid.password = 'Anzen7924';

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
config.S3.url = 'https://s3-us-west-1.amazonaws.com/amdocs-images/profile/';

config.messages = {};
config.messages.status = { READ : 'READ' ,NOTREAD : 'NOTREAD', DELIVERED: 'DELIVERED'};
config.messages.type = { TRANSFER:'TRANSFER' , GIFT : 'GIFT' , BUY :'BUY' ,LOAN :'LOAN', COUPON: 'COUPON' };
config.messages.transferMsg = 'You have received money from ';
config.messages.giftMsg = 'You have received a coffee gift!!!';
config.messages.loanRequestMsg = 'You have requested a loan for €';
config.messages.loanRejectedMsg = 'Build up your Dox score to be elegible for a loan';
config.messages.action = {TRANSFER:1 , GIFT :2 , BUY :3 ,LOAN : 4, COUPON: 5 };
config.messages.transferFund = 'You have sent a Transfer to ';
config.messages.coupon = {};
config.messages.coupon.message = 'Congratulations! You are today’s winner of “Don’t Miss a Beat with DOX” promotion! We will be in touch shortly, along with your Beats Studio headsets!';
config.messages.coupon.title = 'Congratulations! You won a prize!!'

config.messages.twitter = { message :'I just bought a {0} from AmdocsCafe at {1} !!!!' , url :''};
config.messages.twitter1 = 'I just bought a ';
config.messages.twitter2 = ' from AmdocsCafe at ';
config.messages.twitterURL = '';
config.messages.twitterMsg = 'Having a great time at #mmglobal in Istanbul, enjoying the delicious coffee bought with my #AmdocsWallet !!';
config.messages.facebook =	{
								name:'AmdocsCafe',
								caption:'I just bought a coffee',
								description:'Just dowloaded my Amdocs Wallet at Mobile Money Global! Looking forward to the delicous coffee at the fully cashless Amdocs Café, now open at Grand Wyndham, Istanbul',
								link:'',
								picture: '',
							};
config.doxs = {};

config.doxs.linking = 500; //link to twitter/facebook
config.doxs.social = 1000; //Invite a friend
config.doxs.p2p = 1000;	   //Transfer money to a friend
config.doxs.profile = 1000;//Complete profile
config.doxs.pic = 1000;	   //Photo
config.doxs.payment = 1500;//Make a purchase
config.doxs.gift = 1000    //Send a gift to a friend
config.doxs.twitter = 1000;
config.doxs.facebook = 1000;
config.doxs.instagram = 1000;
config.doxs.invite = 1000;

config.prizes = {};
config.prizes.top = 1;

config.conn = {};
config.username = 'anzen_01';
config.pin = '1234';

config.mail = {};
config.mail.bodyPin= 'Thank you for registering with Amdocs wallet! Your pin number is: ';
config.mail.bodyFin='Now you can buy a coffee or just send a coffee to a friend, also you can share your buy in your social networks, all these actions give you Dox points, with Dox points you could win some amazing prizes.';
config.mail.regards='Thanks!';
config.mail.footer='Amdocs wallet Team';

module.exports = config;
