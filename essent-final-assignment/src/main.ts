import { error } from 'console';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';


const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;


const app = express();
app.use(express.json());

interface Account {
  id: string;
  name: string;
  balance: number;
  lastPurchasedDate: number;
}

const accounts: Account[] = [];

/*Part A: Accounts*/
/* Add a new account with name */
app.post('/accounts', (req, res) => {
  try{
    if (req.body['name'] && accounts.some((account) => account.name === req.body.name)){
      res.status(200).send({
        message: accounts
      });
    }else if(req.body['name']) {
      const generateAccount: Account = {
        id: uuidv4(),
        name: req.body['name'],
        balance: 0,
        lastPurchasedDate: 0
      }
      accounts.push(generateAccount);
      res.status(200).send({
         accounts
      });
    }
    else{
      const err = new Error();
      err.name = 'Invalid Input';
      err.message = 'please enter the name';
      throw err;
    }
  }
  catch (error){
    res.status(400).send({error});
  }
});

/* Get all accounts API */
app.get('/accounts', (req, res) => {
  res.status(201).send(
    {
      accounts
    }
  )
});

/* Get an account based on id API */
app.get('/accounts/:accountid', (req, res) => {
  const account: Account[] = accounts.filter((account) => account.id === req.params.accountid);
  try{
    if (account.length >= 1){
      res.status(200).send({account})
    }
    else{
      const err = new Error();
      err.name = 'Not Found';
      err.message = 'Enter a valid accountId'
      throw err;
    }
  }
  catch (error){
    res.status(404).send({error});
  }
});

/*Part B: Purchasing Products*/
/*Products*/

export const products = [
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

/*deposit interface and variables*/

interface Deposit {
  accountId: string;
  simulatedDay: number;
  totalDeposit: number;
  deposits: depositType[]
}

type depositType = {
  depositId: string;
  amount: number
}

const deposit: Deposit[] = [];
let simulatedDay: number;

const updateAccountBalance = (accountId: string, newBalance: number): void => {
  const accountIdIndex = accounts.findIndex(account => account.id === accountId);
  if (accountIdIndex !== -1){
    accounts[accountIdIndex].balance = newBalance;
    console.log(`accountId - ${accountId} balance is updated`)
  }
  else {
    console.log(`accountId - ${accountId} not found`)
  }
}

/*register the deposit for an account*/
app.post('/accounts/:accountId/deposits',(req, res) => {
  try{
    if (accounts.length > 0){
      const inmaccount = accounts.find(account => account.id === req.params.accountId);
      console.log('in memory account: ', inmaccount);
      console.log('sim-day: ', req.headers['simulated-day']);
      if (inmaccount){
        const inmdepositList: depositType[] = [{
          depositId: uuidv4(),
          amount: req.body['amount']
        }];
        const inmdeposit = deposit.find(deposit => deposit.accountId === req.params.accountId);
        if (inmdeposit) {
          const sumOfOldDeposit: number = Number(inmdeposit.deposits.reduce((sum,deposit) => sum+deposit.amount,0));
          const inmTotalDeposit: number = Number(sumOfOldDeposit + req.body['amount']);
          inmdeposit.totalDeposit = inmTotalDeposit
          inmdeposit.deposits.push(inmdepositList[0]);
        }else{
          const inmNewDeposit: Deposit = {
            accountId: req.params.accountId,
            simulatedDay: Number(req.headers['simulated-day']),
            totalDeposit: req.body['amount'],
            deposits: inmdepositList
          };
          deposit.push(inmNewDeposit);
        }
        const filterDeposit: Deposit = deposit.find(deposit => deposit.accountId === req.params.accountId)
        res.status(200).send({id: req.params.accountId,name:inmaccount.name, balance: filterDeposit.totalDeposit});
        
      } 
      else{
        const err = new Error ('Invalid input');
        err.name = 'Invalid input';
        throw err;
      }
    }
    else{
      const err = new Error ('Invalid input');
      err.name = 'Invalid input';
      throw err;
    }
  }
  catch(error){
    console.error('Error Message:',error.message);
    res.status(400).send({error: error.message})
  }

});


app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
