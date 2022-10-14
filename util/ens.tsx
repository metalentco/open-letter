import { ENS } from '@ensdomains/ensjs'
const INFURA_KEY = process.env.INFURA_KEY
import { providers } from 'ethers'

const ens = new ENS()

export const getEnsName = async (address: string) => {
  await ens.setProvider(new providers.InfuraProvider('mainnet', INFURA_KEY))

  const name = await ens.getName(address)

  if (!name) {
    return null
  } else {
    return name
  }

  // double check
  // const addressFromEns = await ens.getOwner(name.name)

  // if (addressFromEns.owner === address) {
  //   return name
  // }

  return null
}
