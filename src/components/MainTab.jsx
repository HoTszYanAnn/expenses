import React, { useState, useMemo } from 'react';
import * as S from './ExpenseTracker.styles.jsx';

export default function MainTab({
  members,
  categories,
  selectedMember,
  mainCat,
  subCat,
  currentMember,
  expenseForm,
  onExpenseInput,
  onMemberChange,
  onMainCatChange,
  onSubCatChange,
  onAddExpense,
  stats,
  records,
  formatCurrency,
}) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const recDate = new Date(rec.created_at);
      const recMonth = `${recDate.getFullYear()}-${String(recDate.getMonth() + 1).padStart(2, '0')}`;
      return recMonth === selectedMonth;
    });
  }, [records, selectedMonth]);

  const monthlyStats = useMemo(() => {
    const total = filteredRecords.reduce((sum, rec) => sum + Number(rec.amount || 0), 0);

    const memberMap = members.reduce((acc, member) => {
      acc[member.id] = 0;
      return acc;
    }, {});

    filteredRecords.forEach(rec => {
      if (memberMap[rec.member_id] !== undefined) {
        memberMap[rec.member_id] += Number(rec.amount || 0);
      }
    });

    const categoryMap = filteredRecords.reduce((acc, rec) => {
      const main = rec.main_category || '未分類';
      acc[main] = (acc[main] || 0) + Number(rec.amount || 0);
      return acc;
    }, {});

    const sortedCats = Object.entries(categoryMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    return {
      total,
      memberMap,
      sortedCats,
      maxCatAmount: sortedCats[0]?.amount || 0,
    };
  }, [filteredRecords, members]);

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    date.setMonth(date.getMonth() - 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    date.setMonth(date.getMonth() + 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthLabel = new Date(`${selectedMonth}-01`).toLocaleDateString('en-HK', {
    year: 'numeric',
    month: 'long',
  });

  // Helper to adjust color opacity
  const getColorWithOpacity = (hexColor, opacity) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Helper to get member who spent on a date
  const getMemberColorForDate = (dateStr) => {
    const dayRecords = filteredRecords.filter(rec => {
      const recDate = new Date(rec.created_at).toISOString().split('T')[0];
      return recDate === dateStr;
    });
    if (dayRecords.length === 0) return null;
    const member = members.find(m => m.id === dayRecords[0].member_id);
    return member?.color || '#ffffff';
  };

  // Get all members' spending for a specific date
  const getMembersSpendingForDate = (dateStr) => {
    const dayRecords = filteredRecords.filter(rec => {
      const recDate = new Date(rec.created_at).toISOString().split('T')[0];
      return recDate === dateStr;
    });

    const memberSpending = {};
    dayRecords.forEach(rec => {
      if (!memberSpending[rec.member_id]) {
        memberSpending[rec.member_id] = 0;
      }
      memberSpending[rec.member_id] += Number(rec.amount || 0);
    });

    return members
      .filter(m => memberSpending[m.id] > 0)
      .map(m => ({
        memberId: m.id,
        memberName: m.name,
        memberColor: m.color,
        amount: memberSpending[m.id],
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  // Calculate member × category breakdown for stacked bar chart
  const memberCategoryStats = useMemo(() => {
    // First get all unique categories from filtered records
    const categorySet = new Set();
    filteredRecords.forEach(rec => {
      categorySet.add(rec.main_category || '未分類');
    });
    const categoryList = Array.from(categorySet).sort();

    // Then calculate spending per member per category
    const stats = members.map(member => {
      const categoryBreakdown = {};
      let totalAmount = 0;

      categoryList.forEach(cat => {
        categoryBreakdown[cat] = 0;
      });

      filteredRecords.forEach(rec => {
        if (rec.member_id === member.id) {
          const cat = rec.main_category || '未分類';
          categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + Number(rec.amount || 0);
          totalAmount += Number(rec.amount || 0);
        }
      });

      return {
        memberId: member.id,
        memberName: member.name,
        memberColor: member.color,
        categoryBreakdown,
        totalAmount,
      };
    });

    return { stats, categories: categoryList };
  }, [filteredRecords, members]);

  // Calculate daily expenses for calendar
  const dailyExpenses = useMemo(() => {
    const daily = {};
    filteredRecords.forEach(rec => {
      const date = new Date(rec.created_at).toISOString().split('T')[0];
      daily[date] = (daily[date] || 0) + Number(rec.amount || 0);
    });
    return daily;
  }, [filteredRecords]);

  // Generate calendar days
  const getCalendarDays = () => {
    const [year, month] = selectedMonth.split('-');
    const firstDay = new Date(Number(year), Number(month) - 1, 1);
    const lastDay = new Date(Number(year), Number(month), 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const calendarDays = getCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <>
      <S.Form onSubmit={onAddExpense}>
        <S.InputAmount
          name="amount"
          type="number"
          step="any"
          placeholder="0.00"
          value={expenseForm.amount}
          onChange={onExpenseInput}
          required
          autoFocus
        />

        <S.ResponsiveRow>
          <S.Select
            value={selectedMember}
            onChange={onMemberChange}
            style={{ color: currentMember.color }}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id.toString()}>
                {member.name}
              </option>
            ))}
          </S.Select>

          <S.Select value={mainCat} onChange={onMainCatChange}>
            {Object.keys(categories).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </S.Select>

          <S.Select value={subCat} onChange={onSubCatChange}>
            {categories[mainCat]?.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </S.Select>
        </S.ResponsiveRow>

        <S.Row>
          <S.TextInput
            name="note"
            type="text"
            placeholder="備忘..."
            value={expenseForm.note}
            onChange={onExpenseInput}
          />
          <S.Button type="submit">＋</S.Button>
        </S.Row>

        {/* Date & Time Inputs */}
        <S.ResponsiveRow style={{ marginTop: '8px', gap: '4px' }}>
          <S.TextInput
            name="expenseDate"
            type="date"
            value={expenseForm.expenseDate || ''}
            onChange={onExpenseInput}
            title="Edit expense date (optional)"
          />
          <S.TextInput
            name="expenseTime"
            type="time"
            value={expenseForm.expenseTime || ''}
            onChange={onExpenseInput}
            title="Edit expense time (optional)"
          />
        </S.ResponsiveRow>
      </S.Form>

      {/* Month Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '12px' }}>
        <button
          onClick={handlePrevMonth}
          style={{
            background: '#050505',
            color: '#fff',
            border: '1px solid #222',
            padding: '8px 12px',
            cursor: 'pointer',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          ← 前月
        </button>
        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>{monthLabel}</span>
        <button
          onClick={handleNextMonth}
          style={{
            background: '#050505',
            color: '#fff',
            border: '1px solid #222',
            padding: '8px 12px',
            cursor: 'pointer',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          後月 →
        </button>
      </div>

      {filteredRecords.length > 0 ? (
        <S.StatsContainer>
          <S.TotalBlock>
            <S.StatsLabel>{monthLabel} 支出總計</S.StatsLabel>
            <S.TotalText>{formatCurrency(monthlyStats.total)}</S.TotalText>
          </S.TotalBlock>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Calendar - 100% width */}
            <S.StatsCard>
              <S.StatsCardTitle>日期分佈</S.StatsCardTitle>
              {/* Weekday Headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '8px' }}>
                {weekDays.map(day => (
                  <div
                    key={day}
                    style={{
                      textAlign: 'center',
                      fontSize: '10px',
                      color: '#666',
                      fontWeight: 'bold',
                      paddingBottom: '4px',
                      borderBottom: '1px solid #1a1a1a',
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>
              {/* Calendar Days */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {calendarDays.map((day, idx) => {
                  const dateStr = day ? `${selectedMonth}-${String(day).padStart(2, '0')}` : null;
                  const membersSpent = dateStr ? getMembersSpendingForDate(dateStr) : [];
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        backgroundColor: '#050505',
                        borderLeft: membersSpent.length > 0 ? `3px solid ${membersSpent[0].memberColor}` : '3px solid transparent',
                        borderRadius: '4px',
                        padding: '8px 6px',
                        cursor: day ? 'pointer' : 'default',
                        fontSize: '12px',
                        color: membersSpent.length > 0 ? '#fff' : '#444',
                        transition: 'all 0.2s',
                        minHeight: membersSpent.length > 0 ? 'auto' : '48px',
                        border: membersSpent.length > 0 ? `1px solid #222` : `1px solid #1a1a1a`,
                        opacity: membersSpent.length > 0 ? 1 : 0.5,
                      }}
                    >
                      {day ? (
                        <>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', lineHeight: '1' }}>
                            {day}
                          </div>
                          {membersSpent.length > 0 ? (
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {membersSpent.map((member) => (
                                <div
                                  key={member.memberId}
                                  style={{
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  <span style={{ color: member.memberColor, fontSize: '6px', fontWeight: 'bold' }}>●</span>
                                  <span style={{ color: member.memberColor, fontWeight: 'bold' }}>
                                    ${member.amount.toFixed(1)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: '8px', color: '#555' }}>
                              —
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </S.StatsCard>

            {/* Stacked Bar Chart - 100% width below */}
            <S.StatsCard>
              <S.StatsCardTitle>成員 × 分類消耗</S.StatsCardTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {memberCategoryStats.stats.map((member) => (
                  <div key={member.memberId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: member.memberColor, fontWeight: 'bold', fontSize: '12px' }}>
                        {member.memberName}
                      </span>
                      <span style={{ color: '#aaa', fontSize: '11px' }}>
                        {formatCurrency(member.totalAmount, 0)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        height: '32px',
                        backgroundColor: '#050505',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: '1px solid #1a1a1a',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {memberCategoryStats.categories.map((cat, catIdx) => {
                        const catAmount = member.categoryBreakdown[cat] || 0;
                        const percent = member.totalAmount > 0 ? (catAmount / member.totalAmount) * 100 : 0;
                        const opacityLevels = [1.0, 0.85, 0.7, 0.55, 0.4];
                        const opacity = opacityLevels[catIdx % opacityLevels.length];
                        const color = getColorWithOpacity(member.memberColor, opacity);
                        return percent > 0 ? (
                          <div
                            key={cat}
                            style={{
                              width: `${percent}%`,
                              backgroundColor: color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '8px',
                              color: '#fff',
                              fontWeight: 'bold',
                              transition: 'all 0.2s',
                              border: `1px solid ${member.memberColor}`,
                            }}
                            title={`${cat}: ${formatCurrency(catAmount, 0)}`}
                          >
                            {percent > 15 && <span>{cat.slice(0, 2)}</span>}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </S.StatsCard>
          </div>
        </S.StatsContainer>
      ) : (
        <S.EmptyState>此月份暫無記帳紀錄</S.EmptyState>
      )}
    </>
  );
}
