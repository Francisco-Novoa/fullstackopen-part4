const bcrypt = require("bcrypt")
const usersRouter = require("express").Router()
const User = require("../models/users")



usersRouter.post("/", async (request, response) => {

    const body = request.body

    const hasPassword = Object.prototype.hasOwnProperty.call(body, "password")
    const hasUserName = Object.prototype.hasOwnProperty.call(body, "username")
    const hasName = Object.prototype.hasOwnProperty.call(body, "name")

    if (!hasPassword || !hasUserName || !hasName) return response.status(400).send({ error: "password, name or username missing" })

    const password = body.password
    if(password.length<=6)return response.status(400).send({ error: "password length is too short. min length is 6 characters long" })

    const username = body.username
    if(username.length<=6)return response.status(400).send({ error: "username length is too short. min length is 6 characters long" })

    const name = body.name
    if(name.length<=6)return response.status(400).send({ error: "name length is too short. min length is 6 characters long" })


    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({ username,name,passwordHash })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

usersRouter.get("/", async (request, response) => {
    const user = await User.find({}).populate("blogs",{ title:1 , url:1, id:1, author:1 })
    response.json(user.map(user => user.toJSON()))
})

usersRouter.get("/:id", async (request, response) => {
    const users = await User.findById(request.params.id).populate("blogs",{ title:1 , url:1, id:1, author:1 })
    response.json(users.toJSON())
})

module.exports = usersRouter