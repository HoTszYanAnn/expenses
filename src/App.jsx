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
const styles = {
  container: {
    backgroundColor: '#000000',
    color: '#aaaaaa',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'monospace',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  nav: { display: 'flex', gap: '30px', marginBottom: '40px', fontSize: '14px' },
  navLink: { color: '#555555', cursor: 'pointer', textDecoration: 'none' },
  navActive: {
    color: '#ffffff',
    cursor: 'pointer',
    borderBottom: '1px solid #fff',
    pb: '2px',
  },
  form: {
    width: '100%',
    maxWidth: '450px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputAmount: {
    backgroundColor: '#000',
    border: 'none',
    borderBottom: '2px solid #222',
    color: '#fff',
    fontSize: '42px',
    textAlign: 'center',
    width: '100%',
    outline: 'none',
    fontFamily: 'monospace',
  },
  row: { display: 'flex', gap: '10px', width: '100%' },
  select: {
    backgroundColor: '#000',
    border: '1px solid #222',
    color: '#fff',
    padding: '10px',
    flex: 1,
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'monospace',
  },
  inputNote: {
    backgroundColor: '#000',
    border: '1px solid #222',
    color: '#fff',
    padding: '10px',
    flexGrow: 1,
    outline: 'none',
    fontFamily: 'monospace',
  },
  colorPicker: {
    backgroundColor: '#000',
    border: '1px solid #222',
    width: '40px',
    height: '40px',
    padding: 0,
    cursor: 'pointer',
  },
  button: {
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    padding: '0 15px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  divider: {
    width: '100%',
    maxWidth: '450px',
    borderColor: '#111111',
    margin: '25px 0',
  },
  list: {
    width: '100%',
    maxWidth: '450px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  listItem: {
    display: 'flex',
    justifyIntersection: 'space-between',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '10px',
    borderBottom: '1px solid #111',
    fontSize: '14px',
  },
  itemLeft: { display: 'flex', gap: '10px', alignItems: 'center' },
  catText: { color: '#555' },
  noteText: { color: '#333', fontSize: '12px' },
  settingsContainer: {
    width: '100%',
    maxWidth: '450px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  settingsSection: { width: '100%' },
};
