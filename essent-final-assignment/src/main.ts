import { error } from 'console';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { products,Product } from './products';

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
    console.log(`accountId - ${accountId} balance is updated ${accounts[accountIdIndex].balance}` )
  }
  else {
    console.log(`accountId - ${accountId} not found`)
  }
}

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

/*register/update the deposit for an account*/
app.post('/accounts/:accountId/deposits',(req, res) => {
  try{
    if (accounts.length > 0){
      const inmaccount = accounts.find(account => account.id === req.params.accountId);
      // console.log('in memory account: ', inmaccount);
      // console.log('sim-day: ', req.headers['simulated-day']);
      if (inmaccount){
        const inmdepositList: depositType[] = [{
          depositId: uuidv4(),
          amount: req.body['amount']
        }];
        const inmdeposit = deposit.find(deposit => deposit.accountId === req.params.accountId);
        if (inmdeposit) {
          console.log('balance before update: ', inmaccount.balance);
          const inmTotalDeposit: number = Number(inmaccount.balance + req.body['amount']);
          inmdeposit.totalDeposit = inmTotalDeposit;
          inmdeposit.deposits.push(inmdepositList[0]);
          updateAccountBalance(req.params.accountId, inmTotalDeposit);
        }else{
          const inmNewDeposit: Deposit = {
            accountId: req.params.accountId,
            simulatedDay: Number(req.headers['simulated-day']),
            totalDeposit: req.body['amount'],
            deposits: inmdepositList
          };
          deposit.push(inmNewDeposit);
          updateAccountBalance(req.params.accountId, req.body['amount']);
        }
        const filterDeposit: Deposit = deposit.find(deposit => deposit.accountId === req.params.accountId)
        res.status(201).send({id: req.params.accountId,name:inmaccount.name, balance: filterDeposit.totalDeposit});
        
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

/*purchase product api*/
app.post('/accounts/:accountId/purchases',(req,res) => {
  try{
    if (accounts.length>0){
      let productPrice:number = 0;
      let balance: number =0;
      let stock: number = 0;
      const inMAccount = accounts.filter(account => account.id === req.params.accountId);
      const inMProduct = products.filter(product => product.id === req.body['productId']);
      if (inMAccount.length>0){
        balance = inMAccount[0].balance;
      }
      if (inMProduct.length>0){
        productPrice=inMProduct[0].price
      }
      if (inMProduct.length>0){
        stock=inMProduct[0].stock
      }
      console.log('balance: ', balance,' productPrice: ',productPrice,' stock: ',stock)
      if(inMAccount.length === 0 || inMProduct.length ===0 ){
        res.status(400).send({message: 'Invalid input'});
      }
      else if (Number(req.headers['simulated-day']) < inMAccount[0].lastPurchasedDate){
        res.status(400).send({message: 'Simulated day illegal'})
      }
      else if (stock >0 && balance>=productPrice){
        inMProduct[0].stock = inMProduct[0].stock-1;
        //inMAccount[0].balance = inMAccount[0].balance - productPrice;
        updateAccountBalance(req.params.accountId, inMAccount[0].balance - productPrice);
        //inMAccount[0].lastPurchasedDate = req.header['simulated-day'];
        simulatedDayForAccount(req.params.accountId, Number(req.headers['simulated-day']));
        res.status(201).send({message: 'Success'})
      }
      else if (balance < productPrice){
        res.status(409).send({message: 'Not enough funds'})
      }
      else if (stock <= 0){
        res.status(409).send({message: 'Not enough stock'})
      }
    }
    else{
      const err = new Error();
      err.name = 'Error';
      err.message= 'Unknown Error';
      throw err;
    }
  }
  catch(error) {
    res.status(400).send({message: error})
  }

});

app.post('/products',(req,res) => {
  try{
    if (req.body['title']){
      const inMProduct: Product = {
        id: uuidv4(),
        title: req.body['title'],
        description: req.body['description'],
        price: req.body['price'],
        stock: req.body['stock']
      }
      products.push(inMProduct);
      res.status(201).send({id: inMProduct.id, title:inMProduct.title,description:inMProduct.description,price:inMProduct.price,stock:inMProduct.stock});
      console.log(products)
    }
    else{
      const err = new Error();
      err.name = 'Invalid Input';
      err.message = 'Invalid Input';
      throw err;
    }
  }
  catch(error){
    res.status(400).send({error});
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
