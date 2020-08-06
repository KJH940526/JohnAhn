const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const saltRounds = 10
//https://d2.naver.com/helloworld/318732
//솔트는 임의 문자열을 만들어줌
//saltRounds는 문자열의 바이트의 수 npm

const jwt = require('jsonwebtoken')
const { json } = require('body-parser')

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
    var user = this; //this는 위에 있는 자기자신 userSchema를 뜻함


    //isModified는 몽구스 메소드
    //이것을 안해주면 회원가입할때 뿐만아니라 save를 할떄마다 
    //패스워드를 암호화를 한다. 따라서 
    //비밀번호를 바꿀떄만 암호화 되도록 한는법
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
});


                  //만든메소드
userSchema.methods.comparePassword = function(plainPassword, cb){

  //plainPassword는 입력하는 password이고
  console.log('2번 client 입력 : ',plainPassword)
  //2번쨰로 실행됨

  //plainPassword 입력한 비밀번호를 암호화된 비밀번호와 비교해야하는데
  //암호화된 비밀번호를 복구할수 없기떄문에
  //bcrypt로 암호화를 한 다음에 비교를한다.
  //bcrypt.compare는 bcrypt에서 지원하는 함수
                                                   //err이고 isMatch는 참이면 true이다
  bcrypt.compare(plainPassword, this.password, function(err, isMatch){

    console.log('3번',isMatch)
    //this.passwrod는 데이터베이스에 있는 암호화된 패스워드이다.
    //비밀번호가 같지 않으면 콜백함수로 err를 전달하고
    if(err) return cb(err)
    cb(null, isMatch) //에러는 없고 isMatch = ture이다.
  });
};




                  //만든메소드
              //index에서 받는 인수가 위와 달리 콜백함수 하나뿐임
userSchema.methods.generateToken = function(cb){
    var user = this; //this는 위에 있는 자기자신 userSchema를 뜻함

      console.log('5번 user._id: ', user._id)

    //토큰을 왜 만든는가??
    //jsonwebtoken을 이용해서 token을 생성한다. => requrie
    //user._id는 User모델에 들어있는 _id(몽고디비 아이디)
    
    //https://www.npmjs.com/package/jsonwebtoken
    //sing뒤에는 순수한 객체만 받기때문에 문자열 객체로 만들어줌  , 뒤에있는 secretToken은 내가 만든 이름
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    // user._id랑 secretToken이 합쳐져서 token이 생성된다.
    // 만들어진 token을 해성할떄 secretToken을 이용해서
    // user._id를 확인할수 있다.
    // user._id + secretToken = token
    // token - secretToken = user._id를 확인인 가능

    //스키마에 있는 user.token을 우리가 만든 token에 집어 넣는다.
    user.token = token

    console.log('6번 유저토큰: ',user.token)
    console.log('7번 토큰: ',token)

                          //user에는 유저정보가 들어있음
    user.save(function(err, user) {

      console.log('8번 user정보: ',user._id)
      if(err) return cb(err) //에러가 있으면 에러를 전달해주고
      cb(null, user) //에러가 null이면 user정보를 콜백해준다.
    })
}


//https://stackoverflow.com/questions/29664499/mongoose-static-methods-vs-instance-methods
//객체생성 안하고 쓸거라서 statics로 생성
                                    //userSchema에서 token을 가져옴
userSchema.statics.findByToken = function(token, cb){
  var user = this;

  //토큰을 디코드 한다.
  jwt.verify(token,'secretToken', function(err, decoded){
    //user._id와 'secretToken'으로 인코드를 했기 떄문에
    //decoded는 user._id가 나온다.
    console.log("1번 models_user decoded",decoded)

    //유저 아이디를 이용해서 유저를 찾은다음에
    //클라이언트엣허 가져온 token과 db에 보관된 토큰이 일치하는지 확인

    user.findOne({ "_id" : decoded, "token": token}, function(err, user){
      //에러가 있으면은
      if(err) return cb(err);
      //만약 에러가 없다면은
      cb(null, user)
    })
  })
}





//스키마를 모델로 감싸준다.
  //Uesr객체 생성      //DB에 들어갈 모델의 이름, 스키마                          
const User = mongoose.model('User',userSchema)

//모델을 다른 파일에서 쓰기 위해서 
module.exports =  {User} 

// export default 인 것은  {} 없이 가져올수 있습니다
// 하지만 default 아닌 것들은 {} 해서 가지고 와야 됩니다.