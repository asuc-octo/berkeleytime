import { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import Banner from './components/Common/Banner';
import Routes from './Routes';

import { openBanner, enterMobile, exitMobile, openLandingModal } from './redux/common/actions';
import { ReduxState } from 'redux/store';

function easterEgg() {
	// eslint-disable-next-line no-console
	console.log(
		`%c
    Hey there! Checking out how Berkeleytime works? We are a group of student developers
    here at UC Berkeley. We build this site using the latest tech - Django, Kubernetes,
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
 `,
		'font-family:monospace'
	);
}

class Berkeleytime extends Component<PropsFromRedux> {
	constructor(props: PropsFromRedux) {
		super(props);

		const bannerType = 'sp23recruitment3'; // should match value in ./redux/common/reducer.ts
		if (localStorage.getItem('bt-hide-banner') !== bannerType) {
			props.openBanner();
		}

		const modalType = 'sp22scheduler'; // should match value in ./redux/common/reducer.ts
		if (localStorage.getItem('bt-hide-landing-modal') !== modalType) {
			props.openLandingModal();
		}

		easterEgg();

		const key = 'bt-spring-2021-catalog';
		if (localStorage.getItem(key) === null) {
			localStorage.setItem(key, key);
		}

		/* Clear storage if not storing anything */
		// localStorage.clear()

		this.checkMobile();
	}

	componentDidMount() {
		window.addEventListener('resize', this.checkMobile);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.checkMobile);
	}

	checkMobile = () => {
		if (window.innerWidth < 768 && !this.props.mobile) {
			this.props.enterMobile();
		} else if (window.innerWidth >= 768 && this.props.mobile) {
			this.props.exitMobile();
		}
	};

	render() {
		return (
			<div className="app">
				<Banner />
				<Routes />
			</div>
		);
	}
}

const mapState = (state: ReduxState) => ({
	mobile: state.common.mobile
});

const mapDispatch = {
	openBanner,
	openLandingModal,
	enterMobile,
	exitMobile
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Berkeleytime);
