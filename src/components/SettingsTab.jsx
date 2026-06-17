import React, { useState } from 'react';
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

  const sortedCategories = [...rawCategories].sort((a, b) => {
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

        <S.ResponsiveFormRow as="form" onSubmit={onAddCategory}>
          <S.TextInput
            name="newMainCat"
            type="text"
            placeholder="主分類 (如: 飲食)"
            value={settingsForm.newMainCat}
            onChange={onSettingsInput}
          />
          <S.TextInput
            name="newSubCat"
            type="text"
            placeholder="子分類 (如: 咖啡)"
            value={settingsForm.newSubCat}
            onChange={onSettingsInput}
          />
          <S.Button type="submit" style={{ padding: '12px 20px' }}>
            加分類
          </S.Button>
        </S.ResponsiveFormRow>

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sortedCategories.map((category) => (
            <S.SettingsItemRow key={category.id}>
              <S.CatNameContainer>
                <span style={{ color: '#fff', wordBreak: 'break-all' }}>{category.main_category}</span>
                <span style={{ color: '#444', margin: '0 6px', flexShrink: 0 }}>➔</span>
                <span style={{ color: '#aaa', wordBreak: 'break-all' }}>{category.sub_category}</span>
              </S.CatNameContainer>
              <S.DeleteButton onClick={() => onDeleteCategory(category.id)}>×</S.DeleteButton>
            </S.SettingsItemRow>
          ))}
        </div>
      </S.SettingsSection>
    </S.SettingsContainer>
  );
}
