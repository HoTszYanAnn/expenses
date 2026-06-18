import React, { useMemo, useState } from 'react';
import * as S from './ExpenseTracker.styles.jsx';

export default function SettingsTab({
  rawCategories,
  settingsForm,
  onSettingsInput,
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory, // ⚡ 喺外層傳入，負責處理改名、搬移同埋連動更新紀錄
}) {
  const [sortBy, setSortBy] = useState('date-desc');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null); // 💊 藥丸選取狀態
  const [editingId, setEditingId] = useState(null); // ✏️ 記錄邊個分類改緊名
  const [editForm, setEditForm] = useState({ main_category: '', sub_category: '' });

  // 🧠 1. 分類排序處理
  const sortedCategories = useMemo(() => {
    const categoriesToUse = Array.isArray(rawCategories) ? rawCategories : [];
    return [...categoriesToUse].sort((a, b) => {
      switch (sortBy) {
        case 'alpha-asc':
          return (a.main_category || '').localeCompare(b.main_category || '') || (a.sub_category || '').localeCompare(b.sub_category || '');
        case 'alpha-desc':
          return (b.main_category || '').localeCompare(a.main_category || '') || (b.sub_category || '').localeCompare(a.sub_category || '');
        case 'date-asc':
          return a.id - b.id;
        case 'date-desc':
        default:
          return b.id - a.id;
      }
    });
  }, [rawCategories, sortBy]);

  // 🧠 2. 提取所有現存主分類用嚟整新增下拉清單
  const existingMainCats = useMemo(() => {
    const categoriesToUse = Array.isArray(rawCategories) ? rawCategories : [];
    return Array.from(new Set(categoriesToUse.map((category) => category.main_category).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [rawCategories]);

  // 🧠 3. 將分類分組
  const categoryGroups = useMemo(() => {
    const groups = {};
    sortedCategories.forEach((category) => {
      if (!groups[category.main_category]) {
        groups[category.main_category] = [];
      }
      groups[category.main_category].push(category);
    });
    return groups;
  }, [sortedCategories]);

  // 🧠 4. 基於 💊 Capsule 藥丸過濾顯示嘅主分類
  const visibleGroupKeys = useMemo(() => {
    const keys = Object.keys(categoryGroups);
    if (!activeCategoryFilter) return keys;
    return keys.filter(mainCat => mainCat === activeCategoryFilter);
  }, [categoryGroups, activeCategoryFilter]);

  // ✏️ 啟動編輯狀態
  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditForm({ main_category: cat.main_category, sub_category: cat.sub_category });
  };

  // 💾 儲存編輯結果（連動埋 Expense 紀錄）
  const handleSaveEdit = async (id, oldCat) => {
    if (!editForm.main_category.trim() || !editForm.sub_category.trim()) {
      window.alert('主分類同子分類都唔可以留空！');
      return;
    }
    
    // 呼叫外層傳入嘅異步更新功能
    await onUpdateCategory(id, oldCat, {
      main_category: editForm.main_category.trim(),
      sub_category: editForm.sub_category.trim()
    });
    
    setEditingId(null);
  };

  return (
    <S.SettingsContainer style={{ gap: '16px' }}>
      
      {/* 自定義分類管理區塊 */}
      <S.SettingsSection>
        <S.SectionTitle style={{ fontSize: '14px', color: '#8a94aa', fontWeight: '500', marginBottom: '12px' }}>
          自定義分類管理
        </S.SectionTitle>

        {/* 💊 📱 完美滑動藥丸列：拿走手動輸入，改用 Capsule 橫向快速篩選 */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            overflowY: 'hidden',
            gap: '6px',
            width: '100%',
            marginBottom: '14px',
            paddingBottom: '8px',
            touchAction: 'pan-x',
            WebkitOverflowScrolling: 'touch',
            whiteSpace: 'nowrap'
          }} 
          hide-scrollbar="true"
        >
          <button
            type="button"
            onClick={() => setActiveCategoryFilter(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              padding: '6px 14px',
              fontSize: '11px',
              borderRadius: '20px',
              border: activeCategoryFilter === null ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
              background: activeCategoryFilter === null ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.01)',
              color: activeCategoryFilter === null ? '#fff' : '#67718a',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            📂 全部顯示
          </button>
          
          {existingMainCats.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategoryFilter(activeCategoryFilter === cat ? null : cat)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                padding: '6px 14px',
                fontSize: '11px',
                borderRadius: '20px',
                border: activeCategoryFilter === cat ? '1px solid #ff8aa5' : '1px solid transparent',
                background: activeCategoryFilter === cat ? 'rgba(248, 138, 165, 0.12)' : 'rgba(255,255,255,0.01)',
                color: activeCategoryFilter === cat ? '#ff8aa5' : '#8a94aa',
                fontWeight: activeCategoryFilter === cat ? '600' : '500',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 工具列：排序及統計 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              backgroundColor: '#0b0f18',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#a6aec7',
              padding: '6px 10px',
              fontSize: '11px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <option value="date-desc">最新優先</option>
            <option value="date-asc">最舊優先</option>
            <option value="alpha-asc">A-Z 升序</option>
            <option value="alpha-desc">Z-A 降序</option>
          </select>
          <span style={{ color: '#5c6679', fontSize: '11px' }}>
            共 {sortedCategories.length} 個子分類組合
          </span>
        </div>

        {/* 新增分類 Form 卡片 */}
        <div style={{ background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '14px' }}>
          <S.ResponsiveFormRow as="form" onSubmit={onAddCategory} style={{ gap: '6px' }}>
            <select
              name="selectedMainCat"
              value={settingsForm?.selectedMainCat || ''}
              onChange={onSettingsInput}
              style={{
                backgroundColor: '#0b0f18',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#fff',
                padding: '0 10px',
                fontSize: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                flex: '1 1 100%',
                height: '34px'
              }}
            >
              <option value="">+ 新增全新主分類</option>
              {existingMainCats.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <S.TextInput
              name="newMainCat"
              type="text"
              placeholder="輸入新主分類名稱"
              value={settingsForm?.newMainCat || ''}
              onChange={onSettingsInput}
              disabled={Boolean(settingsForm?.selectedMainCat)}
              style={{
                flex: '1 1 45%',
                height: '34px',
                padding: '8px 12px',
                fontSize: '12px',
                borderRadius: '8px',
                opacity: settingsForm?.selectedMainCat ? 0.3 : 1,
                cursor: settingsForm?.selectedMainCat ? 'not-allowed' : 'text',
              }}
            />

            <S.TextInput
              name="newSubCat"
              type="text"
              placeholder="子分類 (如: 咖啡)"
              value={settingsForm?.newSubCat || ''}
              onChange={onSettingsInput}
              style={{ flex: '1 1 45%', height: '34px', padding: '8px 12px', fontSize: '12px', borderRadius: '8px' }}
            />

            <S.Button type="submit" style={{ width: '100%', minHeight: '34px', fontSize: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)' }}>
              確認加分類
            </S.Button>
          </S.ResponsiveFormRow>
        </div>

        {/* 分類樹狀清單 + ✏️ 內嵌編輯功能 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {visibleGroupKeys.map((mainCategory) => (
            <div key={mainCategory} style={{ border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.01)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#fff', fontWeight: '600', fontSize: '13px' }}>{mainCategory}</span>
                  <span style={{ color: '#5c6679', fontSize: '11px', marginLeft: '6px' }}>
                    ({categoryGroups[mainCategory].length})
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                {categoryGroups[mainCategory].map((category) => {
                  const isEditing = editingId === category.id;
                  return (
                    <S.SettingsItemRow key={category.id} style={{ padding: '6px 0', borderBottom: 'none', flexDirection: isEditing ? 'column' : 'row', alignItems: isEditing ? 'stretch' : 'center', gap: '8px' }}>
                      
                      {isEditing ? (
                        /* ✏️ 手機版極簡內嵌編輯面板 */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <S.TextInput
                              type="text"
                              value={editForm.main_category}
                              placeholder="主分類"
                              onChange={(e) => setEditForm({ ...editForm, main_category: e.target.value })}
                              style={{ height: '30px', padding: '4px 8px', fontSize: '11px', borderRadius: '6px' }}
                            />
                            <S.TextInput
                              type="text"
                              value={editForm.sub_category}
                              placeholder="子分類"
                              onChange={(e) => setEditForm({ ...editForm, sub_category: e.target.value })}
                              style={{ height: '30px', padding: '4px 8px', fontSize: '11px', borderRadius: '6px' }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button 
                              type="button" 
                              onClick={() => setEditingId(null)}
                              style={{ background: 'transparent', border: 'none', color: '#67718a', fontSize: '11px', cursor: 'pointer', padding: '4px 8px' }}
                            >
                              取消
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleSaveEdit(category.id, category)}
                              style={{ background: '#ff8aa5', border: 'none', color: '#000', fontSize: '11px', fontWeight: '600', borderRadius: '4px', cursor: 'pointer', padding: '4px 10px' }}
                            >
                              儲存更新
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* 顯示原始分類資料 */
                        <>
                          <S.CatNameContainer>
                            <span style={{ color: '#a6aec7', fontSize: '12px' }}>{category.sub_category}</span>
                          </S.CatNameContainer>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {/* ✏️ 編輯按鈕 */}
                            <button
                              type="button"
                              onClick={() => startEdit(category)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#5c6679',
                                cursor: 'pointer',
                                fontSize: '12px',
                                padding: '4px 8px',
                                transition: 'color 0.2s'
                              }}
                            >
                              ✏️
                            </button>
                            {/* ✕ 刪除按鈕 */}
                            <S.DeleteButton onClick={() => onDeleteCategory(category.id)} style={{ fontSize: '16px', width: '22px', height: '22px' }}>×</S.DeleteButton>
                          </div>
                        </>
                      )}

                    </S.SettingsItemRow>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </S.SettingsSection>

      {/* 隱藏滾動條樣式 */}
      <style>{`
        [hide-scrollbar="true"]::-webkit-scrollbar { display: none !important; }
        [hide-scrollbar="true"] { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
    </S.SettingsContainer>
  );
}