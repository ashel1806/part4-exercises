const blogsRouter = require('express').Router()
// const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.get('/', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if(blog){
    response.json(blog)
  }else {
    response.status(404).end()
  }
})

blogsRouter.post('/', middleware.tokenExtractor , async (request, response) => {
  const body = request.body
  // console.log(request.token)
  if (body.userId === undefined) {
    body.userId = '610f965dd579692e042f19e9'
  }

  const user = await User.findById(request.user.id)

  // console.log(body.userId)
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    comments: body.comments,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.json(savedBlog)
})

blogsRouter.post('/:id/comments', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  blog.comments = blog.comments.concat(request.body.comment)

  await blog.save()

  response.json(blog)
})


blogsRouter.delete('/:id', middleware.tokenExtractor, async (request, response) => {
  const userid = request.user.id
  const blogs = await Blog.findById(request.params.id)

  if (blogs.user.toString() === userid.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } else {
    response.status(404).end() 
  }

  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const blog = request.body
  blog.user = blog.user.id

  const updateBlog = await Blog
    .findByIdAndUpdate(request.params.id, blog, { new: true })
    .populate('user')

  response.json(updateBlog)
})

module.exports = blogsRouter
