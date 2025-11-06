const Problem = require("../models/problem");
const Submission = require("../models/submission");
const {getLanguageById, submitBatch, submitToken} = require("../utils/problemUtility");

const submitCode = async (req, res) => {
    try{ 
        const userId = req.result._id;
        const problemId = req.params.id;
        const {code, language} = req.body;

        // Validate input
        if(!userId || !code || !problemId || !language) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: user, code, problem, and language are required'
            });
        }

        // Fetch the problem from database
        const problem = await Problem.findById(problemId); 
        if(!problem) {
            return res.status(404).json({
                status: 'error',
                message: `Problem not found with ID: ${problemId}`
            });
        }

        // Ensure hiddenTestCases is an array
        const hiddenTestCases = Array.isArray(problem.hiddenTestCases) ? problem.hiddenTestCases : [];

        // Create submission record
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: 'pending',
            testCasesTotal: hiddenTestCases.length
        });

        // Resolve language ID
        let languageId = getLanguageById(language) || getLanguageById(String(language).toLowerCase());

        // Validate language ID with aliases
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

        if(!languageId) {
            submittedResult.status = 'error';
            submittedResult.errorMessage = `Invalid language: ${language}`;
            await submittedResult.save();
            return res.status(400).json({
                status: 'error',
                message: `Invalid language: ${language}`
            });
        }

        // If no hidden test cases, mark as accepted
        if(hiddenTestCases.length === 0){
            submittedResult.status = 'accepted';
            submittedResult.testCasesPassed = 0;
            submittedResult.errorMessage = null;
            submittedResult.runtime = 0;
            submittedResult.memory = 0;
            await submittedResult.save();
            
            // Update user's problemSolved array
            if (!Array.isArray(req.result.problemSolved)) {
                if (Array.isArray(req.result.problemSovled)) {
                    req.result.problemSolved = req.result.problemSovled.slice();
                    delete req.result.problemSovled;
                } else {
                    req.result.problemSolved = [];
                }
            }

            const alreadySolved = req.result.problemSolved.some(id => String(id) === String(problemId));
            if (!alreadySolved) {
                req.result.problemSolved.push(problemId);
                await req.result.save();
            }

            return res.status(201).json({
                status: 'accepted',
                message: 'Congratulations! Your solution passed all test cases.',
                stats: {
                    runtime: '0ms',
                    memory: '0KB'
                },
                testCases: {
                    total: 0,
                    passed: 0
                },
                accepted: true,
                runtime: 0,
                memory: 0
            });
        }

        // Prepare submissions for Judge0
        const submissions = hiddenTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        const submitResult = await submitBatch(submissions);
        
        // Validate Judge0 response
        if(!Array.isArray(submitResult) || submitResult.length === 0) {
            return res.status(502).json({
                status: 'error',
                message: 'Judge submission failed - no response'
            });
        }

        const resultToken = submitResult.map((value) => value.token).filter(Boolean);
        if(resultToken.length === 0) {
            return res.status(502).json({
                status: 'error',
                message: 'Judge returned no tokens'
            });
        }

        const testResult = await submitToken(resultToken);

        // Process test results
        let testCasesPassed = 0;
        let totalRuntime = 0;
        let maxMemory = 0;
        let status = 'accepted';
        let errorMessage = null;

        for(const test of testResult){
            if(test.status_id === 3){ // Accepted
                testCasesPassed++;
                totalRuntime += parseFloat(test.time) || 0;
                maxMemory = Math.max(maxMemory, test.memory || 0);
            } else {
                if(test.status_id === 4){ // Runtime Error
                    status = 'error';
                    errorMessage = test.stderr || 'Runtime error occurred';
                } else { // Wrong Answer or other errors
                    status = 'wrong_answer';
                    errorMessage = test.stderr || 'Wrong answer';
                }
                break; // Stop on first failure for submission
            }
        }

        // Update submission record
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = totalRuntime;
        submittedResult.memory = maxMemory;
        await submittedResult.save();
        
        // Update user's solved problems if accepted
        if (!Array.isArray(req.result.problemSolved)) {
            if (Array.isArray(req.result.problemSovled)) {
                req.result.problemSolved = req.result.problemSovled.slice();
                delete req.result.problemSovled;
            } else {
                req.result.problemSolved = [];
            }
        }

        const alreadySolved = req.result.problemSolved.some(id => String(id) === String(problemId));
        if (!alreadySolved && status === 'accepted') {
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }

        // Return formatted response for frontend
        const accepted = (status === 'accepted');
        return res.status(201).json({
            status: accepted ? 'accepted' : 'wrong_answer',
            message: accepted 
                ? `Congratulations! Your solution passed all test cases. (${testCasesPassed}/${hiddenTestCases.length})`
                : `Some test cases failed. (${testCasesPassed}/${hiddenTestCases.length})`,
            stats: {
                runtime: `${totalRuntime.toFixed(2)}ms`,
                memory: `${maxMemory}KB`
            },
            testCases: {
                total: hiddenTestCases.length,
                passed: testCasesPassed
            },
            accepted,
            runtime: totalRuntime,
            memory: maxMemory
        });

    } catch(err) {
        console.error('Submit code error:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error: ' + err.message
        });
    }
}

const runCode = async(req, res) => {
    try{ 
        const userId = req.result._id;
        const problemId = req.params.id;
        const {code, language, customTestCase} = req.body;

        // Validate input
        if(!userId || !code || !problemId || !language) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: user, code, problem, and language are required'
            });
        }

        // Fetch the problem from database
        const problem = await Problem.findById(problemId); 
        if(!problem) {
            return res.status(404).json({
                status: 'error',
                message: `Problem not found with ID: ${problemId}`
            });
        }

        // Use visible test cases for run, or custom test case if provided
        let testCasesToRun = Array.isArray(problem.visibleTestCases) ? problem.visibleTestCases : [];
        
        // If custom test case is provided, use it instead
        if (customTestCase) {
            testCasesToRun = [{
                input: customTestCase,
                output: '', // Custom test case won't have expected output
                explanation: 'Custom test case'
            }];
        }

        // Resolve language ID
        let languageId = getLanguageById(language) || getLanguageById(String(language).toLowerCase());

        // Validate language ID with aliases
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

        if(!languageId) {
            return res.status(400).json({
                status: 'error',
                message: `Invalid language: ${language}`
            });
        }

        // If no test cases to run
        if(testCasesToRun.length === 0){
            return res.status(201).json({
                status: 'success',
                message: 'No test cases to run',
                testCases: [],
                executionTime: '0ms',
                memoryUsed: '0KB',
                accepted: true,
                totalTestCases: 0,
                passedTestCases: 0,
                runtime: 0,
                memory: 0
            });
        }

        // Prepare submissions for Judge0
        const submissions = testCasesToRun.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: customTestCase ? null : testcase.output // Don't check output for custom test cases
        }));

        const submitResult = await submitBatch(submissions);
        
        // Validate Judge0 response
        if(!Array.isArray(submitResult) || submitResult.length === 0) {
            return res.status(502).json({
                status: 'error',
                message: 'Judge submission failed - no response'
            });
        }

        const resultToken = submitResult.map((value) => value.token).filter(Boolean);
        if(resultToken.length === 0) {
            return res.status(502).json({
                status: 'error',
                message: 'Judge returned no tokens'
            });
        }

        const testResult = await submitToken(resultToken);

        // Process test results for run
        let testCasesPassed = 0;
        let totalRuntime = 0;
        let maxMemory = 0;
        let accepted = true;
        const testCases = [];

        for(let i = 0; i < testResult.length; i++){
            const test = testResult[i];
            const testCase = testCasesToRun[i];
            const passed = test.status_id === 3; // Accepted
            
            if(passed){
                testCasesPassed++;
                totalRuntime += parseFloat(test.time) || 0;
                maxMemory = Math.max(maxMemory, test.memory || 0);
            } else {
                accepted = false;
            }

            testCases.push({
                input: testCase.input,
                output: test.stdout || test.stderr || 'No output',
                expected: customTestCase ? 'N/A (Custom test case)' : testCase.output,
                passed: passed
            });
        }

        // Return formatted response for frontend
        return res.status(201).json({
            status: accepted ? 'success' : 'error',
            message: accepted 
                ? `All test cases passed! (${testCasesPassed}/${testCasesToRun.length})`
                : `Some test cases failed. (${testCasesPassed}/${testCasesToRun.length})`,
            testCases: testCases,
            executionTime: `${totalRuntime.toFixed(2)}ms`,
            memoryUsed: `${maxMemory}KB`,
            accepted,
            totalTestCases: testCasesToRun.length,
            passedTestCases: testCasesPassed,
            runtime: totalRuntime,
            memory: maxMemory
        });

    } catch(err) {
        console.error('Run code error:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error: ' + err.message
        });
    }
}

module.exports = {submitCode, runCode};