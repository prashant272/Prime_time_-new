import AwardCategory from '../models/AwardCategory.js';
import AwardEvent from '../models/AwardEvent.js';

// ---- AWARD CATEGORIES ----

export const getAwardCategories = async (req, res) => {
  try {
    const categories = await AwardCategory.find().sort({ order: 1 });
    
    // Inject hardcoded Upcoming Award category at the top
    const upcomingCategory = {
      _id: 'upcoming-hardcode',
      name: 'Upcoming Award',
      slug: 'upcoming-award',
      isActive: true,
      order: -999,
      description: 'Explore all of our upcoming award events across all categories.',
    };
    
    categories.unshift(upcomingCategory);

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAwardCategory = async (req, res) => {
  try {
    const { name, order, isActive } = req.body;
    const category = await AwardCategory.create({ name, order, isActive });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAwardCategory = async (req, res) => {
  try {
    const data = { ...req.body };
    // Automatically regenerate slug if name is updated
    if (data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const category = await AwardCategory.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAwardCategory = async (req, res) => {
  try {
    const category = await AwardCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ---- AWARD EVENTS ----

export const getAwardEvents = async (req, res) => {
  try {
    const filter = {};
    
    // Hide draft events from public users (only admins can see them)
    if (req.query.admin !== 'true') {
      filter.status = { $ne: 'draft' };
    }

    if (req.query.category) {
      if (req.query.category === 'upcoming-award') {
        // Special hardcoded category: return ALL upcoming events regardless of their actual DB category
        filter.status = 'upcoming'; // This safely overrides the $ne: 'draft' above
      } else {
        // Find category by slug
        const category = await AwardCategory.findOne({ slug: req.query.category });
        if (category) {
          filter.category = category._id;
        } else {
           // If category doesn't exist and wasn't the hardcoded one, return empty
           return res.status(200).json({ success: true, data: [] });
        }
      }
    }
    const events = await AwardEvent.find(filter).populate('category').sort({ order: 1, eventDate: -1 });
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAwardEventBySlug = async (req, res) => {
  try {
    const event = await AwardEvent.findOne({ slug: req.params.slug })
      .populate('category')
      .populate('relatedEvents');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAwardEvent = async (req, res) => {
  try {
    const data = { ...req.body };

    // Parse JSON strings back to objects (since formData sends strings)
    if (typeof data.videoGallery === 'string') {
      try { data.videoGallery = JSON.parse(data.videoGallery); } catch (e) { }
    }
    if (typeof data.relatedEvents === 'string') {
      try { data.relatedEvents = JSON.parse(data.relatedEvents); } catch (e) { }
    }

    if (req.files) {
      if (req.files.heroImage && req.files.heroImage[0]) {
        data.heroImage = {
          url: req.files.heroImage[0].location,
          alt: data.title,
        };
      }
      if (req.files.galleryImages) {
        data.galleryImages = req.files.galleryImages.map(file => ({
          url: file.location,
          caption: '',
        }));
      }
    }

    const event = await AwardEvent.create(data);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAwardEvent = async (req, res) => {
  try {
    const data = { ...req.body };

    // Automatically regenerate slug if title is updated
    if (data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    // Parse JSON strings back to objects
    if (typeof data.videoGallery === 'string') {
      try { data.videoGallery = JSON.parse(data.videoGallery); } catch (e) { }
    }
    if (typeof data.relatedEvents === 'string') {
      try { data.relatedEvents = JSON.parse(data.relatedEvents); } catch (e) { }
    }

    // Handle gallery removal/updates logic via existing images string array
    if (typeof data.existingGalleryImages === 'string') {
      try {
        data.galleryImages = JSON.parse(data.existingGalleryImages);
      } catch (e) {
        data.galleryImages = [];
      }
    }

    if (req.files) {
      if (req.files.heroImage && req.files.heroImage[0]) {
        console.log('Hero image file location:', req.files.heroImage[0].location);
        data.heroImage = {
          url: req.files.heroImage[0].location,
          alt: data.title,
        };
      }
      if (req.files.galleryImages) {
        console.log('Gallery images files:', req.files.galleryImages.map(f => f.location));
        const newImages = req.files.galleryImages.map(file => ({
          url: file.location,
          caption: '',
        }));
        data.galleryImages = [...(data.galleryImages || []), ...newImages];
      }
    }

    console.log('Data before update:', JSON.stringify(data, null, 2));
    const event = await AwardEvent.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAwardEvent = async (req, res) => {
  try {
    const event = await AwardEvent.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
