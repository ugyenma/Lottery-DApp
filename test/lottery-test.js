const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lottery", function () {
  let Lottery, lottery;
  let manager, player1, player2;

  beforeEach(async () => {
    [manager, player1, player2] = await ethers.getSigners();
    Lottery = await ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy();
    await lottery.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right manager", async function () {
      expect(await lottery.getManager()).to.equal(manager.address);
    });

    it("Should initialize with no players", async function () {
      const players = await lottery.getPlayers();
      expect(players.length).to.equal(0);
    });

    it("Should initialize with isComplete set to false", async function () {
      expect(await lottery.status()).to.equal(false);
    });

    it("Should initialize with claimed set to false", async function () {
      expect(await lottery.claimed()).to.equal(false);
    });
  });

  describe("Enter Lottery", function () {
    it("Should allow a player to enter the lottery", async function () {
      await lottery.connect(player1).enter({ value: ethers.utils.parseEther("0.001") });
      const players = await lottery.getPlayers();
      expect(players.length).to.equal(1);
      expect(players[0]).to.equal(player1.address);
    });

    it("Should require a minimum amount of ether to enter", async function () {
      await expect(lottery.connect(player1).enter({ value: ethers.utils.parseEther("0.0001") })).to.be.revertedWith("Minimum amount is 0.001 ether");
    });

    it("Should not allow entering after the lottery is complete", async function () {
      await lottery.connect(player1).enter({ value: ethers.utils.parseEther("0.001") });
      await lottery.connect(manager).pickWinner();
      await expect(lottery.connect(player2).enter({ value: ethers.utils.parseEther("0.001") })).to.be.revertedWith("Lottery is already complete");
    });
  });

  describe("Pick Winner", function () {
    it("Should only allow the manager to pick a winner", async function () {
      await lottery.connect(player1).enter({ value: ethers.utils.parseEther("0.001") });
      await expect(lottery.connect(player1).pickWinner()).to.be.revertedWith("Only manager can call this function");
    });

    it("Should require there to be at least one player to pick a winner", async function () {
      await expect(lottery.connect(manager).pickWinner()).to.be.revertedWith("No players entered");
    });

    it("Should pick a winner and set isComplete to true", async function () {
      await lottery.connect(player1).enter({ value: ethers.utils.parseEther("0.001") });
      await lottery.connect(manager).pickWinner();
      expect(await lottery.status()).to.equal(true);
      expect(await lottery.getWinner()).to.equal(player1.address);
    });
  });

  describe("Claim Prize", function () {
    it("Should allow the winner to claim the prize", async function () {
      await lottery.connect(player1).enter({ value: ethers.utils.parseEther("0.001") });
      await lottery.connect(manager).pickWinner();
      const balanceBefore = await ethers.provider.getBalance(player1.address);
      await lottery.connect(player1).claimPrize();
      const balanceAfter = await ethers.provider.getBalance(player1.address);
      expect(await lottery.claimed()).to.equal(true);
      expect(balanceAfter).to.be.above(balanceBefore);
    });

    it("Should not allow non-winner to claim the prize", async function () {
      await lottery.connect(player1).enter({ value: ethers.utils.parseEther("0.001") });
      await lottery.connect(manager).pickWinner();
      await expect(lottery.connect(player2).claimPrize()).to.be.revertedWith("Only winner can claim the prize");
    });

    it("Should not allow claiming the prize before the lottery is complete", async function () {
      await lottery.connect(player1).enter({ value: ethers.utils.parseEther("0.001") });
      await expect(lottery.connect(player1).claimPrize()).to.be.revertedWith("Lottery is not complete");
    });

    it("Should not allow claiming the prize more than once", async function () {
      await lottery.connect(player1).enter({ value: ethers.utils.parseEther("0.001") });
      await lottery.connect(manager).pickWinner();
      await lottery.connect(player1).claimPrize();
      await expect(lottery.connect(player1).claimPrize()).to.be.revertedWith("Prize already claimed");
    });
  });
});
