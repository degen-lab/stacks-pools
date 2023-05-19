import './styles.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import colors from '../../../consts/colorPallete';
import useCurrentTheme from '../../../consts/theme';
import { ContractEndVoteNotifier } from '../../../consts/smartContractFunctions';

interface VotingStatusContainerProps {
  notifier: string | null;
  votingStatus: string | null;
}
const VotingStatusContainer = ({ notifier, votingStatus }: VotingStatusContainerProps) => {
  const { currentTheme } = useCurrentTheme();

  return (
    <div
      style={{ backgroundColor: colors[currentTheme].infoContainers, color: colors[currentTheme].colorWriting }}
      className="info-container-voting-status-page"
    >
      <div
        style={{
          backgroundColor: colors[currentTheme].infoContainers,
          color: colors[currentTheme].colorWriting,
          borderBottom: `1px solid ${colors[currentTheme].colorWriting}`,
        }}
        className="heading-info-container"
      >
        <div className="heading-title-info-container">
          <div style={{ color: colors[currentTheme].defaultYellow }} className="heading-icon-info-container">
            <AccountCircleIcon className="icon-info-container yellow-icon" />
          </div>
          <div className="title-info-container">INFO</div>
        </div>
      </div>
      <div
        style={{ backgroundColor: colors[currentTheme].infoContainers, color: colors[currentTheme].colorWriting }}
        className="content-info-container-normal-user"
      >
        <div className="content-sections-title-info-container">
          <span className="bold-font">Current Notifier: </span>
          <div>{notifier !== null ? notifier : ''}</div>
        </div>
        <div className="content-sections-title-info-container">
          <span className="bold-font">Notifier Voting Status: </span>
          <span>{votingStatus !== null ? votingStatus : ''}</span>
        </div>
      </div>
      {votingStatus === 'Ended by time!' && (
        <div className="footer-join-button-container">
          <button
            className="customButton"
            onClick={() => {
              ContractEndVoteNotifier();
            }}
          >
            End Vote
          </button>
        </div>
      )}
    </div>
  );
};
export default VotingStatusContainer;
