const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();
connectDB();

const products = [
  {
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744390707/trendsaree_vbeoxs.avif',
    price: 5000,
    name: 'Sea Green Bel Buti Patterned Saree',
    video: 'https://res.cloudinary.com/dnevq4wek/video/upload/v1744873419/seagreensareevedio_gvynpb.mp4',
  },
  {
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744390847/pinksaretrend2_saqzxo.avif',
    price: 6000,
    name: 'Cream Beige Floral Embroidered Saree',
    video: 'https://res.cloudinary.com/dnevq4wek/video/upload/v1744873545/creamsareefloral_thxsbm.mp4',
  },
  {
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744527266/trendwhitesaree_uhkcyb.avif',
    name: 'Dark Cream Bel Buti Stone Embellished Saree',
    price: 7000,
    video: 'https://res.cloudinary.com/dnevq4wek/video/upload/v1744873638/DARK_CREAMsaree_kxsv01.mp4',
  },
  {
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744391222/geensareetrend_wesada.avif',
    price: 8099,
    name: 'Sea Green Beige Floral Embroidered Saree',
    video: 'https://manyavar.scene7.com/is/content/manyavar/SB17529_436-SEA%20GREEN_301_30-09-2024-08-46-0x900-1500k',
  },
  {
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744821470/blueleafsaree_qw4sfx.avif',
    price: 2999,
    name: 'Indigo Blue Leaf Patterned Saree',
    video: 'https://manyavar.scene7.com/is/content/manyavar/SB16556_439-INDIGO%20BLUE_201_05-06-2024-11-43-0x900-1500k',
  },
  {
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744821725/pinkyellowsaree_qepd4e.avif',
    price: 3999,
    name: 'Mustard Yellow Jaal Patterned Saree with Square Motifs',
    video: 'https://res.cloudinary.com/dnevq4wek/video/upload/v1744874287/mustedyellowsaree_ziphfl.mp4',
  },
  {
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744822341/redrubysaree_h00gdg.avif',
    price: 14999,
    name: 'Ruby Red Floral Zari Work Bridal Saree',
    video: 'https://manyavar.scene7.com/is/content/manyavar/SB16047_422-WINE_201_03-01-2025-05-20-0x900-1500k',
  },
  {
    category: 'women',
    subCategory: 'saree',
    img: 'https://res.cloudinary.com/dnevq4wek/image/upload/v1744821958/pinknetsaree_tkoc7w.avif',
    price: 11999,
    name: 'Dusty Pink Floral Jaal Embroidered Saree with Rhinestone Work',
    video: 'https://res.cloudinary.com/dnevq4wek/video/upload/v1744874494/dustyfloralpinksaree_iz3iho.mp4',
  },

  {
    category:'women',
    subCategory:'lehenga',
    img:'https://manyavar.scene7.com/is/image/manyavar/SKT4894_441-D.+PURPLE_101.2579_27-07-2024-23-50:650x900?&dpr=on,2',
    price: 9000,
    name:'Festive Purple Georgette Lehenga',
    video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744874550/purpulelehanga_eflagt.mp4',
  },
  {
  category:'women',
  subCategory:'lehenga',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744874954/purpulepinklehanga_cqkrpe.avif',
  price: 26000,
  name:'Majestic Purple Net Crop Top Lehenga with Thread and Zari Work',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744874857/purpulepinklehanga.mp4_crqki9.mp4',
},
{
  category:'women',
  subCategory:'lehenga',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744885561/bluenetlehangajanhvi_dkaip8.avif',
  price: 29000,
  name:'(SEMI-STITCHED)Ethereal Blue Net Lehenga',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744885478/lightbluelehangavideo_kqzbzb.mp4',
},
{
  category:'women',
  subCategory:'lehenga',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744387946/womenwear_trlaal.avif',
  price: 39000,
  name:'Teal Blue Aari Embroidered Lehenga with Imperial, Floral And Peacock Motifs',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744885843/peckoklehanga_pqeaeq.mp4',
},
{
  category:'women',
  subCategory:'weding-w', // Using weding-w for women's wedding based on legacy
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744387946/womenwear_trlaal.avif',
  price: 39000,
  name:'Teal Blue Aari Embroidered Lehenga (Wedding)',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744885843/peckoklehanga_pqeaeq.mp4',
},
{
  category:'women',
  subCategory:'weding-w',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744897971/wedding_sarre1_i4tcwg.avif',
  price: 42000,
  name:'Classic Wine Bel Buti Patterned Bridal Saree',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744898256/weddingsaree1_xlnmio.mp4'
},
{
  category:'women',
  subCategory:'weding-w',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744898424/weddingsaree2_vtyc3x.avif',
  price: 45000,
  name:'Rani Pink Bel Buti Patterned Bridal Saree with Rhinestones',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744898471/weddingsaree2_wk1pov.mp4'
},
{
  category:'women',
  subCategory:'weding-w',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744899232/wedingsaree34_i6ojyi.avif',
  price: 35000,
  name:'Rani Pink Bel Buti Patterned Bridal Saree with Rhinestones (v2)',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744899280/wedingsaree4_lvgsjr.mp4'
},
{
  category:'women',
  subCategory:'Stitched Suit',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744900946/MOIW238_409-MEHANDI_301_f9yg98.avif',
  price: 6544,
  name:'Mehandi Green Plain Indo Western with Sequin And Cape Blouse',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744901786/switcheddress1_kyztak.mp4',
 },
 {
    category:'women',
    subCategory:'Stitched Suit',
    img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744902194/switcheddress2_voeeif.avif',
    price: 20000,
    name:'Wine Hued Elegance Indo Western',
    video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744907635/MOIW184-422-WINE_301_23-09-2024-06-41-0x900-1500k_hk2e2y.mp4',
 },
 {
  category:'women',
  subCategory:'Stitched Suit',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744907307/NMSAS6419_404-FAWN_101_swnwpp.avif',
  price: 5500,
  name:'Fawn Bel Buti Patterned Straight Suit',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744907439/switcheddress3_jnj5yj.mp4',
},
{
  category:'women',
  subCategory:'Stitched Suit',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744908131/stitched_suit_4_xosf05.avif',
  price: 14499,
  name:'Fawn Bel Buti Patterned Straight Suit',
  video:'https://res.cloudinary.com/dnevq4wek/video/upload/v1744908116/switcheddress4_ogtg6h.mp4',
},
{
  category:'men',
  subCategory:'weding-w',
  name: "Cream Elegance Kurta Jacket Set",
  video: "https://manyavar.scene7.com/is/content/manyavar/SHOS368D_304-Fawn_201_03-12-2024-09-15-0x900-1500k",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744544568/MENSTRENSHERVANI1_rahxfv.avif",
  price: 24499
},
{
  category:'men',
  subCategory:'Kurta Jacket',
  name: "Antique White Floral Printed Jacket Set",
  video: "https://manyavar.scene7.com/is/content/manyavar/JOSK017-303_25-05-2023-11-44-0x900-1500k",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744553270/kurthabiscuttrend_ybrjwh.avif",
  price: 9000
},
{
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Light Blue Blended Cotton Kurta Pajama",
  video: "https://manyavar.scene7.com/is/content/manyavar/CPOSK722_341-Light%20Blue_201_14-10-2024-05-27-0x900-1500k",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744554015/lightbluetrending_tx7zsz.avif",
  price: 4500
},
{
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Light pink Blended Cotton Kurta Pajama",
  video: "https://manyavar.scene7.com/is/content/manyavar/SDES873_342-Coral_201_14-08-2024-08-28-0x900-1500k",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744554149/pinkkurthatrend_b8ll17.webp",
  price: 5000
},
{
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Mehndi Green Kurta Set with Abstract & Paisley Print",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744911342/kurtha1_zrwh5t.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744911302/kurthap1_wce0vs.webp",
  price: 6500
},
{
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Maroon Red Chikankari Sequinned Kurta Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744911633/kurtha2_yp8tbw.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744911643/kurtha2_gvxapq.avif",
  price: 3500
},
{
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Purple Buta Diamond Patterned Kurta Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744917182/kurthapaijama3_tyok09.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744917073/SDES1058-313-Purple_rnxbtz.avif",
  price: 3000
},
{
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Navy Blue Chikankari Sequinned Kurta Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744917326/kurtha_paijama_3_sc97bn.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744917348/navy_blue_paijama_4_bdhfhv.avif",
  price: 4499
},
{
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Steel Grey Grid Patterned Sequinned Kurta Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744917725/kurtha_paijama_4_evgwhc.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744917707/kurthapijama_4_gxtgz1.avif",
  price: 5499
},
{
  category:'men',
  subCategory:'Kurta Pajama',
  name: "Warm White and Pink Wave Print Kurta Set with Metallic Buta",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744918166/kurtha_5_sqjtu1.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744918117/SDES1219D_340-315-Warm_White-Pink_101_u8ibx0.avif",
  price: 5499
},
{
  category:'men',
  subCategory:'Kurta Jacket',
  name: "Teal Blue Luxe Kurta Jacket Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744915263/kurtha_jacket1_ldtqp6.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744915318/kurtha_jacket1_rmn5ch.avif",
  price: 13500
},
{
  category:'men',
  subCategory:'Kurta Jacket',
  name: "Bright White Floral Patterned Jacket Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744916280/kurtha_jacket2_xuzpsq.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744916234/JAST540_301-LIGHT_CREAM_btaaxc.avif",
  price: 15500
},
{
  category:'men',
  subCategory:'Kurta Jacket',
  name: "Cream Light Green Bel Buti Patterned Jacket Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744916900/kurtha_jacket_3_nqvafv.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744916852/kurtha_jacket3_py7qpq.avif",
  price: 15500
},
{
  category:'men',
  subCategory:'sherwani',
  name: "Cream Beige Jaal Patterned Sherwani Set with Layered Necklace",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744918722/sherwani1_mkmvs1.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744918739/sherwani1_iczd7d.avif",
  price: 25500
},
{
  category:'men',
  subCategory:'sherwani',
  name: "Grape Wine Jaal Embroidered Sherwani Set with Stone Work",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744919315/sherwani2_z9ykab.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744919299/sherwani2_csaj10.avif",
  price: 19500
},
{
  category:'men',
  subCategory:'sherwani',
  name: "Dusty Pink Medallion Patterned Sherwani Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744919553/sherwani3_zrcpu3.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744919571/sherwani3_hwjhop.avif",
  price: 19500
},
{
  category:'men',
  subCategory:'sherwani',
  name: "Cream White Jaal Medallion Patterned Sherwani Set with Rhinestone Work",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744919917/sherwwani4_iit45z.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744919875/CPSH328_302-Cream_101_yg12et.avif",
  price: 31499
},
{
  category:'men',
  subCategory:'weding-w', // Wedding collection
  name: "Sand Beige Medallion Patterned Indo Western Set",
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744920445/weddingm1_va2u0i.mp4",
  img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744920461/wedding1m_g0mbsu.avif",
  price: 34499 
},
{
  category:'men',
  subCategory:'weding-w',
  name: 'Emerald Green Angrakha Style Indo Western Set',
  video: "https://manyavar.scene7.com/is/content/manyavar/IDES716V-316_04-04-2023-12-53-2-0x900-1500k",
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744921031/wedding3_p5ehqm.avif',
  price: 39999,
},
{
  category:'men',
  subCategory:'weding-w',
  name: 'Warm White Zari Bordered Traditional South Indian Dhoti Set',
  video: "https://res.cloudinary.com/dnevq4wek/video/upload/v1744921356/weddingm4_sqna7i.mp4",
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744921341/weddinm4_hzsczk.avif',
  price: 9999,
},
{
  category:'kids',
  subCategory:'kids',
  name: ' Boys Peach Jaal Patterned Kurta Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744980006/kids3_d30jvu.avif',
  price: 2499,
},
{
  category:'kids',
  subCategory:'kids',
  name: 'Boys Grey And Yellow Kurta Jacket Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744980009/kids4_phg60a.avif',
  price: 2999,
},
{
  category:'kids',
  subCategory:'kids',
  name: 'Boys Sea Green Chikan Kurta Jacket Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744980003/kids2_myi0zj.avif',
  price: 3499,
},
{
  category:'kids',
  subCategory:'kids',
  name: 'Boys Dark Blue Paisley Patterned Angrakha Jacket Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1744980003/kids_iy2ce9.avif',
  price: 3499,
},
{
  category:'kids',
  subCategory:'kids',
  name: 'Pink Cotton Hand Block Printed 3Pc Lehenga Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1745048475/kidw1_tgaxfv.jpg',
  price: 3799,
},
{
  category:'kids',
  subCategory:'kids',
  name: 'Yellow Cotton Chikankari 3Pc Salwar Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1745048638/kidw2_mwpwge.jpg',
  price: 3299,
},
{
  category:'kids',
  subCategory:'kids',
  name: 'Green Cotton Silk Hand Block Printed 3Pc Lehenga Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1745054234/kidw3_unduh1.jpg',
  price: 3099,
},
{
  category:'kids',
  subCategory:'kids',
  name: 'Blue Cotton Printed 3Pc Lehenga Set',
  img:'https://res.cloudinary.com/dnevq4wek/image/upload/v1745054367/kidw4_kibn1i.jpg',
  price: 3000,
},

  {
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744616638/homedecor1main_oww9ns.jpg",
    name: "Helios Alton Arvis Bedside Table",
    category:'HomeDecor',
    subCategory:'home',
    price: 3499
  },
  {
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744616829/rabithomedecor_uv8s4x.jpg",
    name: "Corsica Malta Ceramic Bunny with Pot Planter",
    price: 799,
    category:'HomeDecor',
    subCategory:'home',
  },
  {
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744616907/homedecor2home_czvfkt.jpg",
    name: "Spinel Decor Artificial Planter in Planter",
    price: 1199,
    category:'HomeDecor',
    subCategory:'home',
  },
  {
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744617069/claypotdecor_yocxab.jpg",
    name: "Gloria Human Artificial Succulent in Polyresin Pot",
    price: 599,
    category:'HomeDecor',
    subCategory:'home',
  },
  {
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745060228/homedecor1_m2bfun.jpg",
    name: "Alpana Polyresin Standing Krishna Figurine",
    price: 2499,
    category:'HomeDecor',
    subCategory:'home',
  },
  {
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745060397/1000012970427-1000012970426_01-2100_zslghm.jpg",
    name: "Alpana Polyresin Baby Ganesha Mudra Figurine",
    price: 699,
    category:'HomeDecor',
    subCategory:'home',
  },

  {
    category: "home",
    subCategory: "wallart",
    name: "Corsica Elephant Wall Accent",
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744617990/wallelephantpaint_uqtogl.jpg",
    price: 1799,
  },
  {
    category: "home",
    subCategory: "wallart",
    name: "VEDAS Maanav Metal Ginko Leaf Wall Accent",
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744618552/wallleafascent_k3xqwi.jpg",
    price: 2199,
  },
  {
    category: "home",
    subCategory: "wallart",
    name: "VEDAS Reva Metal Tree of Wisdom and Life Wall Accent",
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744618235/metalteewall_c5brwp.jpg",
    price: 2499,
  },
  {
    category: "home",
    subCategory: "wallart",
    name: "VEDAS Veda Metal Flower Wall Accent",
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1744618325/flowerart_m0i6s3.jpg",
    price: 1999,
  },
  {
    category: "home",
    subCategory: "wallart",
    name: "VEDAS Veda Metal Elephant Wall Accent",
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745065468/wallart3_otlomf.png",
    price: 3999,
  },

  { name: "Handcrafted Wooden Puzzles With Box (Set of 3)", price: 1299, img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745221576/puzzle_hui4rz.webp",category: "home", 
    subCategory: "toys", },

  { name: "Handcrafted Wooden Kit Kat Sound Toy - Twirling Elephant", price: 399, img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745221867/toy2_luuokk.webp" ,category: "home", 
    subCategory: "toys", },

  { name: "Handcrafted Wooden Tangram Puzzle", price: 799, img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745221894/toy3_ygguw9.webp",category: "home", subCategory: "toys", },

  { name: "Tic-Tac-Toe Puzzle", price: 1500, img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745221925/toy4_ofuwmc.webp",category: "home",subCategory: "toys", },
  { name: "Channapatna Wooden Toy Engine, Red", price: 610, img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745222015/toy5_sg8rrn.webp" ,category: "home",subCategory: "toys", },
  { name: "Channapatna Wooden Toy - Rural Couple (Set of 2)", price:920, img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745222016/toy6_fnscxf.webp",category: "home", subCategory: "toys"},

  {
    category: "jewellary",
    subCategory: "jew",
    name: "multicolour hook brass necklace",
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745232038/newjew1_ctshzm.avif",
    price: 8999,
  },
  {
    category: "jewellary",
    subCategory: "jew",
    name: "Gold Toned Handcrafted Brass Necklace with Earrings - Set of 2",
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745232487/NEWJEW2_vnebwx.webp",
    price: 12999,
  },
  {
    category: "jewellary",
    subCategory: "jew",
    name: "Red Handcrafted Brass Choker with Earrings- Set of 2",
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745232651/newjew3_spwyrx.webp",
    price: 9999,
  },
  {
    category: "jewellary",
    subCategory: "jew",
    name: "Brown Handcrafted Cotton Beaded Necklace",
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745232959/tr_c-at_max_w-800_h-1066_akbhdy.webp",
    price: 999,
  },
  {
    category: "jewellary",
    subCategory: "jew",
    name: "Gold Plated Green Handcrafted Brass Semi Precious Stone Necklace",
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745233074/newjew4_nsisbq.webp",
    price: 2999,
  },
  {
    category: "jewellary",
    subCategory: "jew",
    name: "Multicolor Handcrafted Brass Kundan Necklace with Earrings- Set of 2",
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745233310/jewl8_blksvm.webp",
    price: 4999,
  },
  {
    category: "jewellary",
    subCategory: "jew",
    name: "White Handcrafted Pearl Beaded Necklace",
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745236132/jewl9_gwr4cs.webp",
    price: 2999,
  },
  {
    category: "jewellary",
    subCategory: "jew",
    name: "Gold Plated Handcrafted Metal Kundan Choker with Earrings- Set of 2",
    img: "https://res.cloudinary.com/dnevq4wek/image/upload/v1745236310/jewl10_hf23nd.webp",
    price: 4999,
  }
];

const seed = async () => {
    try {
        await Product.deleteMany(); // Clear existing products
        await User.deleteMany(); // Clear existing users

        // Create Admin User
        const adminUser = await User.create({
            fullName: 'Admin User',
            email: 'admin@example.com',
            password: 'password123', // Will be hashed by pre-save middleware
            role: 'admin',
            phoneNumber: '1234567890'
        });

        console.log('Admin User Created: admin@example.com / password123');

        // Create Products
        const productsToInsert = products.map(p => ({
            name: p.name,
            description: p.name, // Default description
            category: p.category,
            subCategory: p.subCategory,
            price: p.price || 0,
            images: p.img ? [p.img] : [],
            video: p.video,
            stockAvailable: 100, // Default stock
            isTrending: false
        }));

        await Product.insertMany(productsToInsert);
        console.log('Products Imported!');
        process.exit();
    } catch (err) {
        console.error('Error with data import', err);
        process.exit(1);
    }
};

seed();
