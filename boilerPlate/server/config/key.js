if(process.env.NODE_ENV === 'production'){ //production 배포환경
  module.exports = require('./prod') //배포환경이면 여기서
} else {                    
  module.exports = require('./dev') //development 개발환경
}