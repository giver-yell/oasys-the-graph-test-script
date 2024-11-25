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
    console.log(`Query Result for URL: ${url}, Block: ${blockNumber}:`, JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`Error executing query for URL: ${url}, Block: ${blockNumber}:`, error);
  }
};

// Fix this here.
const urls = [
  'https://graph.mainnet.oasys.games/subgraphs/name/oasys/staking',
  // 'https://graph.explorer-v6-oasys.net/subgraphs/name/oasys/staking',
  // 'https://graph.mainnet.oasys.games/subgraphs/name/oasys/staking',
  'http://13.114.157.254:8000/subgraphs/name/oasys/staking/', // bin さん
  // 'http://43.206.252.135:8000/subgraphs/name/oasys/staking' // shirai
  'http://13.114.157.254:8000/subgraphs/name/oasys/staking/' // binさんのgrafting 
];

const createQuery = (blockNumber) => `
{
  validators(
    orderBy: id,
    first: 1000,
    block: { number: ${blockNumber} },
    where: { id: "0x15f41edfe3556b853d79f96edbae4b68c0217673" }
  ) {
    id
    commissions
  }
}
`;

const myStakeQuery = () => `
{
  staker(id: "0xd07e9f16687967d093f4570c960a7dc180895089") {
    id
    totalStake
  }
}
`

// Fix this here.
// hardfork = 5095900;
const fromBlock = 4095890;
const toBlock = 4095910;

// const fromBlock = 13599;
// const toBlock = 13600;

const checkBlocksForUrls = async (urls, from, to) => {
  for (const url of urls) {
    console.log(`Checking blocks for URL: ${url}`);
    for (let blockNumber = from; blockNumber <= to; blockNumber++) {
      // const query = createQuery(blockNumber);
      const query = myStakeQuery();
      await executeQuery(url, query, blockNumber);
    }
  }
};

checkBlocksForUrls(urls, fromBlock, toBlock);
