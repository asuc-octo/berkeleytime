interface Subject {
  abbreviations: string[];
  name: string;
}

// TODO: https://guide.berkeley.edu/courses/#C

export const subjects: Record<string, Subject> = {
  astron: {
    abbreviations: ["astro"],
    name: "Astronomy",
  },
  compsci: {
    abbreviations: ["cs", "comp sci", "computer science"],
    name: "Computer Science",
  },
  mcellbi: {
    abbreviations: ["mcb"],
    name: "Molecular and Cell Biology",
  },
  nusctx: {
    abbreviations: ["nutrisci"],
    name: "Nutritional Sciences and Toxicology",
  },
  bioeng: {
    abbreviations: ["bioe", "bio e", "bio p", "bio eng"],
    name: "Bioengineering",
  },
  biology: {
    abbreviations: ["bio"],
    name: "Biology",
  },
  civeng: {
    abbreviations: ["cive", "civ e", "civ eng"],
    name: "Civil and Environmental Engineering",
  },
  chmeng: {
    abbreviations: ["cheme", "chm eng"],
    name: "Chemical Engineering",
  },
  classic: {
    abbreviations: ["classics"],
    name: "Classics",
  },
  cogsci: {
    abbreviations: ["cogsci"],
    name: "Cognitive Science",
  },
  colwrit: {
    abbreviations: ["college writing", "col writ"],
    name: "College Writing",
  },
  comlit: {
    abbreviations: ["complit", "com lit"],
    name: "Comparative Literature",
  },
  cyplan: {
    abbreviations: ["cy plan", "cp"],
    name: "City and Regional Planning",
  },
  desinv: {
    abbreviations: ["des inv", "design"],
    name: "Design Innovation",
  },
  deveng: {
    abbreviations: ["dev eng"],
    name: "Development Engineering",
  },
  devstd: {
    abbreviations: ["dev std"],
    name: "Development Studies",
  },
  datasci: {
    abbreviations: ["ds", "data", "data sci"],
    name: "Data Science",
  },
  data: {
    abbreviations: ["ds", "data", "data sci"],
    name: "Data Science, Undergraduate",
  },
  ealang: {
    abbreviations: ["ea lang"],
    name: "East Asian Languages and Cultures",
  },
  envdes: {
    abbreviations: ["ed", "env des"],
    name: "Environmental Design",
  },
  eleng: {
    abbreviations: ["ee", "electrical engineering", "el eng"],
    name: "Electrical Engineering",
  },
  eecs: {
    abbreviations: ["eecs"],
    name: "Electrical Engineering and Computer Sciences",
  },
  eneres: {
    abbreviations: ["erg", "er", "ene,res"],
    name: "Energy and Resources Group",
  },
  engin: {
    abbreviations: ["e", "engineering"],
    name: "Engineering",
  },
  envsci: {
    abbreviations: ["env sci"],
    name: "Environmental Sciences",
  },
  ethstd: {
    abbreviations: ["eth std"],
    name: "Ethnic Studies",
  },
  geog: {
    abbreviations: ["geology", "geo"],
    name: "Geography",
  },
  hinurd: {
    abbreviations: ["hin urd", "hin-urd"],
    name: "Hindi-Urdu",
  },
  integbi: {
    abbreviations: ["ib"],
    name: "Integrative Biology",
  },
  indeng: {
    abbreviations: ["ie", "ieor", "ind eng"],
    name: "Industrial Engineering and Operations Research",
  },
  linguis: {
    abbreviations: ["ling"],
    name: "Linguistics",
  },
  "l&s": {
    abbreviations: ["l & s", "ls", "lns"],
    name: "Letters and Science",
  },
  indones: {
    abbreviations: ["indonesian"],
    name: "Indonesian",
  },
  matsci: {
    abbreviations: ["mat sci", "ms", "mse"],
    name: "Materials Science and Engineering",
  },
  meceng: {
    abbreviations: ["mec eng", "meche", "mech e", "me"],
    name: "Mechanical Engineering",
  },
  medst: {
    abbreviations: ["med st"],
    name: "Medical Studies",
  },
  mestu: {
    abbreviations: ["me stu", "middle eastern studies"],
    name: "Middle Eastern Studies",
  },
  milaff: {
    abbreviations: ["mil aff"],
    name: "Military Affairs",
  },
  milsci: {
    abbreviations: ["mil sci"],
    name: "Military Science",
  },
  natamst: {
    abbreviations: ["native american studies", "nat am st"],
    name: "Native American Studies",
  },
  neurosc: {
    abbreviations: ["neurosci"],
    name: "Neuroscience",
  },
  nuceng: {
    abbreviations: ["ne", "nuc eng"],
    name: "Nuclear Engineering",
  },
  mediast: {
    abbreviations: ["media", "media st"],
    name: "Media Studies",
  },
  music: {
    abbreviations: ["mus"],
    name: "Music",
  },
  pbhlth: {
    abbreviations: ["pb hlth", "ph", "pub hlth", "public health"],
    name: "Public Health",
  },
  physed: {
    abbreviations: ["pe", "phys ed"],
    name: "Physical Education",
  },
  polecon: {
    abbreviations: ["poliecon"],
    name: "Political Economy",
  },
  philo: {
    abbreviations: ["philosophy", "philos", "phil"],
    name: "Philosophy",
  },
  plantbi: {
    abbreviations: ["pmb"],
    name: "Plant and Microbial Biology",
  },
  polsci: {
    abbreviations: ["poli", "pol sci", "polisci", "poli sci", "ps"],
    name: "Political Science",
  },
  pubpol: {
    abbreviations: ["pub pol", "pp", "public policy"],
    name: "Public Policy",
  },
  pubaff: {
    abbreviations: ["pubaff", "public affaris"],
    name: "Public Affairs",
  },
  psych: {
    abbreviations: ["psychology"],
    name: "Psychology",
  },
  rhetor: {
    abbreviations: ["rhetoric"],
    name: "Rhetoric",
  },
  sasian: {
    abbreviations: ["s asian"],
    name: "South Asian Studies",
  },
  seasian: {
    abbreviations: ["se asian"],
    name: "Southeast Asian Studies",
  },
  stat: {
    abbreviations: ["stats"],
    name: "Statistics",
  },
  theater: {
    abbreviations: ["tdps"],
    name: "Theater, Dance, and Performance Studies",
  },
  ugba: {
    abbreviations: ["haas"],
    name: "Undergraduate Business Administration",
  },
  vietnms: {
    abbreviations: ["vietnamese"],
    name: "Vietnamese",
  },
  vissci: {
    abbreviations: ["vis sci"],
    name: "Vision Science",
  },
  visstd: {
    abbreviations: ["vis std"],
    name: "Visual Studies",
  },
};
