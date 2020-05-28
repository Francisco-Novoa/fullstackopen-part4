const blogRouter = require("express").Router()
const Blog = require("../models/blogs")
const User = require("../models/users")
const middleware= require("../utils/middleware")


const hasEverything = (body) => {
    if (!Object.prototype.hasOwnProperty.call(body, "author")) return { error: true, where: "author" }
    if (!Object.prototype.hasOwnProperty.call(body, "url")) return { error: true, where: "url" }
    if (!Object.prototype.hasOwnProperty.call(body, "title")) return { error: true, where: "title" }
    return { error: false }
}

blogRouter.get("/", async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs.map(blog => blog.toJSON()))
})

blogRouter.get("/:id", async (request, response) => {
    const blogs = await Blog.findById(request.params.id).populate("user", { username: 1, id: 1 })
    response.json(blogs.toJSON())
})

blogRouter.post("/", middleware.tokenValidation , async (request, response) => {
    const body = request.body
    //check if the request has the data appropiate
    const check = hasEverything(body)
    if (check.error) response.status(400).send({ "error": `${check.where} field missing` })
    if (!Object.prototype.hasOwnProperty.call(body, "likes")) Object.assign(body, { "likes": 0 })
    //find and adds the user data to the blog
    const user = await User.findById(body.userId)
    const blog = new Blog(body)
    Object.assign(blog,{ user:user.id  })
    //save the blog
    const savedBlog = await blog.save()
    //actualize the user
    user.blogs = user.blogs.concat(savedBlog._id)
    await User.findByIdAndUpdate(user.id, user)
    //sends the response
    response.json(savedBlog.toJSON())
})

blogRouter.put("/:id", middleware.tokenValidation, async (request, response) => {
    const body = request.body

    //verify that the request body has valid fields

    const check = hasEverything(body)
    if (check.error) return response.status(400).send({ "error": `${check.where} field missing` })
    if (!Object.prototype.hasOwnProperty.call(body, "likes")) return response.status(400).send({ "error": "likes field missing" })

    //verify if the user modifying the blog is the same that created it
    const blog= await Blog.findById(request.params.id)
    if (blog.user.toString()!==body.userId) return response.sendStatus(403)

    //actualize the blog

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, { title:body.title, author:body.author, url:body.url,likes:body.likes }, { new:true })
    response.status(200).json(updatedBlog.toJSON())

})

blogRouter.delete("/:id", middleware.tokenValidation, async (request, response) => {
    const blog= await Blog.findById(request.params.id)
    if (blog.user._id.toString()!==request.body.userId) return response.sendStatus(403)
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})


module.exports = blogRouter