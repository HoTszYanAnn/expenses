import React, { useState } from 'react';
import * as S from './ExpenseTracker.styles.jsx';

export default function DetailsTab({ groupedRecords, members, onDeleteExpense, findMember, formatCurrency }) {
  const [selectedRecord, setSelectedRecord] = useState(null);

  const closeModal = () => setSelectedRecord(null);

  return (
    <div style={{ width: '100%' }}>
      <S.SectionTitle style={{ fontSize: '14px', color: '#8a94aa', fontWeight: '500', marginBottom: '12px' }}>
        歷史流水帳明細
      </S.SectionTitle>

      {groupedRecords.length > 0 ? (
        <S.TimelineContainer style={{ marginTop: '0', gap: '12px' }}>
          {groupedRecords.map((group) => (
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
        <S.EmptyState>清單空空如也</S.EmptyState>
      )}

 {/* Modern Black Minimal Modal — 全置中精緻版 */}
      {selectedRecord && (
        <S.ModalOverlay onClick={closeModal} style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
          <S.ModalCard style={{ backgroundColor: '#0b0f19', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px 20px', textAlign: 'center' }}>
            
            {/* Header 標題與時間置中 */}
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
            
            {/* Body 內容置中 */}
            <S.ModalBody style={{ gap: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              {/* 成員標籤置中 */}
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '20px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: selectedRecord.member.color }} />
                <span style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: '500' }}>{selectedRecord.member.name}</span>
              </div>
              
              {/* 分類資訊 */}
              <div style={{ marginTop: '4px' }}>
                <div style={{ color: '#5c6679', fontSize: '11px', letterSpacing: '0.02em' }}>分類</div>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500', marginTop: '2px' }}>
                  {selectedRecord.record.main_category} · {selectedRecord.record.sub_category}
                </div>
              </div>

              {/* 備註（有的話先顯示） */}
              {selectedRecord.record.note && (
                <div>
                  <div style={{ color: '#5c6679', fontSize: '11px', letterSpacing: '0.02em' }}>備註</div>
                  <div style={{ color: '#e5e7eb', fontSize: '13px', marginTop: '2px', fontStyle: 'italic' }}>「 {selectedRecord.record.note} 」</div>
                </div>
              )}

              {/* 大金額置中 */}
              <div style={{ marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', width: '80%' }}>
                <div style={{ color: '#5c6679', fontSize: '11px', letterSpacing: '0.02em' }}>金額</div>
                <div style={{ color: '#fff', fontWeight: '700', fontSize: '26px', marginTop: '2px', letterSpacing: '-0.03em' }}>
                  {formatCurrency(selectedRecord.record.amount)}
                </div>
              </div>
            </S.ModalBody>
            
            {/* Footer 按鈕置中均分 */}
            <S.ModalFooter style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '10px', width: '100%' }}>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: '#a6aec7',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  flex: 1,
                  maxWidth: '120px'
                }}
              >
                關閉
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteExpense(selectedRecord.record.id);
                  closeModal();
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  flex: 1,
                  maxWidth: '120px'
                }}
              >
                刪除記錄
              </button>
            </S.ModalFooter>
          </S.ModalCard>
        </S.ModalOverlay>
      )}
    </div>
  );
}