import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 🔌 從環境變數讀取
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ 【環境變數出錯】讀取不到 Supabase URL 或 Anon Key！");
}

const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

export default function App() {
  // --- States ---
  const [view, setView] = useState('main'); 
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState({}); 
  const [rawCategories, setRawCategories] = useState([]); 

  // --- Form States (Main Page) ---
  const [amount, setAmount] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [mainCat, setMainCat] = useState('');
  const [subCat, setSubCat] = useState('');
  const [note, setNote] = useState('');

  // --- Form States (Settings Page) ---
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberColor, setNewMemberColor] = useState('#ffffff');
  const [newMainCat, setNewMainCat] = useState('');
  const [newSubCat, setNewSubCat] = useState('');

  // --- Initial Fetch ---
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const [memRes, catRes] = await Promise.all([
          supabase.from('members').select('*').order('id'),
          supabase.from('categories').select('*').order('id')
        ]);

        if (!isMounted) return;

        if (memRes.data && memRes.data.length > 0) {
          setMembers(memRes.data);
          setSelectedMember(memRes.data[0].id.toString());
        }
        if (catRes.data && catRes.data.length > 0) {
          setRawCategories(catRes.data);
          const catObj = {};
          catRes.data.forEach(item => {
            if (!catObj[item.main_category]) catObj[item.main_category] = [];
            if (!catObj[item.main_category].includes(item.sub_category)) catObj[item.main_category].push(item.sub_category);
          });
          setCategories(catObj);
          const firstMain = Object.keys(catObj)[0];
          if (firstMain) {
            setMainCat(firstMain);
            setSubCat(catObj[firstMain][0] || '');
          }
        }
        await fetchExpenses();
      } catch (err) {
        console.error("❌ 讀取資料失敗:", err);
      }
    };
    fetchInitialData();
    return () => { isMounted = false; };
  }, []);

  const fetchExpenses = async () => {
    const { data } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    if (data) setRecords(data);
  };

  useEffect(() => {
    if (mainCat && categories[mainCat]) {
      setSubCat(categories[mainCat][0] || '');
    }
  }, [mainCat, categories]);

  // --- 📊 即時數據分析統計邏輯 (新功能) ---
  const getStats = () => {
    // 1. 總金額
    const total = records.reduce((sum, rec) => sum + parseFloat(rec.amount || 0), 0);

    // 2. 成員消費分佈
    const memberMap = {};
    members.forEach(m => { memberMap[m.id] = 0; });
    records.forEach(rec => {
      if (memberMap[rec.member_id] !== undefined) {
        memberMap[rec.member_id] += parseFloat(rec.amount || 0);
      }
    });

    // 3. 主分類排行
    const catMap = {};
    records.forEach(rec => {
      if (!catMap[rec.main_category]) catMap[rec.main_category] = 0;
      catMap[rec.main_category] += parseFloat(rec.amount || 0);
    });
    
    // 轉成陣列並排序
    const sortedCats = Object.keys(catMap)
      .map(name => ({ name, amount: catMap[name] }))
      .sort((a, b) => b.amount - a.amount);

    return { total, memberMap, sortedCats };
  };

  const stats = getStats();

  // --- Actions ---
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || !selectedMember) return;
    const { error } = await supabase.from('expenses').insert([{
      member_id: parseInt(selectedMember),
      amount: parseFloat(amount),
      main_category: mainCat,
      sub_category: subCat,
      note: note
    }]);
    if (!error) { setAmount(''); setNote(''); fetchExpenses(); }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('確定要刪除呢筆帳目？')) {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (!error) fetchExpenses();
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName) return;
    const { error } = await supabase.from('members').insert([{ name: newMemberName, color: newMemberColor }]);
    if (!error) {
      setNewMemberName('');
      const { data } = await supabase.from('members').select('*').order('id');
      if (data) setMembers(data);
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('警告：刪除成員會一併刪除佢所有記帳紀錄！確定？')) {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (!error) {
        const { data } = await supabase.from('members').select('*').order('id');
        if (data) setMembers(data);
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newMainCat || !newSubCat) return;
    const { error } = await supabase.from('categories').insert([{ main_category: newMainCat, sub_category: newSubCat }]);
    if (!error) {
      setNewMainCat(''); setNewSubCat('');
      const { data } = await supabase.from('categories').select('*').order('id');
      if (data) {
        setRawCategories(data);
        const catObj = {};
        data.forEach(item => {
          if (!catObj[item.main_category]) catObj[item.main_category] = [];
          if (!catObj[item.main_category].includes(item.sub_category)) catObj[item.main_category].push(item.sub_category);
        });
        setCategories(catObj);
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('確定要刪除呢個分類？')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) {
        const { data } = await supabase.from('categories').select('*').order('id');
        if (data) setRawCategories(data);
      }
    }
  };

  const getMember = (id) => {
    if (!id) return { name: '...', color: '#888888' };
    return members.find(m => m.id.toString() === id.toString()) || { name: 'Unknown', color: '#888888' };
  };

  return (
    <div style={styles.container}>
      {/* 固定導航欄 */}
      <nav style={styles.nav}>
        <span style={view === 'main' ? styles.navActive : styles.navLink} onClick={() => setView('main')}>流水帳</span>
        <span style={view === 'settings' ? styles.navActive : styles.navLink} onClick={() => setView('settings')}>設定 (分類/成員)</span>
      </nav>

      {view === 'main' ? (
        <>
          {/* 記帳 Form */}
          <form onSubmit={handleAddExpense} style={styles.form}>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.inputAmount}
              required
              autoFocus
            />

            <div style={styles.responsiveRow}>
              <select 
                value={selectedMember} 
                onChange={(e) => setSelectedMember(e.target.value)} 
                style={{...styles.select, color: getMember(selectedMember).color}}
              >
                {members.map(m => <option key={m.id} value={m.id.toString()} style={{color: m.color}}>{m.name}</option>)}
              </select>

              <select value={mainCat} onChange={(e) => setMainCat(e.target.value)} style={styles.select}>
                {Object.keys(categories).map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select value={subCat} onChange={(e) => setSubCat(e.target.value)} style={styles.select}>
                {categories[mainCat]?.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={styles.row}>
              <input
                type="text"
                placeholder="備忘..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={styles.inputNote}
              />
              <button type="submit" style={styles.button}>＋</button>
            </div>
          </form>

          {/* 📊 數據統計區區塊 (新功能) */}
          {records.length > 0 && (
            <div style={styles.statsContainer}>
              <div style={styles.totalBlock}>
                <div style={styles.statsLabel}>總支出總計</div>
                <div style={styles.totalText}>${stats.total.toFixed(1)}</div>
              </div>
              
              <div style={styles.statsGrid}>
                {/* 左側：成員分佈 */}
                <div style={styles.statsCard}>
                  <div style={styles.statsCardTitle}>成員分擔</div>
                  <div style={styles.statsCardList}>
                    {members.map(m => {
                      const mAmount = stats.memberMap[m.id] || 0;
                      const percent = stats.total > 0 ? ((mAmount / stats.total) * 100).toFixed(0) : 0;
                      return (
                        <div key={m.id} style={styles.statsCardItem}>
                          <span style={{...styles.dot, backgroundColor: m.color}}></span>
                          <span style={{color: '#fff', flex: 1}}>{m.name}</span>
                          <span style={{color: '#666', fontSize: '12px', marginRight: '6px'}}>{percent}%</span>
                          <span style={{color: m.color, fontWeight: 'bold'}}>${mAmount.toFixed(0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 右側：分類排行 */}
                <div style={styles.statsCard}>
                  <div style={styles.statsCardTitle}>分類消耗 (TOP 3)</div>
                  <div style={styles.statsCardList}>
                    {stats.sortedCats.slice(0, 3).map((c, index) => {
                      const percent = stats.total > 0 ? ((c.amount / stats.total) * 100).toFixed(0) : 0;
                      return (
                        <div key={c.name} style={styles.statsCardItem}>
                          <span style={{color: '#666', marginRight: '6px'}}>{index + 1}.</span>
                          <span style={{color: '#fff', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{c.name}</span>
                          <span style={{color: '#666', fontSize: '12px', marginRight: '6px'}}>{percent}%</span>
                          <span style={{color: '#aaa'}}>${c.amount.toFixed(0)}</span>
                        </div>
                      );
                    })}
                    {stats.sortedCats.length === 0 && (
                      <div style={{color: '#444', fontSize: '12px', textAlign: 'center', marginTop: '10px'}}>暫無分類數據</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <hr style={styles.divider} />

          {/* 紀錄列表 */}
          <div style={styles.list}>
            {records.map(rec => {
              const mem = getMember(rec.member_id);
              return (
                <div key={rec.id} style={styles.listItem}>
                  <div style={styles.itemLeft}>
                    <span style={{ color: mem.color, fontWeight: 'bold', minWidth: '50px' }}>{mem.name}</span>
                    <span style={styles.catText}>{rec.main_category}·{rec.sub_category}</span>
                    {rec.note && <span style={styles.noteText}>({rec.note})</span>}
                  </div>
                  <div style={styles.itemRight}>
                    <span style={{ color: mem.color, fontWeight: 'bold', marginRight: '12px' }}>
                      ${parseFloat(rec.amount).toFixed(1)}
                    </span>
                    <span onClick={() => handleDeleteExpense(rec.id)} style={styles.deleteBtn}>×</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* 設定頁面 */
        <div style={styles.settingsContainer}>
          <div style={styles.settingsSection}>
            <h3 style={styles.sectionTitle}>成員名單</h3>
            <form onSubmit={handleAddMember} style={styles.row}>
              <input type="text" placeholder="新成員名..." value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} style={styles.inputNote} />
              <input type="color" value={newMemberColor} onChange={(e) => setNewMemberColor(e.target.value)} style={styles.colorPicker} />
              <button type="submit" style={styles.button}>加人</button>
            </form>
            <div style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {members.map(m => (
                <div key={m.id} style={styles.settingsItemRow}>
                  <span style={{color: m.color, fontWeight: 'bold'}}>{m.name}</span>
                  <span onClick={() => handleDeleteMember(m.id)} style={styles.deleteBtn}>×</span>
                </div>
              ))}
            </div>
          </div>

          <hr style={styles.divider} />

          <div style={styles.settingsSection}>
            <h3 style={styles.sectionTitle}>自定義分類管理</h3>
            <form onSubmit={handleAddCategory} style={styles.responsiveFormRow}>
              <input type="text" placeholder="主分類 (如: 飲食)" value={newMainCat} onChange={(e) => setNewMainCat(e.target.value)} style={styles.inputNote} />
              <input type="text" placeholder="子分類 (如: 咖啡)" value={newSubCat} onChange={(e) => setNewSubCat(e.target.value)} style={styles.inputNote} />
              <button type="submit" style={{...styles.button, padding: '12px 20px'}}>加分類</button>
            </form>
            
            <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {rawCategories.map(cat => (
                <div key={cat.id} style={styles.settingsItemRow}>
                  <div style={styles.catNameContainer}>
                    <span style={{color: '#fff', wordBreak: 'break-all'}}>{cat.main_category}</span>
                    <span style={{color: '#444', margin: '0 6px', flexShrink: 0}}>➔</span>
                    <span style={{color: '#aaa', wordBreak: 'break-all'}}>{cat.sub_category}</span>
                  </div>
                  <span onClick={() => handleDeleteCategory(cat.id)} style={styles.deleteBtn}>×</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🖤 支援 iPad / Mobile 的響應式極黑樣式
const styles = {
  container: { backgroundColor: '#000000', color: '#aaaaaa', minHeight: '100vh', width: '100%', maxWidth: '600px', margin: '0 auto', padding: '20px 16px 100px 16px', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  nav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '600px', backgroundColor: '#050505', borderTop: '1px solid #111111', display: 'flex', justifyContent: 'space-around', padding: '16px 0', zIndex: 1000 },
  navLink: { color: '#555555', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  navActive: { color: '#ffffff', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #fff', paddingBottom: '4px' },
  form: { width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' },
  inputAmount: { backgroundColor: '#000', border: 'none', borderBottom: '2px solid #222', color: '#fff', fontSize: '44px', textAlign: 'center', width: '100%', outline: 'none', fontFamily: 'monospace', padding: '10px 0' },
  row: { display: 'flex', gap: '10px', width: '100%', alignItems: 'center' },
  
  responsiveRow: { display: 'flex', gap: '8px', width: '100%', flexWrap: 'nowrap' },
  select: { backgroundColor: '#050505', border: '1px solid #222', color: '#fff', padding: '12px 8px', fontSize: '14px', flex: 1, minWidth: 0, outline: 'none', cursor: 'pointer', fontFamily: 'monospace', borderRadius: '4px' },
  responsiveFormRow: { display: 'flex', gap: '10px', width: '100%', flexDirection: 'row', flexWrap: 'wrap' },
  
  inputNote: { backgroundColor: '#050505', border: '1px solid #222', color: '#fff', padding: '12px', fontSize: '15px', flex: 1, minWidth: '120px', outline: 'none', fontFamily: 'monospace', borderRadius: '4px', boxSizing: 'border-box' },
  colorPicker: { backgroundColor: '#000', border: '1px solid #222', width: '45px', height: '45px', padding: 0, cursor: 'pointer', borderRadius: '4px', flexShrink: 0 },
  button: { backgroundColor: '#ffffff', color: '#000000', border: 'none', padding: '0 16px', height: '45px', fontSize: '15px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'monospace', borderRadius: '4px', flexShrink: 0 },
  divider: { width: '100%', border: 'none', borderTop: '1px solid #111111', margin: '24px 0' },
  list: { width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' },
  
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #111111', gap: '10px' },
  itemLeft: { display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: 0, flexWrap: 'wrap' },
  itemRight: { display: 'flex', alignItems: 'center', flexShrink: 0 },
  catText: { color: '#666666', fontSize: '13px', wordBreak: 'break-all' },
  noteText: { color: '#444444', fontSize: '13px', wordBreak: 'break-all' },
  
  settingsContainer: { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' },
  settingsSection: { width: '100%', boxSizing: 'border-box' },
  sectionTitle: { color: '#fff', fontSize: '16px', marginBottom: '12px' },
  settingsItemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #111', paddingBottom: '8px', gap: '15px', width: '100%' },
  catNameContainer: { display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, flexWrap: 'wrap', fontSize: '14px' },
  deleteBtn: { color: '#555', cursor: 'pointer', fontSize: '20px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, userSelect: 'none' },

  // 📊 統計面板專屬優化樣式 (保持極簡黑魂味)
  statsContainer: { width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', boxSizing: 'border-box' },
  totalBlock: { backgroundColor: '#050505', border: '1px solid #111', padding: '16px', borderRadius: '4px', textAlign: 'center' },
  statsLabel: { color: '#444', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' },
  totalText: { color: '#fff', fontSize: '32px', fontWeight: 'bold', marginTop: '4px' },
  statsGrid: { display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap' },
  statsCard: { backgroundColor: '#050505', border: '1px solid #111', padding: '12px', borderRadius: '4px', flex: 1, minWidth: '240px', boxSizing: 'border-box' },
  statsCardTitle: { color: '#555', fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #111', paddingBottom: '6px', marginBottom: '8px' },
  statsCardList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  statsCardItem: { display: 'flex', alignItems: 'center', fontSize: '13px', width: '100%' },
  dot: { width: '8px', height: '8px', borderRadius: '50%', marginRight: '8px', flexShrink: 0 }
};