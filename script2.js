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
    // You can uncomment the next line to see the full response
    // console.log(`Query Result for URL: ${url}, Block: ${blockNumber}:`, JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error(`Error executing query for URL: ${url}, Block: ${blockNumber}:`, error);
    return null;
  }
};

const urls = [
//   'https://graph.mainnet.oasys.games/subgraphs/name/oasys/staking', // prod
  'https://graph.explorer-v6-oasys.net/subgraphs/name/oasys/staking', // binさんの手作業
  'http://13.114.157.254:8000/subgraphs/name/oasys/staking/', // bin さん grafting
];

const myStakeQuery = (blockNumber) => `
{
  staker(id: "0xd07e9f16687967d093f4570c960a7dc180895089", block: { number: ${blockNumber} }) {
    id
    totalStake
  }
}
`;

const fromBlock = 5095880;
const toBlock = 5095990;

const getTotalStake = async (url, blockNumber) => {
  const query = myStakeQuery(blockNumber);
  const result = await executeQuery(url, query, blockNumber);
  if (result && result.data && result.data.staker && result.data.staker.totalStake) {
    return result.data.staker.totalStake;
  } else {
    return null;
  }
};

const checkBlocksForUrls = async (urls, from, to) => {
  for (let blockNumber = from; blockNumber <= to; blockNumber++) {
    console.log(`\nChecking block number: ${blockNumber}`);
    const [urlA, urlB] = urls;
    const totalStakeA = await getTotalStake(urlA, blockNumber);
    const totalStakeB = await getTotalStake(urlB, blockNumber);

    if (totalStakeA === totalStakeB) {
      console.log(`Block ${blockNumber}: totalStake values match: ${totalStakeA}`);
    } else {
    //   console.log(`Block ${blockNumber}: totalStake values differ!`);
      console.log(`URL A totalStake: ${totalStakeA}`);
    //   console.log(`URL B totalStake: ${totalStakeB}`);
    }
  }
};

checkBlocksForUrls(urls, fromBlock, toBlock);