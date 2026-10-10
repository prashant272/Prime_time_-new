import ContactMessage from '../models/ContactMessage.js';
import { verifyTurnstileToken } from '../services/turnstile.service.js';

// @desc    Submit a new contact message
// @route   POST /api/contact/submit
// @access  Public
export const submitContactMessage = async (req, res) => {
  try {
    const { name, organization, email, phone, message, captchaToken, _hp_website } = req.body;

    // 1. Honeypot check: bots auto-fill hidden inputs
    if (_hp_website) {
      return res.status(200).json({ success: true, message: 'Message sent successfully' });
    }

    // 2. Basic field validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    // 3. CAPTCHA verification
    const remoteIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress;
    const captchaResult = await verifyTurnstileToken(captchaToken, remoteIp);

    if (!captchaResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Security check failed. Please verify the CAPTCHA and try again.',
      });
    }

    const newMessage = await ContactMessage.create({
      name,
      organization,
      email,
      phone,
      message,
    });

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact/all
// @access  Private/Admin
export const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update message status
// @route   PATCH /api/contact/:id/status
// @access  Private/Admin
export const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.status = status;
    const updatedMessage = await message.save();

    res.status(200).json({ success: true, data: updatedMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.deleteOne();
    res.status(200).json({ success: true, message: 'Message removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
