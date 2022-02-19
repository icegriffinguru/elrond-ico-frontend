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
  Interaction,
  QueryResponseBundle,
  ReturnCode,
  TypedValue,
  U64Value
} from '@elrondnetwork/erdjs';
import BigNumber from '@elrondnetwork/erdjs/node_modules/bignumber.js/bignumber.js';
import DateTimePicker from 'react-datetime-picker';

import {
  stringToHex,
  decimalToHex
} from '../../utils/encode';
import { time } from 'console';

const Admin = () => {
  const { address, account } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { network } = useGetNetworkConfig();
  const proxy = new ProxyProvider(network.apiAddress);
  const { sendTransactions } = transactionServices;

  // const contract = new SmartContract({ address: new Address(contractAddress) });

  console.log('account', account);

  const [tokenId, setTokenId] = React.useState<string | undefined>();
  const [tokenPrice, setTokenPrice] = React.useState<number | undefined>();
  const [buyLimit, setBuyLimit] = React.useState<number>();
  const [startTime, setStartTime] = React.useState<number>();
  const [endTime, setEndTime] = React.useState<number>();
  const Millis = 1000;

  const [contract, setContract] = React.useState<SmartContract>();

  React.useEffect(() => {
    (async() => {
      console.log('contractAbiUrl', contractAbiUrl);
      const abiRegistry = await AbiRegistry.load({
        urls: [contractAbiUrl],
      });
      const con = new SmartContract({
        address: new Address(contractAddress),
        abi: new SmartContractAbi(abiRegistry, [contractName]),
      });
      setContract(con);
    })();
  }, []); // [] makes useEffect run once

  const sendQuery = async (interaction: Interaction) => {
    if (!contract) return;
    const queryResponse = await contract.runQuery(proxy, interaction.buildQuery());
    const res = interaction.interpretQueryResponse(queryResponse);
    return res;
  };

  React.useEffect(() => {
    if (!contract) return;
    (async () => {
      const interaction: Interaction = contract.methods.getTokenId();
      const res: QueryResponseBundle | undefined = await sendQuery(interaction);
      if (!res || !res.returnCode.isSuccess()) return;
      const value = res.firstValue.valueOf().toString();
      setTokenId(value);
    })();
  }, [contract]);

  React.useEffect(() => {
    if (!contract) return;
    (async () => {
      const interaction: Interaction = contract.methods.getTokenPrice();
      const res: QueryResponseBundle | undefined = await sendQuery(interaction);
      if (!res || !res.returnCode.isSuccess()) return;
      const value = parseFloat(Egld.raw(res.firstValue.valueOf()).toDenominated());
      setTokenPrice(value);
    })();
  }, [contract]);

  React.useEffect(() => {
    if (!contract) return;
    (async () => {
      const interaction: Interaction = contract.methods.getBuyLimit();
      const res: QueryResponseBundle | undefined = await sendQuery(interaction);
      if (!res || !res.returnCode.isSuccess()) return;
      const value = parseFloat(Egld.raw(res.firstValue.valueOf()).toDenominated());
      setBuyLimit(value);
    })();
  }, [contract]);

  React.useEffect(() => {
    if (!contract) return;
    (async () => {
      const interaction: Interaction = contract.methods.getStartTime();
      const res: QueryResponseBundle | undefined = await sendQuery(interaction);
      if (!res || !res.returnCode.isSuccess()) return;
      const value = parseInt(res.firstValue.valueOf());
      setStartTime(value);
    })();
  }, [contract]);
  
  React.useEffect(() => {
    if (!contract) return;
    (async () => {
      const interaction: Interaction = contract.methods.getEndTime();
      const res: QueryResponseBundle | undefined = await sendQuery(interaction);
      if (!res || !res.returnCode.isSuccess()) return;
      const value = parseInt(res.firstValue.valueOf());
      setEndTime(value);
    })();
  }, [contract]);

  const sendTransaction = async (functionName: string, args: any[]) => {
    if (!contract) return;
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
    sendTransaction('updateTokenId', args);
  };

  const updateTokenPrice = (e: any) => {
    e.preventDefault();
    console.log('tokenPrice', tokenPrice);
    if (!tokenPrice){
      alert('Token Price cannot be null.');
      return;
    }
    const args = [new BigUIntValue(Balance.egld(tokenPrice).valueOf())];
    sendTransaction('updateTokenPrice', args);
  };

  const updateBuyLimit = (e: any) => {
    e.preventDefault();
    if (!buyLimit){
      alert('Buy Limit cannot be null.');
      return;
    }
    const args = [new BigUIntValue(Balance.egld(buyLimit).valueOf())];
    sendTransaction('updateBuyLimit', args);
  };

  const updateTimes = (e: any) => {
    e.preventDefault();
    if (!startTime || !endTime){
      alert('Start Time and End Time should be set.');
      return;
    }
    if (startTime <= (new Date()).getTime() / Millis){
      alert('Start Time cannot be past.');
      return;
    }
    if (startTime >= endTime){
      alert('Start Time cannot be before than End Time.');
      return;
    }
    const args = [new U64Value(new BigNumber(startTime)), new U64Value(new BigNumber(endTime))];
    sendTransaction('updateTimes', args);
  };

  const withdrawEgld = (e: any) => {
    e.preventDefault();
    sendTransaction('withdraw', []);
  };

  //
  const onStartTimeChanged = (t: Date) => {
    setStartTime(t.getTime() / Millis);
  };

  const onEndTimeChanged = (t: Date) => {
    setEndTime(t.getTime() / Millis);
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
        <div className="col-sm-5">
          <input type="number" className="form-control" id="esdtAmount" defaultValue={buyLimit} onChange={(e) => setBuyLimit(parseFloat(e.target.value))} />
        </div>
        <div className='col-sm-2'>EGLD</div>
        <div className="col-sm-2">
          <button className="btn btn-primary px-3 my-1 input-right-button" onClick={updateBuyLimit}>Update</button>
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-3 col-form-label">Activation Time:</label>
        <div className="col-sm-7">
          <DateTimePicker
            value={new Date(startTime ? startTime * Millis : 0)}
            onChange={onStartTimeChanged}
            />
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-3 col-form-label">End Time:</label>
        <div className="col-sm-7">
          <DateTimePicker
            value={new Date((endTime ? endTime * Millis : 0))}
            onChange={onEndTimeChanged} />
        </div>
        <div className="col-sm-2">
          <button className="btn btn-primary px-3 my-1 input-right-button" onClick={updateTimes}>Update</button>
        </div>
      </div>
      <div className="form-group row">
        <div className="col-sm-5"></div>
        <div className="col-sm-2">
          <button className="btn btn-primary px-3 my-1 input-right-button" onClick={withdrawEgld}>Withdraw Egld</button>
        </div>
      </div>
    </form>
  );
};

export default Admin;
