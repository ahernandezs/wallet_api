  console.log('execute POST method login');
  console.log(req.body);
  sessionUser.searchFlow(req.body,function(err,result){
      if(result.statusCode === 0){
        res.setHeader('X-AUTH-TOKEN', result.sessionid);
        delete result.sessionid;
      }
      res.json(result);
  });
