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

const BuyTokens = () => {
  const { address, account } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { network } = useGetNetworkConfig();
  const proxy = new ProxyProvider(network.apiAddress);
  const { sendTransactions } = transactionServices;

  console.log('account', account);

  const [tokenPrice, setTokenPrice] = React.useState<number | undefined>();
  const [buyLimit, setBuyLimit] = React.useState<number>();
  const [buyAmountInEsdt, setBuyAmountInEsdt] = React.useState<number>(0);
  const [buyAmountInEgld, setBuyAmountInEgld] = React.useState<number>(0);

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

  const sendTransaction = async (functionName: string, args: any[], value = 0) => {
    if (!contract) return;
    const tx = contract.call({
      func: new ContractFunction(functionName),
      gasLimit: new GasLimit(5000000),
      args: args,
      value: Balance.egld(value)
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

  const buyTokens = (e: any) => {
    e.preventDefault();
    if (!buyAmountInEgld){
      alert('Buy Amount cannot be 0.');
      return;
    }
    const args: any[] = [];
    sendTransaction('buyTokens', args, buyAmountInEgld);
  };

  const onBuyAmountInEgldChanged = (e: any) => {
    const amount = e.target.value;
    if (buyLimit && amount > buyLimit) {
      alert('Cannot buy more than Buy Limit.');
      return;
    }
    setBuyAmountInEgld(amount);

    if (tokenPrice) {
      setBuyAmountInEsdt(amount / tokenPrice);
    }
  };

  return (
    <form className='dashboard-container'>
      <h2 className='dashboard-title'>Account Balance</h2>
      <div className="form-group row mt-1">
        <label className="col-sm-2 col-form-label">ESDT</label>
        <div className="col-sm-10">
          <input type="text" readOnly className="form-control-plaintext px-2" value="100" />
        </div>
      </div>
      <div className="form-group row mt-1">
        <label className="col-sm-2 col-form-label">$SVEN</label>
        <div className="col-sm-10">
          <input type="text" readOnly className="form-control-plaintext px-2" value="0" />
        </div>
      </div>
      <hr className='mb-4' />

      <h2 className='dashboard-title'>Buy Tokens</h2>
      <div className="form-group row">
        <label className="col-sm-3 col-form-label">Token Price:</label>
        <div className="col-sm-7">
          <input type="text" readOnly className="form-control-plaintext px-2" value={tokenPrice} />
        </div>
        <div className='col-sm-2'>EGLD</div>
      </div>
      <div className="form-group row">
        <label className="col-sm-3 col-form-label">Buy Limit:</label>
        <div className="col-sm-7">
          <input type="text" readOnly className='form-control-plaintext px-2' value={buyLimit == 0 ? 'No Limit' : buyLimit} />
        </div>
        <div className='col-sm-2'>EGLD</div>
      </div>
      <div className="form-group row mt-4">
        <label className="col-sm-2 col-form-label">$SVEN</label>
        <div className="col-sm-10">
          <input type="text" readOnly className="form-control-plaintext px-2" value={buyAmountInEsdt} />
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">$EGLD</label>
        <div className="col-sm-8">
          <input type="number" className="form-control" defaultValue={buyAmountInEgld} onChange={onBuyAmountInEgldChanged}/>
        </div>
        <div className="col-sm-2">
          <button className="btn btn-primary px-3 my-1 input-right-button" onClick={buyTokens}>Buy</button>
        </div>
      </div>
    </form>
  );
};

export default BuyTokens;
