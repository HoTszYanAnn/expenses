import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import {
  buildCategoryMap,
  buildStats,
  formatCurrency,
  formatExpenseGroups,
  findMember,
} from '../lib/expenseUtils.js';
import * as S from './ExpenseTracker.styles.jsx';
import MainTab from './MainTab.jsx';
import DetailsTab from './DetailsTab.jsx';
import SettingsTab from './SettingsTab.jsx';

const initialExpenseForm = { amount: '', note: '', expenseDate: '', expenseTime: '' };
const initialSettingsForm = { newMemberName: '', newMemberColor: '#ffffff', selectedMainCat: '', newMainCat: '', newSubCat: '' };

export default function ExpenseTracker() {
  const [view, setView] = useState('main');
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState({});
  const [rawCategories, setRawCategories] = useState([]);
  
  // 🌟 新增：Supabase 匯率狀態
  const [rates, setRates] = useState({ JPY: 0.052, CNY: 1.08 });

  const [selectedMember, setSelectedMember] = useState('');
  const [mainCat, setMainCat] = useState('');
  const [subCat, setSubCat] = useState('');
  const [expenseForm, setExpenseForm] = useState(initialExpenseForm);
  const [settingsForm, setSettingsForm] = useState(initialSettingsForm);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const [memberResult, categoryResult] = await Promise.all([
          supabase.from('members').select('*').order('id'),
          supabase.from('categories').select('*').order('id'),
        ]);

        if (!isMounted) return;

        if (memberResult.data) {
          setMembers(memberResult.data);
          setSelectedMember(memberResult.data[0]?.id?.toString() || '');
        }

        const categoryMap = buildCategoryMap(categoryResult.data || []);
        setCategories(categoryMap);
        setRawCategories(categoryResult.data || []);
        setMainCat(Object.keys(categoryMap)[0] || '');
        setSubCat(categoryMap[Object.keys(categoryMap)[0]]?.[0] || '');

        // 🌟 載入初始數據時，順便向 Supabase 攞匯率
        await fetchRates();
        await fetchExpenses();
      } catch (error) {
        console.error('❌ 讀取資料失敗:', error);
      }
    };

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchExpenses();
    if (view === 'settings' || view === 'main') {
      fetchRates();
    }
  }, [view]);

  useEffect(() => {
    if (mainCat && categories[mainCat]) {
      setSubCat(categories[mainCat][0] || '');
    }
  }, [mainCat, categories]);

  // 🌟 新增：從 Supabase 讀取最新匯率
  const fetchRates = async () => {
    const { data } = await supabase.from('system_settings').select('*');
    if (data) {
      const jpyRow = data.find(r => r.key === 'rates_jpy');
      const cnyRow = data.find(r => r.key === 'rates_cny');
      setRates({
        JPY: jpyRow ? Number(jpyRow.value) : 0.052,
        CNY: cnyRow ? Number(cnyRow.value) : 1.08
      });
    }
  };

  // 🌟 新增：更新 Supabase 匯率
  const handleUpdateRate = async (currency, value) => {
    const key = `rates_${currency.toLowerCase()}`;
    const { error } = await supabase
      .from('system_settings')
      .upsert({ key, value: value.toString(), updated_at: new Date().toISOString() });
    
    if (!error) {
      setRates(prev => ({ ...prev, [currency]: Number(value) }));
    } else {
      console.error('❌ 匯率儲存失敗:', error);
    }
  };

  const fetchExpenses = async () => {
    const { data } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    if (data) setRecords(data);
  };

  const reloadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('id');
    if (data) {
      setRawCategories(data);
      const categoryMap = buildCategoryMap(data);
      setCategories(categoryMap);
      setMainCat(Object.keys(categoryMap)[0] || '');
      setSubCat(categoryMap[Object.keys(categoryMap)[0]]?.[0] || '');
    }
  };

  const stats = buildStats(records, members);
  const groupedRecords = formatExpenseGroups(records);
  const currentMember = findMember(members, selectedMember);

  const handleExpenseInput = (event) => {
    const { name, value } = event.target;
    setExpenseForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingsInput = (event) => {
    const { name, value } = event.target;
    setSettingsForm((prev) => {
      if (name === 'selectedMainCat') {
        return {
          ...prev,
          selectedMainCat: value,
          newMainCat: value ? '' : prev.newMainCat,
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleAddExpense = async (event, currencyMeta = { currency: 'HKD', exchangeRate: 1 }) => {
    if (event && event.preventDefault) event.preventDefault();
    
    let amountValue = Number(expenseForm.amount);
    if (!amountValue || !selectedMember || !mainCat || !subCat) return;

    let currencyLabel = currencyMeta.currency || 'HKD';
    let rate = currencyMeta.exchangeRate || 1;
    let finalNote = expenseForm.note;

    if (currencyLabel !== 'HKD') {
      const originalAmount = amountValue;
      amountValue = originalAmount * rate;
      
      const originalStamp = ` (${currencyLabel} ${originalAmount} @ ${rate})`;
      finalNote = finalNote ? `${finalNote}${originalStamp}` : originalStamp.trim();
    }

    let timestamp = new Date();
    if (expenseForm.expenseDate) {
      const dateStr = expenseForm.expenseDate;
      const timeStr = expenseForm.expenseTime || '00:00';
      timestamp = new Date(`${dateStr}T${timeStr}:00`);
    }

    const { error } = await supabase.from('expenses').insert([
      {
        member_id: Number(selectedMember),
        amount: amountValue,
        main_category: mainCat,
        sub_category: subCat,
        note: finalNote,
        created_at: timestamp.toISOString(),
      },
    ]);

    if (!error) {
      setExpenseForm(initialExpenseForm);
      await fetchExpenses();
      window.alert('🔹 記帳成功！');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('確定要刪除呢筆帳目？')) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) fetchExpenses();
  };

  const handleUpdateExpense = async (id, updatedPayload) => {
    const { error } = await supabase
      .from('expenses')
      .update(updatedPayload)
      .eq('id', id);

    if (!error) {
      await fetchExpenses();
      window.alert('🔹 帳目修改成功！');
    } else {
      window.alert('修改失敗，請檢查輸入內容。');
    }
  };

  const handleAddCategory = async (event) => {
    event.preventDefault();
    const mainCategory = (settingsForm.selectedMainCat || settingsForm.newMainCat || '').trim();
    const subCategory = (settingsForm.newSubCat || '').trim();

    if (!mainCategory || !subCategory) {
      window.alert('請輸入完整分類資訊。');
      return;
    }

    const duplicate = rawCategories.some(
      (category) => category.main_category === mainCategory && category.sub_category === subCategory
    );
    if (duplicate) {
      window.alert('此組合已存在！');
      return;
    }

    const { error } = await supabase
      .from('categories')
      .insert([{ main_category: mainCategory, sub_category: subCategory }]);

    if (!error) {
      setSettingsForm((prev) => ({ ...prev, selectedMainCat: '', newMainCat: '', newSubCat: '' }));
      await reloadCategories();
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('確定要刪除呢個分類？')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) reloadCategories();
  };

  const handleUpdateCategory = async (id, oldCategoryData, newCategoryData) => {
    try {
      const { error: catError } = await supabase
        .from('categories')
        .update({ main_category: newCategoryData.main_category, sub_category: newCategoryData.sub_category })
        .eq('id', id);

      if (catError) throw catError;

      const { error: expError } = await supabase
        .from('expenses')
        .update({ main_category: newCategoryData.main_category, sub_category: newCategoryData.sub_category })
        .eq('main_category', oldCategoryData.main_category)
        .eq('sub_category', oldCategoryData.sub_category);

      if (expError) throw expError;

      window.alert('🔹 分類更新成功，歷史流水帳已全面同步！');
      await reloadCategories();
      await fetchExpenses();
    } catch (error) {
      console.error('❌ 更新失敗:', error);
    }
  };

  return (
    <S.AppShell>
      <S.Nav>
        <S.NavButton active={view === 'main'} onClick={() => setView('main')}>
          記帳/圖表
        </S.NavButton>
        <S.NavButton active={view === 'details'} onClick={() => setView('details')}>
          歷史明細
        </S.NavButton>
        <S.NavButton active={view === 'settings'} onClick={() => setView('settings')}>
          設定管理
        </S.NavButton>
      </S.Nav>

      {view === 'main' && (
        <MainTab
          members={members}
          categories={categories}
          selectedMember={selectedMember}
          mainCat={mainCat}
          subCat={subCat}
          currentMember={currentMember}
          expenseForm={expenseForm}
          onExpenseInput={handleExpenseInput}
          onMemberChange={(event) => setSelectedMember(event.target.value)}
          onMainCatChange={(event) => setMainCat(event.target.value)}
          onSubCatChange={(event) => setSubCat(event.target.value)}
          onAddExpense={handleAddExpense}
          stats={stats}
          records={records}
          formatCurrency={formatCurrency}
          rates={rates} // 🌟 傳入 Supabase 匯率
        />
      )}

      {view === 'details' && (
        <DetailsTab
          groupedRecords={groupedRecords}
          members={members}
          categories={categories}
          onDeleteExpense={handleDeleteExpense}
          onUpdateExpense={handleUpdateExpense}
          findMember={findMember}
          formatCurrency={formatCurrency}
        />
      )}

      {view === 'settings' && (
        <SettingsTab
          rawCategories={rawCategories}
          settingsForm={settingsForm}
          onSettingsInput={handleSettingsInput}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onUpdateCategory={handleUpdateCategory}
          rates={rates} // 🌟 傳入 Supabase 匯率
          onUpdateRate={handleUpdateRate} // 🌟 傳入更新 Function
        />
      )}
    </S.AppShell>
  );
}