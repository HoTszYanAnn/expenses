import React, { useState, useMemo, useEffect } from 'react';
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
  rates, // 🌟 由 Supabase 讀取嘅最新匯率
}) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [showCustomDateTime, setShowCustomDateTime] = useState(false);
  const [currency, setCurrency] = useState('HKD');

  // 🌟 改為直接對應 Supabase props 嘅最新匯率
  const currentExchangeRate = useMemo(() => {
    if (currency === 'HKD') return 1;
    if (currency === 'JPY') return rates?.JPY || 0.052;
    if (currency === 'CNY') return rates?.CNY || 1.08;
    return 1;
  }, [currency, rates]);

  const liveConvertedHKD = useMemo(() => {
    const amt = Number(expenseForm.amount);
    if (!amt || currency === 'HKD') return 0;
    return amt * currentExchangeRate;
  }, [expenseForm.amount, currency, currentExchangeRate]);

  const { maxDate, maxTime } = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    
    return {
      maxDate: `${yyyy}-${mm}-${dd}`,
      maxTime: `${hh}:${min}`
    };
  }, [expenseForm.expenseDate]);

  useEffect(() => {
    const lastMember = localStorage.getItem('last_expense_member_id');
    const lastMainCat = localStorage.getItem('last_expense_main_cat');
    const lastSubCat = localStorage.getItem('last_expense_sub_cat');

    if (lastMember && members.some(m => m.id.toString() === lastMember)) {
      onMemberChange({ target: { value: lastMember } });
    }
    if (lastMainCat && Object.keys(categories).includes(lastMainCat)) {
      onMainCatChange({ target: { value: lastMainCat } });
      if (lastSubCat && categories[lastMainCat]?.includes(lastSubCat)) {
        setTimeout(() => {
          onSubCatChange({ target: { value: lastSubCat } });
        }, 50);
      }
    }
  }, [members, categories]);

  const handleAddExpenseWithMemory = (e) => {
    e.preventDefault();
    localStorage.setItem('last_expense_member_id', selectedMember);
    localStorage.setItem('last_expense_main_cat', mainCat);
    localStorage.setItem('last_expense_sub_cat', subCat);
    
    onAddExpense(e, { currency, exchangeRate: currentExchangeRate });
    setCurrency('HKD');
  };

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

  const minimalColors = ['#f88aa5', '#a78bfa', '#60a5fa', '#f87171', '#fbbf24', '#22d3ee', '#e2e8f0'];

  const getCategoryColor = (index, opacity = 1) => {
    const hex = minimalColors[index % minimalColors.length].replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const memberCategoryStats = useMemo(() => {
    const categorySet = new Set();
    filteredRecords.forEach(rec => {
      categorySet.add(rec.main_category || '未分類');
    });
    const categoryList = Array.from(categorySet).sort();

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

  const dailyExpenses = useMemo(() => {
    const daily = {};
    filteredRecords.forEach(rec => {
      const date = new Date(rec.created_at).toISOString().split('T')[0];
      daily[date] = (daily[date] || 0) + Number(rec.amount || 0);
    });
    return daily;
  }, [filteredRecords]);

  const maxDailyExpense = useMemo(() => {
    return Math.max(0, ...Object.values(dailyExpenses));
  }, [dailyExpenses]);

  const getTotalForDate = (dateStr) => dailyExpenses[dateStr] || 0;

  const formatCompactAmount = (amount) => {
    if (!amount) return '';
    if (amount >= 100000) {
      return `${(amount / 1000).toFixed(0)}k`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`.replace('.0', '');
    }
    return Math.round(amount).toString();
  };

  const getCalendarDays = () => {
    const [year, month] = selectedMonth.split('-');
    const firstDay = new Date(Number(year), Number(month) - 1, 1);
    const lastDay = new Date(Number(year), Number(month), 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const calendarDays = getCalendarDays();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const isCustomTimeActive = Boolean(expenseForm.expenseDate || expenseForm.expenseTime);

  const handleResetToCurrentTime = () => {
    onExpenseInput({ target: { name: 'expenseDate', value: '' } });
    onExpenseInput({ target: { name: 'expenseTime', value: '' } });
    setShowCustomDateTime(false);
  };

  return (
    <>
      <S.Form onSubmit={handleAddExpenseWithMemory} style={{ gap: '5px', marginTop: '0' }}>
        
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '5px', width: '100%' }}>
          <S.InputAmount
            name="amount"
            type="number"
            step="any"
            placeholder="0.00"
            value={expenseForm.amount}
            onChange={onExpenseInput}
            required
            inputMode="decimal"
            style={{ flex: 1, minWidth: 0 }}
          />
          <S.Select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{ padding: '6px 8px', fontSize: '12px', borderRadius: '8px', height: '46px', background: '#0b0f18', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', flex: '0 0 85px', textAlign: 'center', fontWeight: '600' }}
          >
            <option value="HKD">HKD ($)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="CNY">CNY (¥)</option>
          </S.Select>
        </div>

        {currency !== 'HKD' && liveConvertedHKD > 0 && (
          <div style={{ fontSize: '11px', color: '#3b82f6', padding: '0 4px', width: '100%', display: 'flex', gap: '4px', fontWeight: '600', fontFamily: 'monospace' }}>
            <span>≈ HKD {liveConvertedHKD.toFixed(2)}</span>
            <span style={{ color: '#5c6679', fontWeight: '400' }}>(雲端匯率: {currentExchangeRate})</span>
          </div>
        )}

        {/* 第一行 */}
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '5px', width: '100%' }}>
          <S.Select
            value={selectedMember}
            onChange={onMemberChange}
            style={{ color: currentMember.color, padding: '6px 8px', fontSize: '12px', borderRadius: '8px', height: '34px', background: '#0b0f18', border: '1px solid rgba(255,255,255,0.04)', fontWeight: '600', flex: '1 1 33%', minWidth: 0, width: '100%' }}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id.toString()}>
                {member.name}
              </option>
            ))}
          </S.Select>

          <S.Select value={mainCat} onChange={onMainCatChange} style={{ padding: '6px 8px', fontSize: '12px', borderRadius: '8px', height: '34px', background: '#0b0f18', border: '1px solid rgba(255,255,255,0.04)', color: '#fff', flex: '1 1 33%', minWidth: 0, width: '100%' }}>
            {Object.keys(categories).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </S.Select>

          <S.Select value={subCat} onChange={onSubCatChange} style={{ padding: '6px 8px', fontSize: '12px', borderRadius: '8px', height: '34px', background: '#0b0f18', border: '1px solid rgba(255,255,255,0.04)', color: '#a6aec7', flex: '1 1 33%', minWidth: 0, width: '100%' }}>
            {categories[mainCat]?.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </S.Select>
        </div>

        {/* 第二行 */}
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '5px', width: '100%', alignItems: 'center' }}>
          <S.TextInput
            name="note"
            type="text"
            placeholder="備忘 (如: 壽司, 巴士)..."
            value={expenseForm.note}
            onChange={onExpenseInput}
            style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px', height: '34px', border: '1px solid rgba(255,255,255,0.04)', flex: '1', minWidth: '0', width: '100%' }}
          />
          <S.Button type="submit" style={{ minHeight: '34px', height: '34px', borderRadius: '8px', fontSize: '13px', background: '#fff', color: '#000', fontWeight: '700', border: 'none', flex: '0 0 65px', width: '65px', padding: '0', textAlign: 'center' }}>
            儲存
          </S.Button>
        </div>

        {/* 日期選擇列 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <S.QuickDateTimeBadge type="button" isCustom={isCustomTimeActive} onClick={() => setShowCustomDateTime(!showCustomDateTime)}>
              <span style={{ fontSize: '8px', color: isCustomTimeActive ? '#ff8aa5' : '#3b82f6' }}>●</span>
              {isCustomTimeActive ? '已補錄過去歷史帳目' : '現在時間 (點擊補填舊帳)'}
            </S.QuickDateTimeBadge>

            {isCustomTimeActive && (
              <button type="button" onClick={handleResetToCurrentTime} style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', color: '#e5e7eb', fontSize: '11px', borderRadius: '12px', padding: '4px 10px', cursor: 'pointer' }}>
                ✕ 還原現在
              </button>
            )}
          </div>

          {(showCustomDateTime || isCustomTimeActive) && (
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '5px', width: '100%' }}>
              <S.TextInput name="expenseDate" type="date" max={maxDate} value={expenseForm.expenseDate || ''} onChange={onExpenseInput} onKeyDown={(e) => e.preventDefault()} onClick={(e) => e.target.showPicker?.()} style={{ padding: '6px 10px', fontSize: '11px', borderRadius: '8px', height: '34px', color: '#fff', background: '#0b0f18', border: '1px solid rgba(255,255,255,0.06)', flex: 1, minWidth: 0, width: '100%', cursor: 'pointer' }} />
              <S.TextInput name="expenseTime" type="time" max={expenseForm.expenseDate === maxDate ? maxTime : undefined} value={expenseForm.expenseTime || ''} onChange={onExpenseInput} onKeyDown={(e) => e.preventDefault()} onClick={(e) => e.target.showPicker?.()} style={{ padding: '6px 10px', fontSize: '11px', borderRadius: '8px', height: '34px', color: '#fff', background: '#0b0f18', border: '1px solid rgba(255,255,255,0.06)', flex: 1, minWidth: 0, width: '100%', cursor: 'pointer' }} />
            </div>
          )}
        </div>
      </S.Form>


      {/* 月份導航 */}
      <S.MonthNav style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', marginBottom: '8px', gap: '8px', width: '100%' }}>
        <button onClick={handlePrevMonth} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: '#67718a', fontSize: '12px', padding: '6px 12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>◀ 前月</button>
        <S.MonthLabel style={{ fontSize: '13px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', textAlign: 'center', flex: 1 }}>{monthLabel}</S.MonthLabel>
        <button onClick={handleNextMonth} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: '#67718a', fontSize: '12px', padding: '6px 12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>後月 ▶</button>
      </S.MonthNav>

      {filteredRecords.length > 0 ? (
        <S.StatsContainer style={{ marginTop: '0', gap: '10px' }}>
          
          <S.TotalBlock style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '14px', borderRadius: '14px', textAlign: 'center', gap: '2px' }}>
            <S.StatsLabel style={{ fontSize: '11px', color: '#5c6679', letterSpacing: '0.05em' }}>本月支出總計</S.StatsLabel>
            <S.TotalText style={{ fontSize: '26px', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em' }}>{formatCurrency(monthlyStats.total)}</S.TotalText>
          </S.TotalBlock>

          {/* 📅 月曆 */}
          <S.StatsCard style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.04)', padding: '10px 4px', borderRadius: '14px' }}>
            <S.StatsCardTitle style={{ fontSize: '11px', color: '#5c6679', marginBottom: '10px', fontWeight: '500', paddingLeft: '4px' }}>月度日期分佈 (顏色愈紅代表消費愈高)</S.StatsCardTitle>
            
            <S.CalendarHeader>
              {weekDays.map(day => (
                <S.CalendarHeaderCell key={day}>{day}</S.CalendarHeaderCell>
              ))}
            </S.CalendarHeader>

            <S.CalendarGrid>
              {calendarDays.map((day, idx) => {
                const dateStr = day ? `${selectedMonth}-${String(day).padStart(2, '0')}` : null;
                const total = dateStr ? getTotalForDate(dateStr) : 0;
                const hasTotal = total > 0;
                
                let textColor = '#e5e7eb';
                let fontWeight = '500';
                
                if (hasTotal && maxDailyExpense > 0) {
                  const ratio = Math.min(total / maxDailyExpense, 1);
                  const r = Math.round(229 + (26 * ratio)); 
                  const g = Math.round(231 - (154 * ratio)); 
                  const b = Math.round(235 - (158 * ratio)); 
                  
                  textColor = `rgb(${r}, ${g}, ${b})`;
                  fontWeight = ratio > 0.4 ? '700' : '600';
                }

                return (
                  <S.CalendarCell key={idx} active={hasTotal} style={{ 
                    minHeight: '52px', padding: '4px 1px', borderRadius: '6px', 
                    background: hasTotal ? 'rgba(255, 255, 255, 0.02)' : 'transparent', 
                    border: hasTotal ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.01)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    {day ? (
                      <>
                        <S.CalendarDayNumber style={{ fontSize: '9px', color: hasTotal ? '#8a94aa' : '#4b5563' }}>
                          {day}
                        </S.CalendarDayNumber>
                        {hasTotal ? (
                          <S.CalendarAmount style={{ 
                            color: textColor, fontSize: '14px', fontWeight: fontWeight,
                            width: '100%', textAlign: 'center', overflow: 'hidden', whiteSpace: 'nowrap',
                            letterSpacing: '-0.04em', fontFamily: 'monospace'
                          }}>
                            {formatCompactAmount(total)}
                          </S.CalendarAmount>
                        ) : null}
                      </>
                    ) : null}
                  </S.CalendarCell>
                );
              })}
            </S.CalendarGrid>
          </S.StatsCard>

          {/* 📊 成員 × 分類消耗 */}
          <S.StatsCard style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.04)', padding: '12px', borderRadius: '14px' }}>
            <S.StatsCardTitle style={{ fontSize: '11px', color: '#5c6679', marginBottom: '8px', fontWeight: '500' }}>成員 × 分類消耗</S.StatsCardTitle>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', marginBottom: '14px', padding: '6px 8px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
              {memberCategoryStats.categories.map((cat, catIdx) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: getCategoryColor(catIdx, 0.95) }} />
                  <span style={{ fontSize: '11px', color: '#a6aec7' }}>{cat}</span>
                </div>
              ))}
            </div>

            <S.BreakdownGroup style={{ gap: '10px' }}>
              {memberCategoryStats.stats.map((member) => (
                <div key={member.memberId}>
                  <S.BreakdownRow style={{ marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: member.memberColor }} />
                      <S.BreakdownLabel style={{ fontSize: '12px', color: '#e5e7eb', fontWeight: '500' }}>{member.memberName}</S.BreakdownLabel>
                    </div>
                    <S.BreakdownAmount style={{ fontSize: '11px', color: '#8a94aa', fontWeight: '600' }}>{formatCurrency(member.totalAmount, 0)}</S.BreakdownAmount>
                  </S.BreakdownRow>
                  
                  <S.BreakdownBar style={{ height: '14px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    {memberCategoryStats.categories.map((cat, catIdx) => {
                      const catAmount = member.categoryBreakdown[cat] || 0;
                      const percent = member.totalAmount > 0 ? (catAmount / member.totalAmount) * 100 : 0;
                      const color = getCategoryColor(catIdx, 0.85);
                      return percent > 0 ? (
                        <S.BarSegment
                          key={cat}
                          darkText={false}
                          style={{ 
                            width: `${percent}%`, backgroundColor: color, height: '100%',
                            fontSize: '9px', fontWeight: '600', color: '#000', textShadow: 'none'
                          }}
                          title={`${cat}: ${formatCurrency(catAmount, 0)}`}
                        >
                          {percent > 22 ? cat.slice(0, 1) : null}
                        </S.BarSegment>
                      ) : null;
                    })}
                  </S.BreakdownBar>
                </div>
              ))}
            </S.BreakdownGroup>
          </S.StatsCard>

          {/* 👩‍❤️‍👨 情侶日常開銷分析 */}
          <S.StatsCard style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.04)', padding: '12px', borderRadius: '14px' }}>
            <S.StatsCardTitle style={{ fontSize: '11px', color: '#5c6679', marginBottom: '10px', fontWeight: '500' }}>
              日常開銷分析
            </S.StatsCardTitle>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8a94aa', marginBottom: '4px' }}>
                  {members.map((m) => {
                    const amt = monthlyStats.memberMap[m.id] || 0;
                    const pct = monthlyStats.total > 0 ? Math.round((amt / monthlyStats.total) * 100) : 0;
                    return (
                      <span key={m.id} style={{ color: m.color, fontWeight: '500' }}>
                        {m.name}: {pct}%
                      </span>
                    );
                  })}
                </div>
                <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.02)', display: 'flex', overflow: 'hidden' }}>
                  {members.map((m) => {
                    const amt = monthlyStats.memberMap[m.id] || 0;
                    const pct = monthlyStats.total > 0 ? (amt / monthlyStats.total) * 100 : 0;
                    return pct > 0 ? (
                      <div key={m.id} style={{ width: `${pct}%`, backgroundColor: m.color, height: '100%', transition: 'width 0.3s' }} />
                    ) : null;
                  })}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px', marginTop: '2px' }}>
                <div style={{ fontSize: '11px', color: '#5c6679', marginBottom: '6px' }}>
                  錢去咗邊 (消費最高分類)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {monthlyStats.sortedCats.slice(0, 3).map((cat, index) => {
                    const catIdx = memberCategoryStats.categories.indexOf(cat.name);
                    const catColor = catIdx !== -1 ? getCategoryColor(catIdx, 0.9) : '#fff';
                    const catPct = monthlyStats.total > 0 ? Math.round((cat.amount / monthlyStats.total) * 100) : 0;
                    
                    return (
                      <div key={cat.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                          <span style={{ fontSize: '10px', color: '#5c6679', fontFamily: 'monospace' }}>0{index + 1}</span>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: catColor }} />
                          <span style={{ color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                        </div>
                        <span style={{ color: '#8a94aa', fontWeight: '500', fontFamily: 'monospace', fontSize: '11px' }}>
                          {formatCurrency(cat.amount, 0)} ({catPct}%)
                        </span>
                      </div>
                    );
                  })}
                  {monthlyStats.sortedCats.length === 0 && (
                    <div style={{ fontSize: '11px', color: '#4b5563', textAlign: 'center', padding: '4px 0' }}>暫無開銷，今個月好慳！</div>
                  )}
                </div>
              </div>

            </div>
          </S.StatsCard>

        </S.StatsContainer>
      ) : (
        <S.EmptyState style={{ fontSize: '12px', marginTop: '30px' }}>此月份暫無記帳紀錄</S.EmptyState>
      )}
    </>
  );
}