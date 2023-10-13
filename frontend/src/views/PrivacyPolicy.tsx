import Description from '../components/Common/Description';
const url = new URL('../../public/privacy.md', import.meta.url).href;

export function Component() {
	return (
		<Description
			title={'Privacy Policy'}
			bodyURL={url}
			link={'/legal/terms'}
			linkName={'Terms Of Service'}
		/>
	);
}
