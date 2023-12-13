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
        message: accounts
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

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
