const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const express = require('express'); // Import multer for file uploads
const path = require('path');
// const Message = require("../models/messageSchema");

// const { saveOtp, markAttendance } = require("../Controllers/attendance");
const { markAttendance, saveOtp, viewAttendance } = require("../Controllers/attendance");
const router = express.Router();
const registerUser = require('../Controllers/registerUser');
const loginUser = require('../Controllers/loginUser');
const verifyOtp = require('../Controllers/verifyOtp');
const submitUserDetails = require("../Controllers/SubmitUserDetails");
const { createOrUpdateTimetable, updateDaySchedule, getTt } = require('../Controllers/timetable.js');
const {addTimetable,getTimetable}=require('../Controllers/exam.js');
const getuserProfile = require("../Controllers/userProfile");
// const { addAssignment } = require('../Controllers/addAssignment');
const {addSubmission}=require('../Controllers/addSubmission.js')
const { submitAssignment } = require('../Controllers/submitAssignment.js');
const { addAssignmentProff } = require('../Controllers/addAssignmentProff.js');
const {addSyllabus}=require('../Controllers/addSyllabus');
const syllabusController = require('../Controllers/syllabusController');
const goalController = require('../Controllers/Goals');
const updateUserProfile = require('../Controllers/updateUserProfile');
const { createMeeting, verifyMeeting } =require('../Controllers/meetingController');

// user.js
router.post('/meeting/create', createMeeting);
router.post('/meeting/verify', verifyMeeting);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/assignments/'); // Store files in 'uploads/assignments'
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique file name
  }
});
const msgController = require("../Controllers/messageController");
router.get("/messages/:user1/:user2", msgController.getMessagesBetweenUsers);
router.delete("/messages/delete/:messageId", msgController.deleteMessageController);

router.post("/send", async (req, res) => {
  try {
    const { sender, recipient, content, type, timestamp, recipientOnline } = req.body;

    // Create a normalized message object with fields expected by controller
    const msgData = {
      from: sender.trim().toLowerCase(),
      to: recipient.trim().toLowerCase(),
      content,
      type,
      timestamp,
    };

    await msgController.saveMessage(msgData, recipientOnline,io);

    if (recipientOnline) {
      await msgController.markMessagesDelivered(recipient, sender);
    }

    res.status(200).json({ success: true, message: "Message saved" });
  } catch (err) {
    console.error("❌ Error in /send route:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});


// PUT mark messages as delivered (✔✔ gray)
router.post("/mark-delivered", async (req, res) => {
  const { user1, user2 } = req.body;
  await msgController.markMessagesDelivered(user1, user2);
  res.status(200).json({ success: true });
});

// // Mark messages as read (✔✔ blue ticks)
router.post("/messages/mark-read", async (req, res) => {
  const { user1, user2 } = req.body;
  await msgController.markMessagesRead(user1, user2);
  res.status(200).json({ success: true });
});

// Get total unread count for a user
router.get("/unread-senders/:userId", async (req, res) => {
  const data = await msgController.getUnreadCountsPerSender(req.params.userId);
  res.status(200).json({ unreadCounts: data });
});
// DELETE /api/v1/messages/delete/:messageId


const {
  getUserByEmail,
  getContacts,
  getConnectionRequests,
  sendConnectionRequest,
  acceptConnectionRequest,rejectConnectionRequest, deleteContact
} = require('../Controllers/getUserByEmail');

router.get('/users/:email/contacts', getContacts);
router.get('/users/:email/connection-requests', getConnectionRequests); // <- THIS route
router.post('/users/:email/connection-requests', sendConnectionRequest);
router.get('/users/search', getUserByEmail);
router.use((req, res, next) => {
  console.log(`Received ${req.method} request on ${req.originalUrl}`);
  next();
});

router.post("/users/:email/connection-requests/:requesterEmail/accept", acceptConnectionRequest);
router.delete("/users/:email/connection-requests/:requesterEmail/reject", rejectConnectionRequest);
router.delete(
  "/users/:email/contacts/:contactEmail",
  deleteContact
);

router.post('/welcome', submitUserDetails);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/createOrUpdateTimetable', createOrUpdateTimetable);
router.put('/updateDaySchedule/:semester/:branch/:day', updateDaySchedule);
router.post('/addTimetable',addTimetable);
router.get('/getTimetable',getTimetable);
router.get('/getTt/:semester/:branch', getTt);
const { getAllAssignments } = require('../Controllers/getAllAssignments');
router.get('/assignments', getAllAssignments);
router.post('/assignment',addSubmission)
router.post('/submit', submitAssignment);
router.put('/updateprofile/:email', updateUserProfile);
router.get('/profile/:email', getuserProfile);
router.post('/addAssignmentProff', addAssignmentProff);
router.post('/syllabus',addSyllabus);
router.use('/api', syllabusController);
router.post('/attendance', saveOtp);
router.post('/mark', markAttendance);
router.post('/view-attendance', viewAttendance);

router.post('/goals', goalController.createGoal);
router.get('/goals/:userId', goalController.getGoalsByUser);
router.put('/goals/:id', goalController.updateGoal);
router.delete('/goals/:id', goalController.deleteGoal);
// Example Express route handler
router.get("/api/v1/meeting/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const meeting = await Meeting.findOne({ linkId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    res.json({ meeting });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
// GET /api/messages/:user1/:user2
// router.get('/:user1/:user2', async (req, res) => {
//   const { user1, user2 } = req.params;
//   const messages = await Message.find({
//     $or: [
//       { from: user1, to: user2 },
//       { from: user2, to: user1 }
//     ]
//   }).sort({ timestamp: 1 });
//   res.json(messages);
// });
// Example using Express.js
router.post('/api/users/:email/contacts', async (req, res) => {
  const { email } = req.params;
  const { contactEmail } = req.body;

  const user = await User.findOne({ email });
  const contact = await User.findOne({ email: contactEmail });

  if (!user || !contact) return res.status(404).json({ message: "User or contact not found" });

  // Avoid duplicate
  if (!user.contacts.includes(contactEmail)) {
    user.contacts.push(contactEmail);
    await user.save();
  }

  res.status(200).json({ message: 'Contact added successfully' });
});

module.exports = router;
