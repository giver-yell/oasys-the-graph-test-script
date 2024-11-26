import { ethers } from 'ethers';
import fs from 'fs';

// バリデーターのアドレス
const validatorAddress = '0x5f6831bda9d0483054eb50a48966d65d2b156c7b';

// スマートコントラクトのアドレスとABI
const contractAddress = '0x0000000000000000000000000000000000001001';
const abi = [
    {
        "inputs": [
          {
            "internalType": "address",
            "name": "validator",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "epoch",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "cursor",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "howMany",
            "type": "uint256"
          }
        ],
        "name": "getValidatorStakes",
        "outputs": [
          {
            "internalType": "address[]",
            "name": "_stakers",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "stakes",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256",
            "name": "newCursor",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
];

// プロバイダーの設定
const provider = new ethers.JsonRpcProvider('https://rpc.mainnet.oasys.games');

// コントラクトインスタンスの作成
const contract = new ethers.Contract(contractAddress, abi, provider);

// 処理するエポック
const epoch = 787;

// ステーカー情報を格納する配列
let nonZeroStakers = [];

// 初期カーソル位置と一度に取得する件数
let cursor = 0;
const howMany = 100;

// 非同期関数の実行
(async () => {
    try {
        while (true) {
            const result = await contract.getValidatorStakes(validatorAddress, epoch, cursor, howMany);
            const stakers = result._stakers;
            const stakes = result.stakes;
            const newCursor = result.newCursor;

            for (let i = 0; i < stakers.length; i++) {
                console.log(`Index ${i}: stake = ${stakes[i]}, type = ${typeof stakes[i]}`);
                if (stakes[i] !== 0n) { // bigint型の場合
                    nonZeroStakers.push({
                        staker: stakers[i],
                        stake: stakes[i].toString()
                    });
                }
            }

            // 取得したステーカー数が少ない場合、全て取得済み
            if (stakers.length < howMany) {
                break;
            }

            // カーソルを更新
            console.log(`newCursor: ${newCursor}`);
            cursor = newCursor;
        }

        console.log(`ステーク額が 0 ではないステーカーの件数: ${nonZeroStakers.length}`);

        // CSVファイルに書き込み
        const csvHeader = 'staker,stake\n';
        const csvRows = nonZeroStakers.map(item => `${item.staker},${item.stake}`).join('\n');
        fs.writeFileSync('non_zero_stakers.csv', csvHeader + csvRows);

        console.log('non_zero_stakers.csv にデータを書き込みました。');
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
})();