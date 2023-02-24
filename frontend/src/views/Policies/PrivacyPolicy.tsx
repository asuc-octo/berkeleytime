import { FC } from 'react';
import Description from '../../components/Recruiting/Description';
const url = new URL('../../../public/privacy.md', import.meta.url).href

const PrivacyPolicy: FC = () => (
	<Description
		title={'Privacy Policy'}
		bodyURL={url}
		link={'/legal/terms'}
		linkName={'Terms Of Service'}
	/>
);

export default PrivacyPolicy;
