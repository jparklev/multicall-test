const addresses = [];
const properties = {
  addresses: []
};

const addAddress = address => {
  properties.addresses.push(address);
};

addAddress('rune');
addAddress('andy');
const templates = {};

function createTemplate(strings, ...args) {
  //console.log('strings', strings);
  //const params = strings[0].split(',')
  //console.log('params', params);
  //console.log('args', properties[strings].map(address => args[0](address)));
  templates[strings[0]] = args;
}

createTemplate`chief${(foo, bar) => ({
  key: `proposals.${foo}.bar.baz`,
  poll: true,
  to: '0xa63E145309cadaa6A903a19993868Ef7E85058BE', // proxy factory
  method: `hotMap(address,${bar})`,
  args: [[foo, 'address']],
  returns: [[`proxyAddressHot-${foo}`, 'address']]
})}baz`;

console.log(templates.chief('0xf00', 'blah'));
