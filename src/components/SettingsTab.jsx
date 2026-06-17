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
    return [...rawCategories].sort((a, b) => {
      switch (sortBy) {
        case 'alpha-asc':
          return a.main_category.localeCompare(b.main_category) || a.sub_category.localeCompare(b.sub_category);
        case 'alpha-desc':
          return b.main_category.localeCompare(a.main_category) || b.sub_category.localeCompare(a.sub_category);
        case 'date-asc':
          return a.id - b.id;
        case 'date-desc':
        default:
          return b.id - a.id;
      }
    });
  }, [rawCategories, sortBy]);

  const existingMainCats = useMemo(() => {
    return Array.from(new Set(rawCategories.map((category) => category.main_category))).sort((a, b) => a.localeCompare(b));
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
      const hasSubMatch = categoryGroups[mainCategory].some((item) => item.sub_category.toLowerCase().includes(keyword));
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
    <S.SettingsContainer>
      <S.SettingsSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <S.SectionTitle style={{ margin: 0 }}>成員名單</S.SectionTitle>
          <button
            onClick={() => setShowMemberList(!showMemberList)}
            style={{
              background: 'none',
              border: 'none',
              color: '#aaa',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0 4px',
            }}
          >
            {showMemberList ? '▼' : '▶'}
          </button>
        </div>

        {showMemberList && (
          <>
            <S.Row as="form" onSubmit={onAddMember} style={{ gap: '8px' }}>
              <S.TextInput
                name="newMemberName"
                type="text"
                placeholder="新成員名..."
                value={settingsForm.newMemberName}
                onChange={onSettingsInput}
              />
              <S.ColorInput
                name="newMemberColor"
                type="color"
                value={settingsForm.newMemberColor}
                onChange={onSettingsInput}
              />
              <S.Button type="submit">加人</S.Button>
            </S.Row>

            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {members.map((member) => (
                <S.SettingsItemRow key={member.id}>
                  <span style={{ color: member.color, fontWeight: 'bold' }}>{member.name}</span>
                  <S.DeleteButton onClick={() => onDeleteMember(member.id)}>×</S.DeleteButton>
                </S.SettingsItemRow>
              ))}
            </div>
          </>
        )}
      </S.SettingsSection>

      <S.Divider />

      <S.SettingsSection>
        <S.SectionTitle>自定義分類管理</S.SectionTitle>

        {/* Sort Controls */}
        <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              backgroundColor: '#050505',
              border: '1px solid #222',
              color: '#fff',
              padding: '8px 10px',
              fontSize: '12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            <option value="date-desc">最新優先</option>
            <option value="date-asc">最舊優先</option>
            <option value="alpha-asc">A-Z 升序</option>
            <option value="alpha-desc">Z-A 降序</option>
          </select>
          <span style={{ color: '#666', fontSize: '12px', alignSelf: 'center' }}>
            共 {sortedCategories.length} 個分類
          </span>
        </div>

        <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <S.TextInput
            name="categorySearch"
            type="text"
            placeholder="搜尋分類..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: '1 1 220px' }}
          />
          <S.Button type="button" onClick={() => setSearchTerm('')} style={{ padding: '12px 20px' }}>
            清除
          </S.Button>
        </div>

        <S.ResponsiveFormRow as="form" onSubmit={onAddCategory} style={{ flexWrap: 'wrap', gap: '8px' }}>
          <select
            name="selectedMainCat"
            value={settingsForm.selectedMainCat}
            onChange={onSettingsInput}
            style={{
              backgroundColor: '#050505',
              border: '1px solid #222',
              color: '#fff',
              padding: '12px 10px',
              fontSize: '12px',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: '1 1 180px',
              minWidth: '160px',
            }}
          >
            <option value="">新增主分類</option>
            {existingMainCats.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <S.TextInput
            name="newMainCat"
            type="text"
            placeholder="或直接輸入新主分類"
            value={settingsForm.newMainCat}
            onChange={onSettingsInput}
            disabled={Boolean(settingsForm.selectedMainCat)}
            style={{
              flex: '1 1 220px',
              opacity: settingsForm.selectedMainCat ? 0.5 : 1,
              cursor: settingsForm.selectedMainCat ? 'not-allowed' : 'text',
            }}
          />

          <S.TextInput
            name="newSubCat"
            type="text"
            placeholder="子分類 (如: 咖啡)"
            value={settingsForm.newSubCat}
            onChange={onSettingsInput}
            style={{ flex: '1 1 220px' }}
          />

          <S.Button type="submit" style={{ padding: '12px 20px' }}>
            加分類
          </S.Button>
        </S.ResponsiveFormRow>

        <div style={{ color: '#666', fontSize: '12px', marginTop: '6px' }}>
          若選擇已有主分類，子分類將加入這個分類；若未選擇，則新增一個新主分類。
        </div>

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {visibleGroupKeys.map((mainCategory) => (
            <div key={mainCategory} style={{ border: '1px solid #222', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>{mainCategory}</div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    {categoryGroups[mainCategory].length} 個子分類
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleGroup(mainCategory)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#aaa',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: 0,
                  }}
                >
                  {isGroupExpanded(mainCategory) ? '▼' : '▶'}
                </button>
              </div>

              {isGroupExpanded(mainCategory) && (
                <div style={{ marginTop: '12px', display: 'grid', gap: '10px' }}>
                  {categoryGroups[mainCategory].map((category) => (
                    <S.SettingsItemRow key={category.id}>
                      <S.CatNameContainer>
                        <span style={{ color: '#fff', wordBreak: 'break-all' }}>{category.sub_category}</span>
                      </S.CatNameContainer>
                      <S.DeleteButton onClick={() => onDeleteCategory(category.id)}>×</S.DeleteButton>
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
