const mongoose = require('mongoose')
const listHelper = require('../utils/list_helper')
const supertest = require('supertest')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  // console.log('cleared')

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))

  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('exercises part4', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('probandoUser', 10)

    const user = new User({
      username: 'ashelTesting',
      passwordHash
    })

    await user.save()
  })

  test('blogs are returned as json', async () => {
    // console.log('entered test')
  
    await api 
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('parameter id is correct', async () => {
    const response =  await api.get('/api/blogs')
  
    expect(response.body.map(blog => blog.id)).toBeDefined()
  })
  
  test('a valid blog can be added', async () => {
    // const usersAtStart = await helper.usersInDb()

    const userToLoggin = {
      username: 'ashelTesting',
      password: 'probandoUser'
    }

    const userLogged = await api
      .post('/api/login')
      .send(userToLoggin)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const token = userLogged.body.token

    const newBlog = {
      title: 'EcoFriends',
      author: 'Carlos M.',
      url: 'www.eco-friends.com',
      likes: 18
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}` )
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    // console.log(blogsAtEnd)
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  })
  
  test('verifing likes number', async () => {
    const newBlog = {
      title: 'test-blog',
      author: 'auth-blog',
      url: 'tes-blog.com',
      likes: undefined || 0
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    
    const likes = blogsAtEnd.map(b => b.likes)
  
    expect(likes).toBeDefined()
    // console.log(likesNumbers)
  })
  
  test('verifing title and url properties', async () => {
    const newBlog = {
      author: 'authorTest',
      likes: 0
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
    
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('a note can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
  
  test('a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToUpdateId = blogsAtStart[0].id
    
    const blogToUpdate = {
      title: 'Econatura',
      author: 'Ashel Vasquez',
      url: 'https://econatura.com',
      likes: 70
    }

    const resultBlog = await api
      .put(`/api/blogs/${blogToUpdateId}`)
      .send(blogToUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const processedBlogUpdated = JSON.parse(JSON.stringify(blogToUpdate))
    
    // console.log(resultBlog.body)

    expect(resultBlog.body.likes).toEqual(processedBlogUpdated.likes)
  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)

    const user = new User({
      username: 'asheljeje',
      passwordHash
    })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'asheldev',
      name: 'Ashel J.',
      password: 'ashelbackend'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'asheljeje',
      name: 'Raquel Gonza',
      password: 'backendTest'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode if username has missed', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'failName',
      password: 'failPass'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    // console.log(result)
    expect(result.body.error).toContain('`username` is required')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode if password has missed', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'passFail',
      name: 'namePassFail'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`password` missing')
    
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

  })

  test('creation fails with proper statuscode if password has less than 3 characters', async () => {
    const usersAtStart = helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'ol'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.errror).toContain('`password` must be at least 3 characters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
]

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0,
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0,
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0,
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0,
  },
]

const favBlog = {
  title: 'Canonical string reduction',
  author: 'Edsger W. Dijkstra',
  likes: 12
}

const mostBlogs = {
  author: 'Robert C. Martin',
  blogs: 3
}

const mostLikes = {
  author: 'Edsger W. Dijkstra',
  likes: 17
}

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])
    expect(result).toBe(0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(5)
  })

  test('of a bigger list is calculated rigth', () => {
    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(36)
  })

  test('of the favourite blog', () => {
    const result  = listHelper.favouriteBlog(blogs)
    expect(result).toEqual(favBlog)
  })
})

describe('author with', () => {
  test('most blogs', () => {
    const result = listHelper.mostBlogs(blogs)
    expect(result).toEqual(mostBlogs)
  })

  test('most likes', () => {
    const result = listHelper.mostLikes(blogs)
    expect(result).toEqual(mostLikes)
  })
})

afterAll(() => {
  mongoose.connection.close()
})