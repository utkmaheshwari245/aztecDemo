require('@babel/register');

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      network_id: '*',
      port: 9545,
    },
  },
};
