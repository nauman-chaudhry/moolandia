const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SeasonImage = require('../models/SeasonImage'); // Import the model

// Configure Multer Storage: Uploads are stored in the "assets" folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'assets'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `seasonImage-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// POST endpoint to handle file upload and create a record in the DB
router.post('/', upload.single('seasonImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const filePath = `/assets/${req.file.filename}`;

    // Create a new SeasonImage record with isBackground defaulting to false
    const newImage = new SeasonImage({
      imagePath: filePath,
      isBackground: false
    });
    await newImage.save();

    return res.json({
      success: true,
      message: 'Season image uploaded successfully!',
      path: filePath
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while uploading the file.'
    });
  }
});

// GET endpoint to list all SeasonImage records from the DB
router.get('/', async (req, res) => {
  try {
    const images = await SeasonImage.find({});
    return res.json({ success: true, images });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to fetch images' });
  }
});

// PATCH endpoint to set an image as the background
router.patch('/set-background', async (req, res) => {
  try {
    const { imagePath } = req.body;
    if (!imagePath) {
      return res.status(400).json({ success: false, message: 'Image path is required.' });
    }
    // Reset all images to not be the background
    await SeasonImage.updateMany({}, { isBackground: false });
    // Set the selected image's isBackground to true
    const updatedImage = await SeasonImage.findOneAndUpdate(
      { imagePath },
      { isBackground: true },
      { new: true }
    );
    if (!updatedImage) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }
    res.json({ success: true, message: 'Background image set successfully!', image: updatedImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE endpoint to remove an image by its id
router.delete('/:id', async (req, res) => {
  try {
    // Find the image record by its _id
    const image = await SeasonImage.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }

    // Remove the leading slash if present and construct the file path
    const relativePath = image.imagePath.startsWith('/') ? image.imagePath.slice(1) : image.imagePath;
    const filePath = path.join(__dirname, '..', relativePath);
    console.log('Deleting file at path:', filePath);

    // Remove the image file from the file system
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        // Continue to remove the record even if file deletion fails.
      } else {
        console.log('File deleted successfully.');
      }
    });

    // Delete the image record from the database
    await SeasonImage.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Image deleted successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
