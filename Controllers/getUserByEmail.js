const User = require("../models/userSchema");

const getUserByEmail = async (req, res) => {
  try {
    const email = req.query.email;  // ✅ Not req.params.email

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      email: user.email,
      phone: user.phone,
      identifier: user.identifier,
      role: user.role,
      department: user.department,
      college: user.college,
    });
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Fetch contacts of a user
const getContacts = async (req, res) => {
  const email = req.params.email;
  try {
    // Logic: find user and their contacts
    // Example: User has a `contacts` array storing emails or IDs
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Assuming contacts is an array of user emails or IDs
    const contacts = user.contacts || [];

    res.status(200).json({ contacts });
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Send connection request
const sendConnectionRequest = async (req, res) => {
  const fromEmail = req.params.email;
  const { toEmail } = req.body;

  try {
    // Validate emails exist
    const fromUser = await User.findOne({ email: fromEmail });
    const toUser = await User.findOne({ email: toEmail });

    if (!fromUser || !toUser) {
      return res.status(404).json({ error: "One or both users not found" });
    }
    if (toUser.connectionRequests?.includes(fromEmail)) {
      return res.status(400).json({ error: "Request already sent" });
    }

    toUser.connectionRequests = toUser.connectionRequests || [];
    toUser.connectionRequests.push(fromEmail);
    await toUser.save();

    res.status(201).json({ message: "Connection request sent" });
  } catch (err) {
    console.error("Error sending connection request:", err);
    res.status(500).json({ error: "Server error" });
  }
};
const getConnectionRequests = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Assuming user.connectionRequests is an array of emails or user IDs
    res.status(200).json({ connectionRequests: user.connectionRequests || [] });
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    res.status(500).json({ error: "Server error" });
  }
};
const acceptConnectionRequest = async (req, res) => {
  const { email, requesterEmail } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.connectionRequests?.includes(requesterEmail)) {
      return res.status(400).json({ error: "No such connection request found" });
    }

    // Add requesterEmail to contacts if not already there
    user.contacts = user.contacts || [];
    if (!user.contacts.includes(requesterEmail)) {
      user.contacts.push(requesterEmail);
    }

    // Remove from connectionRequests
    user.connectionRequests = user.connectionRequests.filter(
      (reqEmail) => reqEmail !== requesterEmail
    );

    await user.save();

    res.status(200).json({ message: "Connection request accepted" });
  } catch (err) {
    console.error("Error accepting connection request:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// New controller to reject a connection request
const rejectConnectionRequest = async (req, res) => {
  const { email, requesterEmail } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.connectionRequests?.includes(requesterEmail)) {
      return res.status(400).json({ error: "No such connection request found" });
    }

    // Remove from connectionRequests only
    user.connectionRequests = user.connectionRequests.filter(
      (reqEmail) => reqEmail !== requesterEmail
    );

    await user.save();

    res.status(200).json({ message: "Connection request rejected" });
  } catch (err) {
    console.error("Error rejecting connection request:", err);
    res.status(500).json({ error: "Server error" });
  }
};
const deleteContact = async (req, res) => {
  const { email, contactEmail } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // If contactEmail is not in user's contacts
    if (!user.contacts?.includes(contactEmail)) {
      return res.status(400).json({ error: "Contact not found in user's list" });
    }

    // Remove contact
    user.contacts = user.contacts.filter((c) => c !== contactEmail);
    await user.save();

    res.status(200).json({ message: "Contact removed successfully" });
  } catch (err) {
    console.error("Error deleting contact:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getUserByEmail,  getContacts, sendConnectionRequest, getConnectionRequests,acceptConnectionRequest,
  rejectConnectionRequest, deleteContact,};
