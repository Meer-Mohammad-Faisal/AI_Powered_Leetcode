const {getLanguageById, submitBatch, submitToken} = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");


const createProblem = async (req, res) =>{

    const {title, description, difficulty, tags,
        visibleTestCases, hiddenTestCases, startCode, 
        refrenceSolution, problemCreator
    } = req.body;

 
    try{

       

        for(const {language, completeCode} of refrenceSolution){

            // source code:
            // language id:
            // stdin:
            // expectedOutput:

            const languageId = getLanguageById(language);

            const submissions = visibleTestCases.map((testcase) =>({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }) );


            const submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map((value) => value.token);
            const testResult = await submitToken(resultToken);


            

            for(const test of testResult){
                if(test.status_id != 3){
                    return res.status(400).send("Error Occured");
                }
            }

        }


        // now we can store in db
        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        });

        res.status(201).send("Problem Saved Successfully");

    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}

const updateProblem = async (req, res) =>{
    const {id} = req.params;
    const {title, description, difficulty, tags,
        visibleTestCases, hiddenTestCases, startCode, 
        refrenceSolution, problemCreator
    } = req.body;

    try{

         if(!id){
            return res.status(400).send("Missing Id Field");
        }

        const DsaProblem = await Problem.findById(id);
        if(!DsaProblem)
        {
            return res.status(404).send("ID is not present in server");
        }

        for(const {language, completeCode} of refrenceSolution){

            // source code:
            // language id:
            // stdin:
            // expectedOutput:

            const languageId = getLanguageById(language);

            const submissions = visibleTestCases.map((testcase) =>({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }) );


            const submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map((value) => value.token);
            const testResult = await submitToken(resultToken);


            

            for(const test of testResult){
                if(test.status_id != 3){
                    return res.status(400).send("Error Occured");
                }
            }

        }


        const newProblem = await Problem.findByIdAndUpdate(id, {...req.body}, {runValidators:true, new: true});

        res.status(200).send(newProblem);



    }
    catch(err){
        res.status(500).send("Error: "+err);
    }
}

const deleteProblem = async (req, res) =>{
    const {id} = req.params;
    
    try{
        if(!id){
            return res.status(400).send("ID is missing");
        }

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if(!deletedProblem)
            return res.status(404).send("Problem is Missing");

        res.status(200).send("Successfully Deleleted");
    }
    catch(err){
        res.status(500).send("Error "+err);
    }
}

const getProblemById = async (req, res) =>{
    const {id} = req.params;
    try{
        if(!id){
            return res.status(400).json({ error: "ID is missing" });
        }
 
        const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases hiddenTestCases startCode refrenceSolution');

        if(!getProblem){
            return res.status(404).json({ error: "Problem not found" });
        }
        
        // Transform the data for frontend
        const problemData = {
            _id: getProblem._id,
            title: getProblem.title,
            description: getProblem.description,
            difficulty: getProblem.difficulty,
            tags: getProblem.tags,
            visibleTestCases: getProblem.visibleTestCases || [],
            hiddenTestCases: getProblem.hiddenTestCases || [],
            startCode: getProblem.startCode || [],
            refrenceSolution: getProblem.refrenceSolution || []
        };

        res.status(200).json(problemData);
    }
    catch(err){
        console.error('Error fetching problem:', err);
        res.status(500).json({ error: "Internal server error" });
    }
}

const getAllProblem = async (req, res) =>{
    try{

        const getProblem = await Problem.find({}).select('_id title difficulty tags');

        if(getProblem.length == 0){
            return res.status(404).send("Problem is Missinng");
        }
         res.status(200).send(getProblem);
        }
        catch(err){
            res.status(500).send("Error "+err);
        }


        // we gonna implemetn pagination. to fetch the 10 problem at 1 page and so on.

}

const solvedAllProblembyUser = async (req, res) =>{
    try{

        const userId = req.result._id;
        const user = await User.findById(userId).populate({
            path:"problemSolved",
            select:"_id title difficulty tags"
        });

        res.status(200).send(user.problemSolved);
    }catch(err){
        res.status(500).send("Server error");
    }
}


const submittedProblem = async(req, res) => {
    try{
        const userId = req.result._id;
        const problemId = req.params.pid;

        const ans = await Submission.find({userId,problemId});

        if(ans.length == 0) {
            res.send(200).send("No Submission is Present");
        }
        res.status(200).send(ans);
    }catch(err){
        res.status(500).send("internal Server Error");
    }
}



// const SUBMISSION_COOLDOWN_MS = 10 * 1000;

// const submissionRateLimiter = async (req, res, next) => {
//     try {
//         const userId = req.result && req.result._id;
//         if (!userId) return res.status(401).send("Unauthorized");

//         const lastSubmission = await Submission.findOne({ userId }).sort({ createdAt: -1 }).select("createdAt");

//         if (lastSubmission) {
//             const elapsed = Date.now() - new Date(lastSubmission.createdAt).getTime();
//             if (elapsed < SUBMISSION_COOLDOWN_MS) {
//                 const waitSeconds = Math.ceil((SUBMISSION_COOLDOWN_MS - elapsed) / 1000);
//                 return res.status(429).send(`Please wait ${waitSeconds} second(s) before submitting again`);
//             }
//         }

//         next();
//     } catch (err) {
//         res.status(500).send("Rate limiter error");
//     }
// };

// exports.submissionRateLimiter = submissionRateLimiter;



module.exports = {createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblembyUser, submittedProblem};