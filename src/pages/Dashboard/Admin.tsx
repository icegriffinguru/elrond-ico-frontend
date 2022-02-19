import * as React from 'react';
import { contractAddress } from 'config';

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
  TransactionPayload
} from '@elrondnetwork/erdjs';
import BigNumber from '@elrondnetwork/erdjs/node_modules/bignumber.js/bignumber.js';
import {
  stringToHex,
  decimalToHex
} from '../../utils/encode';

const Admin = () => {
  const { address, account } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { network } = useGetNetworkConfig();
  const proxy = new ProxyProvider(network.apiAddress);
  const { sendTransactions } = transactionServices;

  console.log('account', account);

  const [tokenId, setTokenId] = React.useState<string>();
  const [tokenPrice, setTokenPrice] = React.useState<number>();
  const [buyLimit, setBuyLimit] = React.useState<number>();

  /// query
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

  React.useEffect(() => {
    sendQuery('getTokenId', parseTokenIdQuery);
  }, []);

  /// transaction
  const contract = new SmartContract({ address: new Address(contractAddress) });

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


  return (
    <form className='dashboard-container'>
      <h2 className='dashboard-title'>Admin Page</h2>
      <div className="form-group row mt-4">
        <label className="col-sm-3 col-form-label">Token Identifier:</label>
        <div className="col-sm-7">
          <input type="text" className="form-control" id="esdtAmount" value={!!tokenId ? tokenId : ''} onChange={(e) => setTokenId(e.target.value)} />
        </div>
        <div className="col-sm-2">
          <button className="btn btn-primary px-3 my-1 input-right-button" onClick={updateTokenId}>Update</button>
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">$EGLD</label>
        <div className="col-sm-10">
          <input type="number" className="form-control" id="egldAmount" />
        </div>
      </div>
      <button className="btn btn-primary mb-2 px-4 buy-tokens-button">Buy</button>
    </form>
  );
};

export default Admin;
