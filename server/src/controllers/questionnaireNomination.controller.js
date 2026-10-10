import QuestionnaireNomination from '../models/QuestionnaireNomination.js';
import User from '../models/User.js';

// @desc    Submit a questionnaire nomination (Public)
// @route   POST /api/questionnaire-nominations/submit
// @access  Public
export const submitQuestionnaireNomination = async (req, res) => {
  try {
    const {
      edition,
      hasUSVisa,
      itrExceeded12L,
      agreedToFees,
      applyType,
      nomineeName,
      organizationName,
      headName,
      headNumber,
      headEmail,
      contactName,
      contactNumber,
      contactEmail,
      website,
      city,
      state,
      country,
      userId,
    } = req.body;

    if (!edition || !applyType || !nomineeName || !headName || !headNumber || !headEmail || !contactName || !contactNumber || !contactEmail || !city || !state || !country) {
      return res.status(400).json({ message: 'Please complete all required fields.' });
    }

    if (agreedToFees === false || agreedToFees === 'false') {
      return res.status(400).json({ message: 'You must agree to the Nomination & PR fees to proceed.' });
    }

    let linkedUserId = req.user?._id || userId || null;
    if (!linkedUserId) {
      const cleanHeadEmail = headEmail.trim().toLowerCase();
      const cleanContactEmail = contactEmail.trim().toLowerCase();
      const cleanHeadNum = headNumber.trim();
      const cleanContactNum = contactNumber.trim();

      const matchedUser = await User.findOne({
        $or: [
          { email: cleanHeadEmail },
          { email: cleanContactEmail },
          { phone: cleanHeadNum },
          { phone: cleanContactNum },
        ],
      });
      if (matchedUser) {
        linkedUserId = matchedUser._id;
      }
    }

    const newNomination = await QuestionnaireNomination.create({
      edition,
      hasUSVisa: hasUSVisa || 'N/A',
      itrExceeded12L: itrExceeded12L || 'N/A',
      agreedToFees: true,
      applyType,
      nomineeName: nomineeName.trim(),
      organizationName: organizationName ? organizationName.trim() : '',
      headName: headName.trim(),
      headNumber: headNumber.trim(),
      headEmail: headEmail.trim().toLowerCase(),
      contactName: contactName.trim(),
      contactNumber: contactNumber.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      website: website ? website.trim() : '',
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      user: linkedUserId,
    });

    res.status(201).json({
      success: true,
      message: 'Questionnaire nomination submitted successfully.',
      data: newNomination,
    });
  } catch (error) {
    console.error('Error submitting questionnaire nomination:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all questionnaire nominations (with search, filter, RBAC isolation)
// @route   GET /api/questionnaire-nominations/all
// @access  Private/Admin
export const getQuestionnaireNominations = async (req, res) => {
  try {
    const { status, paymentStatus, search, edition, assignedTo } = req.query;

    let query = {};

    // Role-based scope isolation:
    const isSuperAdmin = req.admin?.role === 'admin' || req.admin?.role === 'superadmin';
    if (!isSuperAdmin) {
      // Staff members strictly view nominations assigned to them
      query.assignedTo = req.admin._id;
    } else if (assignedTo) {
      if (assignedTo === 'unassigned') {
        query.assignedTo = null;
      } else if (assignedTo !== 'ALL ASSIGNEES' && assignedTo !== 'all') {
        query.assignedTo = assignedTo;
      }
    }

    if (edition && edition !== 'ALL EDITIONS') {
      query.edition = edition;
    }

    if (status && status !== 'ALL STATUSES') {
      query.status = status;
    }

    if (paymentStatus && paymentStatus !== 'ALL PAYMENTS') {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { nomineeName: searchRegex },
        { organizationName: searchRegex },
        { headName: searchRegex },
        { headEmail: searchRegex },
        { headNumber: searchRegex },
        { contactName: searchRegex },
        { contactEmail: searchRegex },
        { contactNumber: searchRegex },
        { website: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
        { country: searchRegex },
        { adminRemark: searchRegex },
        { adminName: searchRegex },
        { edition: searchRegex },
      ];
    }

    const nominations = await QuestionnaireNomination.find(query)
      .populate('assignedTo', '_id name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: nominations.length,
      data: nominations,
    });
  } catch (error) {
    console.error('Error fetching questionnaire nominations:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign questionnaire nomination to staff
// @route   PATCH /api/questionnaire-nominations/:id/assign
// @access  Private/Admin
export const assignQuestionnaireNomination = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const nomination = await QuestionnaireNomination.findById(req.params.id);

    if (!nomination) {
      return res.status(404).json({ message: 'Questionnaire nomination not found' });
    }

    nomination.assignedTo = assignedTo ? assignedTo : null;
    await nomination.save();

    const populated = await QuestionnaireNomination.findById(nomination._id).populate(
      'assignedTo',
      '_id name email role'
    );

    res.status(200).json({
      success: true,
      message: 'Questionnaire nomination assigned successfully',
      data: populated,
    });
  } catch (error) {
    console.error('Error assigning questionnaire nomination:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update workflow status
// @route   PATCH /api/questionnaire-nominations/:id/status
// @access  Private/Admin
export const updateQuestionnaireNominationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const nomination = await QuestionnaireNomination.findById(req.params.id);

    if (!nomination) {
      return res.status(404).json({ message: 'Questionnaire nomination not found' });
    }

    nomination.status = status;
    await nomination.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: nomination,
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update nomination details / admin remark
// @route   PUT /api/questionnaire-nominations/:id
// @access  Private/Admin
export const updateQuestionnaireNomination = async (req, res) => {
  try {
    const nomination = await QuestionnaireNomination.findById(req.params.id);

    if (!nomination) {
      return res.status(404).json({ message: 'Questionnaire nomination not found' });
    }

    Object.assign(nomination, req.body);
    await nomination.save();

    const populated = await QuestionnaireNomination.findById(nomination._id).populate(
      'assignedTo',
      '_id name email role'
    );

    res.status(200).json({
      success: true,
      message: 'Questionnaire nomination updated successfully',
      data: populated,
    });
  } catch (error) {
    console.error('Error updating questionnaire nomination:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete questionnaire nomination
// @route   DELETE /api/questionnaire-nominations/:id
// @access  Private/Admin
export const deleteQuestionnaireNomination = async (req, res) => {
  try {
    const nomination = await QuestionnaireNomination.findById(req.params.id);

    if (!nomination) {
      return res.status(404).json({ message: 'Questionnaire nomination not found' });
    }

    await nomination.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Questionnaire nomination deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting questionnaire nomination:', error);
    res.status(500).json({ message: error.message });
  }
};
