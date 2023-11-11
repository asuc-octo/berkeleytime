import Description from 'components/Common/Description';

const url = new URL('../../public/releases.md', import.meta.url).href;

export function Component() {
	return (
		<Description
			title={'Berkeleytime Releases'}
			subtitle={'Keep up-to-date with our releases and bug fixes.'}
			bodyURL={url}
		/>
	);
}
