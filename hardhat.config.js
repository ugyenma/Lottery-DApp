require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const SEPOLIA_PRIVATE_KEY = "f6910291be2cf0d8d7c547357de22398e3732aa6b0baf1e398d7445d20f1d6ac"
module.exports = {
  solidity: "0.8.18",
  networks: {
    SEPOLIA: {
      url: "https://eth-sepolia.g.alchemy.com/v2/WgjeH4Z8TVzdvqyTi9RaLDH32Yb7_H1x",
      accounts: [`${SEPOLIA_PRIVATE_KEY}`],
    },
  },

};
