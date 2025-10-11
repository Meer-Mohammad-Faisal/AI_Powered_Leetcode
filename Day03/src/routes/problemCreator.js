const express = require('express');

const problemRouter = express.Router();


//
// create 
// for admin only
problemRouter.post("/create", problemCreate);
problemRouter.patch("/:id", problemUpdate);
problemRouter.delete("/:id", problemDelete);

// for user
problemRouter.get("/:id", problemFetch);
problemRouter.get("/", getAllProblem);
problemRouter.get("/user", solveProblem);

// fetch
// update
// delete