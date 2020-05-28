const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const loginRouter = require("express").Router()
const User = require("../models/users")
const config = require("../utils/config")

loginRouter.post("/", async (request, response) => {

    const body = request.body
    const user = await User.findOne({ username: body.username })

    if (!user) return response.status(401).json({ error: "username missing" })
    if (!Object.prototype.hasOwnProperty.call(body, "password")) return response.status(401).json({ error: "password missing" })

    const match = await bcrypt.compare(body.password, user.passwordHash)

    if (!match) return response.status(401).json({ error: "invalid username or password" })

    const userForToken = {
        username: user.username,
        id: user._id,
    }

    const token = jwt.sign(userForToken, config.SECRET)
    response.status(200).send({ token, username: user.username, name: user.name })

})

module.exports = loginRouter