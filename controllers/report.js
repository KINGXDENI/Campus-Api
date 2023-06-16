const path = require('path');
const fs = require('fs');
const Report = require('../models/Report');
const multer = require('multer');

// Konfigurasi penyimpanan file menggunakan multer
const storage = multer.diskStorage({
    destination: './public/images',
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fileName = file.fieldname + '-' + Date.now() + ext;
        cb(null, fileName);
    }
});

// Filter tipe file yang diizinkan
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname);
    if (allowedTypes.includes(ext.toLowerCase())) {
        cb(null, true);
    } else {
        cb(new Error('Invalid Image Type'));
    }
};

// Inisialisasi multer dengan konfigurasi yang telah ditentukan
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5000000 // Batasan ukuran file: 5MB
    }
}).single('file');

const saveReport = async (req, res) => {
    try {
        const {
            title,
            lokasi,
            nim,
            deskripsi
        } = req.body;

        upload(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                // Penanganan kesalahan multer
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(422).json({
                        msg: 'Image must be less than 5 MB'
                    });
                } else {
                    return res.status(500).json({
                        msg: 'Failed to upload file'
                    });
                }
            } else if (err) {
                // Penanganan kesalahan lainnya
                console.log(err);
                return res.status(500).json({
                    msg: 'Failed to upload file'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    msg: 'No File Uploaded'
                });
            }

            const fileName = req.file.filename;
            const url = `${req.protocol}://${req.get('host')}/images/${fileName}`;

            try {
                await Report.create({
                    perihal: title,
                    lokasi: lokasi,
                    gambar: fileName,
                    deskripsi: deskripsi,
                    URL: url,
                    status: 'Diproses',
                    nim: nim,
                });

                res.status(201).json({
                    msg: 'Report Created Successfully'
                });
            } catch (error) {
                console.log(error);
                res.status(500).json({
                    msg: 'Internal Server Error'
                });
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            msg: 'Internal Server Error'
        });
    }
};

const getReports = async (req, res) => {
    try {
        const response = await Report.find();
        res.json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            msg: 'Internal Server Error'
        });
    }
};

const getReportById = async (req, res) => {
    try {
        const response = await Report.findOne({
            where: {
                id: req.params.id,
            },
        });

        if (!response) {
            return res.status(404).json({
                msg: 'No Data Found'
            });
        }

        res.json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            msg: 'Internal Server Error'
        });
    }
};

const updateReport = async (req, res) => {
    try {
        const report = await Report.findOne({
            where: {
                id: req.params.id,
            },
        });

        if (!report) {
            return res.status(404).json({
                msg: 'No Data Found'
            });
        }

        const {
            lokasi,
            deskripsi,
            title,
            status
        } = req.body;

        let fileName = report.gambar;

        if (req.files && req.files.file) {
            const file = req.files.file;
            const fileSize = file.data.length;
            const ext = path.extname(file.name);
            fileName = file.md5 + ext;
            const allowedTypes = ['.png', '.jpg', '.jpeg'];

            if (!allowedTypes.includes(ext.toLowerCase())) {
                return res.status(422).json({
                    msg: 'Invalid Image Type'
                });
            }
            if (fileSize > 5000000) {
                return res.status(422).json({
                    msg: 'Image must be less than 5 MB'
                });
            }

            const filepath = `./public/images/${report.gambar}`;
            fs.unlinkSync(filepath);

            file.mv(`./public/images/${fileName}`, (err) => {
                if (err) {
                    return res.status(500).json({
                        msg: err.message
                    });
                }
            });
        }

        const url = `${req.protocol}://${req.get('host')}/images/${fileName}`;

        await Report.update({
            perihal: title,
            lokasi: lokasi,
            gambar: fileName,
            deskripsi: deskripsi,
            URL: url,
            status: status,
        }, {
            where: {
                id: req.params.id,
            },
        });

        res.status(200).json({
            msg: 'Report Updated Successfully'
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            msg: 'Internal Server Error'
        });
    }
};

const deleteReport = async (req, res) => {
    try {
        const report = await Report.findOne({
            where: {
                id: req.params.id,
            },
        });

        if (!report) {
            return res.status(404).json({
                msg: 'No Data Found'
            });
        }

        const filepath = `./public/images/${report.gambar}`;

        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        await Report.destroy({
            where: {
                id: req.params.id,
            },
        });

        res.status(200).json({
            msg: 'Report Deleted Successfully'
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            msg: 'Internal Server Error'
        });
    }
};

module.exports = {
    getReports,
    getReportById,
    saveReport,
    updateReport,
    deleteReport,
};
