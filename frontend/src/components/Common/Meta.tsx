import Helmet from 'react-helmet';

interface MetaProps {
	title: string;
	description?: string;
}

const Meta = (props: MetaProps) => {
	const { title, description } = props;

	return (
		<Helmet>
			<title>{title}</title>
			{description && <meta name="description" content={description} />}
		</Helmet>
	);
};

Meta.defaultProps = {
	description: ''
};

export default Meta;
