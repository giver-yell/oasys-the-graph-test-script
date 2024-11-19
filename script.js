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
      console.error('GraphQL Error Response:', resultText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = JSON.parse(resultText);
    console.log('Query Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error executing query:', error);
  }
};

const url = 'https://graph.mainnet.oasys.games/subgraphs/name/oasys/staking';

const query = `
{
  validators(orderBy: id, first: 1000, block: { number: 5095899 }, where: { id: "0x4e5e774d3837bd9302b83cad94a112575411f07b" }) {
    id
    commissions
  }
}
`;

executeQuery(url, query);
