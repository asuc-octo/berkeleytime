export type Contributors = {
	name: string;
	items: {
		name: string;
		role: string;
		img?: {
			base: string;
			silly?: string;
		};
		site?: string;
		podCupWins?: [{
			pod: string;
			semester: string;
		}]
	}[];
};

const path = (path: string) => new URL(`../assets/img/about/fa-2024/${path}`, import.meta.url).href;

export const current: Contributors = {
	name: 'Current Team',
	items: [
		{
			name: 'Michelle Tran',
			role: 'Product Manager',
			site: 'https://www.linkedin.com/in/tranmichelletm/',
			img: {
				base: path('michelle1.jpg'),
				silly: path('michelle2.jpeg')
			}
		},
		{
			name: 'Matthew Rowland',
			role: 'Technical Product Manager',
			site: 'https://www.linkedin.com/in/matthew-rowland-dev/',
			img: {
				base: path('matthew1.jpg')
			}
		},
		{
			name: 'Advay Ratan',
			role: 'Lead',
			site: 'https://www.linkedin.com/in/advay-ratan/',
			img: {
				base: path('advay1.jpg')
			}
		},
		{
			name: 'Max Wang',
			role: 'Lead',
			site: 'https://www.linkedin.com/in/maxmwang/',
			img: {
				base: path('max1.jpg')
			},
			podCupWins: [
				{ pod: "Core Engineering", semester: "Fall 2024" }
			]
		},
		{
			name: 'Mary Tran',
			role: 'Lead',
			site: 'https://www.linkedin.com/in/mary-tran-b19246260/',
			img: {
				base: path('mary1.jpg'),
				silly: path('mary2.jpg')
			}
		},
		{
			name: 'Aditya Balasubramanian',
			role: 'Member',
			site: 'https://aditbala.com/',
			img: {
				base: path('aditya1.jpg')
			},
			podCupWins: [
				{ pod: "Core Engineering", semester: "Fall 2024" }
			]
		},
		{
			name: 'Hwanhee Kim',
			role: 'Member',
			site: 'https://www.linkedin.com/in/hwanhee-kim-0193051a8/',
			img: {
				base: path('hwanhee1.jpg'),
				silly: path('hwanhee2.jpg')
			},
			podCupWins: [
				{ pod: "Core Engineering", semester: "Fall 2024" }
			]
		},
		{
			name: 'Iyu Lin',
			role: 'Member',
			site: 'https://www.linkedin.com/in/iyu-lin',
			img: {
				base: path('iyu1.jpg'),
				silly: path('iyu2.jpg')
			}
		},
		{
			name: 'Abhishek Suresh',
			role: 'Member',
			site: 'https://www.linkedin.com/in/abhishek-suresh-eecs/',
			img: {
				base: path('abhishek1.jpg')
			}
		},
		{
			name: 'Amber Le',
			role: 'Member',
			site: 'https://www.linkedin.com/in/amberle0814/',
			img: {
				base: path('amber1.jpg'),
				silly: path('amber2.png')
			}
		},
		{
			name: 'Leo Huang',
			role: 'Member',
			site: 'https://linkedin.com/in/huangleo00',
			img: {
				base: path('leo1.jpg'),
				silly: path('leo2.jpg')
			},
			podCupWins: [
				{ pod: "Core Engineering", semester: "Fall 2024" }
			]
		},
		{
			name: 'Atharv Naidu',
			role: 'Member',
			site: 'https://www.linkedin.com/in/atharvn/'
			// img: {
			// 	silly: path('atharv2.jpg')
			// }
		},
		{
			name: 'Pine Nguyen',
			role: 'Member',
			site: 'https://www.linkedin.com/in/pine-ng/',
			img: {
				base: path('pine1.jpg'),
				silly: path('pine2.png')
			}
		},
		{
			name: 'Lily Yang',
			role: 'Member',
			site: 'https://www.linkedin.com/in/lily-yang-40b2861a5/',
			img: {
				base: path('lily1.jpg'),
				silly: path('lily2.png')
			}
		},
		{
			name: 'Aurelia Wang',
			role: 'Member',
			site: 'https://www.linkedin.com/in/wangaurelia/',
			img: {
				base: path('aurelia1.jpg'),
				silly: path('aurelia2.png')
			}
		},
		{
			name: 'Nicole Lee',
			role: 'Member',
			site: 'https://www.linkedin.com/in/nicolelee7887/',
			img: {
				base: path('nicole1.jpg'),
				silly: path('nicole2.jpeg')
			}
		},
		{
			name: 'Chengming Li',
			role: 'Member',
			site: 'https://www.linkedin.com/in/chengming-li-7b284a251',
			img: {
				base: path('chengming1.jpg'),
				silly: path('chengming2.jpg'),
			}
		},
		{
			name: 'Garima Upadhyay',
			role: 'Member',
			site: 'https://www.linkedin.com/in/garimaupadhyay35/',
			img: {
				base: path('garima1.jpg'),
				silly: path('garima2.jpg')
			}
		},
		{
			name: 'Mahathi Ryali',
			role: 'Member',
			site: 'https://www.linkedin.com/in/mahathi-ryali-a1415b21b',
			img: {
				base: path('mahathi1.jpg'),
				silly: path('mahathi2.jpg')
			}
		},
		{
			name: 'Khankamol Chor Kongrukgreatiyos',
			role: 'Member',
			site: 'https://www.linkedin.com/in/khankamolk/',
			img: {
				base: path('khankamol1.jpg'),
				silly: path('khankamol2.jpeg')
			}
		},
		{
			name: 'Nathan Dai',
			role: 'Member',
			site: 'https://www.linkedin.com/in/nathandai5287',
			img: {
				base: path('nathan1.jpg'),
				silly: path('nathan2.jpg')
			}
		},
		{
			name: 'Lope Akinnitire',
			role: 'Member',
			site: 'https://www.linkedin.com/in/titilope-ak23/',
			img: {
				base: path('lope1.jpg')
			}
		},
		{
			name: 'Eric Xu',
			role: 'Member',
			site: 'https://www.linkedin.com/in/e-xu-at-berkeley',
			img: {
				base: path('eric1.jpg'),
				silly: path('eric2.jpeg')
			}
		},
		{
			name: 'Subhash Prasad',
			role: 'Member',
			site: 'https://www.linkedin.com/in/subhash-j-prasad',
			img: {
				base: path('subhash1.jpg')
			}
		},
		{
			name: 'Arvind Ganesh',
			role: 'Member',
			site: 'https://www.linkedin.com/in/arvindg1/',
			img: {
				base: path('arvind1.jpg')
			}
		},
		{
			name: 'Cheuk Ki Wong',
			role: 'Member',
			site: 'https://www.linkedin.com/in/cheuk-ki-wong-90b65522a/',
			img: {
				base: path('cheuk1.jpg'),
			}
		},
		{
			name: 'Sean Lim',
			role: 'Member',
			site: 'https://www.linkedin.com/in/sean-sj-lim/'
		},
		{
			name: 'Clara Tu',
			role: 'Member',
			site: 'https://www.linkedin.com/in/claratu/',
			img: {
				base: path('clara1.jpg')
			}
		},
		{
			name: 'Jessica Le',
			role: 'Member',
			site: 'https://www.linkedin.com/in/jessica-le-a72a5b2a9/',
			img: {
				base: path('jessica1.jpg')
			}
		},
		{
			name: 'Raymond Tsao',
			role: 'Member',
			img: {
				base: path('raymond1.jpg')
			}
		},
		{
			name: 'Xue HAN',
			role: 'Member',
			site: 'https://www.linkedin.com/in/xue-yuki-han-944478285/',
			img: {
				base: path('xue1.jpg')
			}
		},
		{
			name: 'Kyle Chu',
			role: 'Member',
			site: 'https://www.kyle65463.com/',
			img: {
				base: path('kyle1.jpg')
			}
		}

		// },
		// {
		// 	name: 'Matthew Rowland',
		// 	role: 'Frontend Lead',
		// 	site: 'https://www.linkedin.com/in/matthew-rowland-dev/',
		// 	img: {
		// 		base: path('matthew_1.jpg'),
		// 		silly: path('matthew_2.jpg')
		// 	}
		// },
		// {
		// 	name: 'Michelle Tran',
		// 	role: 'Design Lead',
		// 	site: 'https://michelletran.design',
		// 	img: {
		// 		base: path('michelle_1.jpg'),
		// 		silly: path('michelle_2.jpg')
		// 	}
		// },
		// {
		// 	name: 'Henric Zhang',
		// 	role: 'Frontend Engineer',
		// 	site: null,
		// 	img: {
		// 		base: path('henric_1.jpg'),
		// 		silly: path('henric_2.jpg')
		// 	}
		// },
		// {
		// 	name: 'Jaden Moore',
		// 	role: 'Frontend Engineer',
		// 	site: null,
		// 	img: {
		// 		base: path('jaden_1.jpg'),
		// 		silly: undefined
		// 	}
		// },
		// {
		// 	name: 'Alexander Lew',
		// 	role: 'Frontend Engineer',
		// 	site: 'https://www.qxbytes.com',
		// 	img: {
		// 		base: path('alexander_1.jpg'),
		// 		silly: undefined
		// 	}
		// },
		// {
		// 	name: 'Levi Kline',
		// 	role: 'Frontend Engineer',
		// 	site: 'https://levibkline.com',
		// 	img: {
		// 		base: path('levi_1.jpg'),
		// 		silly: undefined
		// 	}
		// },
		// {
		// 	name: 'Joel Jaison',
		// 	role: 'Frontend Engineer',
		// 	site: null,
		// 	img: {
		// 		base: path('joel_1.jpg'),
		// 		silly: path('joel_1.jpg')
		// 	}
		// },
		// {
		// 	name: 'Michael Khaykin',
		// 	role: 'Backend Engineer',
		// 	site: null,
		// 	img: {
		// 		base: path('michael_1.jpg'),
		// 		silly: undefined
		// 	}
		// },
		// {
		// 	name: 'William Tang',
		// 	role: 'Backend Engineer',
		// 	site: 'https://www.linkedin.com/in/william-tang-cal/',
		// 	img: {
		// 		base: path('william_1.jpg'),
		// 		silly: path('william_2.jpg')
		// 	}
		// },
		// {
		// 	name: 'Ethan Ikegami',
		// 	role: 'Backend Engineer',
		// 	site: 'https://ethanikegami.com/',
		// 	img: {
		// 		base: path('ethan_1.jpg'),
		// 		silly: path('ethan_2.jpg')
		// 	}
		// },



	]
};

export const past: Contributors[] = [
	{
		name: 'Class of 2024',
		items: [
			{
				name: 'Kevin Wang',
				role: 'Product Manager',
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
				role: 'Backend Engineer'
			},
			{
				name: 'Nikhil Jha',
				role: 'Backend Engineer'
			},
			{
				name: 'Nikhil Ograin',
				role: 'Backend Engineer'
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
				name: 'Rachel Hua',
				role: 'Designer',
				site: 'https://www.linkedin.com/in/byrachelhua/',
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
				name: 'Alex Xi',
				role: 'Backend Lead',
				site: 'https://www.alexhxi.com/'
			},
			{
				name: 'Cici Wei',
				role: 'Designer'
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
				name: 'Joanne Chuang',
				role: 'Designer',
			},
			{
				name: 'Carissa Cui',
				role: 'Designer',
				site: 'https://www.carissacui.com',
			},
		]
	},
	{
		name: 'Class of 2022',
		items: [
			{
				name: 'Hiroshi Usui',
				role: 'Backend Lead'
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
				role: 'Designer'
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
				role: 'Fullstack Engineer'
			},
			{
				name: 'Eric Huynh',
				role: 'Fullstack Engineer',
				site: 'http://erichuynhing.com/'
			},
			{
				name: 'Jennifer Yu',
				role: 'Fullstack Engineer'
			},
			{
				name: 'Justin Lu',
				role: 'Fullstack Engineer'
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
				role: 'Fullstack Engineer'
			},
			{
				name: 'Laura Harker',
				role: 'Fullstack Engineer'
			},
			{
				name: 'Mihir Patil',
				role: 'Fullstack Engineer'
			},
			{
				name: 'Niraj Amalkanti',
				role: 'Fullstack Engineer'
			},
			{
				name: 'Parsa Attari',
				role: 'Fullstack Engineer'
			},
			{
				name: 'Ronald Lee',
				role: 'Fullstack Engineer'
			},
			{
				name: 'Sanchit Bareja',
				role: 'Fullstack Engineer'
			},
			{
				name: 'Sandy Zhang',
				role: 'Fullstack Engineer'
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
				site: 'http://ashwiniyengar.github.io/'
			}
		]
	}
];