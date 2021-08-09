// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((likes, item) => {
    return likes + item.likes
  }, 0)
}

const favouriteBlog = (blogs) => {
  let maxLikes = 0
  return blogs.reduce((acc, cur, idx) => {
    if(idx < blogs.length) {
      if(cur.likes > maxLikes) {
        maxLikes = cur.likes
        acc = {
          title: cur.title,
          author: cur.author,
          likes: cur.likes
        }
      }
    }

    return acc
  })
}

const mostBlogs = (blogs) => {
  let cont = 0
  return blogs.reduce((acc, cur, idx, arr) => {
    let numBlogs = 0
    arr.forEach(item => {
      if(item.author === cur.author) numBlogs++      
    })

    if(numBlogs > cont){
      cont = numBlogs
      acc = {
        author: cur.author,
        blogs: cont
      }
    }

    return acc
  }, {})
}

const mostLikes = (blogs) => {
  let maxLikes = 0
  return blogs.reduce((acc, cur, idx, arr) => {
    let contLikes = 0
    
    arr.forEach(item => {
      if(item.author === cur.author){
        contLikes += item.likes
        
      }
    })
   
    if(contLikes > maxLikes){
      maxLikes = contLikes
      acc = {
        author: cur.author,
        likes: maxLikes
      }
    }

    return acc
  },{})
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes
}