const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const Blog = require("../models/blogs")


const api = supertest(app)

const initialBlogs = [
    { title: "Canonical string reduction", author: "Edsger W. Dijkstra", url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html", likes: 12 },
    { title: "React patterns", author: "Michael Chan", url: "https://reactpatterns.com/", likes: 7 }
]

beforeEach(async () => {
    await Blog.deleteMany({})

    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()

    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})
describe("when there are some blogs saved initially", () => {
    test("blogs are returned as json", async () => {
        await api
            .get("/api/blogs/")
            .expect(200)
            .expect("Content-Type", /application\/json/)
    })
    test("all blogs are returned", async () => {
        const response = await api.get("/api/blogs/")
        expect(response.body).toHaveLength(initialBlogs.length)
    })
    test("the blogs id are returned apropiately", async () => {
        const response = await api.get("/api/blogs/")
        expect(response.body[0].id).toBeDefined()
    })
})
describe("when posting a new blog", () => {
    test("the new Blog can be Posted and its contents are intact", async () => {
        await api
            .post("/api/blogs/")
            .send(
                {
                    title: "TDD harms architecture",
                    author: "Robert C. Martin",
                    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
                    likes: 0
                }
            )
        const response = await api.get("/api/blogs/")
        const titles = response.body.map(r => r.title)
        const authors = response.body.map(r => r.author)
        const urls = response.body.map(r => r.url)

        expect(response.body).toHaveLength(initialBlogs.length + 1)
        expect(titles).toContainEqual("TDD harms architecture")
        expect(authors).toContainEqual("Robert C. Martin")
        expect(urls).toContainEqual("http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html")

    })
    test("a new Blog with 'likes' missing receives default value", async () => {
        await api
            .post("/api/blogs/")
            .send(
                {
                    title: "TDD harms architecture",
                    author: "Robert C. Martin",
                    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
                }
            )
        const response = await api.get("/api/blogs/")
        const martin = response.body.find((elem) => elem.author === "Robert C. Martin")
        expect(martin.likes).toBeDefined()
    })
    test("a new Blog with 'title' missing receives a 400 Bad Request error", async () => {
        await api
            .post("/api/blogs/")
            .send(
                {
                    author: "Robert C. Martin",
                    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
                    likes: 0
                }
            )
            .expect(400)
    })
    test("a new Blog with 'url' missing receives a 400 Bad Request error", async () => {
        await api
            .post("/api/blogs/")
            .send(
                {
                    title: "TDD harms architecture",
                    author: "Robert C. Martin",
                    likes: 0
                }
            )
            .expect(400)
    })
    test("a new Blog with 'author' missing receives a 400 Bad Request error", async () => {
        await api
            .post("/api/blogs/")
            .send(
                {
                    title: "TDD harms architecture",
                    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
                    likes: 0
                }
            )
            .expect(400)
    })
})
describe("when deleting a blog", () => {
    test("the aproppiate status is send, the response is smaller and the deleted object is no longer there", async () => {
        const response = await api.get("/api/blogs/")
        expect(response.body[0].id).toBeDefined()
        await api
            .delete(`/api/blogs/${response.body[0].id}`)
            .expect(204)
        const newResponse = await api.get("/api/blogs/")
        expect(newResponse.body).toHaveLength(response.body.length - 1)
        const dijkstra = newResponse.body.find((elem) => elem.author === "Edsger W. Dijkstra")
        expect(dijkstra).toBeUndefined()
    })
})
describe("when updating a blog", () => {
    test("the new Blog can be updated and its contents are correct", async () => {
        const response = await api.get("/api/blogs/")
        await api
            .put(`/api/blogs/${response.body[0].id}`)
            .send(
                {
                    title: "el super awesome blog nuevo",
                    author: "el super awesome autor",
                    url: "http://lasuperawesomeurl.url",
                    likes: 0
                }
            )
        const newResponse = await api.get("/api/blogs/")
        const titles = newResponse.body.map(r => r.title)
        const authors = newResponse.body.map(r => r.author)
        const urls = newResponse.body.map(r => r.url)

        expect(newResponse.body).toHaveLength(initialBlogs.length)
        expect(titles).toContainEqual("el super awesome blog nuevo")
        expect(authors).toContainEqual("el super awesome autor")
        expect(urls).toContainEqual("http://lasuperawesomeurl.url")

    })
})


afterAll(() => {
    mongoose.connection.close()
})