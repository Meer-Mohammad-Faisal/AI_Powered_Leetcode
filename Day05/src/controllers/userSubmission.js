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
        if(!problem)
            return res.status(404).send("Problem not found");

        // ensure hiddenTestCases is an array before using length
        const hiddenTestCases = Array.isArray(problem.hiddenTestCases) ? problem.hiddenTestCases : [];

        // kya apne submission ko store krdu database me, judge 0 se pahle
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: 'pending',
            testCasesTotal: hiddenTestCases.length
        })

        // judge 0 code ko submit krna hai

        // try to resolve the language id from various forms and aliases
        let languageId = getLanguageById(language) || getLanguageById(String(language).toLowerCase());

        // validate language id returned from utility, support common aliases
        if(!languageId){
            const aliases = {
                'cpp': ['cpp17', 'cpp14', 'c++'],
                'c++': ['cpp17', 'cpp14', 'cpp'],
                'js': ['javascript', 'nodejs'],
                'javascript': ['nodejs', 'js'],
                'py': ['python3', 'python'],
                'python': ['python3', 'py']
            };
            const key = String(language).toLowerCase();
            if(aliases[key]){
                for(const alias of aliases[key]){
                    const id = getLanguageById(alias);
                    if(id){
                        languageId = id;
                        break;
                    }
                }
            }
        }

        // still not resolved -> record error and return
        if(!languageId) {
            submittedResult.status = 'error';
            submittedResult.errorMessage = `Invalid language: ${language}`;
            await submittedResult.save();
            return res.status(400).send(`Invalid language: ${language}`);
        }

        // if there are no hidden test cases, mark accepted and return early
        if(hiddenTestCases.length === 0){
            submittedResult.status = 'accepted';
            submittedResult.testCasesPassed = 0;
            submittedResult.errorMessage = null;
            submittedResult.runtime = 0;
            submittedResult.memory = 0;
            await submittedResult.save();
            return res.status(201).send(submittedResult);
        }

        const submissions = hiddenTestCases.map((testcase) => ({
                source_code: code,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }) );

        const submitResult = await submitBatch(submissions);
        // ensure judge returned tokens
        if(!Array.isArray(submitResult) || submitResult.length === 0)
            return res.status(502).send("Judge submission failed");

        const resultToken = submitResult.map((value) => value.token).filter(Boolean);
        if(resultToken.length === 0)
            return res.status(502).send("Judge returned no tokens");

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
        
        // Problem id ko insert krenge userSchema ke problemSolved me if it is
        // not present there.

        // ensure the correct field name exists (migrate if the old misspelled field exists)
        if (!Array.isArray(req.result.problemSolved)) {
            if (Array.isArray(req.result.problemSovled)) {
                // migrate old misspelled entries
                req.result.problemSolved = req.result.problemSovled.slice();
                delete req.result.problemSovled;
            } else {
                req.result.problemSolved = [];
            }
        }

        // compare as strings to avoid ObjectId vs string mismatches
        const alreadySolved = req.result.problemSolved.some(id => String(id) === String(problemId));
        if (!alreadySolved) {
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }

        res.status(201).send(submittedResult); 

    }
    catch(err){
        res.status(500).send("Internal server error: "+err);
    }
}




const runCode = async(req, res)=>{


 try{ 
        const userId = req.result._id;
        const problemId = req.params.id;

        const {code, language} = req.body;

        if(!userId || !code || !problemId || !language)
            return res.status(400).send("Some field missing");

        // fetch the problem fro database
        const problem = await Problem.findById(problemId); 

        // testcases(Hidden)
        if(!problem)
            return res.status(404).send("Problem not found");

        // ensure hiddenTestCases is an array before using length
        const visibleTestCases = Array.isArray(problem.visibleTestCases) ? problem.visibleTestCases : [];

        // // kya apne submission ko store krdu database me, judge 0 se pahle
        // const submittedResult = await Submission.create({
        //     userId,
        //     problemId,
        //     code,
        //     language,
        //     status: 'pending',
        //     testCasesTotal: hiddenTestCases.length
        // })

        // judge 0 code ko submit krna hai

        // try to resolve the language id from various forms and aliases
        let languageId = getLanguageById(language) || getLanguageById(String(language).toLowerCase());

        // validate language id returned from utility, support common aliases
        if(!languageId){
            const aliases = {
                'cpp': ['cpp17', 'cpp14', 'c++'],
                'c++': ['cpp17', 'cpp14', 'cpp'],
                'js': ['javascript', 'nodejs'],
                'javascript': ['nodejs', 'js'],
                'py': ['python3', 'python'],
                'python': ['python3', 'py']
            };
            const key = String(language).toLowerCase();
            if(aliases[key]){
                for(const alias of aliases[key]){
                    const id = getLanguageById(alias);
                    if(id){
                        languageId = id;
                        break;
                    }
                }
            }
        }

        // still not resolved -> record error and return
        if(!languageId) {
            submittedResult.status = 'error';
            submittedResult.errorMessage = `Invalid language: ${language}`;
            await submittedResult.save();
            return res.status(400).send(`Invalid language: ${language}`);
        }

        // if there are no hidden test cases, mark accepted and return early
        if(visibleTestCases.length === 0){
            submittedResult.status = 'accepted';
            submittedResult.testCasesPassed = 0;
            submittedResult.errorMessage = null;
            submittedResult.runtime = 0;
            submittedResult.memory = 0;
            await submittedResult.save();
            return res.status(201).send(submittedResult);
        }

        const submissions = visibleTestCases.map((testcase) => ({
                source_code: code,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }) );

        const submitResult = await submitBatch(submissions);
        // ensure judge returned tokens
        if(!Array.isArray(submitResult) || submitResult.length === 0)
            return res.status(502).send("Judge submission failed");

        const resultToken = submitResult.map((value) => value.token).filter(Boolean);
        if(resultToken.length === 0)
            return res.status(502).send("Judge returned no tokens");

        const testResult = await submitToken(resultToken);

        


        
        
        // Problem id ko insert krenge userSchema ke problemSolved me if it is
        // not present there.

       

        res.status(201).send(testResult); 

    }
    catch(err){
        res.status(500).send("Internal server error: "+err);
    }
}



module.exports = {submitCode, runCode};