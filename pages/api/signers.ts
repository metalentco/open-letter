import clientPromise from '../../lib/mongodb'
import type { NextApiRequest, NextApiResponse } from 'next'

const connectToDatabase = async () => {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB)
  return db
}

const getSigners = async (req: NextApiRequest, res: NextApiResponse) => {
  const db = await connectToDatabase()

  const signers = await db
    .collection('signers')
    .find({})
    .sort({ createdAt: -1 })
    .toArray()

  res.status(200).json(signers)
}

const addSigner = async (req: NextApiRequest, res: NextApiResponse) => {
  const db = await connectToDatabase()

  const signer = await db.collection('signers').insertOne({
    address: req.body.address,
    signature: req.body.signature,
    ens: req.body.ens,
    pinned: false,
    createdAt: new Date(),
  })

  res.status(201).json(signer)
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      return getSigners(req, res)
    case 'POST':
      return addSigner(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
