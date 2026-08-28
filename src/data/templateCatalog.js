export const futuristicTemplateCatalog=[
 {key:'future-neon',name:'Neon Nova',primary:'#00f5ff',secondary:'#ff3df2',layout:1,headline:'Taste beyond tomorrow'},
 {key:'future-hologram',name:'Hologram Feast',primary:'#70ffca',secondary:'#8a7dff',layout:2,headline:'A feast made of light'},
 {key:'future-paper',name:'Paper & Salt',primary:'#d94b32',secondary:'#e7b44d',layout:3,headline:'A fresh page for flavour'},
 {key:'future-cyber',name:'Cyber Bento',primary:'#ff426d',secondary:'#19d9ff',layout:4,headline:'Street food, upgraded'},
 {key:'future-aurora',name:'Aurora Kitchen',primary:'#80ffdb',secondary:'#b388ff',layout:5,headline:'Cooked under new skies'},
 {key:'future-quantum',name:'Quantum Plate',primary:'#c6ff00',secondary:'#00b8d4',layout:6,headline:'Infinite taste states'},
 {key:'future-solar',name:'Solar Flare',primary:'#ffb000',secondary:'#ff3d00',layout:7,headline:'Powered by fire'},
 {key:'future-lunar',name:'Lunar Lounge',primary:'#d8e2ff',secondary:'#7c4dff',layout:8,headline:'Dinner after dark'},
 {key:'future-bio',name:'Bio Lumina',primary:'#64ff72',secondary:'#00e5ff',layout:9,headline:'Naturally electric'},
 {key:'future-chrome',name:'Chrome Café',primary:'#315f73',secondary:'#9eb6c2',layout:10,headline:'Polished to perfection'},
 {key:'future-void',name:'Void Supper',primary:'#ff4d8d',secondary:'#8f5cff',layout:11,headline:'Into the delicious unknown'},
 {key:'future-prism',name:'Prism Pantry',primary:'#ff6ec7',secondary:'#62e7ff',layout:12,headline:'Every flavour, refracted'},
 {key:'future-synth',name:'Synthwave Diner',primary:'#ff2bd6',secondary:'#ff8a00',layout:13,headline:'Retro taste, future pulse'},
 {key:'future-crystal',name:'Crystal Table',primary:'#167b78',secondary:'#9bc9c3',layout:14,headline:'Clarity in every course'},
 {key:'future-plasma',name:'Plasma Grill',primary:'#ff5a36',secondary:'#ffe600',layout:15,headline:'High-energy dining'},
 {key:'future-zen',name:'Neo Zen',primary:'#3f7452',secondary:'#a9c5a4',layout:16,headline:'Stillness meets flavour'},
 {key:'future-circuit',name:'Circuit Kitchen',primary:'#34ff9a',secondary:'#ffd23f',layout:17,headline:'Connected by taste'},
 {key:'future-cosmos',name:'Cosmos Eatery',primary:'#9a7dff',secondary:'#ff75bc',layout:18,headline:'A universe on your plate'},
 {key:'future-flux',name:'Flux Bistro',primary:'#00ffc6',secondary:'#ff477e',layout:19,headline:'Always fresh. Never static.'},
 {key:'future-oasis',name:'Digital Oasis',primary:'#46f7d5',secondary:'#f5cb5c',layout:20,headline:'Recharge your senses'},
]
export const futuristicTemplateMap=Object.fromEntries(futuristicTemplateCatalog.map(template=>[template.key,template]))
export const templateKeys=['editorial','garden','midnight','express','worldplate','ember','sage',...futuristicTemplateCatalog.map(template=>template.key)]
