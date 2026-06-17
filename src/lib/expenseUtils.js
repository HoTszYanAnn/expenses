export const formatCurrency = (value, digits = 1) => {
  const amount = Number(value || 0);
  return `$${amount.toFixed(digits)}`;
};

export const buildCategoryMap = (rawCategories = []) =>
  rawCategories.reduce((map, item) => {
    const main = item.main_category || '';
    const sub = item.sub_category || '';

    if (!main || !sub) return map;
    if (!map[main]) map[main] = [];
    if (!map[main].includes(sub)) map[main].push(sub);
    return map;
  }, {});

export const buildStats = (records = [], members = []) => {
  const total = records.reduce((sum, rec) => sum + Number(rec.amount || 0), 0);

  const memberMap = members.reduce((acc, member) => {
    acc[member.id] = 0;
    return acc;
  }, {});

  records.forEach(rec => {
    if (memberMap[rec.member_id] !== undefined) {
      memberMap[rec.member_id] += Number(rec.amount || 0);
    }
  });

  const categoryMap = records.reduce((acc, rec) => {
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
};

export const formatExpenseGroups = (records = []) => {
  const groups = records.reduce((acc, rec) => {
    const dateObj = new Date(rec.created_at);
    const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(
      dateObj.getDate()
    ).padStart(2, '0')}`;
    const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(
      2,
      '0'
    )}:${String(dateObj.getSeconds()).padStart(2, '0')}`;

    if (!acc[dateKey]) {
      acc[dateKey] = { date: dateKey, total: 0, items: [] };
    }

    acc[dateKey].items.push({ ...rec, timeStr });
    acc[dateKey].total += Number(rec.amount || 0);
    return acc;
  }, {});

  return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
};

export const findMember = (members, id) =>
  members.find(member => member.id.toString() === id.toString()) || { name: 'Unknown', color: '#888888' };
