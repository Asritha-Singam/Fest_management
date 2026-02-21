import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js"
import { createServer } from "http";
import { Server } from "socket.io";

import bcrypt from "bcrypt";
import User from "./models/User.js";

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join event forum room
  socket.on("join-forum", (eventId) => {
    socket.join(`forum-${eventId}`);
    console.log(`User ${socket.id} joined forum-${eventId}`);
  });

  // Leave event forum room
  socket.on("leave-forum", (eventId) => {
    socket.leave(`forum-${eventId}`);
    console.log(`User ${socket.id} left forum-${eventId}`);
  });

  // Handle message posted (this will be emitted from frontend or backend)
  socket.on("message-posted", (data) => {
    // Broadcast to all users in event forum
    io.to(`forum-${data.eventId}`).emit("new-message", data);
  });

  // Handle question posted
  socket.on("question-posted", (data) => {
    io.to(`forum-${data.eventId}`).emit("new-question", data);
  });

  // Handle answer posted
  socket.on("answer-posted", (data) => {
    io.to(`forum-${data.eventId}`).emit("new-answer", data);
  });

  // Handle message deleted
  socket.on("message-deleted", (data) => {
    io.to(`forum-${data.eventId}`).emit("message-deleted", data);
  });

  // Handle message pinned/unpinned
  socket.on("message-pinned", (data) => {
    io.to(`forum-${data.eventId}`).emit("message-pinned", data);
  });

  // Handle reaction added
  socket.on("reaction-added", (data) => {
    io.to(`forum-${data.eventId}`).emit("reaction-updated", data);
  });

  // Handle announcement posted
  socket.on("announcement-posted", (data) => {
    io.to(`forum-${data.eventId}`).emit("new-announcement", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Export io for use in other files
export { io };

const createAdminIfNotExists = async ()=>{
    const adminEmail = process.env.ADMIN_EMAIL;
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        const adminUser = new User({
            firstName: "System",
            lastName: "Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin"
        });
        await adminUser.save();
        console.log("Admin user created with email:", adminEmail);
    }
}

const startServer = async () => {
  try {
    await connectDB();
    await createAdminIfNotExists();

    server.listen(PORT, () => {
      console.log(`Server started on PORT ${PORT}!`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
};

startServer();
