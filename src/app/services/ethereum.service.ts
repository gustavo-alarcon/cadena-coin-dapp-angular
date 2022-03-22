import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ethers, utils } from 'ethers';
import abi from '../contracts/ChinchillaCoin.json';
declare let window: any;

@Injectable({
  providedIn: 'root',
})
export class EthereumService {
  public contractAddress = '0x655FBaA8D93BeedaC9317EfFC574a37096FCe403';
  private contractABI = abi.abi;

  isWalletConnected: boolean = false;
  tokenName: string = '';
  tokenSymbol: string = '';
  tokenTotalSupply: number = 0;
  isTokenOwner: boolean = false;
  tokenOwnerAddress: string = '';
  yourWalletAddress: string = '';
  error: string = '';

  constructor(private snackbar: MatSnackBar) {}

  async checkIfWalletIsConnected(): Promise<boolean> {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const account = accounts[0];
        this.isWalletConnected = true;
        this.yourWalletAddress = account;
        console.log('Account Connected: ', account);
        this.snackbar.open('🎉🦊 Wallet connected!', 'Dismiss', {
          duration: 5000,
        });
        return true;
      } else {
        this.error = 'Please install a MetaMask wallet to use our bank.';
        console.log('No Metamask detected');
        this.snackbar.open(this.error, 'Dismiss');
        return false;
      }
    } catch (error) {
      this.snackbar.open(
        '🤔 Check if perhaps you dismissed the wallet connection popup',
        'Close'
      );
      console.log(error);
      return false;
    }
  }

  async getTokenInfo(): Promise<boolean> {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          signer
        );
        const [account] = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        let tokenName = await tokenContract.name();
        let tokenSymbol = await tokenContract.symbol();
        let tokenOwner = await tokenContract.owner();
        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply);

        this.tokenName = `${tokenName} 🐭`;
        this.tokenSymbol = tokenSymbol;
        this.tokenTotalSupply = tokenSupply;
        this.tokenOwnerAddress = tokenOwner;

        if (account.toLowerCase() === tokenOwner.toLowerCase()) {
          this.isTokenOwner = true;
        }

        return true;
      } else {
        this.error = 'Please install a MetaMask wallet to use our bank.';
        console.log('No Metamask detected');
        this.snackbar.open(this.error, 'Dismiss');
        return false;
      }
    } catch (error) {
      this.snackbar.open(
        '🤔 Check if perhaps you dismissed the wallet connection popup',
        'Close'
      );
      console.log(error);
      return false;
    }
  }

  async transferToken(amount: number, walletAddress: string): Promise<boolean> {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          signer
        );

        const txn = await tokenContract.transfer(
          walletAddress,
          utils.parseEther(amount.toString())
        );
        console.log('Transfering tokens...');
        await txn.wait();
        console.log('Tokens Transfered', txn.hash);
        return true;
      } else {
        console.log('Ethereum object not found, install Metamask.');
        this.error = 'Install a MetaMask wallet to get our token.';
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async burnTokens(amount: number): Promise<boolean> {
    try {
      if (window.ethereum && this.isTokenOwner) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          signer
        );

        const txn = await tokenContract.burn(
          utils.parseEther(amount.toString())
        );
        console.log('Burning tokens...');
        await txn.wait();
        console.log('Tokens Burned', txn.hash);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply);

        this.tokenTotalSupply = tokenSupply;
        return true;
      } else {
        console.log('Ethereum object not found, install Metamask.');
        this.error = 'Install a MetaMask wallet to get our token.';
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async mintTokens(amount: number): Promise<boolean> {
    try {
      if (window.ethereum && this.isTokenOwner) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(
          this.contractAddress,
          this.contractABI,
          signer
        );

        let tokenOwner = await tokenContract.owner();
        const txn = await tokenContract.mint(
          tokenOwner,
          utils.parseEther(amount.toString())
        );
        console.log('Minting tokens...');
        await txn.wait();
        console.log('Tokens Minted', txn.hash);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply);

        this.tokenTotalSupply = tokenSupply;
        return true;
      } else {
        console.log('Ethereum object not found, install Metamask.');
        this.error = 'Install a MetaMask wallet to get our token.';
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
