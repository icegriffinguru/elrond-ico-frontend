import * as React from 'react';
import { Link } from 'react-router-dom';
import { dAppName } from 'config';
import { routeNames } from 'routes';
import './index.scss';

import Timer from './Timer';

const Home = () => {
  const [leftDays, setLeftDays] = React.useState<number>();

  return (
    <div className='d-flex flex-fill container-fluid home-background'>
      <div className='row w-100'>
        <div className='col-12 col-md-6 token-sale-container'>
          <div className='token-sale-title'>Token Sale ends in:</div>
          <Timer />
          <div className='token-available'>5023411 $SVEN Available</div>
          <Link
            to='dashboard/buy'
            className='buy-token-button mr-2'
          >
            Buy Token
          </Link>
          <Link
            to='dashboard/admin'
            className='buy-token-button'
          >
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
