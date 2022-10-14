import { FunctionComponent } from 'react'
import logoSrc from '../../@assets/images/mos-logo.svg'
import styles from '../../index.module.scss'

const Header: FunctionComponent = () => {
  const scrollToSpecific = () => {
    setTimeout(() => {
      window.scrollTo({
        top: document.getElementById('SignPanel').offsetTop - 60,
        behavior: 'smooth',
      })
    }, 100)
  }
  return (
    <header>
      <div className="max-w-7xl mx-auto py-6 px-4 flex flex-col justify-center items-center gap-6 lg:flex-row lg:justify-between">
        <div className="flex justify-between items-center">
          <img src={logoSrc.src} alt="MOS Logo" className="h-8 w-auto" />
        </div>
        <div className="flex justify-between items-center">
          <p
            className={styles.button}
            onClick={() => {
              scrollToSpecific()
            }}
          >
            Sign the Open Letter
          </p>
        </div>
      </div>
    </header>
  )
}

export default Header
