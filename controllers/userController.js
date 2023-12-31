const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const User = require('../models/UserModel');

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/profiles');
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using hexadecimal timestamp
    const uniqueFilename = Date.now().toString(16) + path.extname(file.originalname);
    cb(null, uniqueFilename);
  },
});

const upload = multer({
  storage
});

const login = async (req, res) => {
  try {
    const {
      email,
      nim,
      password
    } = req.body;
    let user;

    if (email) {
      // Jika email tersedia, cari pengguna berdasarkan email
      user = await User.findOne({
        email
      });
    } else if (nim) {
      // Jika nim tersedia, cari pengguna berdasarkan nim
      user = await User.findOne({
        nim
      });
    } else {
      // Jika email dan nim tidak tersedia, kembalikan respons error
      return res.status(400).json({
        message: 'Please provide email or NIM'
      });
    }

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    if (user.role === 'admin') {
      return res.status(200).json({
        id: user.id,
        role: 'admin',
        message: 'Admin login successful',
      });
    } else {
      return res.status(200).json({
        id: user.id,
        role: 'user',
        message: 'User login successful',
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

const register = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      nama,
      nim,
      jurusan,
      fakultas
    } = req.body;

    // Cek apakah pengguna dengan email tersebut sudah ada di database
    const existingUser = await User.findOne({
      email
    });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email is already registered'
      });
    }

    // Hash password sebelum disimpan ke database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tambahkan data pengguna baru ke database
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role,
      nama,
      nim,
      jurusan,
      fakultas,
    });

    if (newUser) {
      return res.status(201).json({
        message: 'User successfully registered'
      });
    } else {
      return res.status(500).json({
        message: 'Failed to register user'
      });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

const changeProfilePicture = async (req, res, next) => {
  try {
    const userId = req.params.id; // You should provide the user's ID in the URL
    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      return next(new Error("User not found"));
    }

    // Handle the profile picture upload
    upload.single('profilePicture')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({
          message: 'Failed to upload profile picture'
        });
      }

      // Update the profilePicture field in the user document
      user.profilePicture = req.file ? req.file.filename : null;
      await user.save();

      const newImageUrl = req.file ? `${req.protocol}://${req.get('host')}/profiles/${user.profilePicture}` : null;

      res.status(200).json({
        success: true,
        message: 'Profile picture updated',
        newImageUrl: newImageUrl // Include the new image URL in the response
      });
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};


const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    const usersWithProfileURLs = users.map(user => {
      return {
        ...user.toObject(),
        profilePicture: user.profilePicture ?
          `${req.protocol}://${req.get('host')}/profiles/${user.profilePicture}` : null
      };
    });

    res.status(200).json({
      success: true,
      users: usersWithProfileURLs,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const userIdornim = req.params.userIdornim;

    let user;

    // Cek apakah userIdornim adalah ID (ObjectId) atau NIM (string)
    if (userIdornim.length === 24 && /^[0-9a-fA-F]+$/.test(userIdornim)) {
      // Cari pengguna berdasarkan ID
      user = await User.findOne({
        _id: userIdornim
      });
    } else {
      // Cari pengguna berdasarkan NIM
      user = await User.findOne({
        nim: userIdornim
      });
    }

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const userWithProfileURL = {
      ...user.toObject(),
      profilePicture: user.profilePicture ?
        `${req.protocol}://${req.get('host')}/profiles/${user.profilePicture}` : null
    };

    // Mengembalikan data pengguna
    return res.status(200).json(userWithProfileURL);
  } catch (error) {
    console.error('Error while getting user:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};


const createUser = async (req, res, next) => {
  try {
    const {
      email,
      password,
      role,
      nama,
      nim,
      jurusan,
      fakultas
    } = req.body;
    if (!email || !password || !role || !nama || !nim || !jurusan || !fakultas) {
      res.status(400);
      return next(new Error("name, email, password, role, nama, nim, jurusan, and fakultas fields are required"));
    }

    // check if user already exists
    const isUserExists = await User.findOne({
      email
    });

    if (isUserExists) {
      res.status(404);
      return next(new Error("User already exists"));
    }

    // Hash password sebelum disimpan ke database
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      nama,
      nim,
      jurusan,
      fakultas,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  const {
    id
  } = req.params;
  try {
    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      return next(new Error("User not found"));
    }

    const updatedUser = await User.findByIdAndUpdate(
      id, {
        $set: req.body,
      }, {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  const {
    id
  } = req.params;
  try {
    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      return next(new Error("User not found"));
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User has been deleted.",
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  const userId = req.params.id;
  const {
    oldPassword,
    newPassword
  } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      return next(new Error("User not found"));
    }

    console.log("oldPassword:", oldPassword); // Tambahkan log ini untuk memeriksa nilai oldPassword

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid old password'
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};


const changePasswordWithoutOld = async (req, res, next) => {
  const userId = req.params.id;
  const {
    newPassword
  } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      return next(new Error("User not found"));
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};



module.exports = {
  login,
  register,
  getUser,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  changeProfilePicture,
  changePassword,
  changePasswordWithoutOld
};