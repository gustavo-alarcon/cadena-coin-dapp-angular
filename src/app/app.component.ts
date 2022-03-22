import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EthereumService } from './services/ethereum.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isWalletConnected: boolean = false;
  infoReady: boolean = false;

  //#region form controls
  addressControl = new FormControl('');
  transferAmountControl = new FormControl(0);
  burnTokensControl = new FormControl(0);
  mintTokensControl = new FormControl(0);
  //#endregion

  constructor(
    public ethereumService: EthereumService,
    private snackbar: MatSnackBar
  ) {
    this.ethereumService.checkIfWalletIsConnected().then((res) => {
      if (res) {
        this.isWalletConnected = true;

        this.ethereumService.getTokenInfo().then((res) => {
          if (res) {
            this.infoReady = true;
          }
        });
      }
    });
  }

  public transfer() {
    if (
      this.addressControl.value === '' ||
      this.transferAmountControl.value === 0 ||
      this.transferAmountControl.value > 10
    ) {
      this.snackbar.open(
        '😄 Please fill in all fields and check the amount',
        'Dismiss',
        {
          duration: 6000,
        }
      );

      return;
    }

    this.ethereumService
      .transferToken(
        this.transferAmountControl.value,
        this.addressControl.value
      )
      .then((res) => {
        if (res) {
          this.snackbar.open('✅ Tokens transferred', 'Dismiss', {
            duration: 6000,
          });
          this.addressControl.reset();
          this.transferAmountControl.reset();
        }
      });
  }

  public burnTokens() {
    if (
      this.burnTokensControl.value === 0 ||
      this.burnTokensControl.value > this.ethereumService.tokenTotalSupply
    ) {
      this.snackbar.open(
        '😄 You have to set a proper amount to be burned (0 < amount < total supply)',
        'Dismiss',
        {
          duration: 6000,
        }
      );

      return;
    }

    this.ethereumService
      .burnTokens(this.burnTokensControl.value)
      .then((res) => {
        if (res) {
          this.snackbar.open('✅ Tokens burned', 'Dismiss', {
            duration: 6000,
          });
          this.burnTokensControl.reset();
        }
      });
  }

  public mintTokens() {
    if (this.mintTokensControl.value === 0) {
      this.snackbar.open(
        '😄 You have to set an amount greater than zero',
        'Dismiss',
        {
          duration: 6000,
        }
      );

      return;
    }

    this.ethereumService
      .mintTokens(this.mintTokensControl.value)
      .then((res) => {
        if (res) {
          this.snackbar.open('✅ Tokens minted', 'Dismiss', {
            duration: 6000,
          });
          this.mintTokensControl.reset();
        }
      });
  }
}
