const { memo } = require("react");
const Problem = require("../models/problem");
const Submission = require("../models/submission");
const {getLanguageById, submitBatch, submitToken} = require("../utils/problemUtility");
const submitCode = async (req, res) => {

    try{
        const userId = req.result._id;
        const problemId = req.params.id;

        const {code, language} = req.body;

        if(!userId || !code || !problemId || !language)
            return res.status(400).send("Some field missing");

        // fetch the problem fro database
        const problem = await Problem.findById(problemId); 

        // testcases(Hidden)

        // kya apne submission ko store krdu database me, judge 0 se pahle
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: 'pending',
            testCasesTotal:problem.hiddenTestCases.length
        })

        // judge 0 code ko submit krna hai

        const languageId = getLanguageById(language);

        const submissions = problem.hiddenTestCases.map((testcase) =>({
                source_code: code,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }) );

        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((value) => value.token);
        const testResult = await submitToken(resultToken);

        // submittedResult ko update krna prega
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = 'accepted';
        let errorMessage = null;
        for(const test of testResult){
            if(test.status_id==3){
                testCasesPassed++;
                runtime = runtime+parseFloat(test.time);
                memory = Math.max(memory, test.memory);
            }
            else{
                if(test.status_id == 4){
                    status = 'error';
                    errorMessage = test.stderr;
                }
                else{
                    status = 'wrong';
                    errorMessage = test.stderr;
                }
            }
        }


        // store the result in database in submission
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;

        await submittedResult.save();

        res.status(201).send(submittedResult);

    }
    catch(err){
        res.status(500).send("Internal server error: "+err);
    }
}

module.exports = submitCode;