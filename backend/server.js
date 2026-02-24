const express  = require('express');
const cors     = require('cors');
const multer   = require('multer');
const axios    = require('axios');
const dotenv   = require('dotenv');
dotenv.config();

const app    = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], methods: ['GET','POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json({ limit: '50mb' }));

const DRESSES = [
  
  { id:'1',  name:'Plain White Round-Neck Tee',    category:'tshirts',    price:'₹399',   image:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400', buyLink:'https://www.myntra.com/t-shirts',                         tags:['casual','basic']      },
  { id:'2',  name:'Striped Navy Blue T-Shirt',     category:'tshirts',    price:'₹499',   image:'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400', buyLink:'https://www.flipkart.com/search?q=striped+tshirt',           tags:['casual','basic']      },
  { id:'3',  name:'Oversized Graphic Tee',         category:'tshirts',    price:'₹649',   image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', buyLink:'https://www.myntra.com/t-shirts',                         tags:['casual','streetwear'] },
  { id:'4',  name:'Solid Black Crop Tee',          category:'tshirts',    price:'₹449',   image:'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400', buyLink:'https://www.flipkart.com/search?q=crop+tshirt',            tags:['casual','trendy']     },
  
  { id:'5',  name:'Cotton A-Line Kurti',           category:'kurtis',     price:'₹799',   image:'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=400', buyLink:'https://www.myntra.com/kurtis',                           tags:['ethnic','casual']     },
  { id:'6',  name:'Embroidered Silk Kurti',        category:'kurtis',     price:'₹1,599', image:'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400', buyLink:'https://www.flipkart.com/search?q=embroidered+kurti',      tags:['ethnic','festive']    },
  { id:'7',  name:'Floral Printed Kurti',          category:'kurtis',     price:'₹899',   image:'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400', buyLink:'https://www.myntra.com/kurtis',                           tags:['ethnic','casual']     },
  { id:'8',  name:'Long Straight Kurti',           category:'kurtis',     price:'₹1,099', image:'https://images.unsplash.com/photo-1572635148818-ef6fd45eb394?w=400', buyLink:'https://www.flipkart.com/search?q=long+straight+kurti',   tags:['ethnic','office']     },
  
  { id:'9',  name:'Classic White Formal Shirt',    category:'shirts',     price:'₹899',   image:'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=400', buyLink:'https://www.amazon.in/s?k=white+formal+shirt',            tags:['formal','minimal']    },
  { id:'10', name:'Light Blue Oxford Shirt',       category:'shirts',     price:'₹1,199', image:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', buyLink:'https://www.myntra.com/shirts',                           tags:['formal','casual']     },
  { id:'11', name:'Checked Casual Shirt',          category:'shirts',     price:'₹999',   image:'https://images.unsplash.com/photo-1594938298603-c8148c4b4e71?w=400', buyLink:'https://www.flipkart.com/search?q=checked+casual+shirt',  tags:['casual','basic']      },
  { id:'12', name:'Oversized Linen Shirt',         category:'shirts',     price:'₹1,299', image:'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400', buyLink:'https://www.myntra.com/shirts',                           tags:['casual','minimal']    },
  
  { id:'13', name:'High-Waist Straight Trousers',  category:'pants',      price:'₹1,299', image:'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', buyLink:'https://www.myntra.com/trousers',                         tags:['formal','minimal']    },
  { id:'14', name:'Wide Leg Palazzo Pants',        category:'pants',      price:'₹999',   image:'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400', buyLink:'https://www.flipkart.com/search?q=palazzo+pants',         tags:['casual','ethnic']     },
  { id:'15', name:'Slim Fit Black Jeans',          category:'pants',      price:'₹1,499', image:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400', buyLink:'https://www.myntra.com/jeans',                            tags:['casual','basic']      },
  { id:'16', name:'Printed Harem Pants',           category:'pants',      price:'₹849',   image:'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=400', buyLink:'https://www.flipkart.com/search?q=harem+pants',           tags:['casual','boho']       },
  
  { id:'17', name:'Floral Anarkali Suit',          category:'dresses',    price:'₹2,499', image:'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400', buyLink:'https://www.myntra.com/anarkali-suits',                   tags:['ethnic','festive']    },
  { id:'18', name:'Floral Maxi Dress',             category:'dresses',    price:'₹1,799', image:'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400', buyLink:'https://www.flipkart.com/search?q=floral+maxi+dress',     tags:['casual','summer']     },
  { id:'19', name:'Printed Wrap Dress',            category:'dresses',    price:'₹2,199', image:'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400', buyLink:'https://www.myntra.com/wrap-dresses',                     tags:['casual','boho']       },
  { id:'20', name:'Indo-Western Blazer Dress',     category:'dresses',    price:'₹3,199', image:'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=400', buyLink:'https://www.myntra.com/blazers',                          tags:['fusion','office']     }
];

async function fetchBuffer(url) {
  const r = await axios.get(url, { responseType:'arraybuffer', timeout:30000, headers:{'User-Agent':'Mozilla/5.0'} });
  return { buffer: Buffer.from(r.data), mime: (r.headers['content-type']||'image/jpeg').split(';')[0] };
}
function toDataUrl(b, m) { return `data:${m};base64,${b.toString('base64')}`; }

app.get('/api/health', async (req, res) => {
  let py = 'offline';
  try { const r = await axios.get('http://localhost:5001/health',{timeout:2000}); py = r.data.status; } catch(_){}
  res.json({ status:'ok', python_service:py, dresses:DRESSES.length });
});

app.get('/api/dresses', (req, res) => {
  const { category } = req.query;
  res.json({ success:true, data: category && category!=='all' ? DRESSES.filter(d=>d.category===category) : DRESSES });
});

app.get('/api/dresses/:id', (req, res) => {
  const d = DRESSES.find(d=>d.id===req.params.id);
  if (!d) return res.status(404).json({ success:false, message:'Not found' });
  res.json({ success:true, data:d });
});

app.post('/api/tryon', upload.single('person_image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success:false, message:'Upload your photo first' });
    const dress = DRESSES.find(d=>d.id===req.body.dress_id);
    if (!dress)  return res.status(404).json({ success:false, message:'Dress not found' });

    console.log(`\n[TryOn] ${dress.name}`);
    const personDataUrl  = toDataUrl(req.file.buffer, req.file.mimetype);
    const { buffer:gb, mime:gm } = await fetchBuffer(dress.image);
    const garmentDataUrl = toDataUrl(gb, gm);

    const r = await axios.post('http://localhost:5001/tryon', {
      person: personDataUrl, garment: garmentDataUrl, description: dress.name
    }, { timeout:300000 });

    if (!r.data?.result) throw new Error('No result');
    console.log('[TryOn] ✓');
    res.json({ success:true, result_image:r.data.result, dress });

  } catch(err) {
    console.error('[TryOn]', err.message);
    if (err.code==='ECONNREFUSED') return res.status(503).json({ success:false, message:'Start the Python service first: python tryon_service.py' });
    if (err.message?.includes('timeout')) return res.status(504).json({ success:false, message:'Timed out — try again', retry:true });
    res.status(500).json({ success:false, message: err.response?.data?.error || err.message });
  }
});

app.post('/api/chat/recommendations', (req, res) => {
  const dress   = DRESSES.find(d=>d.id===req.body.dress_id);
  const formal  = dress?.tags?.includes('formal');
  const ethnic  = dress?.tags?.includes('ethnic');
  res.json({ success:true, data:[
    { category:'👟 Footwear',    item: formal ? 'Block heel sandals or juttis' : ethnic ? 'Kolhapuri flats or mojris' : 'White sneakers or loafers', reason:`Pairs perfectly with ${dress?.name||'this outfit'}`, price:'₹800 – ₹2,500',  link:'https://www.myntra.com/footwear'   },
    { category:'💍 Jewellery',   item: ethnic ? 'Oxidised jhumkas + layered necklace' : 'Dainty gold necklace + hoop earrings',                      reason:'Adds the perfect finishing touch',                   price:'₹400 – ₹1,200',  link:'https://www.myntra.com/jewellery'  },
    { category:'👜 Bag',         item: formal ? 'Embroidered potli bag' : ethnic ? 'Jhola bag or sling bag' : 'Mini crossbody bag',                   reason:'Stylish and practical for any occasion',              price:'₹600 – ₹2,000',  link:'https://www.myntra.com/handbags'   },
    { category:'🕶️ Sunglasses', item:'Oversized cat-eye sunglasses',                                                                                  reason:'The perfect finishing touch to complete the look',    price:'₹500 – ₹1,800',  link:'https://www.myntra.com/sunglasses' }
  ]});
});

app.post('/api/chat/ask', (req, res) => {
  const msg=(req.body.message||'').toLowerCase();
  let reply="Ask me about footwear 👟, bags 👜, jewellery 💍, or colour matching!", links=[];
  if      (msg.includes('shoe')||msg.includes('heel')||msg.includes('jutti'))       { reply='Juttis or kolhapuris for ethnic, block heels for formal, white sneakers for casual!';     links=[{label:'Shop Footwear on Myntra', url:'https://www.myntra.com/footwear'}];   }
  else if (msg.includes('bag')||msg.includes('purse')||msg.includes('potli'))       { reply='Potli bag for ethnic looks, jhola bag for boho, mini sling bag for casual outfits!';      links=[{label:'Shop Bags on Myntra',     url:'https://www.myntra.com/handbags'}];   }
  else if (msg.includes('jewel')||msg.includes('jhumka')||msg.includes('necklace')) { reply='Oxidised jhumkas with a layered necklace is a classic combo for ethnic wear!';            links=[{label:'Shop Jewellery on Myntra',url:'https://www.myntra.com/jewellery'}];  }
  else if (msg.includes('color')||msg.includes('colour')||msg.includes('match'))    { reply='Earthy tones like mustard, terracotta and sage pair beautifully with ethnic wear. Neutrals work great for western looks!'; }
  res.json({ success:true, reply, links });
});

const PORT = process.env.PORT||4000;
app.listen(PORT, ()=>{
  console.log(`\n✅ Backend  → http://localhost:${PORT}`);
  console.log(`   Start Python service: python tryon_service.py\n`);
});