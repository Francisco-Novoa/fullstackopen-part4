const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const User = require("../models/users")
const api = supertest(app)


describe("when you create an user", () => {

    beforeAll(async () => {
        await User.deleteMany({})
    })

    test("you receive an appropiate status and that the name and username are saved", async () => {
        const user = ({ username: "panchote", name: "panchote", password: "password" })

        const savedUser = await api
            .post("/api/users/")
            .send(user)
            .expect(201)
            .expect("Content-Type", /application\/json/)

        const name = savedUser.body.name
        const username = savedUser.body.username

        expect(name).toContain("panchote")
        expect(username).toContain("panchote")
        expect(savedUser.body.id).toBeDefined()

    })
})

describe("when there is an error in the data", () => {
    test("if the username is to short an error is raised", async () => {
        const user = ({ username: "panch", name: "panchote", password: "password" })

        const response = await api
            .post("/api/users/")
            .send(user)
            .expect(400)
        expect(response.body.error).toContain("username length is too short. min length is 6 characters long")
    })

    test("if the name is to short an error is raised", async () => {
        const user = ({ username: "panchote", name: "panch", password: "password" })

        const response = await api
            .post("/api/users/")
            .send(user)
            .expect(400)
        expect(response.body.error).toContain("name length is too short. min length is 6 characters long")

    })

    test("if the password is to short an error is raised", async () => {
        const user = ({ username: "panchote", name: "panchote", password: "pass" })

        const response = await api
            .post("/api/users/")
            .send(user)
            .expect(400)
        expect(response.body.error).toContain("password length is too short. min length is 6 characters long")

    })

    test("if the password is missing an error is raised", async () => {
        const user = ({ username: "panchote", name: "panchote" })

        const response = await api
            .post("/api/users/")
            .send(user)
            .expect(400)
        expect(response.body.error).toContain("password, name or username missing")

    })

    test("if the username is missing an error is raised", async () => {
        const user = ({ name: "panchote", password: "password" })

        const response = await api
            .post("/api/users/")
            .send(user)
            .expect(400)
        expect(response.body.error).toContain("password, name or username missing")

    })

    test("if the name is missing an error is raised", async () => {
        const user = ({ username: "panchote",  password: "password" })

        const response = await api
            .post("/api/users/")
            .send(user)
            .expect(400)
        expect(response.body.error).toContain("password, name or username missing")

    })

    test("no new user was created", async () => {
        const savedUser = await api.get("/api/users/")
            .expect(200)
            .expect("Content-Type", /application\/json/)
        expect(savedUser.body).toHaveLength(1)

    })

})

afterAll(() => {
    mongoose.connection.close()
})