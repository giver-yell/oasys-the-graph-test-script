import fetch from 'node-fetch';

const executeQuery = async (url, query, blockNumber) => {
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
      console.error(`GraphQL Error Response (URL: ${url}, Block: ${blockNumber}):`, resultText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = JSON.parse(resultText);
    // Uncomment the next line to see the full response
    // console.log(`Query Result for URL: ${url}, Block: ${blockNumber}:`, JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error(`Error executing query for URL: ${url}, Block: ${blockNumber}:`, error);
    return null;
  }
};

const urls = [
  // 'https://graph.mainnet.oasys.games/subgraphs/name/oasys/staking', // Production URL
  'https://graph.explorer-v6-oasys.net/subgraphs/name/oasys/staking', // 手作業、接木 (URL A)
  'http://13.114.157.254:8000/subgraphs/name/oasys/staking/',        // grafting (URL B)
];

// 0x73929c46133d15eb2d08db628942ae2c5243a033 sample
// 0x6e28e5af24da4cb7bd669332244271edce95f747 validator

const myValidatorQuery = (blockNumber) => `
{
  validator(id: "0x6e28e5af24da4cb7bd669332244271edce95f747", block: { number: ${blockNumber} }) {
    id
    totalStake
    blsPublicKey
  }
}
`;

const blockNumbers = [1000000, 3000000, 5000000, 5100000, 5110000];

const getStaker = async (url, blockNumber) => {
  const query = myValidatorQuery(blockNumber);
  const result = await executeQuery(url, query, blockNumber);
  if (result && result.data && result.data.validator) {
    return result.data.validator; // Return the entire staker object
  } else {
    console.log("---")
    console.log(url)
    console.log(result)
    return null;
  }
};

const checkBlocksForUrls = async (urls, blockNumbers) => {
  for (let blockNumber of blockNumbers) {
    console.log(`\nChecking block number: ${blockNumber}`);
    const [urlA, urlB] = urls;
    const stakerA = await getStaker(urlA, blockNumber);
    const stakerB = await getStaker(urlB, blockNumber);

    if (JSON.stringify(stakerA) === JSON.stringify(stakerB)) {
      console.log(`Block ${blockNumber}: Staker data matches.`);
      console.log(`Staker Data:`, stakerA);
    } else {
      console.log(`Block ${blockNumber}: Staker data differs!`);
      console.log(`URL A Staker:`, stakerA);
      console.log(`URL B Staker:`, stakerB);
    }
  }
};

checkBlocksForUrls(urls, blockNumbers);