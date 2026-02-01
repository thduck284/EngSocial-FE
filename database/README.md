# EngSocial Database - MongoDB Atlas

## 📊 Database Overview

### Collections (24 total)

| Collection | Description |
|------------|-------------|
| `users` | User accounts and profiles |
| `refresh_tokens` | JWT refresh tokens (TTL 30 days) |
| `skills` | Skill definitions (Reading, Listening, Writing) |
| `lessons` | All lesson content |
| `user_lesson_progress` | User progress on each lesson |
| `user_skill_stats` | Aggregated skill statistics per user |
| `user_daily_goals` | Daily learning goals (TTL 90 days) |
| `achievements` | Achievement definitions |
| `user_achievements` | Unlocked achievements per user |
| `notifications` | User notifications (TTL 30 days) |
| `friendships` | Friend relationships |
| `groups` | Study groups |
| `group_members` | Group membership |
| `posts` | Community posts |
| `post_likes` | Post likes |
| `comments` | Post comments |
| `challenges` | Weekly/monthly challenges |
| `challenge_participants` | Challenge participation |
| `games` | Mini games |
| `game_sessions` | Game play history |
| `chatbot_conversations` | AI chatbot conversations |
| `chatbot_messages` | Chat messages |
| `leaderboard_snapshots` | Periodic leaderboard data |
| `activity_logs` | User activity tracking (TTL 90 days) |

---

## 🚀 Setup MongoDB Atlas

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Login
3. Create a new **Free Tier** cluster (M0)

### Step 2: Configure Network Access

1. Go to **Network Access** in the sidebar
2. Click **Add IP Address**
3. For development: Add `0.0.0.0/0` (allows all IPs)
4. For production: Add specific IPs (Vercel IPs, your server IP)

### Step 3: Create Database User

1. Go to **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create username and password (save these!)
5. Set permissions: **Read and write to any database**

### Step 4: Get Connection String

1. Go to **Database** > **Connect**
2. Choose **Connect your application**
3. Select **Node.js** driver
4. Copy the connection string:

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/engsocial?retryWrites=true&w=majority
```

---

## 📦 Run Schema & Seed

### Option 1: Using MongoDB Shell (mongosh)

```bash
# Install mongosh
# Windows: winget install MongoDB.Shell
# Mac: brew install mongosh

# Run schema
mongosh "mongodb+srv://<cluster>.mongodb.net/engsocial" \
  --username <username> \
  < mongodb-schema.js

# Run seed data
mongosh "mongodb+srv://<cluster>.mongodb.net/engsocial" \
  --username <username> \
  < seed-data.js
```

### Option 2: Using MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Open **mongosh** tab at the bottom
4. Copy & paste content from `mongodb-schema.js`
5. Copy & paste content from `seed-data.js`

---

## 🔧 Backend Environment Variables

Add these to your backend `.env`:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/engsocial?retryWrites=true&w=majority
DB_NAME=engsocial

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173,https://your-app.vercel.app
```

---

## 📐 Data Model Relationships

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│   users     │────<│  lessons    │────<│ user_lesson_progress│
└─────────────┘     └─────────────┘     └─────────────────────┘
      │                                          │
      │     ┌─────────────────┐                  │
      ├────<│  friendships    │                  │
      │     └─────────────────┘                  │
      │                                          │
      │     ┌─────────────────┐                  │
      ├────<│  notifications  │                  │
      │     └─────────────────┘                  │
      │                                          │
      │     ┌─────────────────┐     ┌───────────┐
      ├────<│ user_skill_stats│     │  skills   │
      │     └─────────────────┘     └───────────┘
      │
      │     ┌─────────────────┐     ┌───────────────────────┐
      ├────<│ user_achievements│───>│     achievements      │
      │     └─────────────────┘     └───────────────────────┘
      │
      │     ┌─────────────────┐     ┌───────────┐
      ├────<│challenge_partici│───>│ challenges│
      │     └─────────────────┘     └───────────┘
      │
      │     ┌─────────────────┐     ┌───────────┐
      ├────<│  game_sessions  │───>│   games   │
      │     └─────────────────┘     └───────────┘
      │
      │     ┌─────────────────┐     ┌───────────┐
      ├────<│  group_members  │───>│  groups   │
      │     └─────────────────┘     └───────────┘
      │
      │     ┌─────────────────┐
      ├────<│     posts       │
      │     └────────┬────────┘
      │              │
      │     ┌────────┴────────┐
      │     │    comments     │
      │     └─────────────────┘
      │
      │     ┌─────────────────────┐     ┌───────────────────┐
      └────<│chatbot_conversations│────<│ chatbot_messages  │
            └─────────────────────┘     └───────────────────┘
```

---

## 🗂️ Files

| File | Description |
|------|-------------|
| `mongodb-schema.js` | Creates all collections with validation & indexes |
| `seed-data.js` | Inserts initial/sample data |
| `README.md` | This documentation |

---

## 🔍 Useful Queries

### Get user with stats
```javascript
db.users.aggregate([
  { $match: { _id: ObjectId("...") } },
  { $lookup: {
      from: "user_skill_stats",
      localField: "_id",
      foreignField: "userId",
      as: "skillStats"
    }
  },
  { $lookup: {
      from: "user_achievements",
      localField: "_id",
      foreignField: "userId",
      as: "achievements"
    }
  }
])
```

### Get lesson leaderboard
```javascript
db.user_lesson_progress.aggregate([
  { $match: { lessonId: ObjectId("..."), status: "completed" } },
  { $sort: { score: -1 } },
  { $limit: 10 },
  { $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  },
  { $unwind: "$user" },
  { $project: {
      score: 1,
      completedAt: 1,
      "user.name": 1,
      "user.avatar": 1
    }
  }
])
```

### Weekly XP leaderboard
```javascript
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
db.activity_logs.aggregate([
  { $match: { 
      createdAt: { $gte: weekAgo },
      xpChange: { $exists: true, $gt: 0 }
    }
  },
  { $group: {
      _id: "$userId",
      totalXp: { $sum: "$xpChange" }
    }
  },
  { $sort: { totalXp: -1 } },
  { $limit: 100 },
  { $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user"
    }
  }
])
```

---

## ⚡ Performance Tips

1. **Use indexes** - All important queries should hit indexes
2. **Limit results** - Always use `$limit` for paginated queries
3. **Project fields** - Only select fields you need with `$project`
4. **Use TTL indexes** - Auto-delete old data (notifications, logs)
5. **Compound indexes** - For queries with multiple conditions

---

## 🔐 Security Checklist

- [ ] Use strong database password
- [ ] Restrict IP access in production
- [ ] Enable database auditing
- [ ] Regular backups enabled
- [ ] Use environment variables (never commit credentials)
- [ ] Input validation on all user data
- [ ] Sanitize queries to prevent injection

---

## 📚 Resources

- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Mongoose ODM for Node.js](https://mongoosejs.com/)
- [MongoDB Aggregation Pipeline](https://www.mongodb.com/docs/manual/aggregation/)
