const mongoose = require('mongoose')
const { Schema, model } = mongoose

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 5
  },
  author: {
    type: String,
    required: true,
    minlength: 5
  },
  url: {
    type: String,
    required: true,
  },
  likes: Number,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [ String ]
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = model('Blog', blogSchema)
