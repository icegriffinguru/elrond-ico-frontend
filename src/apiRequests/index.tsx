import axios from 'axios';

interface GetLatestTransactionsType {
  apiAddress: string;
  address: string;
  contractAddress: string;
  timeout: number;
  page?: number;
  url?: string;
}

const fetchTransactions = (url: string) =>
  async function getTransactions({
    apiAddress,
    address,
    contractAddress,
    timeout
  }: GetLatestTransactionsType) {
    try {
      const { data } = await axios.get(`${apiAddress}${url}`, {
        params: {
          sender: address,
          receiver: contractAddress,
          condition: 'must',
          size: 25
        },
        timeout
      });

      return {
        data: data,
        success: data !== undefined
      };
    } catch (err) {
      return {
        success: false
      };
    }
  };

export const getTransactions = fetchTransactions('/transactions');
export const getTransactionsCount = fetchTransactions('/transactions/count');

interface GetEsdtBalanceType {
  apiAddress: string;
  address: string;
  tokenId: string;
  timeout: number;
}

export const getEsdtBalance = async ({
  apiAddress,
  address,
  tokenId,
  timeout
}: GetEsdtBalanceType) => {
  try {
    const url = `${apiAddress}/address/${address}/esdt/${tokenId}`;
    const { data } = await axios.get(url, {
      timeout
    });

    return {
      data: data.data,
      success: data !== undefined && data.code == 'successful'
    };
  } catch (err) {
    return {
      success: false
    };
  }
};

interface GetEgldBalanceType {
  apiAddress: string;
  address: string;
  timeout: number;
}

export const getEgldBalance = async ({
  apiAddress,
  address,
  timeout
}: GetEgldBalanceType) => {
  try {
    const url = `${apiAddress}/address/${address}/balance`;
    const { data } = await axios.get(url, {
      timeout
    });

    return {
      data: data.data,
      success: data !== undefined && data.code == 'successful'
    };
  } catch (err) {
    return {
      success: false
    };
  }
};