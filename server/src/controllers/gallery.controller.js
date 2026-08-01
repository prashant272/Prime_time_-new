import Gallery from '../models/Gallery.js';

const defaultReels = [
  "https://www.youtube.com/shorts/U6HlrIGLbUE",
  "https://www.youtube.com/shorts/Q8wuGQbKsc4",
  "https://www.youtube.com/shorts/rfifB7Be5c4",
  "https://www.youtube.com/shorts/E4U-aPc0_1A",
  "https://www.youtube.com/shorts/igzWCCBDwiE",
  "https://www.youtube.com/shorts/efLVh5zWokg",
  "https://www.youtube.com/shorts/CquG5U61AMo",
  "https://www.youtube.com/shorts/9a5UsyAGovc"
];

const defaultPhotos = [];

const defaultVideos = [
  "https://youtu.be/lidrl7ul_Sk", "https://youtu.be/U5MATHLXZeI", "https://youtu.be/fzvX6BUGFSw",
  "https://youtu.be/kLyUQnQwtyI", "https://youtu.be/nbhc29_Emdw", "https://youtu.be/OKjYW-dyQqc",
  "https://youtu.be/PAF5HAVC9dw", "https://youtu.be/qzSBdM8JFew", "https://youtu.be/PPZ423f-kvM",
  "https://youtu.be/eowKp0wUQtw", "https://youtu.be/C_49puTx1Rw", "https://youtu.be/DBVNd2UHm78",
  "https://youtu.be/FCLOIke4oqA", "https://youtu.be/e8whBdTpL2A", "https://youtu.be/5i4UiYKNO2E",
  "https://youtu.be/5Ud6LmMaG1k", "https://youtu.be/qiaiuynSoj0", "https://youtu.be/QUL2Xn2pW90",
  "https://youtu.be/-3qm822LQoo"
];

// Get the gallery singleton
export const getGallery = async (req, res, next) => {
  try {
    let gallery = await Gallery.findOne();
    if (!gallery) {
      gallery = await Gallery.create({ reels: defaultReels, videos: defaultVideos, photos: defaultPhotos });
    }
    res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    next(error);
  }
};

// Update gallery arrays
export const updateGallery = async (req, res, next) => {
  try {
    const { reels, videos, photos } = req.body;
    let gallery = await Gallery.findOne();
    if (!gallery) {
      gallery = await Gallery.create({ reels: defaultReels, videos: defaultVideos, photos: defaultPhotos });
    }
    
    if (reels !== undefined) gallery.reels = reels;
    if (videos !== undefined) gallery.videos = videos;
    if (photos !== undefined) gallery.photos = photos;

    await gallery.save();
    res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    next(error);
  }
};

// Upload multiple photos to the gallery
export const uploadGalleryPhoto = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images provided' });
    }

    const imageUrls = req.files.map(file => 
      file.location || `${req.protocol}://${req.get('host')}/${file.path.replace(/\\/g, '/')}`
    );

    let gallery = await Gallery.findOne();
    if (!gallery) {
      gallery = await Gallery.create({ reels: defaultReels, videos: defaultVideos, photos: defaultPhotos });
    }

    gallery.photos = [...imageUrls, ...gallery.photos]; // add new images to the beginning
    await gallery.save();

    res.status(201).json({ success: true, data: gallery, uploadedUrls: imageUrls });
  } catch (error) {
    next(error);
  }
};
