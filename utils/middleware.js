const logger = require("./logger")
const jwt = require("jsonwebtoken")
const config = require("../utils/config")


const requestLogger = (request, response, next) => {
    logger.info("Method:", request.method)
    logger.info("Path:  ", request.path)
    logger.info("Body:  ", request.body)
    logger.info("---")
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" })
}

const errorHandler = (error, request, response, next) => {

    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" })
    } else if (error.name === "ValidationError") {
        return response.status(400).json({ error: error.message })
    } else if (error.name === "JsonWebTokenError") {
        return response.status(401).json({
            error: "invalid token"
        })
    }
    logger.error(error.message)
    next(error)
}

const tokenValidation = (request, response, next) => {

    const header = request.get("authorization")
    if (!header)return response.sendStatus(401)
    const token=header.split(" ")[1]
    const { username,id } = jwt.verify(token, config.SECRET)
    Object.assign(request.body,{ username:username, userId: id })
    next()
}

module.exports = { requestLogger, unknownEndpoint, errorHandler, tokenValidation }