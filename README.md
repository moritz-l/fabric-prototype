# Fabric-Prototype
This is a basic prototype for the design I created for my master thesis. It's not functional without a correctly configured connection definition and a valid peer-wallet for the API to use with the Fabric-SDK. Additionally there needs to be access to a running fabric peer and a fabric CA, which have to be defined in the connection definition files. A rough guide to setup a testable REST-API is included below.  

There are three directories with relevant configuration or coding:
- *fabric-api* contains the source code for a REST-API that interacts with a local fabric-peer
- *fabric-testnet* contains the source code for three smart contracts and a collection definition that has to be provided when instantiating one of the smart contracts on the fabric-network
- *test-scripts* contains a python script with some very basic tests for the most import functionality

## Setup Guide
1. Following prequesites have to be installed:
   * [Visual Studio Code](https://code.visualstudio.com) 
   * Version 1.0.40 of the [IBM Blockchain Platform Extension](https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform)
   * npm
   * nodeman 
2. Clone this repository into a directory of your choice.
3. Add the [invoice-contract](fabric-testnet/smart_contracts/invoice-contract) and the [member-contract](fabric-testnet/smart_contracts/member-contract) to your workspace in VS Code. Then follow [Tutorial A3](files/a3.pdf) to create a local fabric network and to deploy the two smart contracts. When instantiating the invoice-contract at step A3.8 choose 'Yes' and provide the [collection-definition](fabric-testnet/private_collections/PrivateCollection.json) file.
4. Follow steps A5.1 to A5.5 of tutorial [Tutorial A5](files/a5.pdf) to export the connection profile and wallet for both organisations in the test network.
5. Replace the wallet for [organisation 1](fabric-api/Org1Wallet/) and [organisation 2](fabric-api/Org2Wallet/) with the previously exported wallets.  
6. Replace the connection definition for [organisation 1](fabric-prototype/fabric-api/connection_org1.json) and [organisation 2](fabric-api/connection_org2.json).
7. Navigate to the [Fabric-API directory](fabric-api/) and start the two servers with nodemon (e.g. nodemon src/server.ts and nodemon src/server2.ts).


