
exports.notification = function(req, res) {
    console.log('LENDO POST method notification ');
    console.log(req.body);
    res.send(200);
};
