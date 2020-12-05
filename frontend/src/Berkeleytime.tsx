import React, { Component } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import Banner from './components/Common/Banner'
import Navigation from './components/Common/Navigation'
import Footer from './components/Common/Footer'
import Routes from './Routes'

import { openBanner, enterMobile, exitMobile } from './redux/common/actions'
import { ReduxState } from 'redux/store'

function easterEgg() {
  console.log(`%c
    Hey there! Checking out how Stanfurdtime works? We are a group of student developers
    here at UC Stanfurd. We build this site using the latest tech - React, Django, Kubernetes,
    and more. If you love using Stanfurdtime and want to see yourself as a contributor,
    we are always looking for passionate individuals to help us improve our product.
    
    Check out our Join Us page, especially towards the start of the Fall semester when we
    are recruiting. Also, send us an email at octo.berkeleytime@asuc.org letting us know you
    found this message!   


                                   .,,uod8B8bou,,.
                    ..,uod8BBBBBBBBBBBBBBBBRPFT?l!i:.
               ,=m8BBBBBBBBBBBBBBBRPFT?!||||||||||||||
               !...:!TVBBBRPFT||||||||||!!^^""'   ||||
               !.......:!?|||||!!^^""'            ||||
               !.........||||                     ||||
               !.........||||  $                  ||||
               !.........||||                     ||||
               !.........||||                     ||||
               !.........||||                     ||||
               !.........||||                     ||||
                \`........||||                    ,||||
                .;.......||||               _.-!!|||||
         .,uodWBBBBb.....||||       _.-!!|||||||||!:'
      !YBBBBBBBBBBBBBBb..!|||:..-!!|||||||!iof68BBBBBb....
      !..YBBBBBBBBBBBBBBb!!||||||||!iof68BBBBBBRPFT?!::   \`.
      !....YBBBBBBBBBBBBBBbaaitf68BBBBBBRPFT?!:::::::::     \`.
      !......YBBBBBBBBBBBBBBBBBBBRPFT?!::::::;:!^"\`;:::       \`.
      !........YBBBBBBBBBBRPFT?!::::::::::^''...::::::;         iBBbo.
      \`..........YBRPFT?!::::::::::::::::::::::::;iof68bo.      WBBBBbo.
        \`..........:::::::::::::::::::::::;iof688888888888b.     \`YBBBP^'
          \`........::::::::::::::::;iof688888888888888888888b.     \`
            \`......:::::::::;iof688888888888888888888888888888b.
              \`....:::;iof688888888888888888888888888888888899fT!
                \`..::!8888888888888888888888888888888899fT|!^"'
                  \`' !!988888888888888888888888899fT|!^"'
                      \`!!8888888888888888899fT|!^"'
                        \`!988888888899fT|!^"'
                          \`!9899fT|!^"'
                            \`!^"'
 `, 'font-family:monospace')
}

interface Props extends PropsFromRedux {}

class Stanfurdtime extends Component<Props> {
  constructor(props: Props) {
    super(props)

    easterEgg()

    const key = 'bt-spring-2021-catalog'
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, key)
      props.openBanner()
    }

    /* Clear storage if not storing anything */
    // localStorage.clear()

    this.checkMobile()
  }

  componentDidMount() {
    window.addEventListener('resize', this.checkMobile)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkMobile)
  }

  checkMobile = () => {
    if (window.innerWidth < 768 && !this.props.mobile) {
      this.props.enterMobile()
    } else if (window.innerWidth >= 768 && this.props.mobile) {
      this.props.exitMobile()
    }
  }

  render() {
    /* Provide a plain version of OCTO Application for embedding */
    // const embeded = window.location.pathname.includes('/embed')
    const embeded = false

    return (
      <>
        {!embeded && <Banner />}
        <div className="app">
          {!embeded && <Navigation />}
          <Routes />
          {!embeded && <Footer />}
        </div>
      </>
    )
  }
}

const mapState = (state: ReduxState) => ({
  mobile: state.common.mobile
})

const mapDispatch = {
  openBanner,
  enterMobile,
  exitMobile
}

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(Stanfurdtime)
