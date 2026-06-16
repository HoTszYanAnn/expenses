import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 🔌 初始化 Supabase 連線 (請確保 Key 正確，RLS 已 Disable)
const supabaseUrl = "https://uphtmvoshxwiuymapjen.supabase.co";
const supabaseAnonKey = "貼上你嗰串 eyJ 開頭嘅超級長 anon public key"; 
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  // --- States ---
  const [view, setView] = useState('main'); // 'main' | 'settings'
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState({}); // { '飲食': ['早餐', '午餐'] }
  const [rawCategories, setRawCategories] = useState([]); // 儲存未經處理的分類 raw data 方便刪除

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
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    // 1. 撈成員
    const { data: memData } = await supabase.from('members').select('*').order('id');
    if (memData) {
      setMembers(memData);
      if (memData.length > 0 && !selectedMember) setSelectedMember(memData[0].id);
    }

    // 2. 撈分類
    const { data: catData } = await supabase.from('categories').select('*').order('id');
    if (catData) {
      setRawCategories(catData);
      const catObj = {};
      catData.forEach(item => {
        if (!catObj[item.main_category]) {
          catObj[item.main_category] = [];
        }
        if (!catObj[item.main_category].includes(item.sub_category)) {
          catObj[item.main_category].push(item.sub_category);
        }
      });
      setCategories(catObj);
      
      const firstMain = Object.keys(catObj)[0];
      if (firstMain && !mainCat) {
        setMainCat(firstMain);
        setSubCat(catObj[firstMain][0] || '');
      }
    }

    // 3. 撈支出紀錄
    fetchExpenses();
  };

  const fetchExpenses = async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRecords(data);
  };

  // 當主分類轉變，自動連動子分類
  useEffect(() => {
    if (categories[mainCat]) {
      setSubCat(categories[mainCat][0] || '');
    }
  }, [mainCat, categories]);

  // --- Actions: Submit Expense ---
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;

    const { error } = await supabase.from('expenses').insert([{
      member_id: parseInt(selectedMember),
      amount: parseFloat(amount),
      main_category: mainCat,
      sub_category: subCat,
      note: note
    }]);

    if (!error) {
      setAmount('');
      setNote('');
      fetchExpenses();
    }
  };

  // 🗑️ 刪除流水帳項目
  const handleDeleteExpense = async (id) => {
    if (window.confirm('確定要刪除呢筆帳目？')) {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (!error) {
        fetchExpenses();
      }
    }
  };

  // --- Actions: Settings ---
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName) return;
    const { error } = await supabase.from('members').insert([{ name: newMemberName, color: newMemberColor }]);
    if (!error) {
      setNewMemberName('');
      fetchInitialData();
    }
  };

  // 🗑️ 刪除成員 (注意：根據我們寫的 SQL，刪除成員會連帶刪除該成員所有帳目)
  const handleDeleteMember = async (id) => {
    if (window.confirm('警告：刪除成員會一併刪除佢所有記帳紀錄！確定？')) {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (!error) {
        fetchInitialData();
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newMainCat || !newSubCat) return;
    const { error } = await supabase.from('categories').insert([{ main_category: newMainCat, sub_category: newSubCat }]);
    if (!error) {
      setNewMainCat('');
      setNewSubCat('');
      fetchInitialData();
    }
  };

  // 🗑️ 刪除特定子分類
  const handleDeleteCategory = async (id) => {
    if (window.confirm('確定要刪除呢個分類？')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) {
        fetchInitialData();
      }
    }
  };

  // --- Helpers ---
  const getMember = (id) => members.find(m => m.id === id) || { name: 'Unknown', color: '#888888' };

  return (
    <div style={styles.container}>
      {/* 📱 下方固定導航欄 */}
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

            <div style={styles.row}>
              <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} style={{...styles.select, color: getMember(parseInt(selectedMember)).color}}>
                {members.map(m => <option key={m.id} value={m.id} style={{color: m.color}}>{m.name}</option>)}
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

          <hr style={styles.divider} />

          {/* 紀錄列表 */}
          <div style={styles.list}>
            {records.map(rec => {
              const mem = getMember(rec.member_id);
              return (
                <div key={rec.id} style={styles.listItem}>
                  <div style={styles.itemLeft}>
                    <span style={{ color: mem.color, fontWeight: 'bold' }}>{mem.name}</span>
                    <span style={styles.catText}>{rec.main_category}·{rec.sub_category}</span>
                    {rec.note && <span style={styles.noteText}>({rec.note})</span>}
                  </div>
                  <div style={styles.itemRight}>
                    <span style={{ color: mem.color, fontWeight: 'bold', marginRight: '15px' }}>
                      ${parseFloat(rec.amount).toFixed(1)}
                    </span>
                    {/* 🗑️ 刪除此行連結 */}
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
            <h3>成員名單</h3>
            <form onSubmit={handleAddMember} style={styles.row}>
              <input type="text" placeholder="新成員名..." value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} style={styles.inputNote} />
              <input type="color" value={newMemberColor} onChange={(e) => setNewMemberColor(e.target.value)} style={styles.colorPicker} />
              <button type="submit" style={styles.button}>加人</button>
            </form>
            <div style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {members.map(m => (
                <div key={m.id} style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #111', paddingBottom: '6px'}}>
                  <span style={{color: m.color}}>{m.name}</span>
                  <span onClick={() => handleDeleteMember(m.id)} style={styles.deleteBtn}>×</span>
                </div>
              ))}
            </div>
          </div>

          <hr style={styles.divider} />

          <div style={styles.settingsSection}>
            <h3>自定義分類管理</h3>
            <form onSubmit={handleAddCategory} style={styles.row}>
              <input type="text" placeholder="主分類 (如: 飲食)" value={newMainCat} onChange={(e) => setNewMainCat(e.target.value)} style={styles.inputNote} />
              <input type="text" placeholder="子分類 (如: 咖啡)" value={newSubCat} onChange={(e) => setNewSubCat(e.target.value)} style={styles.inputNote} />
              <button type="submit" style={styles.button}>加分類</button>
            </form>
            
            <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {rawCategories.map(cat => (
                <div key={cat.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', borderBottom: '1px solid #111', paddingBottom: '6px'}}>
                  <div>
                    <span style={{color: '#fff'}}>{cat.main_category}</span>
                    <span style={{color: '#666', margin: '0 8px'}}>➔</span>
                    <span style={{color: '#aaa'}}>{cat.sub_category}</span>
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

// 🖤 Minimal Black Tune Styles (手機完美優化版)
const styles = {
  container: { backgroundColor: '#000000', color: '#aaaaaa', minHeight: '100vh', width: '100%', maxWidth: '480px', margin: '0 auto', padding: '20px 16px 80px 16px', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' },
  nav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', backgroundColor: '#050505', borderTop: '1px solid #111111', display: 'flex', justifyContent: 'space-around', padding: '15px 0', zIndex: 1000 },
  navLink: { color: '#555555', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  navActive: { color: '#ffffff', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #fff', pb: '4px' },
  form: { width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' },
  inputAmount: { backgroundColor: '#000', border: 'none', borderBottom: '2px solid #222', color: '#fff', fontSize: '48px', textAlign: 'center', width: '100%', outline: 'none', fontFamily: 'monospace', padding: '10px 0' },
  row: { display: 'flex', gap: '10px', width: '100%' },
  select: { backgroundColor: '#050505', border: '1px solid #222', color: '#fff', padding: '12px', fontSize: '16px', flex: 1, outline: 'none', cursor: 'pointer', fontFamily: 'monospace', borderRadius: '4px', WebkitAppearance: 'none' },
  inputNote: { backgroundColor: '#050505', border: '1px solid #222', color: '#fff', padding: '12px', fontSize: '16px', flexGrow: 1, outline: 'none', fontFamily: 'monospace', borderRadius: '4px' },
  colorPicker: { backgroundColor: '#000', border: '1px solid #222', width: '45px', height: '45px', padding: 0, cursor: 'pointer', borderRadius: '4px' },
  button: { backgroundColor: '#ffffff', color: '#000000', border: 'none', padding: '0 20px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'monospace', borderRadius: '4px' },
  divider: { width: '100%', borderColor: '#111111', margin: '30px 0' },
  list: { width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #111111' },
  itemLeft: { display: 'flex', gap: '12px', alignItems: 'center' },
  itemRight: { display: 'flex', alignItems: 'center' },
  catText: { color: '#666666', fontSize: '14px' },
  noteText: { color: '#333333', fontSize: '13px' },
  deleteBtn: { color: '#555', cursor: 'pointer', fontSize: '18px', padding: '0 5px', fontWeight: 'bold', transition: 'color 0.2s' },
  settingsContainer: { width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' },
  settingsSection: { width: '100%' }
};