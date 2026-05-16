# FaisCode - AI-Powered LeetCode

FaisCode is an AI-powered full-stack coding platform inspired by LeetCode, built to provide a complete problem-solving experience with authentication, online code execution, hidden test case evaluation, role-based access control, and scalable backend architecture.

The platform allows users to solve DSA problems in multiple programming languages while enabling admins to create, manage, and validate coding problems dynamically.

---

# Features

## Authentication & Authorization

* User signup and login
* JWT-based authentication
* Secure password hashing using bcrypt
* Cookie-based session handling
* Role-based access control (User/Admin)
* Logout with Redis token blacklist

## Problem Management

* Create coding problems
* Add visible and hidden test cases
* Add starter code templates
* Add reference solutions
* Difficulty-based categorization
* Tag-based filtering
* Admin-only problem creation

## Online Code Execution

* Multi-language code execution using Judge0 API
* Supports:

  * C
  * C++
  * Java
  * JavaScript
  * Python
* Batch submission handling
* Hidden test case evaluation
* Runtime and memory tracking
* Submission status tracking

## Submission System

* User code submission
* Automatic judging system
* Accepted/Wrong Answer/Error handling
* Test case pass count
* Runtime calculation
* Memory usage calculation

## Backend Features

* REST API architecture
* MongoDB database integration
* Mongoose schema validation
* Redis integration
* Secure environment configuration using dotenv
* Modular folder structure
* Middleware-based authorization

---

# Tech Stack

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Redis
* JWT
* bcrypt
* Judge0 API

## Frontend

* React.js
* Redux Toolkit
* Axios
* Tailwind CSS

---

# Project Structure

```bash
AI_Leetcode/
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   │
│   ├── controllers/
│   │   ├── userAuthent.js
│   │   ├── userProblem.js
│   │   └── userSubmission.js
│   │
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   └── userMiddleware.js
│   │
│   ├── models/
│   │   ├── user.js
│   │   ├── problem.js
│   │   └── submission.js
│   │
│   ├── routes/
│   │   ├── userAuth.js
│   │   ├── problemCreator.js
│   │   └── submit.js
│   │
│   ├── utils/
│   │   ├── validator.js
│   │   └── problemUtility.js
│   │
│   └── index.js
│
├── .env
├── package.json
└── README.md
```

---

# Database Models

## User Model

Stores:

* Name
* Email
* Password
* Role
* Solved problems

## Problem Model

Stores:

* Problem title
* Description
* Difficulty
* Tags
* Visible test cases
* Hidden test cases
* Starter code
* Reference solutions

## Submission Model

Stores:

* Submitted code
* Language
* Runtime
* Memory usage
* Submission status
* Passed test cases

---

# API Endpoints

## Authentication

### Register User

```http
POST /user/register
```

### Login User

```http
POST /user/login
```

### Logout User

```http
POST /user/logout
```

---

## Problems

### Create Problem

```http
POST /problem/create
```

### Get Problem

```http
GET /problem/:id
```

---

## Submission

### Submit Code

```http
POST /submission/:id
```

---

# Environment Variables

Create a `.env` file in the root directory.

```env
PORT=3000

DB_CONNECT_STRING=your_mongodb_connection_string

JWT_KEY=your_secret_key

REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Meer-Mohammad-Faisal/FaisCode.git
```

## Navigate to Project

```bash
cd FaisCode
```

## Install Dependencies

```bash
npm install
```

## Start Backend Server

```bash
npm run dev
```

---

# Judge0 Integration Flow

1. User submits code.
2. Backend receives submission.
3. Hidden test cases are fetched.
4. Judge0 API executes code.
5. Tokens are generated.
6. Backend polls Judge0 for results.
7. Results are validated.
8. Submission details are stored in MongoDB.

---

# Security Features

* JWT authentication
* Password hashing with bcrypt
* Redis token blacklisting
* HTTP-only cookies
* Role-based route protection
* Input validation
* Protected admin routes

---

# Future Improvements

* AI-generated coding hints
* AI-based code review
* Contest system
* Real-time leaderboard
* Code plagiarism detection
* Discussion section
* Interview preparation tracks
* Docker deployment
* Kubernetes support
* WebSocket-based live contests

---

# Learning Outcomes

This project demonstrates:

* Backend architecture design
* REST API development
* Authentication systems
* Database schema design
* Redis integration
* Third-party API integration
* Online code execution workflow
* Role-based authorization
* Full-stack development
* Scalable backend engineering

---

# Author

Meer Mohammad Faisal

* Full Stack Developer
* MERN Stack Developer
* AI & Backend Enthusiast
* DSA Problem Solver
