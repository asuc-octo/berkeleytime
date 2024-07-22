/*
Berkeley Way West
Latimer
Dwinelle
Giannini
Moffitt Library
Evans
Genetics & Plant Bio
Hearst Mining
Valley Life Sciences
Off
Hildebrand
Morgan
Hearst Field Annex
Sproul Hall

Social Sciences Building
Barker
Wheeler
Etcheverry
Anthro/Art Practice Bldg
Wurster
Physics Building
Hesse
Mulford
Li Ka Shing
Cheit
Cory
Campbell Hall
Hilgard
Haviland
Doe Library
Pimentel
GSPP
Stephens
Davis
Woo Han Fai Hall
Birge
Stanley
Tan
McEnerney
Lewis
Wellman
McCone
Jacobs Hall
North Gate
Hertz
Hargrove
Morrison
Chou Hall
South Hall
Soda
Hearst Gym
Haas Faculty Wing
Chou Hall N540 and
Berkeley Art Museum
Requested General
Chavez
Graduate Theological Union
GTU Student Services
Starr Library
Sutardja Dai
Joan and Sanford I. Weill 
2251 College
2401 Bancroft
Wheeler 
O'Brien
Chou Hall N440 and
Zellerbach
UC LAW
Bancroft Library
Philosophy Hall
Rec Sports Facility
Hearst Gym North Field
Hearst Pool
RSF Fieldhouse
Hearst Gym Tennis Cts
Chou Hall N340 and
Donner Lab
Blum
HAAS Faculty Wing
Gilman
2521 Channing
2240 Piedmont
*/

interface Building {
  location?: [number, number];
  name: string;
  link?: string;
}

export const buildings: Record<string, Building> = {
  "Berkeley Way West": {
    location: [-122.26840181226721, 37.87341082732256],
    name: "Berkeley Way West",
    link: "https://maps.app.goo.gl/zNbknDXSgV5471ZWA",
  },
  Latimer: {
    location: [-122.25599531409944, 37.87312578450188],
    name: "Latimer Hall",
    link: "https://maps.app.goo.gl/4GuSAkkBckU87vTV8",
  },
  Dwinelle: {
    location: [-122.26060684824738, 37.87056638999202],
    name: "Dwinelle Hall",
    link: "https://maps.app.goo.gl/f42kYmyfuqUQ4Urv7",
  },
  Giannini: {
    location: [-122.26229667155725, 37.87354568917771],
    name: "Giannini Hall",
    link: "https://maps.app.goo.gl/XFQpN8hsnr8XzvYz7",
  },
  "Moffitt Library": {
    location: [-122.26083662991704, 37.872543936658765],
    name: "Moffitt Library",
    link: "https://maps.app.goo.gl/NGAetKPTgYRrwJecA",
  },
  Evans: {
    location: [-122.25759413529791, 37.873621559931614],
    name: "Evans Hall",
    link: "https://maps.app.goo.gl/XdwKVCKwo5eV7qsu6",
  },
  "Genetics & Plant Bio": {
    location: [-122.26474920629475, 37.873442572098185],
    name: "Genetics and Plant Biology Building",
    link: "https://maps.app.goo.gl/MJEptPwUVCpQr2rk7",
  },
  "Hearst Mining": {
    location: [-122.2571920861028, 37.87416437917678],
    name: "Hearst Memorial Mining Building",
    link: "https://maps.app.goo.gl/265AgZFbA1KEZL7i8",
  },
  "Valley Life Sciences": {
    location: [-122.26220645353504, 37.87142462552724],
    name: "Valley Life Sciences Building",
    link: "https://maps.app.goo.gl/gAUL3doGGsB2fqxA7",
  },
  "Off Campus": {
    name: "Off campus",
  },
  Hildebrand: {
    location: [-122.25534011894594, 37.872593339541446],
    name: "Hildebrand Hall",
    link: "https://maps.app.goo.gl/ErfgqYTvYuD8iF3E9",
  },
  Morgan: {
    location: [-122.2642069563565, 37.87332050803642],
    name: "Morgan Hall",
    link: "https://maps.app.goo.gl/pa6x67fXANhfqEXw6",
  },
  "Hearst Field Annex": {
    location: [-122.25755748098894, 37.869243966493414],
    name: "Hearst Field Annex",
    link: "https://maps.app.goo.gl/aj69ELTGUn6SfBoXA",
  },
  "Sproul Hall": {
    location: [-122.25874696852213, 37.86924395748092],
    name: "Sproul Hall",
    link: "https://maps.app.goo.gl/GD7E8czb7xGVyzK39",
  },
  "Social Sciences Building": {
    location: [-122.25798819237231, 37.870063802351076],
    name: "Social Sciences Building",
    link: "https://maps.app.goo.gl/181jSwt8zAK6qVcAA",
  },
  Barker: {
    location: [-122.2654706550479, 37.873949032493385],
    name: "Barker Hall",
    link: "https://maps.app.goo.gl/Z7Z5ts18ZQtQcFaj8",
  },
  Wheeler: {
    location: [-122.25915062833967, 37.87130919316681],
    name: "Wheeler Hall",
    link: "https://maps.app.goo.gl/yBmC2Do44oTxqMbT6",
  },
  Etcheverry: {
    location: [-122.25928093175008, 37.875681116395],
    name: "Etcheverry Hall",
    link: "https://maps.app.goo.gl/6TRaiEmGTko1PNZx5",
  },
  "Anthro/Art Practice Bldg": {
    location: [-122.25534492286732, 37.86986991079993],
    name: "Anthropology and Art Practice Building",
    link: "https://maps.app.goo.gl/kA5LcjADWEsLMbog9",
  },
  Wurster: {
    location: [-122.25489197607627, 37.87074044380782],
    name: "Wurster Hall",
    link: "https://maps.app.goo.gl/iVJxYu7GoCMtZsoZ9",
  },
  "Physics Building": {
    location: [-122.25682010086159, 37.872480670347336],
    name: "Physics Building",
    link: "https://maps.app.goo.gl/tVLb7dBb538MjNqRA",
  },
  Hesse: {
    location: [-122.25935446250307, 37.874322866992514],
    name: "Hesse Hall",
    link: "https://maps.app.goo.gl/f3Cv1Hd5F5rNuha19",
  },
  Mulford: {
    location: [-122.26447768214827, 37.87261701869861],
    name: "Mulford Hall",
    link: "https://maps.app.goo.gl/Yh3aAhHTCgMAeNyQ6",
  },
  "Li Ka Shing": {
    location: [-122.26528001690815, 37.87262266777717],
    name: "Li Ka Shing Center",
    link: "https://maps.app.goo.gl/8FpVG3RXy8DPVc7J9",
  },
  Cheit: {
    location: [-122.2543379032442, 37.87168904984896],
    name: "Cheit Hall",
    link: "https://maps.app.goo.gl/keLxkYXFnPcKgGrL8",
  },
  Cory: {
    location: [-122.25780468934755, 37.87509213485355],
    name: "Cory Hall",
    link: "https://maps.app.goo.gl/jLZYsoST8TtE9y1G7",
  },
  "Campbell Hall": {
    location: [-122.25709767500017, 37.87312763387514],
    name: "Campbell Hall",
    link: "https://maps.app.goo.gl/Ea3AntkJVr1UXF2u9",
  },
  Hilgard: {
    location: [-122.26340306795208, 37.87331983963479],
    name: "Hilgard Hall",
    link: "https://maps.app.goo.gl/LijbW6fezg358m7U8",
  },
  Haviland: {
    location: [-122.26100851764237, 37.87371692436061],
    name: "Haviland Hall",
    link: "https://maps.app.goo.gl/FKqPcqZQaTE6iyhX7",
  },
  "Doe Library": {
    location: [-122.2592358273592, 37.8722145126222],
    name: "Doe Library",
    link: "https://maps.app.goo.gl/GudMeULid1ocEbaw7",
  },
  Pimentel: {
    location: [-122.25602833267033, 37.87342920998079],
    name: "Pimentel Hall",
    link: "https://maps.app.goo.gl/wjmaQrXvN693bBxV7",
  },
  GSPP: {
    location: [-122.25790926224941, 37.87572256387491],
    name: "Richard & Rhoda Goldman School",
    link: "https://maps.app.goo.gl/8tHo874r1SmPjWbX7",
  },
  Stephens: {
    location: [-122.25750797500021, 37.87147064119593],
    name: "Stephens Hall",
    link: "https://maps.app.goo.gl/wGgMqX36qYzKR3CX7",
  },
  Davis: {
    location: [-122.25801209495167, 37.8745786463717],
    name: "Davis Hall",
    link: "https://maps.app.goo.gl/ZrgWVDVvBJYDxnLEA",
  },
  "Woo Han Fai Hall": {
    location: [-122.25586439151184, 37.86874548208747],
    name: "Woo Han Fai Hall",
    link: "https://maps.app.goo.gl/DrimtkfkXTWjBfnb9",
  },
  Birge: {
    location: [-122.25716535675937, 37.872172511655855],
    name: "Birge Hall",
    link: "https://maps.app.goo.gl/tuXqvxSmuPTgFsTp8",
  },
  Stanley: {
    location: [-122.25640023093717, 37.873858606089705],
    name: "Stanley Hall",
    link: "https://maps.app.goo.gl/PMijJrCeTFP9NPn8A",
  },
  Tan: {
    location: [-122.25651115723869, 37.873281595855836],
    name: "Tan Kee Kee Hall",
    link: "https://maps.app.goo.gl/w45simSmLwXzh3q58",
  },
  McEnerney: {
    location: [-122.2644821947179, 37.87666241423979],
    name: "CNMAT",
    link: "https://maps.app.goo.gl/4naDUT6Mp3C3kLh88",
  },
  Lewis: {
    location: [-122.25488562927272, 37.872756450742145],
    name: "Lewis Hall",
    link: "https://maps.app.goo.gl/y2TeJdNji1CkYjM3A",
  },
  Wellman: {
    location: [-122.2627907229642, 37.87317782345241],
    name: "Wellman Hall",
    link: "https://maps.app.goo.gl/Aue7cgmmXsv5u8Fd7",
  },
  McCone: {
    location: [-122.25967790769536, 37.87409189531322],
    name: "McCone Hall",
    link: "https://maps.app.goo.gl/rpxt4kbxrrTRhnNb7",
  },
  "Jacobs Hall": {
    location: [-122.25882193535269, 37.87602971606913],
    name: "Jacobs Hall",
    link: "https://maps.app.goo.gl/xZ9AxhnG5saW1Epf7",
  },
  "North Gate": {
    location: [-122.25990173190104, 37.87497525022868],
    name: "North Gate Hall",
    link: "https://maps.app.goo.gl/MPGKJJMv6TMrdQRw8",
  },
  Hertz: {
    location: [-122.25569849398121, 37.87108130391847],
    name: "Hertz Hall",
    link: "https://maps.app.goo.gl/p9gLFh1JR31jSgNF8",
  },
  Hargrove: {
    location: [-122.25618934462244, 37.87045013995676],
    name: "Jean Gray Hargrove Music Library",
    link: "https://maps.app.goo.gl/z2CtVqLqRSF73dvy8",
  },
  Morrison: {
    location: [-122.25649720028268, 37.87085305022676],
    name: "Morrison Hall",
    link: "https://maps.app.goo.gl/mkcYcrrb3evvNGjq8",
  },
  "Chou Hall": {
    location: [-122.25454360383524, 37.8723166102369],
    name: "Chou Hall",
    link: "https://maps.app.goo.gl/xyS4LwD9m8nsBmRM7",
  },
  "South Hall": {
    location: [-122.25850563373693, 37.87129997946342],
    name: "South Hall",
    link: "https://maps.app.goo.gl/qnT9xCkWiS2vs1cSA",
  },
  Soda: {
    location: [-122.25879005808657, 37.87558462382853],
    name: "Soda Hall",
    link: "https://maps.app.goo.gl/fxcPJG7eJs7Yznr28",
  },
  "Hearst Gym": {
    location: [-122.25639058707237, 37.869926045495006],
    name: "Hearst Gymnasium",
    link: "https://maps.app.goo.gl/KhHLrcdosZSCjVwUA",
  },
  "Haas Faculty Wing": {
    location: [-122.25334752655445, 37.871632438551494],
    name: "Haas School of Business",
    link: "https://maps.app.goo.gl/MUdpvxs5Yg8AsQC36",
  },
  "Berkeley Art Museum": {
    location: [-122.26647977944991, 37.87073521843178],
    name: "Berkeley Art Museum and Pacific Film Archive",
    link: "https://maps.app.goo.gl/sgG289Qa36AXSB4B6",
  },
  "Requested General Assignment": {
    name: "Requested general assignment",
  },
  Chavez: {
    location: [-122.26033260383534, 37.86955061087345],
    name: "César Chávez Student Center",
    link: "https://maps.app.goo.gl/rBzJmqoHz13cxKef9",
  },
  "Graduate Theological Union": {
    location: [-122.26186544616492, 37.87569417196013],
    name: "Graduate Theological Union",
    link: "https://maps.app.goo.gl/WXYqfaqup1bJNFRP8",
  },
  "GTU Student Services Center": {
    location: [-122.26144510383497, 37.87707940337083],
    name: "GTU Student Services Center",
    link: "https://maps.app.goo.gl/WqPaiQqrA5dKjQLa8",
  },
  "Starr Library": {
    location: [-122.25998112731321, 37.87359100039992],
    name: "East Asian Library",
    link: "https://maps.app.goo.gl/pLTHbyKNre5cMKmv9",
  },
  "Sutardja Dai": {
    location: [-122.25831352863513, 37.87503515928838],
    name: "Sutardja Dai Hall",
    link: "https://maps.app.goo.gl/su2AuVn4g2uMfWBp8",
  },
  "Joan and Sanford I. Weill": {
    name: "UCSF Joan and Sanford I. Weill Neurosciences Building",
  },
  "2251 College": {
    location: [-122.25391110710783, 37.870166332980034],
    name: "Archaeological Research Facility",
    link: "https://maps.app.goo.gl/31dzRoRnPyT189Py5",
  },
  "2401 Bancroft": {
    location: [-122.26116005869203, 37.86869499663926],
    name: "Bancroft Dance Studio",
    link: "https://maps.app.goo.gl/m6jzQ5xh9d3yCfsp9",
  },
  "Wheeler Hall": {
    location: [-122.25914745072348, 37.87130186176894],
    name: "Wheeler Hall",
    link: "https://maps.app.goo.gl/HikpBF5dGi3Ku8cT9",
  },
  "O'Brien": {
    location: [-122.2590577968863, 37.87428341581882],
    name: "O'Brien Hall",
    link: "https://maps.app.goo.gl/ZrgWVDVvBJYDxnLEA",
  },
  Zellerbach: {
    location: [-122.26133456732288, 37.86927674211004],
    name: "Zellerbach Playhouse",
    link: "https://maps.app.goo.gl/3Jxn1wkwEeo2hcmN8",
  },
  "UC LAW": {
    location: [-122.25401475499672, 37.86950825416665],
    name: "UC Berkeley School of Law",
    link: "https://maps.app.goo.gl/dfWiaU9b6usgQzx27",
  },
  "Bancroft Library": {
    location: [-122.25866103267037, 37.87231304109882],
    name: "The Bancroft Library",
    link: "https://maps.app.goo.gl/crRxb7m3C56ZkbP67",
  },
  "Philosophy Hall": {
    location: [-122.25810876150558, 37.871015571961365],
    name: "Philosophy Hall",
    link: "https://maps.app.goo.gl/5spQqggAbSp3Lqcx5",
  },
  "Rec Sports Facility": {
    location: [-122.2627939038355, 37.86859167196196],
    name: "Recreational Sports Facility",
    link: "https://maps.app.goo.gl/NKHX1M3wvLdKcy9eA",
  },
  "Hearst Gym North Field": {
    location: [-122.2569165044859, 37.870280891945036],
    name: "Hearst North Field",
    link: "https://maps.app.goo.gl/XuRh7APFD256fJ5L7",
  },
  "Hearst Pool": {
    location: [-122.25694684709053, 37.86969165728141],
    name: "Hearst Gym Pool",
    link: "https://maps.app.goo.gl/wXoxqAmjcLaUhT1j7",
  },
  "RSF Fieldhouse": {
    name: "Recreational Sports Facility Fieldhouse",
  },
  "Hearst Gym Tennis Cts": {
    location: [-122.25580180383541, 37.869568533057866],
    name: "Hearst Tennis Courts",
    link: "https://maps.app.goo.gl/vJJuUph72exgrSvQ9",
  },
  "Donner Lab": {
    location: [-122.25630500383518, 37.87446848531557],
    name: "Donner Lab",
    link: "https://maps.app.goo.gl/gWLtENgxK8yWN4hW8",
  },
  Blum: {
    location: [-122.25879005335187, 37.87504783275099],
    name: "Blum Hall",
    link: "https://maps.app.goo.gl/PfueMBhoB7mkeyURA",
  },
  "HAAS Faculty Wing": {
    name: "Haas School of Business",
  },
  Gilman: {
    location: [-122.25622839210698, 37.87261381887259],
    name: "Gilman Hall",
    link: "https://maps.app.goo.gl/ZPZYam2tjLoWAhpdA",
  },
  "2521 Channing": {
    location: [-122.25780997028515, 37.867224873257776],
    name: "Institute for Research on Labor & Employment",
    link: "https://maps.app.goo.gl/v5Vqvkf26JLfsRyY9",
  },
  "2240 Piedmont": {
    location: [-122.25287235365637, 37.87039854622979],
    name: "Center for the Study of Law and Society",
    link: "https://maps.app.goo.gl/eyaq4h7aaEvs4aJWA",
  },
};
