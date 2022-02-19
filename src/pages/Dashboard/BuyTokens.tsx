import * as React from 'react';
import { useGetAccountInfo, DappUI } from '@elrondnetwork/dapp-core';
import { contractAddress } from 'config';

const BuyTokens = () => {
  const { address, account } = useGetAccountInfo();

  return (
    <form className='dashboard-container'>
      <h2 className='dashboard-title'>Buy Tokens</h2>
      <div className="form-group row mt-4">
        <label className="col-sm-2 col-form-label">$SVEN</label>
        <div className="col-sm-10">
          <input type="text" readOnly className="form-control-plaintext px-2" id="esdtAmount" value="email@example.com" />
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

export default BuyTokens;
