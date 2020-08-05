const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const saltRounds = 10
//https://d2.naver.com/helloworld/318732
//솔트는 임의 문자열을 만들어줌
//saltRounds는 문자열의 바이트의 수 npm

//꼭 읽기
//https://www.zerocho.com/category/MongoDB/post/59a1870210b942001853e250
const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    minLength: 5
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  role: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
  },
  token : {
    type: String
  },
  tokenExp: {     //토근 지속시간
    type: Number
  }
})


//pre는 몽구스에서 가져온 메소드
//'save' 유저 모델에 save하기 전에 콜백함수를 실행한다.
// 그러고 나서 next함수로 save로 보낸다
userSchema.pre('save', function( next ) {
    var user = this; //this는 위에 있는 userSchema를 뜻함
    //이것을 안해주면 회원가입할때 뿐만아니라 save를 할떄마다 
    //패스워드를 암호화를 한다. 따라서 
    //비밀번호를 바꿀떄만 암호화 되도록 한는법
    //isModified는 몽구스 메소드
    if(user.isModified('password')){
    //비밀번호를 암호화시킨다.
    //솔트는 임의 문자열..  
    bcrypt.genSalt(saltRounds, function(err, salt){
      if(err) return next(err)//에러가 생기면 save로 간다.
      //첫번쨰 인자로 암호화 이전에 패스워드          hash는 암호화된 비밀번호
      bcrypt.hash(user.password, salt, function(err, hash){
        if(err) return next(err)
        //암호화 이전에 패스워드를 hash된 비밀번호로 바꿔준다
        user.password = hash   
        next()
      })
    })
    //비밀번호를 바꾸는게 아니라 따른거를 바꿀떄는 
  } else {
      next()
  }
})


//스키마를 모델로 감싸준다.
  //Uesr객체 생성      //DB에 들어갈 모델의 이름, 스키마                          
const User = mongoose.model('User',userSchema)

//모델을 다른 파일에서 쓰기 위해서 
module.exports = { User }