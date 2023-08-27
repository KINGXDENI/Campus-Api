const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
  },
  user: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  likes: {
    type: Number,
    default: 0, // Ubah default menjadi 0
  },
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
