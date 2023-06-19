const path = require('path');
const fs = require('fs');
const Report = require('../models/ReportModel');
const multer = require('multer');

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

            const {
                title,
                lokasi,
                nim,
                deskripsi
            } = req.body;

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
        const report = await Report.findOne({
            _id: req.params.id,
        });

        if (!report) {
            return res.status(404).json({
                msg: 'No Data Found'
            });
        }

        res.json(report);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            msg: 'Internal Server Error'
        });
    }
};



const updateReport = async (req, res) => {
     upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred during file upload
            return res.status(422).json({
                msg: err.message
            });
        } else if (err) {
            // An unknown error occurred during file upload
            return res.status(500).json({
                msg: err.message
            });
        }

        const report = await Report.findOne({
            _id: req.params.id
        });

        if (!report) {
            return res.status(404).json({
                msg: 'No Data Found'
            });
        }

        const {
            lokasi,
            deskripsi,
            perihal,
            status
        } = req.body;

        let gambarName = report.gambar;

        if (req.file) {
            const ext = path.extname(req.file.originalname);
            gambarName = req.file.md5 + ext;
            const allowedTypes = ['.png', '.jpg', '.jpeg'];

            if (!allowedTypes.includes(ext.toLowerCase())) {
                return res.status(422).json({
                    msg: 'Invalid Image Type'
                });
            }

            const gambarpath = `./public/images/${report.gambar}`;
            fs.unlinkSync(gambarpath);
        }

        const url = `${req.protocol}://${req.get('host')}/images/${gambarName}`;

        try {
            await Report.updateOne({
                _id: req.params.id
            }, {
                perihal: perihal,
                lokasi: lokasi,
                gambar: gambarName,
                deskripsi: deskripsi,
                URL: url,
                status: status,
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
    });
};

const deleteReport = async (req, res) => {
    try {
        const report = await Report.findOne({
            _id: req.params.id,
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

        await Report.deleteOne({
            _id: req.params.id,
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