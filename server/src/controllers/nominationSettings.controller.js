import NominationFormSettings from '../models/NominationFormSettings.js';

// @desc    Get nomination form settings
// @route   GET /api/nomination-settings
// @access  Public
export const getNominationSettings = async (req, res) => {
  try {
    let settings = await NominationFormSettings.findOne();
    
    // If no settings exist yet, return an empty structure
    if (!settings) {
      settings = { categories: [] };
    }
    
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching nomination settings:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update nomination form settings
// @route   PUT /api/nomination-settings
// @access  Private/Admin
export const updateNominationSettings = async (req, res) => {
  try {
    const { categories } = req.body;
    
    let settings = await NominationFormSettings.findOne();
    
    if (settings) {
      settings.categories = categories;
      await settings.save();
    } else {
      settings = await NominationFormSettings.create({ categories });
    }
    
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error updating nomination settings:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
