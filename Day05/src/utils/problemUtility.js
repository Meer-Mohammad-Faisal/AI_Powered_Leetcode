const axios = require('axios');

const getLanguageById = (lang) => {
  const language = {
    "c++": 105,
    "c": 103,
    "java": 91,
    "javascript": 102,
    "python": 109
  };

  return language[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {

  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      base64_encoded: 'false',
      // wait: 'false',
      // fields: '*'
    },
    headers: {
      'x-rapidapi-key': '5c1fc8d260msh1b48af1f8c0c18cp1d6544jsn05cb3c6632aa',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: { submissions }
  };

  async function fetchData(){
    try{
      const response = await axios.request(options);
      return response.data;
    } catch(error){
      console.error(error);
    }
  }

  return await fetchData();
};

const waiting = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

const submitToken = async (resultToken) => {
  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resultToken.join(','),
      base64_encoded: 'false',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': '5c1fc8d260msh1b48af1f8c0c18cp1d6544jsn05cb3c6632aa',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
  };

  while (true) {
    const response = await axios.request(options);
    const result = response.data;

    const isDone = result.submissions.every((r) => r.status_id > 2);
    if (isDone) return result.submissions;

    await waiting(1000);
  }
};

module.exports = { getLanguageById, submitBatch, submitToken };
