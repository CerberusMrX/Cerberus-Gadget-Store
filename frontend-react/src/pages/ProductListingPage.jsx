/**
 * CERBERUS GADGET STORE - Product Listing Page
 * File: frontend-react/src/pages/ProductListingPage.jsx
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['Smartphones','Laptops','Smartwatches','Audio','Gaming','Cameras'];
const BRANDS     = ['Apple','Samsung','Google','Sony','Dell','ASUS','Canon','Razer','Bose','GoPro'];
const SORTS      = [
  { label:'Newest',        value:'created_at:DESC' },
  { label:'Price: Low-High', value:'price:ASC' },
  { label:'Price: High-Low', value:'price:DESC' },
  { label:'Top Rated',     value:'rating:DESC' },
];

export default function ProductListingPage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    category: params.get('category') || '',
    search:   params.get('search')   || '',
    brand:    '',
    min_price:'',
    max_price:'',
    sort:     'created_at:DESC',
    page:     1
  });

  useEffect(() => {
    document.title = 'Products — Cerberus Gadget Store';
  }, []);

  useEffect(() => {
    const catParam = params.get('category') || '';
    const searchParam = params.get('search') || '';
    if (catParam || searchParam) {
      setFilters(f => ({ ...f, category: catParam, search: searchParam, page: 1 }));
    }
  }, [params]);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = filters.sort.split(':');
      const q = new URLSearchParams();
      if (filters.category)  q.set('category', filters.category);
      if (filters.search)    q.set('search',   filters.search);
      if (filters.brand)     q.set('brand',    filters.brand);
      if (filters.min_price) q.set('min_price',filters.min_price);
      if (filters.max_price) q.set('max_price',filters.max_price);
      q.set('sort', sortField);
      q.set('order', sortOrder);
      q.set('page', filters.page);
      q.set('limit', 12);

      const res = await api.get(`/products?${q.toString()}`);
      setProducts(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const updateFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));
  const clearFilters = () => setFilters({ category:'', search:'', brand:'', min_price:'', max_price:'', sort:'created_at:DESC', page:1 });

  return (
    <div style={{ padding:'2rem 0 4rem' }}>
      <div className="page-container">
        <div style={{ display:'flex', gap:'1.5rem', alignItems:'flex-start' }}>
          {/* ── Sidebar Filters ──────────────────────── */}
          <aside style={{ width:'240px', flexShrink:0, position:'sticky', top:'80px' }} className="hidden-mobile">
            <div style={{ background:'#18181b', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'1.25rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
                <span style={{ fontWeight:700, color:'#fafafa', fontSize:'0.9375rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <Filter size={16} color="#dc2626" /> Filters
                </span>
                <button onClick={clearFilters} style={{ fontSize:'0.75rem', color:'#71717a', background:'none', border:'none', cursor:'pointer' }}>Clear all</button>
              </div>

              {/* Category */}
              <div style={{ marginBottom:'1.25rem' }}>
                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#a1a1aa', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.625rem' }}>Category</label>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
                  <button onClick={() => updateFilter('category', '')}
                    style={{ textAlign:'left', padding:'0.375rem 0.625rem', borderRadius:'6px', border:'none', cursor:'pointer', fontSize:'0.8125rem', fontWeight:500, transition:'all 0.15s',
                      background: !filters.category ? 'rgba(220,38,38,0.15)' : 'transparent',
                      color: !filters.category ? '#f87171' : '#a1a1aa' }}>
                    All Categories
                  </button>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => updateFilter('category', cat)}
                      style={{ textAlign:'left', padding:'0.375rem 0.625rem', borderRadius:'6px', border:'none', cursor:'pointer', fontSize:'0.8125rem', fontWeight:500, transition:'all 0.15s',
                        background: filters.category===cat ? 'rgba(220,38,38,0.15)' : 'transparent',
                        color: filters.category===cat ? '#f87171' : '#a1a1aa' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div style={{ marginBottom:'1.25rem' }}>
                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#a1a1aa', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.625rem' }}>Brand</label>
                <select value={filters.brand} onChange={e=>updateFilter('brand',e.target.value)} className="input-dark" style={{ fontSize:'0.8125rem' }}>
                  <option value="">All Brands</option>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* Price Range */}
              <div style={{ marginBottom:'1.25rem' }}>
                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#a1a1aa', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.625rem' }}>Price Range (USD)</label>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <input type="number" placeholder="Min" value={filters.min_price} onChange={e=>updateFilter('min_price',e.target.value)}
                    className="input-dark" style={{ fontSize:'0.8125rem' }} />
                  <input type="number" placeholder="Max" value={filters.max_price} onChange={e=>updateFilter('max_price',e.target.value)}
                    className="input-dark" style={{ fontSize:'0.8125rem' }} />
                </div>
              </div>
            </div>
          </aside>

          {/* ── Product Grid ─────────────────────────── */}
          <div style={{ flex:1, minWidth:0 }}>
            {/* Top bar */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
              <div>
                <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:'1.5rem', fontWeight:800, color:'#fafafa', marginBottom:'0.25rem' }}>
                  {filters.category || filters.search ? `Rs. ${filters.category || `"${filters.search}"`}` : 'All Products'}
                </h1>
                <p style={{ color:'#71717a', fontSize:'0.8125rem' }}>
                  {pagination.total || 0} products found
                </p>
              </div>
              <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                <select value={filters.sort} onChange={e=>updateFilter('sort',e.target.value)}
                  className="input-dark" style={{ width:'auto', fontSize:'0.8125rem' }}>
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {/* Active filters */}
            {(filters.category || filters.search || filters.brand) && (
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1rem' }}>
                {[['category',filters.category], ['search',filters.search && `"${filters.search}"`], ['brand',filters.brand]].map(([key,val]) =>
                  val ? (
                    <span key={key} style={{ display:'inline-flex', alignItems:'center', gap:'0.375rem', padding:'0.25rem 0.625rem',
                      background:'rgba(220,38,38,0.12)', border:'1px solid rgba(220,38,38,0.2)', borderRadius:'6px',
                      fontSize:'0.75rem', color:'#f87171', fontWeight:500 }}>
                      {val}
                      <button onClick={()=>updateFilter(key,'')} style={{ background:'none',border:'none',cursor:'pointer',color:'#f87171',lineHeight:1,padding:0,fontSize:'14px' }}>×</button>
                    </span>
                  ) : null
                )}
              </div>
            )}

            {loading ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1rem' }}>
                {[...Array(8)].map((_,i) => (
                  <div key={i} style={{ borderRadius:'16px', overflow:'hidden' }}>
                    <div className="skeleton" style={{ height:'220px' }} />
                    <div style={{ padding:'1rem', background:'#18181b' }}>
                      <div className="skeleton" style={{ height:'12px', marginBottom:'8px', width:'50%' }} />
                      <div className="skeleton" style={{ height:'14px', marginBottom:'8px' }} />
                      <div className="skeleton" style={{ height:'18px', width:'40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign:'center', padding:'5rem 1rem', color:'#71717a' }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📦</div>
                <h3 style={{ color:'#a1a1aa', marginBottom:'0.5rem' }}>No products found</h3>
                <p style={{ fontSize:'0.875rem' }}>Try adjusting your filters</p>
                <button onClick={clearFilters} className="btn-cerberus" style={{ marginTop:'1.25rem' }}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1rem' }}>
                  {products.map(p => <ProductCard key={p.PRODUCT_ID || p.product_id} product={p} />)}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem', marginTop:'2rem' }}>
                    {[...Array(pagination.pages)].map((_,i) => (
                      <button key={i} onClick={()=>setFilters(f=>({...f,page:i+1}))}
                        style={{ width:'36px', height:'36px', borderRadius:'8px', border:'1px solid', cursor:'pointer', fontWeight:600, fontSize:'0.875rem', transition:'all 0.15s',
                          borderColor: filters.page===i+1 ? '#dc2626' : 'rgba(255,255,255,0.1)',
                          background:  filters.page===i+1 ? 'rgba(220,38,38,0.15)' : 'transparent',
                          color:       filters.page===i+1 ? '#f87171' : '#71717a' }}>
                        {i+1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
