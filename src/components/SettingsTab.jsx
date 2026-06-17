import React, { useMemo, useState } from 'react';
import * as S from './ExpenseTracker.styles.jsx';

export default function SettingsTab({
  members,
  rawCategories,
  settingsForm,
  onSettingsInput,
  onAddMember,
  onDeleteMember,
  onAddCategory,
  onDeleteCategory,
}) {
  const [sortBy, setSortBy] = useState('date-desc');
  const [showMemberList, setShowMemberList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

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

  const existingMainCats = useMemo(() => {
    const categoriesToUse = Array.isArray(rawCategories) ? rawCategories : [];
    return Array.from(new Set(categoriesToUse.map((category) => category.main_category).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [rawCategories]);

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

  const visibleGroupKeys = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return Object.keys(categoryGroups).filter((mainCategory) => {
      if (!keyword) return true;
      const hasMainMatch = mainCategory.toLowerCase().includes(keyword);
      const hasSubMatch = categoryGroups[mainCategory].some((item) => (item.sub_category || '').toLowerCase().includes(keyword));
      return hasMainMatch || hasSubMatch;
    });
  }, [categoryGroups, searchTerm]);

  const toggleGroup = (mainCategory) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [mainCategory]: !(prev[mainCategory] ?? true),
    }));
  };

  const isGroupExpanded = (mainCategory) => expandedGroups[mainCategory] ?? true;

  return (
    <S.SettingsContainer style={{ gap: '16px' }}>
      
      {/* 成員名單區塊 */}
      <S.SettingsSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <S.SectionTitle style={{ margin: 0, fontSize: '14px', color: '#8a94aa', fontWeight: '500' }}>
            成員名單
          </S.SectionTitle>
          <button
            onClick={() => setShowMemberList(!showMemberList)}
            style={{
              background: 'none',
              border: 'none',
              color: '#5c6679',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '4px',
              transition: 'color 0.2s'
            }}
          >
            {showMemberList ? '隱藏 ▼' : '顯示 ▶'}
          </button>
        </div>

        {showMemberList && (
          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
            {/* 新增成員 Form */}
            <S.Row as="form" onSubmit={onAddMember} style={{ gap: '6px', flexDirection: 'row', alignItems: 'center' }}>
              <S.TextInput
                name="newMemberName"
                type="text"
                placeholder="新成員名..."
                value={settingsForm?.newMemberName || ''}
                onChange={onSettingsInput}
                style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px', height: '34px' }}
              />
              <S.ColorInput
                name="newMemberColor"
                type="color"
                value={settingsForm?.newMemberColor || '#000000'}
                onChange={onSettingsInput}
                style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none' }}
              />
              <S.Button type="submit" style={{ minHeight: '34px', padding: '0 14px', fontSize: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)' }}>
                加人
              </S.Button>
            </S.Row>

            {/* 成員列表清單 */}
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {members?.map((member) => (
                <S.SettingsItemRow key={member.id} style={{ padding: '6px 4px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: member.color }} />
                    <span style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: '500' }}>{member.name}</span>
                  </div>
                  <S.DeleteButton onClick={() => onDeleteMember(member.id)} style={{ fontSize: '16px', width: '24px', height: '24px' }}>×</S.DeleteButton>
                </S.SettingsItemRow>
              ))}
            </div>
          </div>
        )}
      </S.SettingsSection>

      <S.Divider style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)', margin: '4px 0' }} />

      {/* 自定義分類管理區塊 */}
      <S.SettingsSection>
        <S.SectionTitle style={{ fontSize: '14px', color: '#8a94aa', fontWeight: '500', marginBottom: '12px' }}>
          自定義分類管理
        </S.SectionTitle>

        {/* 工具列：篩選與搜尋 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              共 {sortedCategories.length} 個分類
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <S.TextInput
              name="categorySearch"
              type="text"
              placeholder="搜尋分類..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px', height: '34px', flex: 1 }}
            />
            {searchTerm && (
              <S.Button type="button" onClick={() => setSearchTerm('')} style={{ minHeight: '34px', padding: '0 12px', fontSize: '11px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', color: '#67718a' }}>
                清除
              </S.Button>
            )}
          </div>
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

        {/* 分類折疊樹狀清單 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {visibleGroupKeys.map((mainCategory) => (
            <div key={mainCategory} style={{ border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div onClick={() => toggleGroup(mainCategory)} style={{ cursor: 'pointer', flex: 1 }}>
                  <span style={{ color: '#fff', fontWeight: '600', fontSize: '13px' }}>{mainCategory}</span>
                  <span style={{ color: '#5c6679', fontSize: '11px', marginLeft: '6px' }}>
                    ({categoryGroups[mainCategory].length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleGroup(mainCategory)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#5c6679',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '4px',
                  }}
                >
                  {isGroupExpanded(mainCategory) ? '▼' : '▶'}
                </button>
              </div>

              {isGroupExpanded(mainCategory) && (
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '4px' }}>
                  {categoryGroups[mainCategory].map((category) => (
                    <S.SettingsItemRow key={category.id} style={{ padding: '4px 0', borderBottom: 'none' }}>
                      <S.CatNameContainer>
                        <span style={{ color: '#a6aec7', fontSize: '12px' }}>{category.sub_category}</span>
                      </S.CatNameContainer>
                      <S.DeleteButton onClick={() => onDeleteCategory(category.id)} style={{ fontSize: '16px', width: '22px', height: '22px' }}>×</S.DeleteButton>
                    </S.SettingsItemRow>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </S.SettingsSection>
    </S.SettingsContainer>
  );
}