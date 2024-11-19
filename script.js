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
      console.error(`GraphQL Error Response (URL: ${url}, Block ${blockNumber}):`, resultText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = JSON.parse(resultText);
    console.log(`Query Result for URL: ${url}, Block ${blockNumber}:`, JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`Error executing query for URL: ${url}, Block ${blockNumber}:`, error);
  }
};

// Fix this here.
const urls = [
  // 'https://graph.mainnet.oasys.games/subgraphs/name/oasys/staking',
  'https://graph.explorer-v6-oasys.net/subgraphs/name/oasys/staking',
  // 'https://graph.mainnet.oasys.games/subgraphs/name/oasys/staking',
];

const createQuery = (blockNumber) => `
{
  validators(
    orderBy: id,
    first: 1000,
    block: { number: ${blockNumber} },
    where: { id: "0x4e5e774d3837bd9302b83cad94a112575411f07b" }
  ) {
    id
    commissions
  }
}
`;

const blockNumbers = [5095898, 5095899, 5095900];

urls.forEach((url) => {
  blockNumbers.forEach((blockNumber) => {
    const query = createQuery(blockNumber);
    executeQuery(url, query, blockNumber);
  });
});
