import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 🔌 初始化 Supabase 連線
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  // --- States ---
  const [view, setView] = useState('main'); // 'main' | 'settings'
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState({}); // 格式: { '飲食': ['早餐', '午餐'] }

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
    const { data: memData } = await supabase
      .from('members')
      .select('*')
      .order('id');
    if (memData) {
      setMembers(memData);
      if (memData.length > 0) setSelectedMember(memData[0].id);
    }

    // 2. 撈分類並處理成巢狀 Object
    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .order('id');
    if (catData) {
      const catObj = {};
      catData.forEach((item) => {
        if (!catObj[item.main_category]) {
          catObj[item.main_category] = [];
        }
        if (!catObj[item.main_category].includes(item.sub_category)) {
          catObj[item.main_category].push(item.sub_category);
        }
      });
      setCategories(catObj);

      const firstMain = Object.keys(catObj)[0];
      if (firstMain) {
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

    const { error } = await supabase.from('expenses').insert([
      {
        member_id: parseInt(selectedMember),
        amount: parseFloat(amount),
        main_category: mainCat,
        sub_category: subCat,
        note: note,
      },
    ]);

    if (!error) {
      setAmount('');
      setNote('');
      fetchExpenses();
    }
  };

  // --- Actions: Settings ---
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName) return;
    const { error } = await supabase
      .from('members')
      .insert([{ name: newMemberName, color: newMemberColor }]);
    if (!error) {
      setNewMemberName('');
      fetchInitialData();
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newMainCat || !newSubCat) return;
    const { error } = await supabase
      .from('categories')
      .insert([{ main_category: newMainCat, sub_category: newSubCat }]);
    if (!error) {
      setNewMainCat('');
      setNewSubCat('');
      fetchInitialData();
    }
  };

  // --- Helpers ---
  const getMember = (id) =>
    members.find((m) => m.id === id) || { name: 'Unknown', color: '#888888' };

  return (
    <div style={styles.container}>
      {/* 頂部導航 */}
      <nav style={styles.nav}>
        <span
          style={view === 'main' ? styles.navActive : styles.navLink}
          onClick={() => setView('main')}
        >
          流水帳
        </span>
        <span
          style={view === 'settings' ? styles.navActive : styles.navLink}
          onClick={() => setView('settings')}
        >
          設定 (分類/成員)
        </span>
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
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                style={{
                  ...styles.select,
                  color: getMember(parseInt(selectedMember)).color,
                }}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} style={{ color: m.color }}>
                    {m.name}
                  </option>
                ))}
              </select>

              <select
                value={mainCat}
                onChange={(e) => setMainCat(e.target.value)}
                style={styles.select}
              >
                {Object.keys(categories).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={subCat}
                onChange={(e) => setSubCat(e.target.value)}
                style={styles.select}
              >
                {categories[mainCat]?.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
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
              <button type="submit" style={styles.button}>
                ＋
              </button>
            </div>
          </form>

          <hr style={styles.divider} />

          {/* 紀錄列表 */}
          <div style={styles.list}>
            {records.map((rec) => {
              const mem = getMember(rec.member_id);
              return (
                <div key={rec.id} style={styles.listItem}>
                  <div style={styles.itemLeft}>
                    <span style={{ color: mem.color, fontWeight: 'bold' }}>
                      {mem.name}
                    </span>
                    <span style={styles.catText}>
                      {rec.main_category}·{rec.sub_category}
                    </span>
                    {rec.note && (
                      <span style={styles.noteText}>({rec.note})</span>
                    )}
                  </div>
                  <div style={{ color: mem.color, fontWeight: 'bold' }}>
                    ${parseFloat(rec.amount).toFixed(1)}
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
            <h3>新增成員口味</h3>
            <form onSubmit={handleAddMember} style={styles.row}>
              <input
                type="text"
                placeholder="名..."
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                style={styles.inputNote}
              />
              <input
                type="color"
                value={newMemberColor}
                onChange={(e) => setNewMemberColor(e.target.value)}
                style={styles.colorPicker}
              />
              <button type="submit" style={styles.button}>
                加人
              </button>
            </form>
            <div
              style={{
                marginTop: '10px',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              {members.map((m) => (
                <span
                  key={m.id}
                  style={{
                    color: m.color,
                    border: '1px solid #222',
                    padding: '4px 8px',
                  }}
                >
                  {m.name}
                </span>
              ))}
            </div>
          </div>

          <hr style={styles.divider} />

          <div style={styles.settingsSection}>
            <h3>新增自定義分類</h3>
            <form onSubmit={handleAddCategory} style={styles.row}>
              <input
                type="text"
                placeholder="主分類 (e.g. 飲食)"
                value={newMainCat}
                onChange={(e) => setNewMainCat(e.target.value)}
                style={styles.inputNote}
              />
              <input
                type="text"
                placeholder="子分類 (e.g. 咖啡)"
                value={newSubCat}
                onChange={(e) => setNewSubCat(e.target.value)}
                style={styles.inputNote}
              />
              <button type="submit" style={styles.button}>
                加分類
              </button>
            </form>

            <div style={{ marginTop: '15px' }}>
              {Object.keys(categories).map((main) => (
                <div
                  key={main}
                  style={{ marginBottom: '8px', fontSize: '14px' }}
                >
                  <span style={{ color: '#fff' }}>{main}: </span>
                  <span style={{ color: '#666' }}>
                    {categories[main].join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🖤 Minimal Black Tune Styles
// 🖤 Minimal Black Tune Styles (手機完美優化版)
const styles = {
  container: { 
    backgroundColor: '#000000', 
    color: '#aaaaaa', 
    minHeight: '100vh', 
    width: '100%',
    maxWidth: '480px', // 喺電腦睇就限死呢個手機闊度，好似一條 Stream 咁，極簡美
    margin: '0 auto',
    padding: '20px 16px 80px 16px', // 底部留 80px 費事俾固定導航欄遮住
    fontFamily: 'monospace', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    boxSizing: 'border-box'
  },
  
  // 📱 下方固定導航欄 (好似原生 App 咁擺喺底，方便手指公撳)
  nav: { 
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#050505',
    borderTop: '1px solid #111111',
    display: 'flex', 
    justifyContent: 'space-around',
    padding: '15px 0',
    zIndex: 1000
  },
  navLink: { 
    color: '#555555', 
    cursor: 'pointer', 
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'color 0.2s'
  },
  navActive: { 
    color: '#ffffff', 
    cursor: 'pointer', 
    fontSize: '14px',
    fontWeight: 'bold',
    borderBottom: '2px solid #fff', 
    pb: '4px' 
  },

  form: { 
    width: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px',
    marginTop: '20px'
  },
  
  // 💰 金額輸入框加大，方便電話撳
  inputAmount: { 
    backgroundColor: '#000', 
    border: 'none', 
    borderBottom: '2px solid #222', 
    color: '#fff', 
    fontSize: '48px', // 字體夠大，iOS 唔會亂咁 Auto-zoom
    textAlign: 'center', 
    width: '100%', 
    outline: 'none', 
    fontFamily: 'monospace',
    padding: '10px 0'
  },
  
  row: { 
    display: 'flex', 
    gap: '10px', 
    width: '100%' 
  },
  
  // 強化手機 Select 觸控感
  select: { 
    backgroundColor: '#050505', 
    border: '1px solid #222', 
    color: '#fff', 
    padding: '12px', // 加厚少少好撳啲
    fontSize: '16px', // 關鍵：手機 input/select 超過 16px 就唔會觸發盲目 Zoom In
    flex: 1, 
    outline: 'none', 
    cursor: 'pointer', 
    fontFamily: 'monospace',
    borderRadius: '4px',
    WebkitAppearance: 'none' // 消除 iOS 預設嘅核突原生下拉箭咀
  },
  
  inputNote: { 
    backgroundColor: '#050505', 
    border: '1px solid #222', 
    color: '#fff', 
    padding: '12px', 
    fontSize: '16px', 
    flexGrow: 1, 
    outline: 'none', 
    fontFamily: 'monospace',
    borderRadius: '4px'
  },
  
  colorPicker: { 
    backgroundColor: '#000', 
    border: '1px solid #222', 
    width: '45px', 
    height: '45px', 
    padding: 0, 
    cursor: 'pointer',
    borderRadius: '4px'
  },
  
  button: { 
    backgroundColor: '#ffffff', 
    color: '#000000', 
    border: 'none', 
    padding: '0 20px', 
    fontSize: '18px',
    cursor: 'pointer', 
    fontWeight: 'bold', 
    fontFamily: 'monospace',
    borderRadius: '4px' 
  },
  
  divider: { 
    width: '100%', 
    borderColor: '#111111', 
    margin: '30px 0' 
  },
  
  // 📜 流水帳列表（手機版靈活調整）
  list: { 
    width: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px' 
  },
  listItem: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingBottom: '12px', 
    borderBottom: '1px solid #111111'
  },
  itemLeft: { 
    display: 'flex', 
    gap: '12px', 
    alignItems: 'center' 
  },
  catText: { 
    color: '#666666',
    fontSize: '14px' 
  },
  noteText: { 
    color: '#333333', 
    fontSize: '13px' 
  },
  settingsContainer: { 
    width: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
  },
  settingsSection: { 
    width: '100%' 
  }
};