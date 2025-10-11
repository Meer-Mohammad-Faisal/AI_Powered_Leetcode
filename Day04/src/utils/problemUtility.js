const axios = require('axios');

const getLanguageById = (lang) => {
    const language = {
        "c++":105,
        "c":103,
        "java":91,
        "javascript":102,
        "python":109
    }

    return language[lang.toLowerCase()];
}




const submitBatch = async (submissions) =>{

  const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    base64_encoded: 'true'
  },
  headers: {
    'x-rapidapi-key': '5c1fc8d260msh1b48af1f8c0c18cp1d6544jsn05cb3c6632aa',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

return await fetchData();


}





//









module.exports = {getLanguageById, submitBatch};