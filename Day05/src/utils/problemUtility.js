const axios = require('axios');

const getLanguageById = (lang) => {
  const language = {
    "c": 50,
    "c++": 54,
    "java": 62,
    "javascript": 63,
    "python": 71
  };

  return language[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {
console.log("Submitting:", JSON.stringify({ submissions }, null, 2));

  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      base64_encoded: 'false',
      wait: 'false',
      // fields: '*'
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_KEY,
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
      'x-rapidapi-key': process.env.JUDGE0_KEY,
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
