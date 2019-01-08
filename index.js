const Multicall = require('@makerdao/multicall');
const Web3 = require('web3');
const mkrAbi = require('./mkr.json');
const pipAbi = require('./pip.json');

const multicall = new Multicall('mainnet');
const web3 = new Web3(
  // 'https://eth-mainnet.alchemyapi.io/jsonrpc/fQLFb2wi-6nuQ54LrDR21zILhrV7n7Xj'
  // 'https://eth-mainnet.alchemyapi.io/jsonrpc/0O_RM5PjE3TH2DYU4tnLO5rcvaK2ytxu'
  'https://mainnet.infura.io/'
  // new Web3.providers.WebsocketProvider(
  // 'wss://mainnet.infura.io/ws'
  //   )
);

// sequential historical calls
// calling eth_call on historical blocks, one after another

// 5 blocks
// infura 1. 820.372ms 2. 828.879ms
// alchemy 1. 745.436ms 2.  950.839ms

// 300 blocks
// infura 1. 42,613.352ms 2. 42,911.797ms
// alchemy 1. 33,483.615ms 2. 35,800.974ms

// 5,000 blocks
// infura 1. DROPPED 2. DROPPED
// alchemy 1. 608,350.044ms 2. DROPPED

// concurrnet calls
// calls to pip.read sent all at once

// 5 concurrent calls
// infura 1. 406.217ms 2. 415.132ms
// alchemy 1. 405.262ms 2. 448.146ms

// 50 concurrent calls
// infura 1. 533.227ms 2. 628.551ms
// alchemy 1. 473.002ms 2. 628.838ms

// 150 concurrent calls
// infura 1. DROPPED 2. 978.372ms
// alchemy 1. 919.010ms 2. 834.455ms

// 300 concurrent calls
// infura 1. 1,840.207ms 2. DROPPED
// alchemy Rate lmited to 150 QPS

// past events
// historical mkr token transfer events

// 300 blocks -> 27 events
// infura 1. 561.585ms 2.  687.941ms
// alchemy 1. 521.185ms 2. 528.637ms

// 5,000 blocks –> 1,681 events
// infura 1. 7,851.980ms 2. 3,453.052ms
// alchemy 1. 2,642.535ms 2. 2,641.592ms

// 100,000 blocks –> 20,081 events
// infura 1. 55,202.708ms 2. 60,230.740ms
// alchemy 1. 59,811.317ms 2. 54,859.459ms

// all blocks
// infura 1. DROPPED 2. DROPPED
// alchemy 1. DROPPED 2. DROPPED

// wss://mainnet.infura.io/ws
// https://mainnet.infura.io/
// https://eth-mainnet.alchemyapi.io/jsonrpc/0O_RM5PjE3TH2DYU4tnLO5rcvaK2ytxu

const promiseWait = time =>
  new Promise(resolve => setTimeout(resolve, time || 0));

class Accounts {
  constructor() {
    this.addresses = [];
    this.addressState = {
      mkrBalance: null
    };
    this.latestFetchedBlock = null;
  }

  async init() {
    const mkrToken = new web3.eth.Contract(
      mkrAbi,
      '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'
    );

    // const totalSupply = await mkrToken.methods.totalSupply().call();

    const pip = new web3.eth.Contract(
      pipAbi,
      '0x729d19f657bd0614b4985cf1d82531c67569197b'
    );

    const START_BLOCK = 6913300;
    const END_BLOCK = 6918300;
    console.time(`call ${END_BLOCK - START_BLOCK} blocks`);
    for (let i = START_BLOCK; i < END_BLOCK; i++) {
      console.log(await pip.methods.read().call({}, i), i);
    }
    console.timeEnd(`call ${END_BLOCK - START_BLOCK} blocks`);

    // const NUM_CALLS = 150;
    // console.time(`${NUM_CALLS} concurrent calls`);
    // try {
    //   const res = await Promise.all(
    //     Array.apply(null, Array(NUM_CALLS)).map((_, i) =>
    //       i % 2 === 0
    //         ? pip.methods.read().call({})
    //         : mkrToken.methods.totalSupply().call({})
    //     )
    //   );
    //   console.log(res);
    //   console.timeEnd(`${NUM_CALLS} concurrent calls`);
    // } catch (err) {
    //   console.log('ahhh', err);
    // }

    // console.time(`${START_BLOCK - END_BLOCK} blocks`);
    // mkrToken.getPastEvents(
    //   'Transfer',
    //   {
    //     fromBlock: START_BLOCK,
    //     toBlock: END_BLOCK
    //   },
    //   (error, events) => {
    //     console.log(events);
    //     console.log(events.length);
    //     console.timeEnd(`${START_BLOCK - END_BLOCK} blocks`);
    //   }
    // );

    // const logs = await web3.eth
    //   .getPastLogs({
    //     address: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
    //     topics: [
    //       '0x033456732123ffff2342342dd12342434324234234fd234fd23fd4f23d4234'
    //     ]
    //   });
    //   console.log(logs)
    // const val = await web3.eth.call({
    //   to: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    //   data: generateCallData({
    //     method: web3.utils.sha3('balanceOf(address)').substr(0, 10),
    //     args: ['8e2a84d6ade1e7fffee039a35ef5f19f13057152']
    //   })
    // });
    // console.log(val);
    // web3.eth.subscribe('newBlockHeaders').on('data', blockHeader => {
    //   this.fetchLatest();
    // });

    // const { blockNumber, ...balances } = await multicall.aggregate(
    //   [
    //     '0x8e2a84d6ade1e7fffee039a35ef5f19f13057152',
    //     '0x8778b64f999aa8ed59045d8d67998a77ab51e258',
    //     '0xe4abc54f5a6288b60c18b361442a151fc4911da6'
    //   ].reduce(
    //     (acc, address) =>
    //       acc.concat({
    //         to: `0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2`,
    //         method: `balanceOf(address)`,
    //         args: [[address, 'address']],
    //         returns: [[`mkrBalance-${address}`, `uint256`]]
    //       }),
    //     []
    //   )
    // );
    // console.log(balances);
  }

  async fetchLatest() {
    // console.log(balances, 'blocks');
    // if (blockNumber === this.latestFetchedBlock) this.fetchLatest();
    // else {
    //   for (const [key, value] of Object.entries(balances)) {
    //     const [type, address] = key.split('-');
    //     this.addressState[address] = [type] = value;
    //   }
    //   this.latestFetchedBlock = blockNumber;
    // }
    // console.log(this.addressState);
  }

  registerAddress(address) {
    this.addresses.push(address);
    // console.log(address, 'address register');
  }
}

const accounts = new Accounts();
accounts.init();
accounts.registerAddress('0x8e2a84d6ade1e7fffee039a35ef5f19f13057152');
accounts.registerAddress('0x8778b64f999aa8ed59045d8d67998a77ab51e258');
accounts.registerAddress('0xe4abc54f5a6288b60c18b361442a151fc4911da6');
accounts.registerAddress('0x1f8978b550c0291627d5604a84e76fc044c23fb5');
(async () => await promiseWait(1000000))();
