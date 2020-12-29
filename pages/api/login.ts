import { NowRequest, NowResponse } from '@vercel/node'
import { MongoClient, Db } from 'mongodb'
import url from 'url';
import md5 from 'md5'
import { type } from 'os';

let cachedDb: Db = null;

async function connectToDatabase(uri: string) {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const dbName = url.parse(uri).pathname.substr(1);

  const db = client.db(dbName);

  cachedDb = db;

  return db;
}

export default async (request: NowRequest, response: NowResponse) => {
  const email = request.body.email;
  const password = request.body.password;

  const db = await connectToDatabase(process.env.MONGODB_URI);

  const collection = db.collection('users');

  const result = await collection.find({ email: email, password: md5(password) }).toArray();

  console.log({ email: email, password: md5(password) })
  console.log(result)

  if (result.length > 0) {
    let resultData = result
    resultData[0].password = null
    resultData[0].token = "NO-TOKEN"

    return response.status(200).json({ success: true, data: result });
  } else {
    return response.status(201).json({ success: false, message: 'E-mail ' + email + ' não possue cadastro!' });
  }

}