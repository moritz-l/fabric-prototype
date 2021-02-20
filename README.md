# fabric-prototype
This is the prototype I developed for my master thesis. It's not functional without a correctly configured connection definition and a valid peer-wallet for the API to use with the Fabric-SDK. Additionally there needs to be access to a running fabric peer and a fabric CA, which have to be defined in the connection definition. The easiest method to accomplish that is to use the IBM Blockchain Platform VS Code extension. 

Currently there are two main directories:
- *fabric-api* contains the source code for a REST-API that interacts with a local fabric-peer
- *fabric-testnetwork* contains the source code for three smart contracts and a collection definition that has to be provided when instantiating one of the smart contracts on the fabric-network
- *test-scripts* contains a python script with some very basic tests for the most import functionality

