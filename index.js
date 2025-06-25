const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const Message =require('./models/Message');
const server = http.createServer(app);
const msgController=require("./Controllers/messageController")
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // frontend origin
    methods: ["GET", "POST"],
    credentials: true
  }
});
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
socket.on("set_email", (email) => {
    socket.join(email);
    socket.email = email;  // optional, store email in socket object
    console.log(`Socket ${socket.id} joined room: ${email}`);
  });
  socket.on("send_message", async (msgData) => {
  try {
    const toRoom = msgData.to.toLowerCase();
    const fromRoom = msgData.from.toLowerCase();
    const recipientOnline = io.sockets.adapter.rooms.has(toRoom);

    const savedMessage = await msgController.saveMessage(msgData, recipientOnline, io);

    io.to(toRoom).emit("receive_message", savedMessage);
    io.to(fromRoom).emit("message_saved", savedMessage);
  } catch (error) {
    console.error("Error saving message:", error);
  }
});

  socket.on("mark_messages_read", async ({ user1, user2 }) => {
  try {
    await msgController.markMessagesRead(user1, user2);

    io.to(user1).emit("messages_read_update", { user1, user2 });
    io.to(user2).emit("messages_read_update", { user1, user2 });

  } catch (err) {
    console.error("Error marking messages read:", err);
  }
});


});
const PORT = process.env.PORT || 4000;
app.use('/uploads', express.static('uploads'));
// Import routes and database
const user = require("./routes/user");
const userdb = require("./models/googleSchema");
require("./config/database").connect();

// Configure CORS 
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// Configure session middleware BEFORE passport
app.use(
  session({
    secret: "we#will#win#1",  // Replace with an env variable for security
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",  // Set to true in production
    },
  })
);


// Initialize passport and configure it to use sessions
app.use(passport.initialize());
app.use(passport.session());

// Configure cookie parser
app.use(cookieParser());

// Enable JSON body parsing
app.use(express.json());

// Passport strategy setup
const OAuth2Strategy = require("passport-google-oauth2").Strategy;

const clientID = process.env.EMAIL_USER;  // Move to environment variables for security
const clientSecret = process.env.EMAIL_PASS;
console.log("email:",process.env.EMAIL_USER);
console.log("pass:",process.env.EMAIL_PASS);
const users={};
passport.use(
  new OAuth2Strategy(
    {
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Google profile:", profile);
      try {
        let user = await userdb.findOne({ googleId: profile.id });
        if (!user) {
          user = new userdb({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
          });
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3001/login",
  }),
  (req, res) => {
    res.cookie("user_email", req.user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.redirect(`http://localhost:3001/details?email=${req.user.email}`);
  }
);

// Your login route middleware for session handling
app.use((req, res, next) => {
  if (req.session && req.session.userId) {
    req.user = { id: req.session.userId };
  }
  next();
});

// Mount user routes
app.use('/api/v1', user);
const syllabusRoutes = require('./routes/user');
app.get('/api/v1/goals/:userId', (req, res) => {
  const { userId } = req.params;
  const { date } = req.query;
  Goal.find({ userId, deadline: date })
    .then((goals) => res.json({ data: goals }))
    .catch((error) => res.status(500).json({ error: error.message }));
});
server.listen(PORT, () => {
  console.log(`App + Socket.IO server is listening at http://localhost:${PORT}`);
});