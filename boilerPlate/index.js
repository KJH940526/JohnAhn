const express = require('express')  //express modules를 가져온다
const app = express() //express 함수를 이용해서 새로운 express app을 만들고
const port = 5000     //포트번호

const bodyParser = require('body-parser')

const config = require('./config/key')

//application/x-www-form-urlencode 처럼 온 타입으로 온 데이터를 분석한다
app.use(bodyParser.urlencoded({extended: true}));

//application/json 타입으로 온 데이터를 분석해서 가져온다.
app.use(bodyParser.json());

//유저 모델을 가져온다
const { User } = require('./models/User')

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
app.post('/register',(req,res)=>{

  //회원 가입 할떄 필요한 정보들을 client에서 가져오면
  //그것들을 데이터베이스에 넣어준다.
  //객체와 인스턴스 클래스의 차이 다시 한번 보기
  //user라는 이름을가진 User객체의 인스턴스를 만들어준다.
  const user = new User(req.body)
  //req.body 안에는 json형식으로 아이디, password 이런식으로 들어온다.
  // json형식으로 되어있기 때문에 postman을 사용할때도 json으로 보낸다
  //json 형식으로 된 데이터가 들어있을수 있게하는건 bodyparser를 이용했기 분석했기 떄문
  
  //save는 몽고db 메소드이고 save를 하면 User모델에 저장이된다.
  //그 이후에 콜백함수가 온다.
  user.save((err, userInfo) => {
    if(err) return res.json({ success: false, err })
    //status(200)은 성공했다는 뜻임
    return res.status(200).json({
      success: true
    })
  })
})




//포트번호 5000번에서 만들어진 app를 실행한다.
app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})