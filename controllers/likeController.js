
const Report = require('../models/ReportModel');

const addLike = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      nim
    } = req.body; // Menambahkan field NIM dari body request

    // Menemukan report berdasarkan ID
    const report = await Report.findById(id);

    // Memeriksa apakah report.likes adalah array
    if (!Array.isArray(report.likes)) {
      report.likes = [];
    }

    // Memeriksa apakah pengguna dengan NIM yang sama sudah melike sebelumnya
    if (report.likes.find(like => like.nim === nim)) {
      return res.status(409).json({
        message: 'You have already liked this report'
      });
    }

    // Menambahkan like ke dalam array likes pada report
    report.likes.push({
      nim
    });
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


const removeLike = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const {
      nim
    } = req.body; // Menambahkan field NIM dari body request

    // Menemukan report berdasarkan ID
    const report = await Report.findById(id);

    // Mencari index like yang sesuai dengan NIM pengguna
    const likeIndex = report.likes.findIndex(like => like.nim === nim);

    // Jika NIM pengguna tidak ditemukan dalam daftar likes
    if (likeIndex === -1) {
      return res.status(404).json({
        message: 'You have not liked this report'
      });
    }

    // Menghapus like dari array likes pada report
    report.likes.splice(likeIndex, 1);
    await report.save();

    res.status(200).json({
      message: 'Like removed successfully'
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
    const { id } = req.params;
    // Menemukan report berdasarkan ID
    const report = await Report.findById(id);

    // Mengembalikan jumlah like pada laporan
    res.status(200).json({ likes: report.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
  addLike,
  getLikesByReportId,
  removeLike,
};
