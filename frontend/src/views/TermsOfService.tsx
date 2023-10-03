import Description from '../components/Common/Description';
const url = new URL('../../public/terms.md', import.meta.url).href;

export function Component() {
	return (
		<Description
			title={'Terms of Service'}
			bodyURL={url}
			link={'/legal/privacy'}
			linkName={'Privacy Policy'}
		/>
	);
}
