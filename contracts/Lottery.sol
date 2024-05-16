// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Lottery {
    address public manager;
    address payable[] public players;
    address payable public winner;
    bool public isComplete;
    bool public claimed;

    constructor() {
        manager = msg.sender;
        isComplete = false;
        claimed = false;
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager can call this function");
        _;
    }

    function status() public view returns (bool) {
        return isComplete;
    }

    function getManager() public view returns (address) {
        return manager;
    }

    function getWinner() public view returns (address) {
        return winner;
    }

    function enter() public payable {
        require(msg.value >= 0.001 ether, "Minimum amount is 0.001 ether");
        require(!isComplete, "Lottery is already complete");
        players.push(payable(msg.sender));
    }

    function pickWinner() public onlyManager {
        require(players.length > 0, "No players entered");
        require(!isComplete, "Lottery is already complete");
        winner = players[randomNumber() % players.length];
        isComplete = true;
    }

    function randomNumber() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, players.length)));
    }

    function claimPrize() public {
        require(isComplete, "Lottery is not complete");
        require(msg.sender == winner, "Only winner can claim the prize");
        require(!claimed, "Prize already claimed");
        winner.transfer(address(this).balance);
        claimed = true;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }
}
