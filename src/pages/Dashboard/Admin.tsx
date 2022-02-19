import * as React from 'react';
import {
  contractAddress,
  contractAbiUrl,
  contractName
} from 'config';

import {
  transactionServices,
  useGetAccountInfo,
  useGetPendingTransactions,
  refreshAccount,
  useGetNetworkConfig,
  DappUI,
  getAccountProvider
} from '@elrondnetwork/dapp-core';
import {
  Address,
  AddressValue,
  Nonce,
  ContractFunction,
  ProxyProvider,
  WalletProvider,
  Query,
  SmartContract,
  Egld,
  GasLimit,
  BigUIntValue,
  Balance,
  BytesValue,
  ArgSerializer,
  TransactionPayload,
  AbiRegistry,
  SmartContractAbi,
  Interaction
} from '@elrondnetwork/erdjs';
import BigNumber from '@elrondnetwork/erdjs/node_modules/bignumber.js/bignumber.js';
import {
  stringToHex,
  decimalToHex
} from '../../utils/encode';

const Admin = async () => {
  const { address, account } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { network } = useGetNetworkConfig();
  const proxy = new ProxyProvider(network.apiAddress);
  const { sendTransactions } = transactionServices;

  // const contract = new SmartContract({ address: new Address(contractAddress) });
  const abiRegistry = await AbiRegistry.load({
    files: [contractAbiUrl],
  });
  const contract = new SmartContract({
    address: new Address(contractAddress),
    abi: new SmartContractAbi(abiRegistry, [contractName]),
  });

  console.log('account', account);

  const [tokenId, setTokenId] = React.useState<string>();
  const [tokenPrice, setTokenPrice] = React.useState<number>();
  const [buyLimit, setBuyLimit] = React.useState<number>();
  const [startTime, setStartTime] = React.useState<Date>();
  const [duration, setDuration] = React.useState<Date>();

  /// query
  // const sendQuery = (functionName: string, getQueryResult: any) => {
  //   const query = new Query({
  //     address: new Address(contractAddress),
  //     func: new ContractFunction(functionName)
  //   });
  //   proxy
  //     .queryContract(query)
  //     .then(({ returnData }) => {
  //       console.log('Query: ', functionName, returnData);
  //       getQueryResult(returnData);
  //     })
  //     .catch((err) => {
  //       console.error(`Unable to call ${functionName} VM query`, err);
  //     });
  // };
  const sendQuery = (functionName: string, getQueryResult: any) => {
    const query = new Query({
      address: new Address(contractAddress),
      func: new ContractFunction(functionName)
    });
    proxy
      .queryContract(query)
      .then(({ returnData }) => {
        console.log('Query: ', functionName, returnData);
        getQueryResult(returnData);
      })
      .catch((err) => {
        console.error(`Unable to call ${functionName} VM query`, err);
      });
  };

  const parseTokenIdQuery = (returnData: any) => {
    let [decoded] = returnData;
    decoded = Buffer.from(decoded, 'base64').toString();
    setTokenId(decoded);
  };

  const parseTokenPriceQuery = (returnData: any) => {
    let [decoded] = returnData;
    decoded = Buffer.from(decoded, 'base64').toString('hex');
    decoded = parseInt(decoded, 16);
    decoded = Egld.raw(decoded).toDenominated();
    decoded = parseFloat(decoded);
    setTokenPrice(decoded);
  };

  const parseBuyLimitQuery = (returnData: any) => {
    let [decoded] = returnData;
    decoded = Buffer.from(decoded, 'base64').toString('hex');
    decoded = parseInt(decoded, 16);
    decoded = Egld.raw(decoded).toDenominated();
    decoded = parseFloat(decoded);
    setBuyLimit(decoded);
  };

  const parseStartTimeQuery = (returnData: any) => {
    let [decoded] = returnData;
    decoded = Buffer.from(decoded, 'base64').toString('hex');
    decoded = parseInt(decoded, 16);
    decoded = new Date(decoded * 1000);
    setBuyLimit(decoded);
  };

  React.useEffect(() => {
    const interaction: Interaction = contract.methods.getTokenId();
    sendQuery(interaction, parseTokenIdQuery);
  }, []);
  // React.useEffect(() => {
  //   sendQuery('getTokenPrice', parseTokenPriceQuery);
  // }, []);
  // React.useEffect(() => {
  //   sendQuery('getBuyLimit', parseBuyLimitQuery);
  // }, []);

  /// transaction

  const sendUpdatePriceTransaction = async (functionName: string, args: any[]) => {
    const tx = contract.call({
      func: new ContractFunction(functionName),
      gasLimit: new GasLimit(5000000),
      args: args
    });

    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: tx,
      transactionsDisplayInfo: {
        processingMessage: 'Processing ' + functionName + ' transaction',
        errorMessage: 'An error has occured during ' + functionName,
        successMessage: functionName + ' transaction successful'
      },
      redirectAfterSign: false
    });
  };

  const updateTokenId = (e: any) => {
    e.preventDefault();
    if (!tokenId){
      alert('Token Id cannot be null.');
      return;
    }
    const args = [BytesValue.fromUTF8(tokenId)];
    sendUpdatePriceTransaction('updateTokenId', args);
  };

  const updateTokenPrice = (e: any) => {
    e.preventDefault();
    if (!tokenPrice){
      alert('Token Price cannot be null.');
      return;
    }
    const args = [new BigUIntValue(Balance.egld(tokenPrice).valueOf())];
    sendUpdatePriceTransaction('updateTokenPrice', args);
  };

  const updateBuyLimit = (e: any) => {
    e.preventDefault();
    if (!buyLimit){
      alert('Buy Limit cannot be null.');
      return;
    }
    const args = [new BigUIntValue(Balance.egld(buyLimit).valueOf())];
    sendUpdatePriceTransaction('updateBuyLimit', args);
  };

  return (
    <form className='dashboard-container'>
      <h2 className='dashboard-title'>Admin Page</h2>
      <div className="form-group row mt-4">
        <label className="col-sm-3 col-form-label">Token Identifier:</label>
        <div className="col-sm-7">
          <input type="text" className="form-control" id="esdtAmount" defaultValue={tokenId} onChange={(e) => setTokenId(e.target.value)} />
        </div>
        <div className="col-sm-2">
          <button className="btn btn-primary px-3 my-1 input-right-button" onClick={updateTokenId}>Update</button>
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-3 col-form-label">Token Price:</label>
        <div className="col-sm-5">
          <input type="number" className="form-control" id="esdtAmount" defaultValue={tokenPrice} onChange={(e) => setTokenPrice(parseFloat(e.target.value))} />
        </div>
        <div className='col-sm-2'>EGLD</div>
        <div className="col-sm-2">
          <button className="btn btn-primary px-3 my-1 input-right-button" onClick={updateTokenPrice}>Update</button>
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-3 col-form-label">Buy Limit:</label>
        <div className="col-sm-7">
          <input type="text" className="form-control" id="esdtAmount" defaultValue={buyLimit} onChange={(e) => setBuyLimit(parseFloat(e.target.value))} />
        </div>
        <div className="col-sm-2">
          <button className="btn btn-primary px-3 my-1 input-right-button" onClick={updateBuyLimit}>Update</button>
        </div>
      </div>
    </form>
  );
};

export default Admin;
