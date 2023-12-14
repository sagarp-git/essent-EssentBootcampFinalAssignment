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
  console.log(account)
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

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
