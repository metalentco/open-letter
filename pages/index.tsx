import * as React from 'react'
// import favicon from './@assets/images/fav.png'
import Footer from './@components/footer'
import Head from 'next/head'
import Header from './@components/header'
import styles from './index.module.scss'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3Modal from 'web3modal'
import { providers } from 'ethers'
import { useCallback, useEffect, useReducer, useState } from 'react'
import Lotus from './@assets/images/lotus.svg'
import SignLogo from './@assets/images/sign-logo.svg'
import SmCircle from './@assets/images/sm-circle.svg'
import { getEnsName } from '../util/ens'
import { isMobile } from 'react-device-detect'
// import { stringify } from 'querystring'

const INFURA_KEY = '36e6bf067bfd4547a69b3e48cb599982'

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: INFURA_KEY,
    },
  },
}

let web3Modal
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    network: 'mainnet',
    cacheProvider: true,
    providerOptions,
  })
}

type StateType = {
  signature?: string | null
  address?: string | null
  walletConnected?: boolean | false
}

type ActionType =
  | {
      type: 'SET_SIGNATURE'
      signature?: string
      address?: string
    }
  | {
      type: 'RESET'
    }
  | {
      type: 'WALLET_CONNECT'
      walletConnected?: boolean
    }

const initialState: StateType = {
  signature: null,
  address: null,
  walletConnected: false,
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_SIGNATURE':
      return {
        ...state,
        signature: action.signature,
        address: action.address,
      }
    case 'RESET':
      return initialState

    case 'WALLET_CONNECT':
      return {
        ...state,
        walletConnected: action.walletConnected,
      }

    default:
      throw new Error()
  }
}

const Address: React.FunctionComponent<{ address: string }> = ({
  address,
}: {
  address: string
}) => {
  const [ensName, setEnsName] = useState<string | null>(null)

  useEffect(() => {
    getEnsName(address).then((name) => {
      if (name) {
        setEnsName(name.name)
      } else {
        setEnsName(address)
      }
    })
  }, [address])

  return <>{ensName}</>
}

export const Home = (): JSX.Element => {
  const [signers, setSigners] = useState<any[]>()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { signature, address, walletConnected } = state
  const [twitter, setTwitter] = useState<boolean>(false)

  const onFetchSigners = useCallback(async () => {
    const response = await fetch(`/api/signers`)
    const data = await response.json()
    setSigners(data)
  }, [])

  const onAddSigner = useCallback(
    async (addr, signature) => {
      const ensName = await getEnsName(addr)
      await fetch(`/api/signers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: addr,
          signature,
          ens: ensName ? ensName.name : null,
        }),
      }).then(
        (response) => {
          if (response.status === 200) {
            onFetchSigners()
          }
        },
        // eslint-disable-next-line no-console
        (error) => console.log('An error occurred.', error)
      )
    },
    [onFetchSigners]
  )

  const shareTwitter = () => {
    var text = `I’m supporting wellbeing in web3 🤍 %0aLet’s unite to take better care of our individual and collective minds https://openletter.momentsofspace.com 
    %0aSigned: ${signature}`
    url = window.location.href
    var url = `https://twitter.com/intent/tweet?text=${text}`
    window.open(url, 'TwitterWindow', '600')

    setTwitter(true)
    return false
  }

  useEffect(() => {
    if (!signers) {
      onFetchSigners()
    }
  }, [signers, twitter, onFetchSigners])

  const signLetter = useCallback(
    async function () {
      const provider = await web3Modal.connect().catch((error) => {
        // eslint-disable-next-line no-console
        console.log('Could not get a wallet connection', error)
        return
      })

      if (!provider) {
        dispatch({ type: 'RESET' })
        return
      } else {
        dispatch({
          type: 'WALLET_CONNECT',
          walletConnected: true,
        })
      }

      if (!isMobile) {
        const web3Provider = new providers.Web3Provider(provider)

        const signer = web3Provider.getSigner()
        const addr = await signer.getAddress()

        const sign = await signer
          .signMessage(
            'I show my support for wellbeing in web3 by signing this open letter 👇'
          )
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.log('Could not sign message', error)
            return
          })

        if (!sign) {
          dispatch({ type: 'RESET' })
          return
        }

        onAddSigner(addr, sign)

        dispatch({
          type: 'SET_SIGNATURE',
          signature: sign,
          address: addr,
        })

        // set cookies for signature and address
        document.cookie = `signature=${sign}`
        document.cookie = `address=${addr}`
      }
    },
    [onAddSigner]
  )

  const signLetterOnMobile = useCallback(
    async function () {
      const provider = await web3Modal.connect()

      if (!provider) {
        dispatch({ type: 'RESET' })
        return
      } else {
        dispatch({
          type: 'WALLET_CONNECT',
          walletConnected: true,
        })
      }

      const web3Provider = new providers.Web3Provider(provider)

      const signer = web3Provider.getSigner()
      const addr = await signer.getAddress()

      const sign = await signer
        .signMessage(
          'I show my support for wellbeing in web3 by signing this open letter 👇'
        )
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log('Could not sign message', error)
          return
        })

      if (!sign) {
        dispatch({ type: 'RESET' })
        return
      }

      onAddSigner(addr, sign)

      dispatch({
        type: 'SET_SIGNATURE',
        signature: sign,
        address: addr,
      })

      // set cookies for signature and address
      document.cookie = `signature=${sign}`
      document.cookie = `address=${addr}`
    },
    [onAddSigner]
  )

  const onSignatureInCookies = useCallback(() => {
    const cookies = document.cookie.split(';')
    const signatureCookie = cookies.find((cookie) =>
      cookie.includes('signature')
    )
    const addressCookie = cookies.find((cookie) => cookie.includes('address'))
    if (signatureCookie && addressCookie) {
      const signature = signatureCookie.split('=')[1]
      const address = addressCookie.split('=')[1]
      dispatch({
        type: 'SET_SIGNATURE',
        signature,
        address,
      })
      return true
    }
    return false
  }, [])

  useEffect(() => {
    if (web3Modal.cachedProvider && !signature) {
      if (!onSignatureInCookies()) {
        signLetter()
      }
    }
  }, [signLetter, signature, onSignatureInCookies])

  return (
    <>
      <Head>
        <title>Moments of Space - Open Letter</title>
        {/* <link rel="icon" href={favicon.src} /> */}
      </Head>
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 mt-16">
        <h1 className={styles.title}>Open Letter</h1>
        <h2 className={styles.subtitle}>A commitment to wellbeing in web3</h2>
        <img src={Lotus.src} alt="Lotus" className={styles.lotus} />

        <p className={styles.paragraphCentered}>
          As the world of web3 evolves, it awakens never-ending possibilities. A
          wave of energy and excitement is building, and we &#39; re all here
          for it! But with the energy of innovation comes strain, overwhelm and
          exhaustion. To be a meaningful part of this movement, it can feel like
          we must be always on, always connected, always available, and always
          doing. So while we embrace the opportunities that this revolution can
          offer us, we must also recognise its contradictions and move forward
          together with awareness.
        </p>
        <br />
        <div className={styles.paragraph}>
          <p className={styles.paragraphCentered1}>
            <span className={styles.relative}>
              W
              <img
                src={SmCircle.src}
                alt="SmCircle"
                className={styles.smCircle1}
              />
            </span>
            eb3 allows us to create and dream without barriers, but this world
            of limitless potential can become all-consuming and obscure the
            version we&#39;re working towards.
          </p>

          <p className={styles.paragraphCentered1}>
            <span className={styles.relative}>
              M
              <img
                src={SmCircle.src}
                alt="SmCircle"
                className={styles.smCircle2}
              />
            </span>
            t gifts us greater connectivity, making our expansive world feel
            closer than ever, but this hyper-connectedness can also create
            competition and comparison, leaving us feeling isolated or pressured
            by FOMO
          </p>

          <p className={styles.paragraphCentered1}>
            <span className={styles.relative}>
              T
              <img
                src={SmCircle.src}
                alt="SmCircle"
                className={styles.smCircle3}
              />
            </span>
            his high-stakes, fast-moving world is captivating, but its rapid
            progress can command our attention 24/7 and lead to burnout
          </p>
        </div>

        <p className={styles.paragraphCentered}>
          As we navigate our way through this technological transformation,
          let&#39;s all choose to stay mindful and present so we can reclaim our
          time, attention, and energy and let our wellbeing come first. If we
          progress with collective awareness, we&#39;ll all be more able to find
          space amid the busyness.
        </p>

        <div>
          <h4 className={styles.miniHeader}>
            Join us in pledging to care for our collective and individual minds
            by signing with your wallet.
          </h4>
          <p className={styles.paragraphCentered}>
            At Moments of Space, we pledge to prioritise wellbeing as we ride
            this wave towards its infinite horizon. We commit to harnessing the
            power of mindfulness, meditation, and the tools of web3 to pave the
            way for a brighter, more united future. Community is the lifeblood
            of web3, and we urge you to join us in our mission to take better
            care of ourselves so we can all take care of each other.
          </p>

          <div className={styles.center}>
            <div className={styles.threeCircles}>
              <img src={SmCircle.src} alt="SmCircle" />
              <img src={SmCircle.src} alt="SmCircle" />
              <img src={SmCircle.src} alt="SmCircle" />
            </div>
          </div>

          <p className={styles.paragraphCentered}>
            Sign before Decemtber 15th and we&#39;ll represent your voice in a
            collective statement of wellbeing with a special NFT. Keep your eyes
            on our Twitter for the reveal and extra surprises.
          </p>
        </div>
        {signature ? (
          isMobile ? (
            <div className={styles.pledgePanel} id="SignPanel">
              <p className={styles.joinPanel}>Share your commitment</p>
              <p className={styles.wellbeingPanel}>
                Thank you for pledging to be apart of our vision
              </p>
              <div className={styles.flexCenter}>
                <div className={styles.process}>
                  <div className={styles.box}>
                    <div className={styles.center}>
                      <div className={styles.circle}>✓</div>
                    </div>
                    <div className={styles.letter}>Sign open letter</div>
                  </div>
                  <div className={styles.box}>
                    {twitter ? (
                      <div className={styles.circle}>✓</div>
                    ) : (
                      <div className={styles.circle}></div>
                    )}
                    <div className={styles.letter}>Share signing</div>
                  </div>
                </div>
              </div>
              <div className={styles.center}>
                <div className={styles.line}></div>
              </div>
              {isMobile ? (
                <h4 className={styles.signatureHeading}>
                  Thank you for signing!
                </h4>
              ) : (
                <h4 className={styles.signatureHeading}>Your Signature</h4>
              )}
              <p
                className={`${styles.info} ${styles.signature} justify-center p-6`}
              >
                {signature}
              </p>
              <p className={styles.signatureAddress}>
                —{' '}
                <Address
                  address={
                    address.slice(0, 4) +
                    '---' +
                    address.slice(address.length - 4, address.length)
                  }
                />
              </p>
              {twitter ? (
                <div>
                  <p className={styles.twitterText}>
                    Thank you for your support. Follow us on Twitter and keep an
                    eye out for something special landing on Dec 16th
                  </p>
                  <div className={styles.twitter}>
                    <p className={styles.button} onClick={shareTwitter}>
                      Verified
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className={styles.twitterText}>
                    Help to spread the word and be eligible for future surprises
                    👀
                  </p>
                  <div className={styles.twitter}>
                    <p className={styles.button} onClick={shareTwitter}>
                      Share on twitter
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.pledgePanel} id="SignPanel">
              <p className={styles.joinPanel}>
                Thank you for supporting wellbeing in web3
              </p>
              <p className={styles.wellbeingPanel}>
                Please help us spread the word by sharing your pledges
              </p>
              <div className={styles.flexCenter}>
                <div className={styles.process}>
                  <div className={styles.box}>
                    <div className={styles.center}>
                      <div className={styles.circle}>✓</div>
                    </div>
                    <div className={styles.letter}>Sign open letter</div>
                  </div>
                  <div className={styles.box}>
                    {twitter ? (
                      <div className={styles.circle}>✓</div>
                    ) : (
                      <div className={styles.circle}></div>
                    )}
                    <div className={styles.letter}>Share signing</div>
                  </div>
                </div>
              </div>
              <div className={styles.center}>
                <div className={styles.line}></div>
              </div>
              {isMobile ? (
                <h4 className={styles.signatureHeading}>
                  Thank you for signing!
                </h4>
              ) : (
                <h4 className={styles.signatureHeading}>Your Signature</h4>
              )}
              <p
                className={`${styles.info} ${styles.signature} justify-center p-6`}
              >
                {signature}
              </p>
              <p className={styles.signatureAddress}>
                —{' '}
                <Address
                  address={
                    address.slice(0, 4) +
                    '---' +
                    address.slice(address.length - 4, address.length)
                  }
                />
              </p>
              {twitter ? (
                <div>
                  <p className={styles.twitterText}>
                    Follow us on Twitter and keep an eye out for something
                    special landing on Dec 16th
                  </p>
                  <div className={styles.twitter}>
                    <p className={styles.button} onClick={shareTwitter}>
                      Verified
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className={styles.twitterText}>
                    Help to spread the word and be eligible for future surprises
                    👀
                  </p>
                  <div className={styles.twitter}>
                    <p className={styles.button} onClick={shareTwitter}>
                      Share on twitter
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        ) : isMobile && walletConnected ? (
          <div className={styles.pledgePanel} id="SignPanel">
            <p className={styles.shareLetter}>Share your commitment</p>
            <p className={styles.wellbeingPanel}>
              Thank you for connecting your wallet
            </p>
            <div className={styles.circleBox}>
              <div className={styles.process}>
                <div className={styles.box}>
                  <div className={styles.center}>
                    <div className={styles.circle}></div>
                  </div>
                  <div className={styles.letter}>Sign open letter</div>
                </div>
                <div className={styles.box}>
                  <div className={styles.circle}></div>
                  <div className={styles.letter}>Share signing</div>
                </div>
              </div>
            </div>
            <div className={styles.center}>
              <div className={styles.line}></div>
            </div>
            <p className={styles.twitterText}>
              Press below to sign the open letter
            </p>
            <div className={styles.twitter}>
              <p className={styles.button} onClick={signLetterOnMobile}>
                Sign the open letter
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.pledgePanel} id="SignPanel">
            <p className={styles.joinPanel}>Join us</p>
            <p className={styles.wellbeingPanel}>Pledge to Wellbeing in Web3</p>
            <div className={styles.signLogo}>
              <img src={SignLogo.src} alt="SignLogo" className={styles.lotus} />
            </div>
            {isMobile ? (
              <div className={styles.walletBlock}>
                <div className={styles.mobileWallet}>
                  To sign the Open Letter please start by
                </div>
                <div className={styles.mobileWallet}>
                  connecting your wallet
                </div>
                <div className={styles.flex}>
                  <div className={styles.connectWallet} onClick={signLetter}>
                    Connect Wallet
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className={styles.flex}>
                  <button
                    className={styles.signLogoButton}
                    onClick={signLetter}
                  >
                    Sign the Open Letter
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <div className={`${styles.signInfo} justify-center p-6`}>
        <p className={styles.signerHeader}>
          {signers && signers.length} people have signed the open letter so far
        </p>
        <div className={styles.signers}>
          <ul>
            {signers &&
              signers
                .filter((signer) => signer.pinned === true && signer.ens)
                .map((signer) => <li key={signer.address}>{signer.ens}</li>)}
          </ul>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Home
