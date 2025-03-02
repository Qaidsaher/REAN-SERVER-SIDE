// server.js
const express = require('express');
const cors = require('cors'); // ✅ Import CORS middleware
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const innovationRoutes = require('./routes/innovationRoutes');
const innovatorRoutes = require('./routes/innovatorRoutes');
const investorRoutes = require('./routes/investorRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const commitmentRoutes = require('./routes/commitmentRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const chattingRoutes = require('./routes/chattingRoutes');
const relationsRoutes = require('./routes/relationsRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/usersRoutes');
const userChatRoutes = require("./routes/userChatRoutes");
const investorUserRoutes = require('./routes/investorUserRoutes')
const userInvestmentRoute = require('./routes/investmentRoutes')
const adminUserRoutes = require('./routes/adminUserRoutes') 
//------------------------------
const path = require("path");

const websiteRoutes =require('./routes/websiteRoutes') 
const chatRoutes = require('./routes/chatRoutes')
const profileRoutes = require('./routes/profileRoutes')
require('dotenv').config();

const app = express();
connectDB();
// Example using Express middleware:
app.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.join(__dirname, "uploads")));

// ✅ Enable CORS
const corsOptions = {
  origin: "http://localhost:5173", // your frontend URL
  credentials: false,
};

app.use(cors(corsOptions));

  
app.use(express.json());
// app.use((req, res, next) => {
//   console.log("Request URL:", req.url);
//   next();
// });



app.use('/api/admin', adminRoutes);
app.use('/api/website',websiteRoutes)
app.use('/api/admin/users',adminUserRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/innovation', innovationRoutes);
app.use('/api/innovator', innovatorRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/commitment', commitmentRoutes);
app.use('/api/investment', investmentRoutes);
app.use('/api/chats', chattingRoutes);
app.use('/api/user/chat',chatRoutes)
app.use('/api/user/profile',profileRoutes)

app.use('/api/relations', relationsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use("/api/user", userChatRoutes);
app.use("/api/user/investors", investorUserRoutes);
app.use("/api/user/investments", userInvestmentRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
