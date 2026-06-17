import styled from 'styled-components';

export const AppShell = styled.div`
  background-color: #000000;
  color: #aaaaaa;
  min-height: 100vh;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 16px 100px 16px;
  font-family: monospace;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

export const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  background-color: #050505;
  border-top: 1px solid #111111;
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  z-index: 1000;
`;

export const NavButton = styled.span`
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  color: ${({ active }) => (active ? '#ffffff' : '#555555')};
  border-bottom: ${({ active }) => (active ? '2px solid #fff' : 'none')};
  padding-bottom: ${({ active }) => (active ? '4px' : '0')};
`;

export const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 10px;
`;

export const InputAmount = styled.input`
  background-color: #000;
  border: none;
  border-bottom: 2px solid #222;
  color: #fff;
  font-size: 44px;
  text-align: center;
  width: 100%;
  outline: none;
  font-family: monospace;
  padding: 10px 0;
`;

export const Row = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: center;
`;

export const ResponsiveRow = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  flex-wrap: nowrap;
`;

export const Select = styled.select`
  background-color: #050505;
  border: 1px solid #222;
  color: #fff;
  padding: 12px 8px;
  font-size: 14px;
  flex: 1;
  min-width: 0;
  outline: none;
  cursor: pointer;
  font-family: monospace;
  border-radius: 4px;
`;

export const TextInput = styled.input`
  background-color: #050505;
  border: 1px solid #222;
  color: #fff;
  padding: 12px;
  font-size: 15px;
  flex: 1;
  min-width: 120px;
  outline: none;
  font-family: monospace;
  border-radius: 4px;
  box-sizing: border-box;
`;

export const ColorInput = styled.input`
  background-color: #000;
  border: 1px solid #222;
  width: 45px;
  height: 45px;
  padding: 0;
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;
`;

export const Button = styled.button`
  background-color: #ffffff;
  color: #000000;
  border: none;
  padding: 0 16px;
  height: 45px;
  font-size: 15px;
  cursor: pointer;
  font-weight: bold;
  font-family: monospace;
  border-radius: 4px;
  flex-shrink: 0;
`;

export const Divider = styled.hr`
  width: 100%;
  border: none;
  border-top: 1px solid #111111;
  margin: 24px 0;
`;

export const StatsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
  box-sizing: border-box;
`;

export const TotalBlock = styled.div`
  background-color: #050505;
  border: 1px solid #111;
  padding: 16px;
  border-radius: 4px;
  text-align: center;
`;

export const StatsLabel = styled.div`
  color: #444;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const TotalText = styled.div`
  color: #fff;
  font-size: 32px;
  font-weight: bold;
  margin-top: 4px;
`;

export const StatsGrid = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  flex-wrap: wrap;
`;

export const StatsCard = styled.div`
  background-color: #050505;
  border: 1px solid #111;
  padding: 12px;
  border-radius: 4px;
  flex: 1;
  min-width: 240px;
  box-sizing: border-box;
`;

export const StatsCardTitle = styled.div`
  color: #555;
  font-size: 12px;
  font-weight: bold;
  border-bottom: 1px solid #111;
  padding-bottom: 6px;
  margin-bottom: 12px;
`;

export const StatsCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const StatsCardItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  width: 100%;
`;

export const ChartTrack = styled.div`
  width: 100%;
  height: 4px;
  background-color: #111111;
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
`;

export const ChartBar = styled.div`
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease-out;
  width: ${({ width }) => width || '0%'};
  background-color: ${({ color }) => color || '#ffffff'};
`;

export const TimelineContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 15px;
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
  background-color: #050505;
  border-left: 3px solid #fff;
  padding: 8px 12px;
  margin-bottom: 8px;
  box-sizing: border-box;
`;

export const DateTitle = styled.span`
  color: #ffffff;
  font-weight: bold;
  font-size: 14px;
`;

export const DateTotal = styled.span`
  color: #888888;
  font-size: 12px;
  font-weight: bold;
`;

export const DateItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 4px;
`;

export const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #0a0a0a;
  gap: 10px;
`;

export const ItemLeft = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
`;

export const ItemRight = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export const TimeText = styled.span`
  color: #333333;
  font-size: 12px;
  margin-right: 4px;
  flex-shrink: 0;
`;

export const CatText = styled.span`
  color: #666666;
  font-size: 13px;
  word-break: break-all;
`;

export const NoteText = styled.span`
  color: #444444;
  font-size: 13px;
  word-break: break-all;
`;

export const SettingsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SettingsSection = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

export const SectionTitle = styled.h3`
  color: #fff;
  font-size: 16px;
  margin-bottom: 12px;
  font-family: monospace;
`;

export const SettingsItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #111;
  padding-bottom: 8px;
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
  color: #555;
  cursor: pointer;
  font-size: 20px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  user-select: none;
`;

export const ResponsiveFormRow = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
`;

export const EmptyState = styled.div`
  color: #444;
  text-align: center;
  margin-top: 40px;
`;
