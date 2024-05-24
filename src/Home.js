import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import constants from './constants';
import './App.css';

function Home() {
    const [currentAccount, setCurrentAccount] = useState("");
    const [contractInstance, setContractInstance] = useState(null);
    const [status, setStatus] = useState(false);
    const [isWinner, setIsWinner] = useState(false);

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (typeof window.ethereum !== 'undefined') {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                try {
                    // Request account access
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const signer = provider.getSigner();
                    const address = await signer.getAddress();
                    setCurrentAccount(address);

                    window.ethereum.on('accountsChanged', (accounts) => {
                        setCurrentAccount(accounts[0]);
                    });

                    const contract = new ethers.Contract(constants.contractAddress, constants.contractAbi, signer);
                    setContractInstance(contract);

                    const status = await contract.isComplete();
                    setStatus(status);

                    const winner = await contract.getWinner();
                    setIsWinner(winner.toLowerCase() === address.toLowerCase());
                } catch (err) {
                    console.error('Error loading blockchain data:', err);
                }
            } else {
                alert('Please install MetaMask to use this application');
            }
        };

        loadBlockchainData();
    }, []);

    const enterLottery = async () => {
        if (contractInstance) {
            try {
                const amountToSend = ethers.utils.parseEther('0.001');
                const tx = await contractInstance.enter({ value: amountToSend });
                await tx.wait();
            } catch (err) {
                console.error('Error entering lottery:', err);
            }
        }
    };

    const claimPrize = async () => {
        if (contractInstance) {
            try {
                const tx = await contractInstance.claimPrize();
                await tx.wait();
            } catch (err) {
                console.error('Error claiming prize:', err);
            }
        }
    };

    return (
        <div className="container">
            <h1>Lottery Page</h1>
            <div className="button-container">
                {status ? (
                    isWinner ? (
                        <button className="claim-button" onClick={claimPrize}>Claim Prize</button>
                    ) : (
                        <p className="non-winner-message">You are not the winner</p>
                    )
                ) : (
                    <button className="enter-button" onClick={enterLottery}>Enter Lottery</button>
                )}
            </div>
        </div>
    );
}

export default Home;
