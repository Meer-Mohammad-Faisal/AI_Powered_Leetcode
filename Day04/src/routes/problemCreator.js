const express = require('express');

const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");

//
// create 
// for admin only
problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.patch("/:id", updateProblem);
problemRouter.delete("/:id", deleteProblem);

// for user
problemRouter.get("/:id", getProblemById);
problemRouter.get("/", getAllProblem);
problemRouter.get("/user", solvedAllProblembyUser);

// fetch
// update
// delete