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
config.orders.errMsg = 'Ha ocurrido un error';
config.orders.emptyMsg = 'No hay ' + config.orders.status + ' ordenes';

config.loans = {};
config.loans.status = {NEW : 'NEW' ,ACCEPTED : 'ACCEPTED' , REJECTED : 'REJECTED' };
config.loans.errMsg = 'Ha ocurrido un error';
config.loans.emptyMsg = 'No hay ' + config.loans.status + ' prestamos';

config.products = {};
config.products.status = 'IN STOCK';
config.products.errMsg = 'Ha ocurrido un error';
config.products.emptyMsg = 'No existen productos ' + config.products.status;
config.products.emptyInventory = 'El inventario esta vacío';

config.merchants = {};
config.merchants.errMsg = 'Ha ocurrido un error';
config.merchants.emptyMsg = 'El distribuidor no existe ';

config.S3 = {};
config.S3.url = process.env.AS3_IMAGES;

config.messages = {};
config.messages.status = { READ : 'READ' ,NOTREAD : 'NOTREAD', DELIVERED: 'DELIVERED'};
config.messages.type = { TRANSFER:'TRANSFER' , GIFT : 'GIFT' , BUY :'BUY' ,LOAN :'LOAN', COUPON: 'COUPON' , REQUEST_MONEY : 'REQUEST_MONEY' , MESSAGE : 'MESSAGE' };
config.messages.transferMsg = 'Ha recibido dinero de ';
config.messages.giftMsg = '¡ [sender] te han invitado una margarita de AGS Nasoft Wallet!';
config.messages.loanRequestMsg = 'Ha solicitado un prestamo por €';
config.messages.loanRejectedMsg = 'Genera puntos y podrás ser eligible para un prestamo';
config.messages.loanRejectedOneMsg = '¡Lo sentimos! Tiene un prestamo reciente, necesita esperar para solicitar otro ';
config.messages.loanRejectedTwoMsg = ' minutos y ser elegible para un prestamo!';
config.messages.loanAcceptedMsg = '¡Felicitaciones! Su prestamo ha sido aprobado!';
config.messages.action = {TRANSFER:1 , GIFT :2 , BUY :3 ,LOAN : 4, COUPON: 5 };
config.messages.transferFund = 'You have sent a Transfer to ';
config.messages.coupon = {};
config.messages.coupon.message = '¡Felicitaciones! Tu eres el ganador de la promoción “La puntuación mas alta del día ganará unas bocinas bluetooth” ! Estaremos en contacto a la brevedad contigo!';
//config.messages.coupon.message = 'Congratulations! You are today’s winner of “Don’t Miss a  surprise gift with DOX” promotion! We will be in touch shortly' ;
config.messages.coupon.title = '¡Felicitaciones! ¡Has ganado un premio!'
config.messages.inviteError = '¡Lo sentimos! Has excedido el máximo número de invitaciones!'

config.messages.twitter = { message :'Acabo de comprar una {0} en el Stand AGS Nasoft a las {1} !!!!' , url :''};
config.messages.twitter1 = 'Acabo de comprar una ';
config.messages.twitter2 = ' de Stand AGS Nasoft a las';
config.messages.twitterURL = '';
config.messages.twitterMsg = 'Teniendo un gran día en #sapforum 2015 en Mexico DF, disfrutando de una deliciosa bebida comprada con mi AGS NASOFT Wallet! ';
config.messages.facebook =	{
								name:'Stand AGS Nasoft',
								caption:'Acabo de comprar una bebida',
								description:'Acabo de descargar mi app wallet ',
								link:' https://forummexico2015.sapevents.com/'
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

config.prizes = {};
config.prizes.top = 1;

config.conn = {};
config.username = 'anzen_01';
config.pin = '1234';

config.mail = {};
config.mail.bodyPin= 'Gracias por registrarte con tu wallet! Tu número de PIN es: ';
config.mail.bodyFin='Ahora puedes comprar una margarita  o invitar una a un amigo, también puedes  compartir tu compra en tus redes sociales, todas estas acciones  te dan puntos, con ellos podrás ganar premios increibles .';
config.mail.regards='¡Gracias!';
config.mail.footer='Stand AGS Nasoft';

config.mailInvite = {}
config.mailInvite.header = 'Hola,';
config.mailInvite.bodyInit = 'Echale un vistazo a la App AGS NASOFT Wallet  - Es realmente impresionante  con $100.00 MXN GRATIS para empezar, con deliciosas bebidas   !';
config.mailInvite.bodyMid1 = 'El usuario mas activo en el wallet  ganará unas bocinas bluetooth';
config.mailInvite.bodyMid2 = 'Para descargar la aplicación, simplemente has click en el siguiente link desde tu dispositivo móvil';
config.mailInvite.bodyEnd = '(soporte para iOS y Android )';
config.mailInvite.footer = 'Saludos, ';



config.logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ colorize: 'true', handleExceptions: true }),
        new (winston.transports.File)({ filename: 'amdocs.log', handleExceptions: true })
    ],
    exitOnError: false
});

module.exports = config;
