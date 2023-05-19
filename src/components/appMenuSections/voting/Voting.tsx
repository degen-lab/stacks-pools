import { readOnlyGetNotifier, readOnlyGetNotifierElectionProcessData } from '../../../consts/readOnly';
import useCurrentTheme from '../../../consts/theme';
import { useState, useEffect } from 'react';
import VotingStatusContainer from '../../reusableComponents/voting/VotingStatusContainer';
import colors from '../../../consts/colorPallete';

const Voting = () => {
  const { currentTheme } = useCurrentTheme();
  const [notifierVoteStatus, setNotifierVoteStatus] = useState<string | null>(null);
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentNotifier = async () => {
      const notifier = await readOnlyGetNotifier();
      setCurrentNotifier(notifier);
    };

    getCurrentNotifier();
  }, []);

  useEffect(() => {
    const getNotifierStatus = async () => {
      const notifier = await readOnlyGetNotifierElectionProcessData();
      setNotifierVoteStatus(
        notifier['vote-status'].value === false
          ? 'Elections ended!'
          : parseInt(notifier['election-blocks-remaining'].value) > 0
          ? 'Elections on-going!'
          : 'Ended by time!'
      );
    };
    getNotifierStatus();
  }, []);

  return (
    <div style={{ color: colors[currentTheme].colorWriting }} className="page-heading-title">
      <h2>Decentralized Mining Pool</h2>
      <h2>Voting - Status</h2>
      <div className="principal-content-profile-page">
        <div className={'main-info-container-normal-user'}>
          <VotingStatusContainer notifier={currentNotifier} votingStatus={notifierVoteStatus} />
        </div>
      </div>
    </div>
  );
};

export default Voting;
