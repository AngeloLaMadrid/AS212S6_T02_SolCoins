import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { BlockchainService } from './blockchain.service';
import { FormGroup, FormControl } from '@angular/forms';


declare let window: any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // Corregido a styleUrls y hecho un array
})
export class AppComponent implements OnInit {
  [x: string]: any;
  transactionForm = new FormGroup({
    toAddress: new FormControl(''),
    amount: new FormControl(0),
  });

  address: string = ''; // Inicializa con una cadena vacía
  balance: number = 0; // Inicializa con 0
  isConnecting: boolean = false; // Añade esta línea
  web3Initialized: boolean = false;
  
  constructor(private blockchainService: BlockchainService, private cd: ChangeDetectorRef) { }

  async ngOnInit() {
    this.address = await this.blockchainService.getAddress();
    this.balance = await this.blockchainService.getBalance();
    console.log('Dirección en el componente:', this.address);
    console.log('Saldo en el componente:', this.balance);
     this.listenForNetworkChanges();
  }

  async listenForNetworkChanges() {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', async () => {
        // Actualizar el saldo cuando se cambia de red
        this.balance = await this.blockchainService.getBalance();
        this.cd.detectChanges();
      });
    }
  }

  async connectWallet() {
    if (!this.isConnecting) {
      this.isConnecting = true;
      try {
        await this.blockchainService.initWeb3();
        this.address = await this.blockchainService.getAddress();
        this.balance = await this.blockchainService.getBalance();
        console.log('MetaMask connected:');
        console.log('Address:', this.address);
        console.log('Balance:', this.balance);
        this.web3Initialized = true; // Set the flag to true after successful initialization
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      } finally {
        this.isConnecting = false;
      }
    } else {
      console.warn('Request to connect to MetaMask is already in progress.');
    }
  }


  async sendTransaction() {
    const toAddress = this.transactionForm?.get('toAddress')?.value;
    const amount = this.transactionForm?.get('amount')?.value;
  
    if (toAddress && amount) {
      try {
        const { toAddress: newToAddress, amount: newAmount } = await this.blockchainService.sendTransaction(toAddress, amount);
        
        // Actualizar el saldo después de la transacción
        this.balance = await this.blockchainService.getBalance();
  
        // Limpiar los campos del formulario después de la transacción
        this.transactionForm.setValue({ toAddress: newToAddress, amount: newAmount });
      } catch (error) {
        console.error('Error al enviar la transacción:', error);
      }
    }
  }
}