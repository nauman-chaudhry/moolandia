import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BackgroundImageContext } from '../App';

const SeasonImageManager = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [images, setImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setBackgroundImage } = useContext(BackgroundImageContext);

  // Handle file selection from the upload input
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Upload the selected file to the backend
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select an image to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('seasonImage', selectedFile);
    try {
      const response = await axios.post('https://moolandia-mern-app.onrender.com/api/season-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setUploadStatus('Image uploaded successfully!');
        // Refresh the image list after successful upload
        fetchImages();
      } else {
        setUploadStatus('Upload failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('An error occurred during upload.');
    }
  };

  // Fetch the list of images from the backend
  const fetchImages = async () => {
    try {
      const response = await axios.get('https://moolandia-mern-app.onrender.com/api/season-images');
      if (response.data.success) {
        setImages(response.data.images);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  // Fetch images when the component mounts
  useEffect(() => {
    fetchImages();
  }, []);

  // Handle background image selection from the modal
  const handleSelectBackground = async (imgPath) => {
    const fullImageUrl = `https://moolandia-mern-app.onrender.com${imgPath}`;
    
    // Update the background image in the context
    setBackgroundImage(fullImageUrl);
    
    // Update the document body background
    document.body.style.backgroundImage = `url(${fullImageUrl})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    
    // Close the modal once an image is selected
    setIsModalOpen(false);

    // Update the backend to mark this image as the background
    try {
      const response = await axios.patch('https://moolandia-mern-app.onrender.com/api/season-images/set-background', { imagePath: imgPath });
      console.log(response.data.message);
    } catch (error) {
      console.error('Error updating background in backend:', error);
    }
  };

  // Function to delete an image by its id
  const handleDeleteImage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const response = await axios.delete(`https://moolandia-mern-app.onrender.com/api/season-images/${id}`);
      if (response.data.success) {
        fetchImages(); // Refresh the image list after deletion
      } else {
        alert('Failed to delete image: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <>
      <style>{`
        .season-image-manager-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: #fff;
          padding: 20px;
          max-width: 800px;
          margin-left: 700px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .back-button {
          align-self: flex-start;
          margin-bottom: 10px;
        }
        .upload-section {
          margin-bottom: 20px;
        }
        .upload-section button {
          margin-left: 10px;
        }
        .modal-button-section {
          margin-bottom: 20px;
        }
        .background-preview {
          margin-bottom: 20px;
        }
        .background-preview img {
          max-width: 300px;
          border: 1px solid #ccc;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 4px;
          max-width: 800px;
          width: 90%;
          max-height: 80vh;
          overflow: auto;
        }
        .image-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 20px;
          max-height: 400px;
          overflow-y: auto;
        }
        .image-item {
          position: relative;
        }
        .image-item img {
          width: 100%;
          cursor: pointer;
          border: 2px solid transparent;
        }
        .image-item button {
          position: absolute;
          top: 5px;
          right: 5px;
          border: 1px solid #000;
          background-color: #fff;
          cursor: pointer;
        }
        .modal-close {
          margin-top: 20px;
          text-align: right;
        }
        @media (max-width: 768px) {
          .season-image-manager-container {
            padding: 10px;
            max-width: 95%;
            margin-left: 25px;
          }
          .image-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .background-preview img {
            max-width: 100%;
          }
        }
      `}</style>
      <div className="season-image-manager-container">
        {/* Back Button */}
        <div className="back-button">
          <Link to="/teacher-dashboard">
            <button>Back</button>
          </Link>
        </div>

        <h2>Manage Season Images</h2>

        {/* Upload Section */}
        <div className="upload-section">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload</button>
          <p>{uploadStatus}</p>
        </div>

        {/* Button to Open Modal for Background Selection */}
        <div className="modal-button-section">
          <button onClick={() => setIsModalOpen(true)}>Select Background Image</button>
        </div>

        {/* Modal to Display Existing Images */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Select Background Image</h3>
              <div className="image-grid">
                {images.map((img, index) => (
                  <div key={index} className="image-item">
                    <img
                      src={`https://moolandia-mern-app.onrender.com${img.imagePath || img.path}`}
                      alt="Option"
                      onClick={() => handleSelectBackground(img.imagePath || img.path)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(img._id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <div className="modal-close">
                <button onClick={() => setIsModalOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SeasonImageManager;
