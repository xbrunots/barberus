import { NowRequest, NowResponse } from '@vercel/node'
import { MongoClient, Db } from 'mongodb'
import url from 'url';
import md5 from 'md5'

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

  const result = await collection.find({ email: email }).toArray();

  if (result.length > 0) {

    return response.status(200).json({ success: false, message: 'Email ' + email + ' já cadastrado!' });

  } else {
    await collection.insertOne({
      email: email,
      password: md5(password),
      status: 1,
      type: 99,
      createAt: new Date(),
    })

    return response.status(201).json({ success: true, token: 'NO-TOKEN' });
  }

}