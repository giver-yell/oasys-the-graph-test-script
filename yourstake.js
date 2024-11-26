import fetch from 'node-fetch';

const executeQuery = async (url, query) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const resultText = await response.text();
    if (!response.ok) {
      console.error(`GraphQL Error Response (URL: ${url}):`, resultText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = JSON.parse(resultText);
    console.log(`Query Result for URL: ${url}:`, JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`Error executing query for URL: ${url}:`, error);
  }
};

const urls = [
  'https://graph.mainnet.oasys.games/subgraphs/name/oasys/staking',
];

const createLatestStakeQuery = (stakerAddress) => `
{
  staker(id: "${stakerAddress}") {
    id
    totalStake
  }
}
`;

const stakerAddress = "0x9d70Ef152Ba2E56B911568060285E33f4495454a".toLowerCase();


const checkLatestStakeForUrls = async (urls, stakerAddress) => {
  for (const url of urls) {
    console.log(`Checking latest stake for URL: ${url}`);
    const query = createLatestStakeQuery(stakerAddress);
    await executeQuery(url, query);
  }
};

checkLatestStakeForUrls(urls, stakerAddress);
