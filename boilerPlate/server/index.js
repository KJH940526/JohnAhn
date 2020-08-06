const express = require('express')  //express modules를 가져온다
const app = express() //express 함수를 이용해서 새로운 express app을 만들고
const port = 5000     //포트번호

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const config = require('./config/key')

//application/x-www-form-urlencode 처럼 온 타입으로 온 데이터를 분석한다
app.use(bodyParser.urlencoded({extended: true}));

//application/json 타입으로 온 데이터를 분석해서 가져온다.
app.use(bodyParser.json());

//쿠키에 저정하기 위해서는 express에서 제공!!!하는 
//cookieparser가 필요하다
app.use(cookieParser())
//bodyparser 역시 express에서 제공한다.

const { auth } = require('./middleware/auth')

//유저 모델을 가져온다
const { User } = require('models/User')
// export default 인 것은  {} 없이 가져올수 있습니다
// 하지만 default 아닌 것들은 {} 해서 가지고 와야 됩니다.

const mongoose = require('mongoose')

// https://mongoosejs.com/docs/deprecations.html //use 설정에대한 설명이 있음
//{}를 객체, []를 배열  
//개발 환경에서는 mongoURI는 key.js를 통해서 dev.js에 있는 mongoURI를 가져온거
//config 객체 안에있는 mongoURI라는 속성에 접근
mongoose.connect(config.mongoURI,{
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(()=>console.log('몽고DB 연결중...'))
  .catch(err => console.log(err))


// '/'는 보내는 주소
// (req, res)는 콜백함수
// req 는 말그대로 요청을 하는것이고
// res 는 값읕 반환해준다고 생각을 하면된다.
// 따라서 "/"는 주소이고 res를 통해서 hello wrold!를 보여준다
app.get('/', (req, res) => {
  res.send('Hello World!')
})



//회원가입을 위한 라우트(경로)를 만듬
//라우트(경로) 라우팅(경로를 찾아가게 하는 과정)
app.post('/api/users/register',(req,res)=>{

  
  console.log('clinet에서 입력: ',req.body)

  //회원 가입 할떄 필요한 정보들을 client에서 가져오면
  //그것들을 데이터베이스에 넣어준다.
  //객체와 인스턴스 클래스의 차이 다시 한번 보기
  //user라는 이름을가진 User객체의 인스턴스를 만들어준다.
  const user = new User(req.body)

  //req.body 안에는 json형식으로 아이디, password 이런식으로 들어온다.
  // json형식으로 되어있기 때문에 postman을 사용할때도 json으로 보낸다
  //json 형식으로 된 데이터가 들어있을수 있게하는건 bodyparser를 이용했기 분석했기 떄문
  
  //save를 하기전에 패스워드를 암호회해줘야한다.
  //save는 몽고db 메소드이고 save를 하면 User모델에 저장이된다.
  //그 이후에 콜백함수가 온다.
  user.save((err, userInfo) => {

    console.log('save메소드를 통해서 저장이 된 유저정보: ', userInfo)

    if(err) return res.json({ success: false, err })
    //status(200)은 성공했다는 뜻임
    return res.status(200).json({
      success: true
    })
  })
})



app.post('/api/users/login',(req,res)=>{

  console.log("0번 클라이언트에서 입력: ",req.body)
  //1. 데이터베이스 안에서 요청한 E-mail 찾기
  //객체 User안에 있는 User모델을 가져온다.
  //const User = mongoose.model('User',userSchema)
  //터미널창을 보면 0번과 1번 사이에 몽고 DB연결중.. 이라는 로그창이 보이는데
  //이는 User.fineOne을 통해서 몽고db에 접속하기 떄문이다.
  
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  //email은 데이터베이스에 있는거고
  //req.body.email은 클라이언트에서 요청받은 이메일
                                      //user정보가 들어있음
  User.findOne({ email: req.body.email}, (err, user)=> {

    console.log('1번 clinet 입력: ',req.body.email) //클라이언트에서 요청하는
    //1번으로 실행됨
    console.log('1-1번 DB에 있는 user정보: ',user)

    if(!user){
      return res.json({
        loginSuccess: false,
        message : "제공된 이메일에 해당하는 유저가 없습니다."
      });
    }
  //2. 데이트베이스 안에서 요청한 E-mail이 있다면 비밀번호가 같은지 확인
  //요청된 이메일이 데이터 베이스 있다면 비밀번호가 맞는 비밀번호인지 확인
  //user에는 user정보가 들어있음
  //req.body.password는 클라이언트에서 입력한 비밀번호
  //comparePasswrod                                              
                  //클라이언트비밀번호가 맞다면 isMatch를 가져옴
  user.comparePassword(req.body.password, (err, isMatch)=>{
  //매소드를 유저 model에서 만듬
    
    console.log('4번 index isMatch: ', isMatch)
    
    // console.log(req.body.password)
    if(!isMatch)
    return res.json({ 
      loginSuccess : false, 
      message: "비밀번호가 틀렸습니다"
    })
  
    //3.비밀번호가 같다면 Token 생성
    //토큰을 생성하기 위해서 jsonwebtoken 모듈을 인스톨한다.
    //https://www.npmjs.com/package/jsonwebtoken
                            //user에는 토큰이 생성된 유저정보가 있다.
    user.generateToken((err, user)=>{
        //매소드를 유저 model에서 만듬

      console.log('9번 user정보: ',user)
      
        if(err) return res.status(400).send(err);

        //토큰을 저장한다. 어디에? 쿠키, 로컬스토리지에 저장하지만
        //여기서는 쿠키에다가 저장한다.
        //쿠키에 저정하기 위해서는 express에서 제공하는 cookieparser가 필요하다
        //현재 user에는 model에 user에서 만들어진 토큰이 들어있다
        //
        res.cookie('x_auth: ',user.token)
          .status(200)
                                            //user.id는 몽고디비 고유아이디
          .json({loginSuccess: true, userId: user._id})
        // Cookies that have not been signed

        // console.log('Cookies: ', req.cookies)
        // console.log('x_auth: ',user.token)
        // // Cookies that have been signed
        // console.log('Signed Cookies: ', req.signedCookies)        
      })
    })
  })
})


                            //auth라는 미들웨어
//미들웨어란? '/api/users/auth라는 엔드포인트에
//리퀘스트를 받은 다음에 콜백함수를 실행하기전에 
//중간에서 실행된다.
app.get('/api/users/auth', auth ,(req,res)=>{
  //여기까지 미들웨어를 통과해 왔다는 이야기는
  //Authentication이 True라는 말.
  //따라서 True임을 클라이언트에 전달하기 위해서
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  })
//role이 0이면 일반유저 role이 0이 아니면 관리자
//어떤 페이지에서든지 유저정보를 주기 때문에 모든 데이터가 있어야한다.
})


//로그아웃
//로그아웃 하려는 유저를 데이터베이스에 찾아서
//데이터 베이스의 토큰을 삭제한다. 토큰을 삭제하는 이유는??
//데이터베이스에서 토큰을 지우면 클라이언트에서 가져오는 토큰과
//같지 않기 떄문에 인증이 되지 않는다.
//토큰이용해서 로그인 유지를 하기 때문에
//토큰만 사라지면 자동으로 로그아웃이 된다. => 토큰을 지운다.
                          //auth가 있는 이유는 
app.get("/api/users/logout", auth, (req,res)=>{
  console.log("6번 req.user", req.user);
      //_id는 db에 있는 _id   //req.user._id는 auth 미들웨어에서 가져온다.
  User.findByIdAndUpdate({_id: req.user._id}, //검색대상
    { token: ""},//수정대상 //아틀라스에서 확인하기
    (err,user)=>{
      if(err) return res.json({success: false, err})
      return res.status(200).send({
        success:true
      })
    })
})





//포트번호 5000번에서 만들어진 app를 실행한다.
app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})