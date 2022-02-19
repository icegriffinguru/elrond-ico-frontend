import * as React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
// import Actions from './Actions';
import TopInfo from './TopInfo';
import ContractInfo from './ContractInfo';
import Transactions from './Transactions';
import BuyTokens from './BuyTokens';
import Admin from './Admin';
import './index.scss';

const Dashboard = () => {
  return (
    <div className='container py-4'>
      <div className='row'>
        <div className='col-12 col-md-10 mx-auto'>
          <div className='card shadow-sm rounded border-0'>
            <div className='card-body p-1'>
              <Routes>
                <Route
                  path="buy"
                  element={<BuyTokens />}
                />
                <Route
                  path="admin"
                  element={<Admin />}
                />
                <Route path="/" element={<Navigate replace to="buy" />} />
              </Routes>
              <hr />
              {/* <div className='card rounded border-0 bg-primary'>
                <div className='card-body text-center p-4'>
                  <TopInfo />
                  <ContractInfo />
                  <Actions />
                </div>
              </div> */}
              <Transactions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
