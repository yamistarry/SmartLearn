const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Assignment = require('../models/assignment');
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Multer middleware to handle file uploads (expecting `attachments`)
const upload = multer({ storage: storage }).array('attachments', 5); // Accept up to 5 files

const addAssignmentProff = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: 'File upload failed.' });
    }

    try {
      console.log("Received Data:", req.body);
      console.log("Uploaded Files:", req.files); // Log all uploaded files

      const { assignmentNumber, subject, chapter, deadline, professorName, description, email,branch } = req.body;

      if (!assignmentNumber || !subject || !chapter || !deadline || !professorName || !email || !branch) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }

      // Fix email field
      let processedEmail = Array.isArray(email) ? email.find(e => e.trim() !== '') : email;
      if (typeof processedEmail === 'string') {
        processedEmail = processedEmail.trim();
      } else {
        return res.status(400).json({ error: 'Invalid email format.' });
      }

      // Process file uploads correctly
      const attachments = req.files && req.files.length > 0
        ? req.files.map(file => ({ filename: file.originalname, url: `/uploads/${file.filename}` }))
        : [];

      const newAssignment = new Assignment({
        assignmentNumber,
        subject,
        chapter,
        deadline,
        professorName,
        description,
        branch,
        email: processedEmail, // Use the processed email
        attachments,
        submitted: false,
        createdAt: new Date(),
      });

      const savedAssignment = await newAssignment.save();
      res.status(201).json({ message: 'Assignment created successfully.', assignment: savedAssignment });
    } catch (error) {
      console.error('Error adding assignment:', error);
      res.status(500).json({ error: 'Server error. Could not add assignment.' });
    }
  });
};

module.exports = { addAssignmentProff };

