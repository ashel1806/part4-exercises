const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'Econatura',
    author: 'Ashel Vasquez',
    url: 'https://econatura.com',
    likes: undefined
  },
  {
    title: 'Web-eando',
    author: 'Raquel Stacy',
    url: 'https://web-eando.com',
    likes: 134,
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb
}