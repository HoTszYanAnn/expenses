import styled from 'styled-components';

// 注入全域樣式（直接寫喺呢度或者主 entry），確保最外層 body 都是黑底
if (typeof document !== 'undefined') {
  document.body.style.backgroundColor = '#020205';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
}

export const AppShell = styled.div`
  /* 鎖死全黑底色，防止滾動或拉扯時兩邊漏白 */
  background: radial-gradient(circle at top, rgba(40, 48, 73, 0.14), transparent 25%),
    linear-gradient(180deg, #020205 0%, #020205 48%, #07080d 100%);
  color: #e5e7eb;
  min-height: 100vh;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  
  /* 🌟 完美修復：利用 padding-top / padding-bottom 避開 iPhone 17 Pro 嘅動態島(瀏海)同底部手勢橫條 */
  padding-top: calc(24px + env(safe-area-inset-top));
  padding-left: calc(20px + env(safe-area-inset-left));
  padding-right: calc(20px + env(safe-area-inset-right));
  padding-bottom: calc(120px + env(safe-area-inset-bottom));
  
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  @media (max-width: 680px) {
    padding-top: calc(18px + env(safe-area-inset-top));
    padding-left: calc(14px + env(safe-area-inset-left));
    padding-right: calc(14px + env(safe-area-inset-right));
    padding-bottom: calc(110px + env(safe-area-inset-bottom));
  }
`;

export const Nav = styled.nav`
  position: fixed;
  /* 🌟 完美修復：利用 safe-area-inset-bottom 計算，不論是 iOS 底線還是 Android 三鍵導航，都能完美懸浮且不穿幫 */
  bottom: calc(24px + env(safe-area-inset-bottom)); 
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 500px; 
  background: rgba(10, 11, 14, 0.85); 
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 999px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px;
  z-index: 1000;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
`;

export const NavButton = styled.button`
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: ${({ active }) => (active ? '#ffffff' : '#7b8391')};
  background: transparent;
  border: none;
  padding: 10px 18px;
  border-radius: 999px;
  transition: color 0.2s ease, background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-1px);
  }

  ${({ active }) =>
    active &&
    `
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  `}

  @media (max-width: 500px) {
    padding: 10px 12px;
    font-size: 12px;
  }
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.03em;
`;

export const PageSubtitle = styled.p`
  margin: 8px 0 0;
  color: #8b93a8;
  font-size: 14px;
  max-width: 420px;
  line-height: 1.55;
`;

export const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 6px;

  @media (max-width: 560px) {
    gap: 12px;
  }
`;

export const InputAmount = styled.input`
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  width: 100%;
  height: 54px;
  outline: none;
  border-radius: 12px;
  padding: 0 16px;
  box-sizing: border-box;
  letter-spacing: -0.02em;
  font-family: 'Inter', monospace;
  transition: border-color 0.2s ease, background 0.2s ease;

  &:focus {
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.03);
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }

  @media (max-width: 480px) {
    font-size: 28px;
    height: 48px;
  }
`;

export const Row = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: center;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const ResponsiveRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  flex-wrap: wrap;

  @media (max-width: 520px) {
    flex-direction: column;
    gap: 10px;
  }
`;

export const DateTimeRow = styled(ResponsiveRow)`
  margin-top: 8px;
  gap: 4px;
`;

export const FormGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 520px) {
    flex-direction: column;
  }
`;

export const Select = styled.select`
  background-color: #0b0f18;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f8fafc;
  padding: 14px 12px;
  font-size: 14px;
  flex: 1;
  min-width: 0;
  outline: none;
  cursor: pointer;
  border-radius: 16px;
  font-family: inherit;

  @media (max-width: 520px) {
    font-size: 13px;
    padding: 12px 10px;
  }
`;

export const TextInput = styled.input`
  background-color: #0b0f18;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f8fafc;
  padding: 14px 16px;
  font-size: 14px;
  flex: 1;
  min-width: 120px;
  outline: none;
  border-radius: 16px;
  box-sizing: border-box;
  font-family: inherit;

  @media (max-width: 520px) {
    font-size: 13px;
    padding: 12px 14px;
  }
`;

export const ColorInput = styled.input`
  background-color: #0b0f18;
  border: 1px solid rgba(255, 255, 255, 0.08);
  width: 45px;
  height: 45px;
  padding: 0;
  cursor: pointer;
  border-radius: 14px;
  flex-shrink: 0;
`;

export const Button = styled.button`
  background-color: #131825;
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 18px;
  min-height: 45px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
  border-radius: 14px;
  flex-shrink: 0;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.065);
    transform: translateY(-1px);
  }

  @media (max-width: 520px) {
    width: 100%;
    padding: 0 14px;
    min-height: 42px;
    font-size: 13px;
  }
`;

export const AccentButton = styled(Button)`
  background-color: #ff8aa5;
  color: #090b11;
  border-color: transparent;

  &:hover {
    background-color: #ff7ea3;
  }
`;

export const SecondaryButton = styled(Button)`
  background-color: rgba(255, 255, 255, 0.06);
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.12);

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const DangerButton = styled(Button)`
  background-color: #451010;
  color: #ffcccc;
  border-color: rgba(255, 120, 120, 0.25);

  &:hover {
    background-color: #5c1b1b;
  }
`;

export const Panel = styled.div`
  width: 100%;
  background: rgba(7, 10, 16, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 28px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 18px;

  @media (max-width: 520px) {
    padding: 16px;
  }
`;

export const MonthNav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  margin-bottom: 8px;
  gap: 12px;
  width: 100%;
  flex-direction: row;
  flex-wrap: nowrap !important; 
`;

export const MonthButton = styled(Button)`
  background: #050505;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 10px 14px;
  font-size: 13px;
  min-width: 110px;

  @media (max-width: 520px) {
    width: 100%;
  }
`;

export const MonthLabel = styled.span`
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
`;

export const CalendarHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
  margin-bottom: 4px;
  color: #5c6679;
  font-size: 9px;
  text-transform: uppercase;
  text-align: center;
`;

export const CalendarHeaderCell = styled.div`
  text-align: center;
  font-weight: 700;
`;

export const BreakdownGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const BreakdownRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const BreakdownLabel = styled.span`
  color: ${({ highlight }) => (highlight ? '#ffb3fc' : '#f8fafc')};
  font-size: 13px;
  font-weight: 700;
`;

export const BreakdownAmount = styled.span`
  color: #a6aec7;
  font-size: 12px;
`;

export const BreakdownBar = styled.div`
  display: flex;
  height: 32px;
  background: #050505;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
`;

export const BreakdownAction = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const DetailsPanel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const RecordHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const RecordText = styled.span`
  color: ${({ subtle }) => (subtle ? '#888' : '#fff')};
  font-size: ${({ large }) => (large ? '16px' : '13px')};
  font-weight: ${({ bold }) => (bold ? 700 : 400)};
`;

export const ModalActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 520px) {
    justify-content: stretch;
  }
`;

export const MemberDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const DetailLabel = styled.div`
  color: #8a94aa;
  font-size: 12px;
`;

export const DetailValue = styled.div`
  color: #f8fafc;
  font-weight: 700;
  font-size: 14px;
`;

export const CollapsibleCard = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  padding: 14px;
  background: #090c14;
`;

export const CollapsibleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const ControlRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 520px) {
    flex-direction: column;
  }
`;

export const GroupCard = styled(CollapsibleCard)`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const StatsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 18px;
  box-sizing: border-box;
`;

export const TotalBlock = styled.div`
  background-color: rgba(15, 18, 26, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 24px 22px;
  border-radius: 28px;
  text-align: left;
  display: grid;
  gap: 8px;
`;

export const StatsLabel = styled.div`
  color: #8a94aa;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const TotalText = styled.div`
  color: #f8fafc;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.03em;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const StatsCard = styled.div`
  background: rgba(9, 12, 19, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 18px;
  border-radius: 24px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18);
`;

export const StatsCardTitle = styled.div`
  color: #8a94aa;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 16px;
`;

export const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
`;

export const CalendarCell = styled.div`
  background: ${({ active }) => (active ? '#12151f' : 'transparent')};
  border-left: ${({ active }) => (active ? '3px solid #ff8cc3' : '3px solid transparent')};
  border: 1px solid ${({ active }) => (active ? '#222' : 'rgba(255, 255, 255, 0.06)')};
  border-radius: 18px;
  min-height: 72px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  color: ${({ active }) => (active ? '#fff' : '#5c6679')};
  opacity: ${({ active }) => (active ? 1 : 0.55)};
  transition: background 0.2s ease, transform 0.2s ease, border 0.2s ease, opacity 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  @media (max-width: 520px) {
    min-height: 68px;
    padding: 10px;
  }
`;

export const CalendarDayNumber = styled.div`
  font-size: 13px;
  font-weight: 700;
`;

export const CalendarAmount = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #f8fafc;
`;

export const BarStack = styled.div`
  display: flex;
  height: 32px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export const BarSegment = styled.div`
  transition: width 0.3s ease;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ darkText }) => (darkText ? '#111' : '#fff')};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
`;

export const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
`;

export const StatsName = styled.span`
  color: #e5e7eb;
  font-size: 14px;
  font-weight: 700;
`;

export const StatsValue = styled.span`
  color: #8a94aa;
  font-size: 13px;
`;

export const TimelineContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 16px;
`;

export const DateGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const DateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border-left: 2px solid rgba(248, 138, 165, 0.8);
  padding: 4px 0 4px 8px;
  margin-bottom: 4px;
`;

export const DateTitle = styled.span`
  color: #f8fafc;
  font-weight: 700;
  font-size: 13px;
`;

export const DateTotal = styled.span`
  color: #8a94aa;
  font-size: 12px;
`;

export const DateItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ListItem = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  gap: 10px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.08);
  }
`;

export const ItemLeft = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
  min-width: 0;
`;

export const ItemRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 56px;
`;

export const CatText = styled.span`
  color: #e5e7eb;
  font-size: 13px;
  line-height: 1.4;
  min-width: 0;
  word-break: break-word;
`;

export const NoteText = styled.span`
  color: #8a94aa;
  font-size: 12px;
  line-height: 1.4;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(2, 4, 9, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

export const ModalCard = styled.div`
  width: min(520px, calc(100% - 48px));
  background-color: #10151f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;

export const SettingsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SettingsSection = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

export const SectionTitle = styled.h3`
  color: #f8fafc;
  font-size: 16px;
  margin-bottom: 12px;
  font-weight: 700;
`;

export const SettingsItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 10px 0;
  gap: 15px;
  width: 100%;
`;

export const CatNameContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
  font-size: 14px;
`;

export const DeleteButton = styled.span`
  color: #7a808f;
  cursor: pointer;
  font-size: 20px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  user-select: none;
  border-radius: 50%;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
  }
`;

export const ResponsiveFormRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
`;

export const EmptyState = styled.div`
  color: #67718a;
  text-align: center;
  margin-top: 40px;
  font-size: 14px;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin: 20px 0;
  width: 100%;
`;

export const QuickDateTimeBadge = styled.button`
  background: ${props => props.isCustom ? 'rgba(248, 138, 165, 0.12)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${props => props.isCustom ? 'rgba(248, 138, 165, 0.3)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.isCustom ? '#ff8aa5' : '#8a94aa'};
  padding: 6px 12px;
  font-size: 11px;
  border-radius: 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;