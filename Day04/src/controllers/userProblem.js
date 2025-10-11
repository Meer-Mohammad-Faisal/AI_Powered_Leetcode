const {getLanguageById, submitBatch} = require("../utils/problemUtility");

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

            const submissions = visibleTestCases.map((input, output) =>({
                source_code: completeCode,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }) );


            const subminResult = await submitBatch(submissions);
        }


    }
    catch(err){

    }
}

