const Multicall = require('@makerdao/multicall');
const Web3 = require('web3');

const multicall = new Multicall('mainnet');
const web3 = new Web3(
  //   'https://eth-mainnet.alchemyapi.io/jsonrpc/fQLFb2wi-6nuQ54LrDR21zILhrV7n7Xj'
  // 'https://eth-mainnet.alchemyapi.io/jsonrpc/0O_RM5PjE3TH2DYU4tnLO5rcvaK2ytxu'
  'https://mainnet.infura.io/'
  //   new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws')
);

const promiseWait = time =>
  new Promise(resolve => setTimeout(resolve, time || 0));

const promiseRetry = (fn, times = 3) =>
  fn().catch(err =>
    times > 0
      ? promiseWait(delay).then(() => promiseRetry(fn, times - 1))
      : Promise.reject(err)
  );

// {
//   key: `proposals.${address}.bar.baz`,
//   to: '0xa63E145309cadaa6A903a19993868Ef7E85058BE', // proxy factory
//   method: `hotMap(address)`,
//   args: [[address, 'address']],
//   returns: [[`proxyAddressHot-${address}`, 'address']]
// },
// {
//   key: `proposals.${address}.bar.baz`,
//   poll: true,
//   to: '0xa63E145309cadaa6A903a19993868Ef7E85058BE', // proxy factory
//   method: `hotMap(address)`,
//   args: [[address, 'address']],
//   returns: [[`proxyAddressHot-${address}`, 'address']]
// },

// [
//   {
//     template: 'proposals.bar.baz',
//     key: `proposals.${address}.bar.baz`,
//     initial: true,
//     to: '0xa63E145309cadaa6A903a19993868Ef7E85058BE', // proxy factory
//     method: `hotMap(address)`,
//     args: [[address, 'address']],
//     returns: [[`proxyAddressHot-${address}`, 'address']]
//   },
// ]

// createCdp -> 'proposals.bar.baz', { address }

// chiefStateObject`proposals.${address}`

const chiefTemplate = address => [
  {
    to: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', // mkr token
    method: `balanceOf(address)`,
    args: [[address, 'address']],
    returns: [[`mkrBalance-${address}`, 'uint256']]
  },
  {
    to: '0xfd536f5bc03ed27a240b3f80da898c9e4c33e7b1', // eth balance helper
    method: `ethBalanceOf(address)`,
    args: [[address, 'address']],
    returns: [[`ethBalance-${address}`, 'uint256']]
  },
  {
    to: '0xa63E145309cadaa6A903a19993868Ef7E85058BE', // proxy factory
    method: `hotMap(address)`,
    args: [[address, 'address']],
    returns: [[`proxyAddressHot-${address}`, 'address']]
  },
  {
    to: '0xa63E145309cadaa6A903a19993868Ef7E85058BE', // proxy factory
    method: `coldMap(address)`,
    args: [[address, 'address']],
    returns: [[`proxyAddressCold-${address}`, 'address']]
  }
];

class ChiefState {
  constructor() {
    this.proposals = {
      foo: {}
    };
    this.template = templates`template_key`;
    this.latestFetchedBlock = null;
    this.init = this.init.bind(this);
  }
}

class Accounts {
  constructor() {
    this.addresses = [];
    this.callPath = [];
    this.latestFetchedBlock = null;
    this.init = this.init.bind(this);
  }

  async init() {
    const blockNumber = await web3.eth.getBlockNumber();
    if (blockNumber !== this.latestFetchedBlock) {
      promiseRetry(() => this.fetchLatest(blockNumber)).catch(err => {
        console.error(`problem fetching account data ${err}`);
      });
      this.latestFetchedBlock = blockNumber;
    }
    setTimeout(this.init, 1000);
  }

  async fetchLatest(currentBlock) {
    const { blockNumber, ...rawState } = await multicall.aggregate(
      this.callPath
    );
    if (blockNumber !== currentBlock) // retry
  }

  registerAddress(address) {
    this.callPath.push(chiefTemplate(address));
  }
}

const accounts = new Accounts();
accounts.init();
accounts.registerAddress('0xf320c0d45f7fc3257d36c894cfafacf29e80a4f6');
accounts.registerTemplate(
  'chief',
  '0xf320c0d45f7fc3257d36c894cfafacf29e80a4f6'
);
accounts.registerAddress('0x6668f1a105ac73e063fe6d5d5238ba98a1040af1');
accounts.registerAddress('0x3617e7e5f5fbf18ce45ad40a2e7ee7ac1405daeb');
accounts.registerAddress('0x0048d6225d1f3ea4385627efdc5b4709cab4a21c');
(async () => await promiseWait(1000000))();

const reduxProps = (
  { chiefState, proxyFactory, hat, approvals },
  { signaling }
) => {
  return {
    approvals,
    proposals: proposals.filter(p => !!p.govVote === !!signaling),
    canVote: activeCanVote({ accounts }),
    fetching: accounts.fetching,
    votingFor: getActiveVotingFor({ accounts })
  };
};
