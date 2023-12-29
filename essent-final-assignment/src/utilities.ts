interface Account {
  id: string;
  name: string;
  balance: number;
  lastPurchasedDate: number;
}

const accounts: Account[] = [];

/*update account balance function*/
const updateAccountBalance = (accountId: string, newBalance: number): void => {
  const accountIdIndex = accounts.findIndex(account => account.id === accountId);
  if (accountIdIndex !== -1){
    accounts[accountIdIndex].balance = newBalance;
    console.log(`accountId - ${accountId} balance is updated ${accounts[accountIdIndex].balance}` )
  }
  else {
    console.log(`accountId - ${accountId} not found`)
  }
}

/*update simulated day function*/
const simulatedDayForAccount = (accountId: string, NewsimulatedDay: number): void => {
  const accountIdIndex = accounts.findIndex(account => account.id === accountId);
  if (accountIdIndex !== -1){
    accounts[accountIdIndex].lastPurchasedDate = NewsimulatedDay;
    console.log(`accountId - ${accountId} simulatedDay is updated - ${NewsimulatedDay}`)
  }
  else {
    console.log(`accountId - ${accountId} not found`)
  }
}

/*Product interface*/
interface Product{
    id: string,
    title: string,
    description: string,
    stock: number,
    price: number
  }

/* Products details which will be used in the main process*/
const products : Product[] = [
    {
      id: "solar",
      title: "Solar Panel",
      description: "Super duper Essent solar panel",
      stock: 10,
      price: 750,
    },
    {
      id: "insulation",
      title: "Insulation",
      description: "Cavity wall insulation",
      stock: 10,
      price: 2500,
    },
    {
      id: "heatpump",
      title: "Awesome Heatpump",
      description: "Hybrid heat pump",
      stock: 3,
      price: 5000,
    },
  ];

  /*Deposit interface*/
  interface Deposit {
    accountId: string;
    simulatedDay: number;
    totalDeposit: number;
    deposits: depositType[]
  }
  /*Deposittype used in Deposit interface*/
  type depositType = {
    depositId: string;
    amount: number
  }

  const deposit: Deposit[] = [];

  export { Product, products , Account, accounts, Deposit,deposit, depositType,updateAccountBalance,simulatedDayForAccount};