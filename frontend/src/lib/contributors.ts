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

const path = (path: string) => new URL(`../assets/img/about/sp2024/${path}`, import.meta.url).href;

export const current: Contributors = {
	name: 'Current Team',
	items: [
		{
			name: 'Michelle Tran',
			role: 'Product Manager & Design Lead',
			site: 'https://www.linkedin.com/in/tranmichelletm/',
			img: {
				base: path('michelle_tran.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Matthew Rowland',
			role: 'Frontend Lead',
			site: 'https://www.linkedin.com/in/matthew-rowland-dev/',
			img: {
				base: path('matthew_1.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Max Wang',
			role: 'Backend Lead',
			img: {
				base: path('max_wang.jpg'),
				silly: undefined
			},
			site: null
		},

		{
			name: 'Jaden Moore',
			role: 'Frontend Engineer',
			site: 'https://github.com/Jdyn',
			img: {
				base: path('jaden_moore.jpg'),
				silly: undefined
			}
		},
		{
			name: 'AZ Zhang',
			role: 'Frontend Engineer',
			site: 'https://www.linkedin.com/in/az-zhang/',
			img: {
				base: path('az_zhang.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Kara Rizzardi',
			role: 'Frontend Engineer',
			site: 'https://www.linkedin.com/in/kararizzardi/',
			img: {
				base: path('kara_rizzardi.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Leo Huang',
			role: 'Frontend Engineer',
			site: 'https://www.linkedin.com/in/huangleo00/',
			img: {
				base: path('leo_huang.jpeg'),
				silly: undefined
			}
		},
		{
			name: 'Arhum Khan',
			role: 'Frontend Engineer',
			site: 'https://www.linkedin.com/in/arhum--khan/',
			img: {
				base: path('arhum_khan.jpeg'),
				silly: undefined
			}
		},
		{
			name: 'Clara Tu',
			role: 'Frontend Engineer',
			site: 'https://www.linkedin.com/in/claratu/',
			img: {
				base: path('clara_tu.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Gobind Singh',
			role: 'Frontend Engineer',
			site: null,
			img: {
				base: path('gobind_singh.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Kevin Wang',
			role: 'Backend Engineer',
			site: 'https://kevwang.dev/',
			img: {
				base: path('kevin_wang.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Eric Xu',
			role: 'Backend Engineer',
			site: 'https://www.linkedin.com/in/e-xu-at-berkeley',
			img: {
				base: path('eric_xu.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Advay Ratan',
			role: 'Backend Engineer',
			site: 'https://advayratan.com',
			img: {
				base: path('advay_ratan.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Chengming (Daniel) Li',
			role: 'Backend Engineer',
			site: 'https://www.linkedin.com/in/chengming-li-7b284a251/',
			img: {
				base: path('daniel_li.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Kartavya (Kurt) Sharma',
			role: 'Backend Engineer',
			site: 'https://www.kartavyas.com',
			img: {
				base: path('kartavya_sharma.jpeg'),
				silly: undefined
			}
		},
		{
			name: 'Cheuk Ki (Jacky) Wong',
			role: 'Backend Engineer',
			site: null,
			img: {
				base: path('jacky_wong.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Subhash Prasad',
			role: 'Backend Engineer',
			site: 'https://www.linkedin.com/in/subhash-j-prasad',
			img: {
				base: path('subhash_prasad.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Rachel Hua',
			role: 'Designer',
			site: 'https://www.linkedin.com/in/byrachelhua/',
			img: {
				base: path('rachel_hua.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Sarah Suen',
			role: 'Designer',
			site: 'https://www.linkedin.com/in/sarahsuen/',
			img: {
				base: path('sarah_suen.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Xue Han',
			role: 'Designer',
			site: 'https://www.linkedin.com/in/xue-yuki-han-944478285/',
			img: {
				base: path('xue_han.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Mary Tran',
			role: 'Designer',
			site: 'https://www.linkedin.com/in/mary-tran-b19246260/',
			img: {
				base: path('mary_tran.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Ethan Chng',
			role: 'Designer',
			site: null,
			img: {
				base: path('ethan_chng.jpg'),
				silly: undefined
			}
		},
		{
			name: 'Khankamol Chor (Jan) Kongrukgreatiyos',
			role: 'Designer',
			site: null,
			img: {
				base: path('missing.jpg'),
				silly: undefined
			}
		}
	]
};

export const past: Contributors[] = [
	{
		name: 'Class of 2026',
		items: [
			{
				name: 'William Tang',
				role: 'Backend Engineer',
				site: 'https://www.linkedin.com/in/william-tang-cal/'
			}
		]
	},
	{
		name: 'Class of 2025',
		items: [
			{
				name: 'Levi Kline',
				role: 'Frontend Engineer',
				site: 'https://levibkline.com'
			}
		]
	},
	{
		name: 'Class of 2024',
		items: [
			{
				name: 'Ethan Ikegami',
				role: 'Backend Engineer',
				site: 'https://ethanikegami.com/'
			},
			{
				name: 'Joel Jaison',
				role: 'Frontend Engineer',
				site: null
			},
			{
				name: 'Henric Zhang',
				role: 'Frontend Engineer',
				site: null
			},
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
				name: 'Alex Zhang',
				role: 'Backend Engineer',
				site: null
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
			}
		]
	},
	{
		name: 'Class of 2023',
		items: [
			{
				name: 'Carissa Cui',
				role: 'Designer',
				site: 'https://www.carissacui.com'
			},
			{
				name: 'Joanne Chuang',
				role: 'Designer',
				site: null
			},
			{
				name: 'Michael Khaykin',
				role: 'Backend Engineer',
				site: null
			},
			{
				name: 'Alexander Lew',
				role: 'Frontend Engineer',
				site: 'https://www.qxbytes.com'
			},
			{
				name: 'Zachary Zollman',
				role: 'Backend Lead',
				site: 'https://zacharyzollman.com/'
			},
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
			}
		]
	},
	{
		name: 'Class of 2022',
		items: [
			{
				name: 'Hiroshi Usui',
				role: 'Backend Lead',
				site: 'https://i-am.2se.xyz/'
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
