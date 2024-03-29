const releases = [
	{
		date: 'Jan 24, 2021',
		whatsNew: [
			'We released user profiles! Click on the bookmark icon in <a href="/catalog">catalog</a> to save a class, then click on the class in your user home to see it in the catalog. Also be sure to opt in to notifications for when we update the catalog, grades, and the site.',
			'We updated the site with Summer 2020 <a href="/grades">grade</a> distributions.'
		],
		fixes: [
			'Updated GEOG 20 in the catalog, which no longer satisfies the L&S International Studies, Social and Behavioral Sciences Breadths.'
		]
	},
	{
		date: 'Dec 6, 2020',
		whatsNew: [
			'We wrote new backend APIs using GraphQL (our previous APIs use the REST framework). Although the APIs listed on our <a href="/apidocs">API Docs</a> are currently supported, they may change in the future.',
			'We are now primarily hosted on the <a href="https://www.ocf.berkeley.edu/">OCF\'s</a> servers.',
			'We have added a <a href="/legal/privacy">Privacy Policy</a> and <a href="/legal/terms">Terms of Service</a> to the site.'
		],
		fixes: [
			'Modified prerequisites for PB HLTH 126 in Spring 2021 as requested by the instructor.',
			'Added support for opening a course by url in catalog on mobile.',
			'Added easter eggs back into the catalog.',
			'Changed the semester dropdown in catalog to be single select rather than multi-select.'
		]
	},
	{
		date: 'Nov 15, 2020',
		whatsNew: [
			'We have released mobile views! You can now browse our site on your phone and tablet.',
			'We\'ve added improved search to our <a href="/catalog">catalog</a>. You can now search for courses by their names. We\'ve added a Sort By - Relevance query to give you courses that are most similar to your query (try searching "Economics" in catalog).',
			"We've revamped our backend so that we now display more complete grades and enrollment data."
		],
		fixes: [
			'Modified enrollment search to display all courses we have data for. Previously, we were only displaying courses that would be offered in the coming semester.',
			'Fixed L&S requirement filters, which were temporarily broken due to a SIS API issue.'
		]
	},
	{
		date: 'Oct 11, 2020',
		whatsNew: [
			'We released Spring 2021 course information! You can now search for courses on our <a href="/catalog">catalog</a>.'
		],
		fixes: [
			'Fixed a bug in our enrollment scraper so that all courses we have enrollment data for are listed.',
			'Fixed a bug where certain catalog pages like COMPSCI 61B caused the screen to go completely white.',
			"Fixed scrolling behavior on catalog so it's friendly for smaller screen sizes and more intuitive for users."
		]
	},
	{
		date: 'Aug 23, 2020',
		whatsNew: [
			'We are opening our Fall 2020 applications! Come see what roles we have open and join the OCTO team on the <a href="/apply">apply</a> page.',
			'Our backend API can now be accessed from mobile devices, and the *_json queries now have a long option.'
		],
		fixes: [
			'Fixed a bug where many courses for which we have enrollment data do not show up.',
			'Fixed a bug where enrollment and some course data were not updating.',
			'Fixed a bug where typing in the course search bar caused the screen to go completely white.',
			'Added visible scrollbars to some scrollable elements. (You can still turn them off using your OS settings.)'
		]
	},
	{
		date: 'May 3, 2020',
		whatsNew: [
			"We're rolling out an updated UI, which is now available on both web (and soon on mobile)!",
			'Our backend API is officially open-sourced in version v0.1! Head over to our <a href="/apidocs">API Documentation</a> to check it out.',
			'This releases page will be updated with notes of new features, bug fixes, and class enrollment/grades updates.',
			'Our new  <a href="/faq">FAQ page</a>  answers some common questions we\'ve gotten over the past few semesters. Feel free to send us more questions if you\'ve got them!',
			'Support for our old legacy site is now officially deprecated. You can still visit it at <a href="https://old.berkeleytime.com">old.berkeleytime.com</a>, but some features may be broken and we won\'t be maintaining it moving forward.'
		],
		fixes: [
			'Adding courses to Grades and Enrollment pages now accurately generate unique URLs, which you can share with friends to reproduce your search.',
			'Fixed an issue where the course average in Grades was not being calculated correctly.',
			'Enrollment statistics are now updated every 15 minutes.',
			'Course search is improved with better support for abbreviations for class names.'
		]
	}
];

export default releases;
