import React from 'react';
import * as S from './ExpenseTracker.styles.jsx';

export default function DetailsTab({ groupedRecords, members, onDeleteExpense, findMember, formatCurrency }) {
  return (
    <div style={{ width: '100%' }}>
      <S.SectionTitle>歷史流水帳明細</S.SectionTitle>

      {groupedRecords.length > 0 ? (
        <S.TimelineContainer>
          {groupedRecords.map((group) => (
            <S.DateGroup key={group.date}>
              <S.DateHeader>
                <S.DateTitle>{group.date}</S.DateTitle>
                <S.DateTotal>當日計: {formatCurrency(group.total)}</S.DateTotal>
              </S.DateHeader>

              <S.DateItemList>
                {group.items.map((record) => {
                  const member = findMember(members, record.member_id);
                  return (
                    <S.ListItem key={record.id}>
                      <S.ItemLeft>
                        <S.TimeText>{record.timeStr}</S.TimeText>
                        <span style={{ color: member.color, fontWeight: 'bold', minWidth: '45px' }}>{member.name}</span>
                        <S.CatText>
                          {record.main_category}·{record.sub_category}
                        </S.CatText>
                        {record.note && <S.NoteText>({record.note})</S.NoteText>}
                      </S.ItemLeft>
                      <S.ItemRight>
                        <span style={{ color: member.color, fontWeight: 'bold', marginRight: '12px' }}>
                          {formatCurrency(record.amount)}
                        </span>
                        <S.DeleteButton onClick={() => onDeleteExpense(record.id)}>×</S.DeleteButton>
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
    </div>
  );
}
