// このファイルは、二つのgraphqlに対して、total stakeをepochごとに比較する
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
  'https://graph.mainnet.oasys.games/subgraphs/name/oasys/staking', // Production URL
  // 'https://graph.explorer-v6-oasys.net/subgraphs/name/oasys/staking', // 手作業、接木 (URL A)
  // 'http://13.114.157.254:8000/subgraphs/name/oasys/staking/',        // grafting (URL B)
    'http://54.178.33.215:8000/subgraphs/name/oasys/staking/', // ifelse by bin-san
];

// 0x73929c46133d15eb2d08db628942ae2c5243a033 sample
// 0x6e28e5af24da4cb7bd669332244271edce95f747 validator

const myStakeQuery = (blockNumber) => `
{
  staker(id: "0x73929c46133d15eb2d08db628942ae2c5243a033", block: { number: ${blockNumber} }) {
    id
    totalStake
  }
}
`;

const blockNumbers = [1000000, 1500000, 1800000, 2000000, 2500000, 3000000, 5000000, 5100000, 5110000];

const getTotalStake = async (url, blockNumber) => {
  const query = myStakeQuery(blockNumber);
  const result = await executeQuery(url, query, blockNumber);
  if (result && result.data && result.data.staker && result.data.staker.totalStake) {
    return result.data.staker.totalStake;
  } else {
    return null;
  }
};

const checkBlocksForUrls = async (urls, blockNumbers) => {
  for (let blockNumber of blockNumbers) {
    console.log(`\nChecking block number: ${blockNumber}`);
    const [urlA, urlB] = urls;
    const totalStakeA = await getTotalStake(urlA, blockNumber);
    const totalStakeB = await getTotalStake(urlB, blockNumber);

    if (totalStakeA === totalStakeB) {
      console.log(`Block ${blockNumber}: totalStake values match: ${totalStakeA}`);
    } else {
      console.log(`Block ${blockNumber}: totalStake values differ!`);
      console.log(`URL A totalStake: ${totalStakeA}`);
      console.log(`URL B totalStake: ${totalStakeB}`);
    }
  }
};

checkBlocksForUrls(urls, blockNumbers);