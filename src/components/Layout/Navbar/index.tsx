import React from 'react';
import { logout, useGetAccountInfo } from '@elrondnetwork/dapp-core';
import { Navbar as BsNavbar, NavItem, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { dAppName } from 'config';
import { routeNames } from 'routes';
import { ReactComponent as ElrondLogo } from './../../../assets/img/elrond.svg';
import './index.scss';

const Navbar = () => {
  const { address } = useGetAccountInfo();

  const handleLogout = () => {
    logout(`${window.location.origin}/unlock`);
  };

  const isLoggedIn = Boolean(address);

  return (
    <BsNavbar className='bg-white border-bottom px-4 py-3'>
      <div className='container-fluid'>
        <Link
          className='d-flex align-items-center navbar-brand mr-4'
          to='/'
        >
          <ElrondLogo className='elrond-logo' />
        </Link>

        <Link
          className='d-flex align-items-center navbar-brand mr-4'
          to='/dashboard/buy'
        >
          BUY
        </Link>
        <Link
          className='d-flex align-items-center navbar-brand mr-2'
          to='/dashboard/Admin'
        >
          ADMIN
        </Link>

        <Nav className='ml-auto'>
          {isLoggedIn && (
            <NavItem>
              <button className='btn btn-link' onClick={handleLogout}>
                Close
              </button>
            </NavItem>
          )}
        </Nav>

        <Link
          to={routeNames.unlock}
          className='btn btn-primary mt-3 text-white'
          data-testid='loginBtn'
        >
          Connect Wallet
        </Link>
      </div>
    </BsNavbar>
  );
};

export default Navbar;
