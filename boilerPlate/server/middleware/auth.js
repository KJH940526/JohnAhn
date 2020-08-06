const { User } = require('models/User')

let auth = (req, res, next)=> {
  console.log("0번 클라이언트에 있는 토큰: ",req.cookies.x_auth)
  //인증처리를 하는곳

  // client 쿠키에서 토큰을 가져온다.
  let token = req.cookies.x_auth;

  // 토큰을 복호화 한다음에 데이터 베이스에서 유저를 찾는다.
  //findeByToken은 만들어준 메소드
  User.findByToken(token, (err,user)=> {
    console.log('2번 auth token: ', token)
    console.log('3번 auth user: ', user)
    if(err) throw err;
    if(!user) return res.json({ isAuth: false, error: true })

    //유저와 토큰정보를 req에 넣어주어야 그 뒤에 사용가능
    req.token = token;
    req.user = user;
    console.log('4번 auth req.token: ', req.token)
    console.log('5번 auth req.user: ', req.user)
    next()//next를 하는 이유는 미들웨어에서 다음으로 가게 하기 위해서
  })
}

module.exports = {auth}
//auth안에서 인증처리를 한다.