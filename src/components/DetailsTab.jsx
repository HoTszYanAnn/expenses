import React, { useState, useMemo } from 'react';
import * as S from './ExpenseTracker.styles.jsx';

export default function DetailsTab({
  groupedRecords = [],
  members = [],
  categories = {},
  onDeleteExpense,
  onUpdateExpense,
  findMember,
  formatCurrency
}) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // 📦 編輯表單暫存狀態
  const [editForm, setEditForm] = useState({
    amount: '',
    member_id: '',
    main_category: '',
    sub_category: '',
    note: '',
    date: '',
    time: ''
  });

  // 💊 藥丸選單過濾與排序狀態
  const [activeMemberFilter, setActiveMemberFilter] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
  const [isSortByAmount, setIsSortByAmount] = useState(false);

  const closeModal = () => {
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (!selectedRecord) return;
    const { record } = selectedRecord;
    const dt = new Date(record.created_at);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const min = String(dt.getMinutes()).padStart(2, '0');

    setEditForm({
      amount: record.amount,
      member_id: record.member_id.toString(),
      main_category: record.main_category,
      sub_category: record.sub_category,
      note: record.note || '',
      date: `${yyyy}-${mm}-${dd}`,
      time: `${hh}:${min}`
    });
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMainCatChange = (e) => {
    const nextMain = e.target.value;
    const subList = categories[nextMain] || [];
    setEditForm(prev => ({
      ...prev,
      main_category: nextMain,
      sub_category: subList[0] || ''
    }));
  };

  const handleSaveUpdate = async () => {
    if (!editForm.amount || Number(editForm.amount) <= 0) {
      window.alert('請輸入有效金額！');
      return;
    }
    if (!editForm.main_category || !editForm.sub_category) {
      window.alert('請選擇完整主/子分類！');
      return;
    }

    const timestamp = new Date(`${editForm.date}T${editForm.time}:00`);

    const updatedPayload = {
      amount: Number(editForm.amount),
      member_id: Number(editForm.member_id),
      main_category: editForm.main_category,
      sub_category: editForm.sub_category,
      note: editForm.note.trim(),
      created_at: timestamp.toISOString()
    };

    await onUpdateExpense(selectedRecord.record.id, updatedPayload);
    closeModal();
  };

  // 🧠 動態生成分類藥丸
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

  // ⚡ 數據過濾
  const filteredGroupedRecords = useMemo(() => {
    if (isSortByAmount) {
      const allItems = [];
      groupedRecords.forEach(group => {
        if (group && Array.isArray(group.items)) {
          group.items.forEach(item => {
            if (activeMemberFilter !== null && item.member_id != activeMemberFilter) return;
            if (activeCategoryFilter !== null && String(item.main_category).trim() !== String(activeCategoryFilter).trim()) return;
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
        if (activeMemberFilter !== null && item.member_id != activeMemberFilter) return false;
        if (activeCategoryFilter !== null && String(item.main_category).trim() !== String(activeCategoryFilter).trim()) return false;
        return true;
      });
      if (matchedItems.length > 0) {
        const newTotal = matchedItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        resultGroups.push({ ...group, total: newTotal, items: matchedItems });
      }
    });
    return resultGroups;
  }, [groupedRecords, activeMemberFilter, activeCategoryFilter, isSortByAmount]);

  return (
    <div style={{ width: '100%' }}>
      <S.SectionTitle style={{ fontSize: '14px', color: '#8a94aa', fontWeight: '500', marginBottom: '12px' }}>
        歷史流水帳明細
      </S.SectionTitle>

      {/* 💊 滑動藥丸列 */}
      <div
        style={{
          display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', overflowX: 'auto', overflowY: 'hidden',
          gap: '6px', width: '100%', marginBottom: '14px', paddingBottom: '8px', touchAction: 'pan-x',
          WebkitOverflowScrolling: 'touch', whiteSpace: 'nowrap'
        }}
        hide-scrollbar="true"
      >
        <button
          type="button"
          onClick={() => setIsSortByAmount(!isSortByAmount)}
          style={{
            display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', padding: '6px 14px', fontSize: '11px', borderRadius: '20px',
            border: isSortByAmount ? '1px solid rgba(248, 113, 113, 0.4)' : '1px solid rgba(255,255,255,0.04)',
            background: isSortByAmount ? 'rgba(248, 113, 113, 0.1)' : 'rgba(255,255,255,0.02)',
            color: isSortByAmount ? '#f87171' : '#8a94aa', fontWeight: isSortByAmount ? '700' : '500', cursor: 'pointer', flexShrink: 0
          }}
        >
          {isSortByAmount ? '🔥 大額優先' : '🕒 時間排序'}
        </button>

        <span style={{ width: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 2px', flexShrink: 0 }} />

        {members.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveMemberFilter(activeMemberFilter == m.id ? null : m.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', padding: '6px 14px', fontSize: '11px', borderRadius: '20px',
              border: activeMemberFilter == m.id ? `1px solid ${m.color}` : '1px solid transparent',
              background: activeMemberFilter == m.id ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
              color: activeMemberFilter == m.id ? m.color : '#8a94aa', fontWeight: activeMemberFilter == m.id ? '600' : '500', cursor: 'pointer', flexShrink: 0
            }}
          >
            {m.name}
          </button>
        ))}

        <span style={{ width: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 2px', flexShrink: 0 }} />

        {activeCategories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategoryFilter(activeCategoryFilter === cat ? null : cat)}
            style={{
              display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', padding: '6px 14px', fontSize: '11px', borderRadius: '20px',
              border: activeCategoryFilter === cat ? '1px solid #60a5fa' : '1px solid transparent',
              background: activeCategoryFilter === cat ? 'rgba(96, 165, 250, 0.12)' : 'rgba(255,255,255,0.01)',
              color: activeCategoryFilter === cat ? '#60a5fa' : '#8a94aa',
              fontWeight: activeCategoryFilter === cat ? '600' : '500',
              cursor: 'pointer', flexShrink: 0
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
          <S.ModalCard style={{ backgroundColor: '#10151f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px 16px', boxSizing: 'border-box' }} onClick={(e) => e.stopPropagation()}>

            <S.ModalHeader style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '15px', letterSpacing: '0.05em' }}>
                {isEditing ? '✏️ 編輯記帳紀錄' : '交易明細'}
              </div>
              {!isEditing && (
                <div style={{ color: '#5c6679', fontSize: '11px', marginTop: '4px' }}>
                  {new Date(selectedRecord.record.created_at).toLocaleString('zh-HK', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              )}
            </S.ModalHeader>

            <S.ModalBody style={{ gap: '12px', display: 'flex', flexDirection: 'column' }}>
              {isEditing ? (
                /* ---------------- 📝 編輯狀態表單 ---------------- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box' }}>

                  {/* 金額修改 (🌟 手機強制 16px 核心阻擊 Auto-zoom) */}
                  <div>
                    <div style={{ color: '#8a94aa', fontSize: '11px', marginBottom: '4px' }}>金額</div>
                    <S.TextInput
                      name="amount"
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={editForm.amount}
                      onChange={handleInputChange}
                      style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', fontSize: '16px', fontWeight: '600' }}
                    />
                  </div>

                  {/* 記帳人 (一列過) */}
                  <div>
                    <div style={{ color: '#8a94aa', fontSize: '11px', marginBottom: '4px' }}>記帳人</div>
                    <S.Select
                      name="member_id"
                      value={editForm.member_id}
                      onChange={handleInputChange}
                      style={{ width: '100%', height: '40px', padding: '0 10px', fontSize: '16px', borderRadius: '10px' }}
                    >
                      {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </S.Select>
                  </div>

                  {/* 分類二連彈 (並排) */}
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <div style={{ width: '50%' }}>
                      <div style={{ color: '#8a94aa', fontSize: '11px', marginBottom: '4px' }}>主分類</div>
                      <S.Select
                        name="main_category"
                        value={editForm.main_category}
                        onChange={handleMainCatChange}
                        style={{ width: '100%', height: '40px', padding: '0 8px', fontSize: '16px', borderRadius: '10px' }}
                      >
                        {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </S.Select>
                    </div>

                    <div style={{ width: '50%' }}>
                      <div style={{ color: '#8a94aa', fontSize: '11px', marginBottom: '4px' }}>子分類</div>
                      <S.Select
                        name="sub_category"
                        value={editForm.sub_category}
                        onChange={handleInputChange}
                        style={{ width: '100%', height: '40px', padding: '0 8px', fontSize: '16px', borderRadius: '10px' }}
                      >
                        {(categories[editForm.main_category] || []).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </S.Select>
                    </div>
                  </div>

                  {/* 備忘備註 */}
                  <div>
                    <div style={{ color: '#8a94aa', fontSize: '11px', marginBottom: '4px' }}>備忘備註</div>
                    <S.TextInput
                      name="note"
                      type="text"
                      placeholder="無備忘項目..."
                      value={editForm.note}
                      onChange={handleInputChange}
                      style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', fontSize: '16px' }}
                    />
                  </div>

                  {/* 日期與時間 完美並排版 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', boxSizing: 'border-box', gap: '8px' }}>
                    <div style={{ width: '48%', boxSizing: 'border-box' }}>
                      <div style={{ color: '#8a94aa', fontSize: '11px', marginBottom: '4px' }}>日期</div>
                      <S.TextInput
                        name="date"
                        type="date"
                        value={editForm.date}
                        onChange={handleInputChange}
                        onClick={(e) => e.target.showPicker?.()}
                        style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '8px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ width: '48%', boxSizing: 'border-box' }}>
                      <div style={{ color: '#8a94aa', fontSize: '11px', marginBottom: '4px' }}>時間</div>
                      <S.TextInput
                        name="time"
                        type="time"
                        value={editForm.time}
                        onChange={handleInputChange}
                        onClick={(e) => e.target.showPicker?.()}
                        style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '8px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                </div>
              ) : (
                /* ---------------- 👁️ 唯讀查閱狀態 ---------------- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '20px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: selectedRecord.member.color }} />
                    <span style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: '500' }}>{selectedRecord.member.name}</span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#5c6679', fontSize: '11px', letterSpacing: '0.02em' }}>分類</div>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500', marginTop: '2px' }}>
                      {selectedRecord.record.main_category} · {selectedRecord.record.sub_category}
                    </div>
                  </div>

                  {selectedRecord.record.note && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#5c6679', fontSize: '11px', letterSpacing: '0.02em' }}>備註</div>
                      <div style={{ color: '#e5e7eb', fontSize: '13px', marginTop: '2px', fontStyle: 'italic' }}>「 {selectedRecord.record.note} 」</div>
                    </div>
                  )}

                  <div style={{ marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', width: '80%', textAlign: 'center' }}>
                    <div style={{ color: '#5c6679', fontSize: '11px', letterSpacing: '0.02em' }}>金額</div>
                    <div style={{ color: '#fff', fontWeight: '700', fontSize: '26px', marginTop: '2px', letterSpacing: '-0.03em' }}>
                      {formatCurrency(selectedRecord.record.amount)}
                    </div>
                  </div>
                </div>
              )}
            </S.ModalBody>

            {/* 下方按鈕 */}
            <S.ModalFooter style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#a6aec7', borderRadius: '8px', padding: '10px', fontSize: '12px', cursor: 'pointer', fontWeight: '500', flex: 1 }}
                  >
                    返回
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveUpdate}
                    style={{ background: '#3b82f6', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '12px', cursor: 'pointer', fontWeight: '700', flex: 1 }}
                  >
                    儲存修改
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#a6aec7', borderRadius: '8px', padding: '10px', fontSize: '12px', cursor: 'pointer', fontWeight: '500', flex: 1 }}
                  >
                    關閉
                  </button>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '12px', cursor: 'pointer', fontWeight: '500', flex: 1 }}
                  >
                    ✏️ 編輯
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteExpense(selectedRecord.record.id);
                      closeModal();
                    }}
                    style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#f87171', borderRadius: '8px', padding: '10px', fontSize: '12px', cursor: 'pointer', fontWeight: '500', flex: 1 }}
                  >
                    刪除記錄
                  </button>
                </>
              )}
            </S.ModalFooter>

          </S.ModalCard>
        </S.ModalOverlay>
      )}

      <style>{`
        [hide-scrollbar="true"]::-webkit-scrollbar { display: none !important; }
        [hide-scrollbar="true"] { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
    </div>
  );
}