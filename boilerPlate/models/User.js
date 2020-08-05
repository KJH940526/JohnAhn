const mongoose = require('mongoose')

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

//스키마를 모델로 감싸준다.
                          //DB에 들어갈 모델의 이름, 스키마
const User = mongoose.model('User',userSchema)

//모델을 다른 파일에서 쓰기 위해서 
module.exports = { User }