const Report = require('../models/ReportModel');
const User = require('../models/UserModel');
const Like = require('../models/likeModel'); // Ganti dengan nama model Like yang sesuai

const addLike = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      userId
    } = req.body;

    // Menemukan report berdasarkan ID
    const report = await Report.findById(id);
    const user = await User.findById(userId);

    if (!report || !user) {
      return res.status(404).json({
        message: 'Report or user not found'
      });
    }

    // Cek apakah sudah ada like untuk report ini
    let existingLike = await Like.findOne({
      report: report._id
    });

    if (existingLike) {
      // Jika sudah ada like, tambahkan user ke dalam array user dan update jumlah likes
      existingLike.user.push(user._id);
      existingLike.likes = existingLike.user.length;
      await existingLike.save();
    } else {
      // Jika belum ada like, buat like baru
      existingLike = new Like({
        report: report._id,
        user: [user._id],
        likes: 1,
      });
      await existingLike.save();
    }

    // Memperbarui jumlah like pada report
    report.likes = existingLike.likes;
    await report.save();

    res.status(200).json({
      message: 'Like added successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};




const getLikesByReportId = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    // Menemukan semua likes berdasarkan ID laporan
    const likes = await Like.find({
      report: id
    });

    res.status(200).json({
      result: likes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};


const removeLike = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      userId
    } = req.body;

    // Menemukan like berdasarkan ID laporan
    const like = await Like.findOne({
      report: id
    });

    if (!like) {
      return res.status(404).json({
        message: 'Like not found'
      });
    }

    // Cek apakah pengguna telah melakukan like pada laporan ini
    const userIndex = like.user.indexOf(userId);

    if (userIndex !== -1) {
      // Hapus ID pengguna dari array user dan kurangi jumlah likes
      like.user.splice(userIndex, 1);
      like.likes = like.user.length;
      await like.save();

      // Memperbarui jumlah likes pada laporan
      const report = await Report.findById(id);
      report.likes = like.likes;
      await report.save();

      res.status(200).json({
        message: 'Like removed successfully'
      });
    } else {
      res.status(400).json({
        message: 'User has not liked this report'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};



module.exports = {
  addLike,
  getLikesByReportId,
  removeLike,
};