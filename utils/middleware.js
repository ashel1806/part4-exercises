const logger = require('./logger')
const jwt = require('jsonwebtoken')

const requestLogger = (request, response, next) => {
  logger.info('Method: ', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndPoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  
  if(error.message === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if(error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }else if(error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }

  logger.error(error.message)
  
  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.headers.authorization

  if (authorization && authorization.startsWith('bearer')) {
    request.token = authorization.split(' ')[1]
  } 

  if (!request.token) {
    return response.status(401).json({ error: 'token missing' })
  }

  const decoded = jwt.verify(request.token, process.env.SECRET)

  if(decoded) {
    request.user = decoded
    next()
  }else {
    request.status(400).json({ error: 'token invalid' })
    next()
  }
}

module.exports = {
  requestLogger,
  unknownEndPoint,
  errorHandler,
  tokenExtractor
}