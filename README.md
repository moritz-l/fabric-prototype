# Fabric-Prototype
This is a basic prototype for the design I created for my master thesis. It's not functional without a correctly configured connection definition and a valid peer-wallet for the API to use with the Fabric-SDK. Additionally there needs to be access to a running fabric peer and a fabric CA, which have to be defined in the connection definition files. A detailed setup guide is included below.  

Currently there are three main directories:
- *fabric-api* contains the source code for a REST-API that interacts with a local fabric-peer
- *fabric-testnetwork* contains the source code for three smart contracts and a collection definition that has to be provided when instantiating one of the smart contracts on the fabric-network
- *test-scripts* contains a python script with some very basic tests for the most import functionality

## Setup Guide
1) Following extensions have to be installed:
- [Visual Studio Code](https://code.visualstudio.com) 
- Version 1.0.40 of the [IBM Blockchain Platform Extension](https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform) 

2) Clone this repository into a directory of your choice

3) Follow [Tutorial A1](files/a1.pdf) to create a local fabric network

4) Add the [invoice-contract](fabric-prototype/fabric-testnet/smart_contracts/invoice-contract) and the [member-contract](fabric-prototype/fabric-testnet/smart_contracts/member-contract) to your workspace in VS Code. Then follow [Tutorial A3](files/a3.pdf) to deploy the two smart contracts. When instantiating the invoice-contract at step A3.8 choose 'Yes' and provide the [collection-definition file](fabric-prototype/fabric-testnet/private_collections/PrivateCollection.json).

5) Follow steps A5.1 to A5.5 of tutorial [Tutorial A5](files/a5.pdf) to export the connection profile and wallet for both organisations in the test network.

