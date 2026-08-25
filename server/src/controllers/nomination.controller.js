import Nomination from '../models/Nomination.js';
import { sendNominationConfirmationEmail } from '../services/email.service.js';

// @desc    Submit a new nomination
// @route   POST /api/nominations/submit
// @access  Public
export const submitNomination = async (req, res) => {
  try {
    const {
      awardName,
      edition,
      categoryPath,
      wantTo,
      registrationType,
      nomineeName,
      organizationName,
      headName,
      headDesignation,
      headEmail,
      headMobile,
      contactName,
      contactDesignation,
      contactMobile,
      contactEmail,
      website,
      turnover,
      streetAddress,
      city,
      state,
      zipCode,
      referredBy,
      message,
      termsAccepted,
    } = req.body;

    // Check if terms accepted
    if (termsAccepted === 'false' || termsAccepted === false) {
      return res.status(400).json({ message: 'You must accept the terms and conditions' });
    }

    let fileUrl = '';
    if (req.file) {
      // If uploaded to S3, location is provided. Otherwise, construct local path.
      fileUrl = req.file.location ? req.file.location : `/uploads/${req.file.filename}`;
    }

    const newNomination = await Nomination.create({
      awardName,
      edition,
      categoryPath,
      wantTo,
      registrationType,
      nomineeName,
      organizationName,
      headName,
      headDesignation,
      headEmail,
      headMobile,
      contactName,
      contactDesignation,
      contactMobile,
      contactEmail,
      website,
      turnover,
      streetAddress,
      city,
      state,
      zipCode,
      referredBy,
      message,
      termsAccepted: true,
      fileUrl,
    });

    // Send confirmation email if contactEmail is provided
    const emailToSend = contactEmail || headEmail;
    if (emailToSend) {
      // Don't await email so it doesn't block response
      sendNominationConfirmationEmail(nomineeName, emailToSend).catch(err => 
        console.error("Failed to send nomination confirmation email:", err)
      );
    }

    res.status(201).json({ success: true, data: newNomination });
  } catch (error) {
    console.error('Error submitting nomination:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all nominations (with search & filter)
// @route   GET /api/admin/nominations
// @access  Private/Admin
export const getNominations = async (req, res) => {
  try {
    const { status, paymentStatus, search, awardName, edition, categoryPath } = req.query;
    
    // Build query object
    let query = {};

    if (status && status !== 'ALL STATUSES') {
      query.status = status;
    }

    if (paymentStatus && paymentStatus !== 'ALL PAYMENTS') {
      query.paymentStatus = paymentStatus;
    }

    if (awardName && awardName !== 'ALL AWARDS') {
      query.awardName = awardName;
    }

    if (edition && edition !== 'ALL EDITIONS') {
      query.edition = edition;
    }

    if (categoryPath && categoryPath !== 'ALL CATEGORIES') {
      // If filtering by a specific category node, check if it's anywhere in the path
      query.categoryPath = categoryPath;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { nomineeName: searchRegex },
        { organizationName: searchRegex },
        { contactEmail: searchRegex },
        { headEmail: searchRegex },
        { headName: searchRegex },
        { contactName: searchRegex },
        { headMobile: searchRegex },
        { contactMobile: searchRegex },
        { website: searchRegex },
        { message: searchRegex },
        { adminRemark: searchRegex },
        { adminName: searchRegex },
        { awardName: searchRegex },
        { city: searchRegex },
        { state: searchRegex }
      ];
    }

    const nominations = await Nomination.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: nominations.length, data: nominations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update nomination status
// @route   PATCH /api/admin/nominations/:id/status
// @access  Private/Admin
export const updateNominationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const nomination = await Nomination.findById(req.params.id);

    if (!nomination) {
      return res.status(404).json({ message: 'Nomination not found' });
    }

    nomination.status = status;
    const updatedNomination = await nomination.save();

    res.status(200).json({ success: true, data: updatedNomination });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update full nomination details
// @route   PUT /api/admin/nominations/:id
// @access  Private/Admin
export const updateNomination = async (req, res) => {
  try {
    const nomination = await Nomination.findById(req.params.id);

    if (!nomination) {
      return res.status(404).json({ message: 'Nomination not found' });
    }

    // Prevent overwriting internal fields like _id, fileUrl (unless we explicitly allow)
    const { _id, __v, fileUrl, createdAt, updatedAt, ...updateData } = req.body;

    const updatedNomination = await Nomination.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedNomination });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a nomination
// @route   DELETE /api/admin/nominations/:id
// @access  Private/Admin
export const deleteNomination = async (req, res) => {
  try {
    const nomination = await Nomination.findById(req.params.id);

    if (!nomination) {
      return res.status(404).json({ message: 'Nomination not found' });
    }

    await nomination.deleteOne();
    res.status(200).json({ success: true, message: 'Nomination removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
