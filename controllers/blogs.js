const blogRouter = require("express").Router()
const Blog = require("../models/blogs")

blogRouter.get("/", async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs.map(blog => blog.toJSON()))
})


blogRouter.post("/", async (request, response, next) => {
    const body = request.body
    const hasLikes = Object.prototype.hasOwnProperty.call(body, "likes")
    if (!hasLikes) {
        Object.assign(body, { "likes": 0 })
    }
    const blog = new Blog(body)
    try {
        const savedBlog = await blog.save()
        response.json(savedBlog.toJSON())
    }
    catch(error){
        next(error)
    }
})

blogRouter.put("/:id", async (request, response, next) => {
    const body = request.body
    const hasLikes = Object.prototype.hasOwnProperty.call(body, "likes")
    const hasAuthor = Object.prototype.hasOwnProperty.call(body, "author")
    const hasUrl = Object.prototype.hasOwnProperty.call(body, "url")
    const hasTitle = Object.prototype.hasOwnProperty.call(body, "title")

    if (!hasLikes&&hasAuthor&&hasUrl&&hasTitle){response.status(400).send({ "error":"some of the fields are missing" })}

    try {
        const updatedBlog =await Blog.findByIdAndUpdate(request.params.id, request.body)
        response.status(200).json(updatedBlog.toJSON())
    }
    catch(error){
        next(error)
    }
})

blogRouter.delete("/:id", async (request, response) => {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})


module.exports = blogRouter