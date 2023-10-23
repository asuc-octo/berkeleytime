export type Contributors = {
	name: string;
	items: {
		name: string;
		role: string;
		img?: {
			base: string;
			silly: string | undefined;
		};
		site: string | null;
	}[];
};

const path = (path: string) => new URL(`../assets/img/about/2022-23/${path}`, import.meta.url).href;

export const current: Contributors = {
	name: 'Current Team',
	items: [
		{
			name: 'Kevin Wang',
			role: 'Product Manager and Backend Engineer',
			site: 'https://kevwang.dev/',
			img: {
				base: path('kevin_1.jpg'),
				silly: path('kevin_2.jpg')
			}
		},
		{
			name: 'Matthew Rowland',
			role: 'Frontend Lead',
			site: 'https://www.linkedin.com/in/matthew-rowland-dev/',
			img: {
				base: path('matthew_1.jpg'),
				silly: path('matthew_2.jpg')
			}
		},
		{
			name: 'Michelle Tran',
			role: 'Design Lead',
			site: 'michelletran.cargo.site',
			img: {
				base: path('michelle_1.jpg'),
				silly: path('michelle_2.jpg')
			}
		},
		{
			name: 'Max Wang',
			role: 'Backend Lead',
			img: {
				base: path('max_1.jpg'),
				silly: undefined
			},
			site: null
		},
		{
			name: 'Jaden Moore',
			role: 'Frontend Engineer',
			site: 'https://github.com/Jdyn',
			img: {
				base: path('jaden_1.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Eric Xu',
			role: 'Backend Engineer',
			site: 'https://www.linkedin.com/in/e-xu-at-berkeley',
			img: {
				base: path('eric_1.jpg'),
				silly: path('eric_2.jpg')
			}
		},
		{
			name: 'Michael Khaykin',
			role: 'Backend Engineer',
			site: null,
			img: {
				base: path('michael_1.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Rachel Hua',
			role: 'Designer',
			site: 'https://www.linkedin.com/in/byrachelhua/',
			img: {
				base: path('rachel_1.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Nyx Iskandar',
			role: 'Frontend Engineer',
			site: 'https://xyntechx.com',
			img: {
				base: path('rachel_1.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Ethan Chng',
			role: 'Designer',
			site: 'www.ethanchng.com',
		},
		{
			name: 'Kara Rizzardi',
			role: 'Frontend Engineer',
			site: 'https://www.kararizzardi.com/',
		},
		{
			name: 'Advay Ratan',
			role: 'Frontend Engineer',
			site: 'https://advayratan.com/',
		},
		{
			name: 'Daniel Li',
			role: 'Backend Engineer',
			site: null,
		},
		{
			name: 'Kartavya Sharma',
			role: 'Backend Engineer',
			site: 'https://www.kartavyas.com',
		},
		{
			name: 'Mary Tran',
			role: 'Designer',
			site: 'https://www.linkedin.com/in/mary-tran-b19246260/',
		},
		{
			name: 'Mary Tran',
			role: 'Designer',
			site: 'https://www.linkedin.com/in/mary-tran-b19246260/',
		},
		{
			name: 'Clara Tu',
			role: 'Frontend Engineer',
			site: 'https://www.linkedin.com/in/claratu/',
		},
	]
};

export const past: Contributors[] = [
	{
		name: 'Class of 2026',
		items: [
			{
				name: 'William Tang',
				role: 'Backend Engineer',
				site: 'https://www.linkedin.com/in/william-tang-cal/',
			},
		]
	},
	{
		name: 'Class of 2025',
		items: [
			{
				name: 'Levi Kline',
				role: 'Frontend Engineer',
				site: 'https://levibkline.com',
			},
		]
	},
	{
		name: 'Class of 2024',
		items: [
			{
				name: 'Kelly Ma',
				role: 'Design Lead',
				site: 'https://kellymadesign.com'
			},
			{
				name: 'Shuming Xu',
				role: 'Backend Engineer',
				site: 'https://shumingxu.com/'
			},
			{
				name: 'Nikhil Jha',
				role: 'Backend Engineer',
				site: null
			},
			{
				name: 'Nikhil Ograin',
				role: 'Backend Engineer',
				site: null
			},
			{
				name: 'Vihan Bhargava',
				role: 'Frontend Engineer',
				site: 'https://vihan.org/'
			},
			{
				name: 'Gabe Mitnick',
				role: 'Frontend Engineer',
				site: 'https://gabe-mitnick.github.io/'
			},
			{
				name: 'Henric Zhang',
				role: 'Frontend Engineer',
				site: null,
			},
			{
				name: 'Joel Jaison',
				role: 'Frontend Engineer',
				site: null,
			},
			{
				name: 'Ethan Ikegami',
				role: 'Backend Engineer',
				site: 'https://ethanikegami.com/',
			},
		]
	},
	{
		name: 'Class of 2023',
		items: [
			{
				name: 'Annie Pan',
				role: 'Designer',
				site: 'http://anniexpan.com/'
			},
			{
				name: 'Cici Wei',
				role: 'Designer',
				site: null
			},
			{
				name: 'Alex Xi',
				role: 'Backend Lead',
				site: 'https://www.alexhxi.com/'
			},
			{
				name: 'Yueheng Zhang',
				role: 'Backend Engineer',
				site: 'https://www.linkedin.com/in/azicon/'
			},
			{
				name: 'Zachary Zollman',
				role: 'Backend Lead',
				site: 'https://zacharyzollman.com/',
			},
			{
				name: 'Alexander Lew',
				role: 'Frontend Engineer',
				site: 'https://www.qxbytes.com'
			},
			{
				name: 'Michael Khaykin',
				role: 'Backend Engineer',
				site: null,
			},
			{
				name: 'Carissa Cui',
				role: 'Designer',
				site: 'https://www.carissacui.com',
			},
			{
				name: 'Joanne Chuang',
				role: 'Designer',
				site: null,
			},
			{
				name: 'Alex Zhang',
				role: 'Backend Engineer',
				site: 'https://www.nociza.com/me'
			},
		]
	},
	{
		name: 'Class of 2022',
		items: [
			{
				name: 'Hiroshi Usui',
				role: 'Backend Lead',
				site: null
			},
			{
				name: 'Danji Liu',
				role: 'Design Lead',
				site: 'https://www.linkedin.com/in/danji-liu/'
			},
			{
				name: 'Christina Shao',
				role: 'Frontend Lead',
				site: 'https://christinashao.github.io/'
			}
		]
	},
	{
		name: 'Class of 2021',
		items: [
			{
				name: 'Grace Luo',
				role: 'Product Manager',
				site: 'https://www.linkedin.com/in/g-luo/'
			},
			{
				name: 'Christopher Liu',
				role: 'Frontend Lead',
				site: 'https://chrisdliu.github.io'
			},
			{
				name: 'Janet Xu',
				role: 'Design Lead',
				site: 'https://www.linkedin.com/in/janet-xu/'
			},
			{
				name: 'Hannah Yan',
				role: 'Designer',
				site: 'https://www.linkedin.com/in/yanhannah/'
			},
			{
				name: 'Junghyun Choy',
				role: 'Designer',
				site: null
			},
			{
				name: 'Leon Ming',
				role: 'Backend Lead',
				site: 'https://leon-ming.com'
			},
			{
				name: 'Jonathan Pan',
				role: 'Backend Engineer',
				site: 'https://www.linkedin.com/in/jonathan-pan/'
			}
		]
	},
	{
		name: 'Class of 2020',
		items: [
			{
				name: 'Will Wang',
				role: 'Backend Lead / PM',
				site: 'http://www.hantaowang.me'
			},
			{
				name: 'Jemma Kwak',
				role: 'Design Lead',
				site: 'https://jemmakwak.me'
			},
			{
				name: 'Anson Tsai',
				role: 'Backend Engineer',
				site: 'https://www.linkedin.com/in/anson-tsai-83b9a312a/'
			},
			{
				name: 'Eli Wu',
				role: 'Backend Engineer',
				site: 'https://www.linkedin.com/in/eli-w-8b192ba0/'
			},
			{
				name: 'Sean Meng',
				role: 'Backend Engineer',
				site: 'https://www.linkedin.com/in/sean-meng-berkeley'
			},
			{
				name: 'Isabella Lau',
				role: 'Backend Engineer',
				site: 'https://www.linkedin.com/in/xisabellalau/'
			},
			{
				name: 'Chloe Liu',
				role: 'Frontend Engineer',
				site: 'https://www.linkedin.com/in/ruochen99/'
			}
		]
	},
	{
		name: 'Class of 2019',
		items: [
			{
				name: 'Sangbin Cho',
				role: 'Backend Lead',
				site: 'https://www.linkedin.com/in/sang-cho/'
			},
			{
				name: 'Evelyn Li',
				role: 'Backend Engineer',
				site: 'https://www.linkedin.com/in/yunqil'
			},
			{
				name: 'Richard Liu',
				role: 'Backend Engineer',
				site: 'https://www.linkedin.com/in/richard4912'
			},
			{
				name: 'Mary Liu',
				role: 'Backend Engineer',
				site: 'https://www.linkedin.com/in/mary-y-liu'
			},
			{
				name: 'Kate Xu',
				role: 'Frontend Lead',
				site: 'https://www.linkedin.com/in/kate-shijie-xu-666b57110'
			},
			{
				name: 'Scott Lee',
				role: 'Frontend Lead / PM',
				site: 'http://scottjlee.github.io'
			}
		]
	},
	{
		name: 'Class of 2018',
		items: [
			{
				name: 'Tony Situ',
				role: 'Backend Lead',
				site: 'https://www.linkedin.com/in/c2tonyc2'
			},
			{
				name: 'Vaibhav Srikaran',
				role: 'Product Manager',
				site: 'https://www.linkedin.com/in/vsrikaran'
			},
			{
				name: 'Katharine Jiang',
				role: 'Frontend Engineer',
				site: 'http://katharinejiang.com'
			},
			{
				name: 'Flora Xue',
				role: 'Frontend Engineer',
				site: 'https://www.linkedin.com/in/flora-zhenruo-xue'
			},
			{
				name: 'Alan Rosenthal',
				role: 'Backend Engineer',
				site: 'https://www.linkedin.com/in/alan-rosenthal-37767614a'
			}
		]
	},
	{
		name: 'Founding Team',
		items: [
			{
				name: 'Christine Wang',
				role: 'Fullstack Engineer',
				site: 'https://www.linkedin.com/in/cwang395/'
			},
			{
				name: 'Emily Chen',
				role: 'Fullstack Engineer',
				site: null
			},
			{
				name: 'Eric Huynh',
				role: 'Fullstack Engineer',
				site: 'http://erichuynhing.com/'
			},
			{
				name: 'Jennifer Yu',
				role: 'Fullstack Engineer',
				site: null
			},
			{
				name: 'Justin Lu',
				role: 'Fullstack Engineer',
				site: null
			},
			{
				name: 'Kelvin Leong',
				role: 'Fullstack Engineer',
				site: 'https://www.linkedin.com/in/kelvinjleong/'
			},
			{
				name: 'Kevin Jiang',
				role: 'Fullstack Engineer',
				site: 'https://github.com/kevjiangba/'
			},
			{
				name: 'Kimya Khoshnan',
				role: 'Fullstack Engineer',
				site: null
			},
			{
				name: 'Laura Harker',
				role: 'Fullstack Engineer',
				site: null
			},
			{
				name: 'Mihir Patil',
				role: 'Fullstack Engineer',
				site: null
			},
			{
				name: 'Niraj Amalkanti',
				role: 'Fullstack Engineer',
				site: null
			},
			{
				name: 'Parsa Attari',
				role: 'Fullstack Engineer',
				site: null
			},
			{
				name: 'Ronald Lee',
				role: 'Fullstack Engineer',
				site: null
			},
			{
				name: 'Sanchit Bareja',
				role: 'Fullstack Engineer',
				site: null
			},
			{
				name: 'Sandy Zhang',
				role: 'Fullstack Engineer',
				site: null
			}
		]
	},
	{
		name: 'Founders',
		items: [
			{
				name: 'Yuxin Zhu',
				role: 'Co-Founder',
				site: 'http://yuxinzhu.com/#'
			},
			{
				name: 'Noah Gilmore',
				role: 'Co-Founder',
				site: 'https://noahgilmore.com'
			},
			{
				name: 'Ashwin Iyengar',
				role: 'Co-Founder',
				site: 'https://nms.kcl.ac.uk/ashwin.iyengar'
			}
		]
	}
];
