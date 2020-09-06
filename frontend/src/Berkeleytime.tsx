import React, { Component, FC } from 'react'
import { Route } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'

import Banner from './components/Common/Banner'
import Navigation from './components/Common/Navigation'
import Footer from './components/Common/Footer'
import Routes from './Routes'

// google analytics
import ReactGA from 'react-ga'
const gaTrackingID = 'UA-35316609-1'
ReactGA.initialize(gaTrackingID)

const LogPageView: FC = () => {
  ReactGA.set({ page: window.location.pathname })
  ReactGA.pageview(window.location.pathname)
  console.log("page view")
  return null
}

function easterEgg() {
  console.log(`%c
    Hey there! Checking out how Berkeleytime works? We are a group of student developers
    here at UC Berkeley. We build this site using the latest tech - React, Django, Kubernetes,
    and more. If you love using Berkeleytime and want to see yourself as a contributor,
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

interface Props extends ReduxProps {}

class Berkeleytime extends Component<Props> {
  constructor(props: Props) {
    super(props)

    easterEgg()

    const key = 'bt-apps-open-update'
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, key)
      props.openBanner()
    }

    // Clear storage if not storing anything
    /* localStorage.clear() */
  }

  render() {
    // Provide a plain version of OCTO Application for embedding
    // Delete all instances of [embeded] to remove this feature
    const embeded = window.location.pathname.includes('/embed')

    return (
      <>
        {!embeded && <Banner />}
        <Route path="/" component={LogPageView} />
        <div className="app-container">
          {!embeded && <Navigation />}
          <Routes />
          {!embeded && <Footer />}
        </div>
      </>
    )
  }
}

const mapDispatch = {
  openBanner: () => ({ type: 'OPEN_BANNER' })
}

const connector = connect(null, mapDispatch)

type ReduxProps = ConnectedProps<typeof connector>

export default connector(Berkeleytime)