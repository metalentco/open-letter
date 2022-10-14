import { FunctionComponent } from 'react'
// import { isMobile } from 'web3modal'
import styles from '../../index.module.scss'
import { isMobile } from 'react-device-detect'

const Footer: FunctionComponent = () => {
  return (
    <div>
      {isMobile ? (
        <footer className={styles.footer}>
          <div className="max-w-7xl mx-auto py-6 px-4 flex flex-col justify-center items-center gap-6 lg:flex-row lg:justify-between">
            <div>Download the iOS app</div>
            <div className="flex flex-col justify-center items-center gap-6 lg:flex-row lg:justify-between">
              <a
                href="https://www.momentsofspace.com/"
                rel="noreferrer"
                target="_blank"
              >
                Go to website
              </a>
            </div>
            <div className="flex flex-col justify-center items-center gap-6 lg:flex-row lg:justify-between">
              <div className="flex justify-center">
                © 2022 Moments of Space Ltd
              </div>
              <div className={styles.footerEmail}>
                community@momentsofspace.com
              </div>
            </div>
          </div>
        </footer>
      ) : (
        <footer className={styles.footer}>
          <div className="max-w-7xl mx-auto py-6 px-4 flex flex-col justify-center items-center gap-6 lg:flex-row lg:justify-between">
            <div className="flex flex-col justify-center items-center gap-6 lg:flex-row lg:justify-between">
              © 2022 Moments of Space Ltd
              <br />
              community@momentsofspace.com
            </div>
            <div className="flex flex-col justify-center items-center gap-6 lg:flex-row lg:justify-between">
              <a
                href="https://www.momentsofspace.com/"
                rel="noreferrer"
                target="_blank"
              >
                Go to website
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default Footer
