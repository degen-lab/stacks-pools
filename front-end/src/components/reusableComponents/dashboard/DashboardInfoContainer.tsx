import '../../../css/buttons/styles.css';
import './styles.css';
import '../../../css/common-page-alignments/styles.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import colors from '../../../consts/colorPallete';
import { ContractAskToJoinMining } from '../../../consts/smartContractFunctions';
import { selectCurrentTheme, UserRoleMining } from '../../../redux/reducers/user-state';
import { useAppSelector } from '../../../redux/store';
import { numberWithCommas } from '../../../consts/converter';

interface DashboardInfoContainerProps {
  notifier: string | null;
  minersList: Array<string>;
  blocksWon: number | null;
  stacksRewards: number | null;
  userAddress: string | null;
  currentRole: UserRoleMining;
  currentBurnBlockHeight: number | null;
  minersNumber: number | null;
  poolTotalSpendPerBlock: number | null;
}
const DashboardInfoContainer = ({
  notifier,
  minersList,
  blocksWon,
  stacksRewards,
  userAddress,
  currentRole,
  currentBurnBlockHeight,
  minersNumber,
  poolTotalSpendPerBlock,
}: DashboardInfoContainerProps) => {
  const appCurrentTheme = useAppSelector(selectCurrentTheme);

  return (
    <div
      style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
      className="info-container-dashboard-page"
    >
      <div
        style={{
          backgroundColor: colors[appCurrentTheme].infoContainers,
          color: colors[appCurrentTheme].colorWriting,
          borderBottom: `1px solid ${colors[appCurrentTheme].colorWriting}`,
        }}
        className="heading-info-container"
      >
        <div className="heading-title-info-container">
          <div style={{ color: colors[appCurrentTheme].defaultYellow }} className="heading-icon-info-container">
            <AccountCircleIcon className="icon-info-container yellow-icon" />
          </div>
          <div className="title-info-container">INFO</div>
        </div>
      </div>
      <div
        style={{ backgroundColor: colors[appCurrentTheme].infoContainers, color: colors[appCurrentTheme].colorWriting }}
        className="content-info-container-normal-user"
      >
        <div className="content-sections-title-info-container">
          <span className="bold-font">Current Bitcoin Block Height: </span>
          <div className="result-of-content-section">
            {currentBurnBlockHeight !== null ? numberWithCommas(currentBurnBlockHeight) : ''}
          </div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Current Notifier: </span>
          <div className="result-of-content-section">{notifier !== null ? notifier : ''}</div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Number of Miners in the Pool: </span>
          <div className="result-of-content-section">{minersNumber !== null ? minersNumber : 0}</div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Miners List: </span>
          {minersList.length !== 0 &&
            minersList.map((data: string, index: number) => (
              <div className="result-of-content-section" key={index}>
                {data}
              </div>
            ))}
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Pool total spend per block: </span>
          <div className="result-of-content-section">
            {poolTotalSpendPerBlock !== null ? numberWithCommas(poolTotalSpendPerBlock / 1_000_000) : 0} sats
          </div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Number of Blocks Won: </span>
          <span className="result-of-content-section">{blocksWon !== null ? numberWithCommas(blocksWon) : ''}</span>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Stacks Rewards: </span>
          <span className="result-of-content-section">
            {stacksRewards !== null ? numberWithCommas(stacksRewards / 1000000) + ' STX' : ''}
          </span>
        </div>
      </div>
      {currentRole === 'NormalUser' && (
        <div style={{ alignContent: 'center', textAlign: 'center' }}>
          <div>
            <label className="custom-label">Insert your Bitcoin public key</label>
            <div className="bottom-margins" style={{ width: '20vw', margin: 'auto' }}>
              <input
                className="custom-input"
                type="text"
                // TODO: add onChange for publicKey input and operate join operation with it
                // onChange={(e) => setBtcAddress(e.target.value)}
              ></input>
            </div>
          </div>
          <br />
          <br />
          <button
            className={appCurrentTheme === 'light' ? 'customButton' : 'customDarkButton'}
            onClick={() => {
              if (userAddress !== null) {
                ContractAskToJoinMining(`${userAddress}`);
              }
            }}
          >
            Join Pool
          </button>
        </div>
      )}
    </div>
  );
};
export default DashboardInfoContainer;
