import { useEffect, useState } from 'react';
import {
  readOnlyGetBlocksWon,
  readOnlyGetCurrentBlock,
  readOnlyGetNotifier,
  readOnlyGetNotifierElectionProcessData,
} from '../../../consts/readOnly';
import MiningPoolStatusContainer from '../../reusableComponents/miningPool/MiningStatusContainer';
import useCurrentTheme from '../../../consts/theme';
import colors from '../../../consts/colorPallete';

const MiningPoolStatus = () => {
  const { currentTheme } = useCurrentTheme();
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  const [notifierVoteStatus, setNotifierVoteStatus] = useState<string | null>(null);
  const [currentNotifier, setCurrentNotifier] = useState<string | null>(null);
  const [blocksWon, setBlocksWon] = useState<number | null>(null);

  useEffect(() => {
    const getBlocksWon = async () => {
      const blocks = await readOnlyGetBlocksWon();
      setBlocksWon(blocks);
    };
    getBlocksWon();
  }, []);

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

  useEffect(() => {
    const getCurrentBlock = async () => {
      const block = await readOnlyGetCurrentBlock();
      setCurrentBlock(block);
    };
    getCurrentBlock();
  }, []);

  return (
    <div style={{ color: colors[currentTheme].colorWriting }} className="page-heading-title">
      <h2>Decentralized Mining Pool</h2>
      <h2>Mining Pool - Status</h2>
      <div className="principal-content-profile-page">
        <div className={'main-info-container-normal-user'}>
          <MiningPoolStatusContainer
            notifier={currentNotifier}
            currentBlock={currentBlock}
            blocksWon={blocksWon}
            votingStatus={notifierVoteStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default MiningPoolStatus;
