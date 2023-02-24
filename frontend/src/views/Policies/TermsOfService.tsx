import { FC } from 'react';
import Description from '../../components/Recruiting/Description';
const url = new URL('../../../public/terms.md', import.meta.url).href

const TermsOfService: FC = () => (
	<Description
		title={'Terms of Service'}
		bodyURL={url}
		link={'/legal/privacy'}
		linkName={'Privacy Policy'}
	/>
);

export default TermsOfService;
