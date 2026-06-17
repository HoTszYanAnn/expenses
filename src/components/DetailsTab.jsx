import React, { useState, useMemo } from 'react';
import * as S from './ExpenseTracker.styles.jsx';

export default function DetailsTab({ groupedRecords = [], members = [], onDeleteExpense, findMember, formatCurrency }) {
  const [selectedRecord, setSelectedRecord] = useState(null);

  // 💊 藥丸選單過濾與排序狀態
  const [activeMemberFilter, setActiveMemberFilter] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
  const [isSortByAmount, setIsSortByAmount] = useState(false);

  const closeModal = () => setSelectedRecord(null);

  // 🧠 1. 動態提取當前畫面上「有開銷嘅主分類清單」用作動態生成分類藥丸
  const activeCategories = useMemo(() => {
    const cats = new Set();
    groupedRecords.forEach(group => {
      if (group && Array.isArray(group.items)) {
        group.items.forEach(item => {
          if (item && item.main_category) cats.add(item.main_category);
        });
      }
    });
    return Array.from(cats).sort();
  }, [groupedRecords]);

  // ⚡ 2. 核心處理：根據藥丸選取狀態，重新運算及過濾要顯示的數據結構
  const filteredGroupedRecords = useMemo(() => {
    if (isSortByAmount) {
      const allItems = [];
      groupedRecords.forEach(group => {
        if (group && Array.isArray(group.items)) {
          group.items.forEach(item => {
            if (activeMemberFilter !== null && item.member_id == activeMemberFilter) { /* match */ }
            else if (activeMemberFilter !== null) return;

            if (activeCategoryFilter !== null && String(item.main_category).trim() === String(activeCategoryFilter).trim()) { /* match */ }
            else if (activeCategoryFilter !== null) return;

            allItems.push(item);
          });
        }
      });

      allItems.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));

      return allItems.length > 0 ? [{
        date: '🔥 全月大額排行精算',
        total: allItems.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        items: allItems
      }] : [];
    }

    const resultGroups = [];
    groupedRecords.forEach(group => {
      if (!group || !Array.isArray(group.items)) return;

      const matchedItems = group.items.filter(item => {
        if (activeMemberFilter !== null && item.member_id == activeMemberFilter) { /* match */ }
        else if (activeMemberFilter !== null) return false;

        if (activeCategoryFilter !== null && String(item.main_category).trim() === String(activeCategoryFilter).trim()) { /* match */ }
        else if (activeCategoryFilter !== null) return false;

        return true;
      });

      if (matchedItems.length > 0) {
        const newTotal = matchedItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        resultGroups.push({
          ...group,
          total: newTotal,
          items: matchedItems
        });
      }
    });

    return resultGroups;
  }, [groupedRecords, activeMemberFilter, activeCategoryFilter, isSortByAmount]);

  return (
    <div style={{ width: '100%' }}>
      <S.SectionTitle style={{ fontSize: '14px', color: '#8a94aa', fontWeight: '500', marginBottom: '12px' }}>
        歷史流水帳明細
      </S.SectionTitle>

      {/* 💊 📱 完美滑動修復版：左右橫向滑動全功能藥丸列 */}
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
          touchAction: 'pan-x',              /* 🌟 核心：告訴手機網頁只允許橫向滑動，防止手勢衝突 */
          WebkitOverflowScrolling: 'touch',  /* 🌟 核心：開啟 iOS 原生絲滑滾動阻尼感 */
          whiteSpace: 'nowrap'               /* 🌟 核心：防止內容被迫換行 */
        }} 
        hide-scrollbar="true"
      >
        {/* A. 排序切換藥丸 */}
        <button
          type="button"
          onClick={() => setIsSortByAmount(!isSortByAmount)}
          style={{
            display: 'inline-flex',          /* 🌟 核心：確保按鈕不被內縮 */
            alignItems: 'center',
            whiteSpace: 'nowrap',
            padding: '6px 14px',
            fontSize: '11px',
            borderRadius: '20px',
            border: isSortByAmount ? '1px solid rgba(248, 113, 113, 0.4)' : '1px solid rgba(255,255,255,0.04)',
            background: isSortByAmount ? 'rgba(248, 113, 113, 0.1)' : 'rgba(255,255,255,0.02)',
            color: isSortByAmount ? '#f87171' : '#8a94aa',
            fontWeight: isSortByAmount ? '700' : '500',
            cursor: 'pointer',
            flexShrink: 0                    /* 🌟 核心：防止被 Flex 機制擠扁 */
          }}
        >
          {isSortByAmount ? '🔥 大額優先' : '🕒 時間排序'}
        </button>

        <span style={{ width: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 2px', flexShrink: 0 }} />

        {/* B. 成員切換藥丸 */}
        <button
          type="button"
          onClick={() => setActiveMemberFilter(null)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            padding: '6px 14px',
            fontSize: '11px',
            borderRadius: '20px',
            border: activeMemberFilter === null ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
            background: activeMemberFilter === null ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.01)',
            color: activeMemberFilter === null ? '#fff' : '#67718a',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          👥 全員
        </button>
        
        {members.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveMemberFilter(activeMemberFilter == m.id ? null : m.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              padding: '6px 14px',
              fontSize: '11px',
              borderRadius: '20px',
              border: activeMemberFilter == m.id ? `1px solid ${m.color}` : '1px solid transparent',
              background: activeMemberFilter == m.id ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
              color: activeMemberFilter == m.id ? m.color : '#8a94aa',
              fontWeight: activeMemberFilter == m.id ? '600' : '500',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {m.name}
          </button>
        ))}

        <span style={{ width: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 2px', flexShrink: 0 }} />

        {/* C. 主分類過濾藥丸 */}
        {activeCategories.map(cat => (
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
              border: activeCategoryFilter === cat ? '1px solid #34d399' : '1px solid transparent',
              background: activeCategoryFilter === cat ? 'rgba(52, 211, 153, 0.12)' : 'rgba(255,255,255,0.01)',
              color: activeCategoryFilter === cat ? '#34d399' : '#8a94aa',
              fontWeight: activeCategoryFilter === cat ? '600' : '500',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 歷史清單 */}
      {filteredGroupedRecords.length > 0 ? (
        <S.TimelineContainer style={{ marginTop: '0', gap: '12px' }}>
          {filteredGroupedRecords.map((group) => (
            <S.DateGroup key={group.date} style={{ marginBottom: '8px' }}>
              <S.DateHeader>
                <S.DateTitle style={{ fontSize: '12px', color: '#fff', opacity: 0.9 }}>{group.date}</S.DateTitle>
                <S.DateTotal style={{ fontSize: '11px', color: '#67718a' }}>
                  計: {formatCurrency(group.total)}
                </S.DateTotal>
              </S.DateHeader>

              <S.DateItemList style={{ gap: '4px' }}>
                {group.items.map((record) => {
                  const member = findMember(members, record.member_id);
                  return (
                    <S.ListItem key={record.id} onClick={() => setSelectedRecord({ record, member })}>
                      <S.ItemLeft style={{ gap: '8px' }}>
                        <S.MemberDot style={{ backgroundColor: member.color, width: '8px', height: '8px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <S.CatText style={{ fontSize: '12px', color: '#e5e7eb' }}>
                            {record.main_category} · {record.sub_category}
                          </S.CatText>
                          {record.note && (
                            <S.NoteText style={{ fontSize: '11px', color: '#67718a', marginTop: '1px' }}>
                              {record.note}
                            </S.NoteText>
                          )}
                        </div>
                      </S.ItemLeft>
                      <S.ItemRight style={{ minWidth: 'auto' }}>
                        <span style={{ color: member.color, fontWeight: '600', fontSize: '13px', letterSpacing: '-0.02em' }}>
                          {formatCurrency(record.amount)}
                        </span>
                      </S.ItemRight>
                    </S.ListItem>
                  );
                })}
              </S.DateItemList>
            </S.DateGroup>
          ))}
        </S.TimelineContainer>
      ) : (
        <S.EmptyState>清單空空如也 👩‍❤️‍👨</S.EmptyState>
      )}

      {/* Modal 彈窗 */}
      {selectedRecord && (
        <S.ModalOverlay onClick={closeModal} style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
          <S.ModalCard style={{ backgroundColor: '#0b0f19', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px 20px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '15px', letterSpacing: '0.05em' }}>交易明細</div>
              <div style={{ color: '#5c6679', fontSize: '11px', marginTop: '4px' }}>
                {new Date(selectedRecord.record.created_at).toLocaleString('zh-HK', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </S.ModalHeader>
            
            <S.ModalBody style={{ gap: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '20px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: selectedRecord.member.color }} />
                <span style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: '500' }}>{selectedRecord.member.name}</span>
              </div>
              
              <div style={{ marginTop: '4px' }}>
                <div style={{ color: '#5c6679', fontSize: '11px', letterSpacing: '0.02em' }}>分類</div>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500', marginTop: '2px' }}>
                  {selectedRecord.record.main_category} · {selectedRecord.record.sub_category}
                </div>
              </div>

              {selectedRecord.record.note && (
                <div>
                  <div style={{ color: '#5c6679', fontSize: '11px', letterSpacing: '0.02em' }}>備註</div>
                  <div style={{ color: '#e5e7eb', fontSize: '13px', marginTop: '2px', fontStyle: 'italic' }}>「 {selectedRecord.record.note} 」</div>
                </div>
              )}

              <div style={{ marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', width: '80%' }}>
                <div style={{ color: '#5c6679', fontSize: '11px', letterSpacing: '0.02em' }}>金額</div>
                <div style={{ color: '#fff', fontWeight: '700', fontSize: '26px', marginTop: '2px', letterSpacing: '-0.03em' }}>
                  {formatCurrency(selectedRecord.record.amount)}
                </div>
              </div>
            </S.ModalBody>
            
            <S.ModalFooter style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '10px', width: '100%' }}>
              <button
                type="button"
                onClick={closeModal}
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#a6aec7', borderRadius: '8px', padding: '10px 20px', fontSize: '12px', cursor: 'pointer', fontWeight: '500', flex: 1, maxWidth: '120px' }}
              >
                關閉
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteExpense(selectedRecord.record.id);
                  closeModal();
                }}
                style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#f87171', borderRadius: '8px', padding: '10px 20px', fontSize: '12px', cursor: 'pointer', fontWeight: '500', flex: 1, maxWidth: '120px' }}
              >
                刪除記錄
              </button>
            </S.ModalFooter>
          </S.ModalCard>
        </S.ModalOverlay>
      )}

      {/* 隱藏滾動條微光 CSS */}
      <style>{`
        [hide-scrollbar="true"]::-webkit-scrollbar { display: none !important; }
        [hide-scrollbar="true"] { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
    </div>
  );
}