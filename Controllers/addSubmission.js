const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Submission = require('../models/submission');

// Create 'uploads' directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage }).array('attachments', 5);

const addSubmission = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: 'File upload failed.' });
    }

    try {
      const {
        assignmentNumber,
        subject,
        chapter,
        deadline,
        professorName,
        description,
        email,
        branch
      } = req.body;

      if (!assignmentNumber || !subject || !chapter || !deadline || !professorName || !email || !branch) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }

      let processedEmail = Array.isArray(email) ? email.find(e => e.trim() !== '') : email;
      if (typeof processedEmail === 'string') {
        processedEmail = processedEmail.trim();
      } else {
        return res.status(400).json({ error: 'Invalid email format.' });
      }

      const attachments = req.files.map(file => ({
        filename: file.originalname,
        url: `/uploads/${path.basename(file.path)}`
      }));

      const newSubmission = new Submission({
        assignmentNumber,
        subject,
        chapter,
        deadline,
        professorName,
        description,
        email: processedEmail,
        branch,
        submitted: true,
        createdAt: new Date(),
        attachments,
      });

      const savedSubmission = await newSubmission.save();

      res.status(201).json({
        message: 'Submission saved successfully.',
        submission: savedSubmission,
      });

    } catch (error) {
      console.error('Error adding submission:', error);
      res.status(500).json({ error: 'Server error. Could not add submission.' });
    }
  });
};

module.exports = { addSubmission };
