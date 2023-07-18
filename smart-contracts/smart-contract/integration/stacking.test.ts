import {
  asyncExpectCurrentCycleIdToBe,
  buildDevnetNetworkOrchestrator,
  DEFAULT_EPOCH_TIMELINE,
  getAccount,
  getBitcoinBlockHeight,
  getBlockPoxAddresses,
  getBlockRewards,
  getCheckDelegation,
  getNetworkIdFromEnv,
  getPoolMembers,
  getScLockedBalance,
  getStackerWeight,
  readRewardCyclePoxAddressForAddress,
  readRewardCyclePoxAddressListAtIndex,
  waitForStacks24,
} from './helpers-stacking';
import {
  broadcastStackSTX,
  waitForNextPreparePhase,
  waitForNextRewardPhase,
  getPoxInfo,
  waitForRewardCycleId,
  initiateStacking,
  createVault,
  getStackerInfo,
  stackIncrease,
} from './helpers-stacking';
import { Accounts, Contracts } from './constants-stacking';
import { StacksTestnet } from '@stacks/network';
import { DevnetNetworkOrchestrator, StacksBlockMetadata } from '@hirosystems/stacks-devnet-js';

import { broadcastAllowContractCallerContracCall } from './allowContractCaller';
import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  broadcastDelegateStackStx,
  broadcastDelegateStx,
  broadcastDepositStxOwner,
  broadcastJoinPool,
  broadcastReserveStxOwner,
  broadcastRewardDistribution,
  broadcastUpdateScBalances,
} from './helper-fp';
import { expect } from 'chai';
import { getNonce, optionalCVOf, uintCV } from '@stacks/transactions';
import { mainContract } from './contracts';

describe('testing stacking under epoch 2.1', () => {
  let orchestrator: DevnetNetworkOrchestrator;
  let timeline = DEFAULT_EPOCH_TIMELINE;

  beforeAll(() => {
    orchestrator = buildDevnetNetworkOrchestrator(getNetworkIdFromEnv(), timeline);
    orchestrator.start(200000);
  });

  afterAll(() => {
    orchestrator.terminate();
  });

  // it("allow pool SC in pox-2", async () => {
  //   const network = new StacksTestnet({ url: orchestrator.getStacksNodeUrl() });
  // });

  // it("delegate after allowing pool SC in pox-2 and joining the pool", async () => {
  //   const network = new StacksTestnet({ url: orchestrator.getStacksNodeUrl() });

  //   await orchestrator.waitForStacksBlockAnchoredOnBitcoinBlockOfHeight(
  //     timeline.pox_2_activation + 1,
  //     5,
  //     true
  //   );

  //   let chainUpdate = await waitForRewardCycleId(network, orchestrator, 2);
  //   console.log("chain update", chainUpdate.new_blocks[0].block.metadata);

  //   let poxInfo = await getPoxInfo(network);
  //   console.log("PoxInfo, Pre conventional stacking:", poxInfo);

  //   let nonceUpdated = (await getAccount(network, Accounts.WALLET_4.stxAddress))
  //     .nonce;

  //   await broadcastAllowContractCallerContracCall({
  //     network: network,
  //     nonce: nonceUpdated,
  //     senderKey: Accounts.WALLET_4.secretKey,
  //   });

  //   chainUpdate = await orchestrator.waitForNextStacksBlock();
  //   let tx = await chainUpdate.new_blocks[0].block.transactions[1];
  //   console.log("tx Allow Contract Caller", tx);
  //   let metadata = await chainUpdate.new_blocks[0].block.transactions[1][
  //     "metadata"
  //   ];
  //   expect((metadata as any)["success"]).toBe(true);
  //   expect((metadata as any)["result"]).toBe("(ok true)");

  //   nonceUpdated = (await getAccount(network, Accounts.WALLET_4.stxAddress))
  //     .nonce;

  //   await broadcastJoinPool({
  //     nonce: nonceUpdated,
  //     network,
  //     user: Accounts.WALLET_4,
  //   });

  //   chainUpdate = await orchestrator.waitForNextStacksBlock();
  //   tx = await chainUpdate.new_blocks[0].block.transactions[1];
  //   console.log("tx Join Stacking Pool", tx);
  //   metadata = await chainUpdate.new_blocks[0].block.transactions[1][
  //     "metadata"
  //   ];
  //   expect((metadata as any)["success"]).toBe(true);
  //   expect((metadata as any)["result"]).toBe("(ok true)");

  //   nonceUpdated = (await getAccount(network, Accounts.WALLET_4.stxAddress))
  //     .nonce;

  //   await broadcastDelegateStx({
  //     amountUstx: 125_000_000_000_000,
  //     user: Accounts.WALLET_4,
  //     nonce: nonceUpdated,
  //     network,
  //   });

  //   chainUpdate = await orchestrator.waitForNextStacksBlock();
  //   tx = await chainUpdate.new_blocks[0].block.transactions[1];
  //   console.log("tx Delegate STX", tx);
  //   metadata = chainUpdate.new_blocks[0].block.transactions[1]["metadata"];
  //   expect((metadata as any)["success"]).toBe(true);
  //   expect((metadata as any)["result"]).toBe("(ok true)");

  //   console.log(await getAccount(network, Accounts.WALLET_4.stxAddress));
  // });

  // it("whole flow 5 stackers", async () => {
  //   const network = new StacksTestnet({ url: orchestrator.getStacksNodeUrl() });

  //   let usersList = [
  //     Accounts.WALLET_8,
  //     Accounts.WALLET_1,
  //     Accounts.WALLET_2,
  //     Accounts.WALLET_3,
  //   ];

  //   let nonceUpdated = (await getAccount(network, Accounts.DEPLOYER.stxAddress))
  //     .nonce;
  //   await broadcastDepositStxOwner({
  //     amountUstx: 11_000_000_000,
  //     nonce: nonceUpdated,
  //     network: network,
  //     user: Accounts.DEPLOYER,
  //   });
  //   let chainUpdate = await orchestrator.waitForNextStacksBlock();
  //   let metadata = chainUpdate.new_blocks[0].block.transactions[1]["metadata"];
  //   expect((metadata as any)["success"]).toBe(true);
  //   expect((metadata as any)["result"]).toBe("(ok true)");

  //   // TODO: Add reserve-funds-future-rewards

  //   await orchestrator.waitForStacksBlockAnchoredOnBitcoinBlockOfHeight(
  //     timeline.pox_2_activation + 1,
  //     10,
  //     true
  //   );

  //   console.log(await getPoxInfo(network));

  //   console.log(chainUpdate.new_blocks[0].block.metadata);
  //   console.log(
  //     "DEPLOYER NONCE:",
  //     (await getAccount(network, Accounts.DEPLOYER.stxAddress)).nonce,
  //     "WALLET_1 NONCE:",
  //     (await getAccount(network, Accounts.WALLET_1.stxAddress)).nonce
  //   );

  //   await broadcastAllowContractCallerContracCall({
  //     network,
  //     nonce: (await getAccount(network, usersList[0].stxAddress)).nonce,
  //     senderKey: usersList[0].secretKey,
  //   });

  //   await broadcastAllowContractCallerContracCall({
  //     network,
  //     nonce: (await getAccount(network, usersList[1].stxAddress)).nonce,
  //     senderKey: usersList[1].secretKey,
  //   });

  //   await broadcastAllowContractCallerContracCall({
  //     network,
  //     nonce: (await getAccount(network, usersList[2].stxAddress)).nonce,
  //     senderKey: usersList[2].secretKey,
  //   });
  //   await broadcastReserveStxOwner({
  //     amountUstx: 11_000_000_000,
  //     nonce: (await getAccount(network, Accounts.DEPLOYER.stxAddress)).nonce,
  //     network: network,
  //     user: Accounts.DEPLOYER,
  //   });
  //   chainUpdate = await orchestrator.waitForNextStacksBlock();
  //   // metadata = chainUpdate.new_blocks[0].block.transactions[1]["metadata"];
  //   // expect((metadata as any)["success"]).toBe(true);
  //   // expect((metadata as any)["result"]).toBe("(ok true)");
  //   // chainUpdate = await orchestrator.waitForNextStacksBlock();

  //   for (
  //     let i = 1;
  //     i < chainUpdate.new_blocks[0].block.transactions.length;
  //     i++
  //   ) {
  //     let metadataAllowI =
  //       chainUpdate.new_blocks[0].block.transactions[i]["metadata"];
  //     expect((metadataAllowI as any)["success"]).toBe(true);
  //     expect((metadataAllowI as any)["result"]).toBe("(ok true)");
  //   }

  //   for (let i = 0; i < usersList.length - 1; i++) {
  //     await broadcastJoinPool({
  //       nonce: (await getAccount(network, usersList[i].stxAddress)).nonce,
  //       network,
  //       user: usersList[i],
  //     });
  //   }
  //   chainUpdate = await orchestrator.waitForNextStacksBlock();

  //   for (let i = 1; i < usersList.length; i++) {
  //     metadata = chainUpdate.new_blocks[0].block.transactions[i]["metadata"];
  //     expect((metadata as any)["success"]).toBe(true);
  //     expect((metadata as any)["result"]).toBe("(ok true)");
  //   }

  //   await broadcastDelegateStx({
  //     amountUstx: 125_000_000_000,
  //     user: usersList[0],
  //     nonce: (await getAccount(network, usersList[0].stxAddress)).nonce,
  //     network,
  //   });

  //   await broadcastDelegateStx({
  //     amountUstx: 125_000_000_000,
  //     user: usersList[1],
  //     nonce: (await getAccount(network, usersList[1].stxAddress)).nonce,
  //     network,
  //   });

  //   // modified here to be greater than min_threshold_ustx
  //   await broadcastDelegateStx({
  //     amountUstx: 50_286_942_145_278, // pox activation threshold
  //     user: usersList[2],
  //     nonce: (await getAccount(network, usersList[2].stxAddress)).nonce,
  //     network,
  //   });

  //   chainUpdate = await orchestrator.waitForNextStacksBlock();
  //   console.log("delegations:", chainUpdate.new_blocks[0].block.transactions);

  //   for (
  //     let i = 1;
  //     i < chainUpdate.new_blocks[0].block.transactions.length;
  //     i++
  //   ) {
  //     let metadataDelegateI =
  //       chainUpdate.new_blocks[0].block.transactions[i]["metadata"];
  //     expect((metadataDelegateI as any)["success"]).toBe(true);
  //     expect((metadataDelegateI as any)["result"]).toBe("(ok false)");
  //   }

  //   chainUpdate = await orchestrator.waitForNextStacksBlock();
  //   for (
  //     let i = 1;
  //     i < chainUpdate.new_blocks[0].block.transactions.length;
  //     i++
  //   ) {
  //     let metadataDelegateI =
  //       chainUpdate.new_blocks[0].block.transactions[i]["metadata"];
  //     expect((metadataDelegateI as any)["success"]).toBe(true);
  //     expect((metadataDelegateI as any)["result"]).toBe("(ok true)");
  //   }
  //   chainUpdate = await orchestrator.waitForNextStacksBlock();
  //   for (
  //     let i = 1;
  //     i < chainUpdate.new_blocks[0].block.transactions.length;
  //     i++
  //   ) {
  //     let metadataDelegateI =
  //       chainUpdate.new_blocks[0].block.transactions[i]["metadata"];
  //     expect((metadataDelegateI as any)["success"]).toBe(true);
  //     expect((metadataDelegateI as any)["result"]).toBe("(ok true)");
  //   }

  //   // Friedger check table entry:

  //   let poxInfo = await getPoxInfo(network);
  //   console.log("pox info CURRENT CYCLE:", poxInfo.current_cycle);
  //   console.log("pox info NEXT CYCLE:", poxInfo.next_cycle);

  //   const poxAddrInfo0 = await readRewardCyclePoxAddressForAddress(
  //     network,
  //     2,
  //     Accounts.DEPLOYER.stxAddress
  //   );

  //   expect(poxAddrInfo0).toBeNull();
  //   console.log("POX ADDRESS INFO WALLET 1", poxAddrInfo0);

  //   const poxAddrInfo1 = await readRewardCyclePoxAddressListAtIndex(
  //     network,
  //     3,
  //     0
  //   );

  //   expect(poxAddrInfo1?.["total-ustx"]).toEqual(uintCV(50_536_942_145_278)); // 375_000_000_000 before
  //   console.log("POX ADDRESS INFO POOL", poxAddrInfo1);

  //   console.log(
  //     "first user:",
  //     await getAccount(network, usersList[0].stxAddress)
  //   );
  //   console.log(
  //     "second user:",
  //     await getAccount(network, usersList[1].stxAddress)
  //   );
  //   console.log(
  //     "third user:",
  //     await getAccount(network, usersList[2].stxAddress)
  //   );
  //   console.log(
  //     "fourth user:",
  //     await getAccount(network, usersList[3].stxAddress)
  //   );

  //   console.log(
  //     "** " +
  //       (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata)
  //         .bitcoin_anchor_block_identifier.index
  //   );

  //   chainUpdate = await orchestrator.waitForNextStacksBlock();

  //   getPoolMembers(network);

  //   await broadcastUpdateScBalances({
  //     user: Accounts.DEPLOYER,
  //     nonce: (await getAccount(network, Accounts.DEPLOYER.stxAddress)).nonce,
  //     network,
  //   });

  //   chainUpdate = await orchestrator.waitForNextStacksBlock();

  //   let metadataUpdateBalances =
  //     chainUpdate.new_blocks[0].block.transactions[1]["metadata"];
  //   expect((metadataUpdateBalances as any)["success"]).toBe(true);
  //   expect((metadataUpdateBalances as any)["result"]).toBe("(ok true)");

  //   console.log(
  //     "** " +
  //       (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata)
  //         .bitcoin_anchor_block_identifier.index
  //   );

  //   await getScLockedBalance(network);

  //   await getStackerWeight(network, usersList[0].stxAddress, 3);
  //   await getStackerWeight(network, usersList[1].stxAddress, 3);
  //   await getStackerWeight(network, usersList[2].stxAddress, 3);
  //   await getStackerWeight(network, usersList[3].stxAddress, 3);

  //   chainUpdate = await waitForRewardCycleId(network, orchestrator, 4);
  //   console.log(
  //     "** " +
  //       (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata)
  //         .bitcoin_anchor_block_identifier.index
  //   );

  //   await getBlockPoxAddresses(network, Accounts.DEPLOYER.stxAddress, 130);
  //   await getBlockPoxAddresses(network, Accounts.DEPLOYER.stxAddress, 131);
  //   await getBlockPoxAddresses(network, Accounts.DEPLOYER.stxAddress, 132);
  //   await getBlockPoxAddresses(network, Accounts.DEPLOYER.stxAddress, 133);

  //   await getBlockRewards(network, Accounts.DEPLOYER.stxAddress, 130);
  //   await getBlockRewards(network, Accounts.DEPLOYER.stxAddress, 131);
  //   await getBlockRewards(network, Accounts.DEPLOYER.stxAddress, 132);
  //   await getBlockRewards(network, Accounts.DEPLOYER.stxAddress, 133);

  //   await broadcastRewardDistribution({
  //     burnBlockHeight: 130,
  //     network,
  //     user: Accounts.DEPLOYER,
  //     nonce: (await getAccount(network, Accounts.DEPLOYER.stxAddress)).nonce,
  //   });

  //   await broadcastRewardDistribution({
  //     burnBlockHeight: 131,
  //     network,
  //     user: Accounts.WALLET_1,
  //     nonce: (await getAccount(network, Accounts.WALLET_1.stxAddress)).nonce,
  //   });

  //   await broadcastRewardDistribution({
  //     burnBlockHeight: 132,
  //     network,
  //     user: Accounts.WALLET_2,
  //     nonce: (await getAccount(network, Accounts.WALLET_2.stxAddress)).nonce,
  //   });

  //   await broadcastRewardDistribution({
  //     burnBlockHeight: 133,
  //     network,
  //     user: Accounts.WALLET_8,
  //     nonce: (await getAccount(network, Accounts.WALLET_8.stxAddress)).nonce,
  //   });

  //   chainUpdate = await orchestrator.waitForNextStacksBlock();
  //   console.log(chainUpdate.new_blocks[0].block.transactions);

  //   chainUpdate = await orchestrator.waitForNextStacksBlock();
  //   console.log(chainUpdate.new_blocks[0].block.transactions);

  //   console.log(
  //     "first user:",
  //     await getAccount(network, usersList[0].stxAddress)
  //   );
  //   console.log(
  //     "second user:",
  //     await getAccount(network, usersList[1].stxAddress)
  //   );
  //   console.log(
  //     "third user:",
  //     await getAccount(network, usersList[2].stxAddress)
  //   );
  //   console.log(
  //     "fourth user:",
  //     await getAccount(network, usersList[3].stxAddress)
  //   );
  // });

  it('whole flow many cycles 3 stackers', async () => {
    console.log('POX-3 test beginning');
    const network = new StacksTestnet({ url: orchestrator.getStacksNodeUrl() });

    let usersList = [Accounts.WALLET_8, Accounts.WALLET_1, Accounts.WALLET_2, Accounts.WALLET_3];

    // Wait for Pox-2 activation

    await waitForStacks24(orchestrator, timeline);

    console.log(await getPoxInfo(network));

    // Wait for the contracts to be deployed

    let chainUpdate, txs;
    let noOfTxs = 0;
    while (noOfTxs < 18) {
      chainUpdate = await orchestrator.waitForNextStacksBlock();
      txs = chainUpdate.new_blocks[0].block.transactions;
      if (txs.length > 1) {
        noOfTxs += txs.length - 1;
        console.log(noOfTxs);
      }
    }
    // Deposit STX Liquidity Provider

    await broadcastDepositStxOwner({
      amountUstx: 11_000_000_000,
      nonce: (await getAccount(network, Accounts.DEPLOYER.stxAddress)).nonce,
      network: network,
      user: Accounts.DEPLOYER,
    });

    // Check the deposit tx

    let depositTxIndex = 0;
    let blockIndex = 0;
    while (depositTxIndex < 1) {
      chainUpdate = await orchestrator.waitForNextStacksBlock();
      txs = chainUpdate.new_blocks[0].block.transactions;
      blockIndex++;
      if (txs.length > 1) {
        let txMetadata = txs[1].metadata;
        let txData = txMetadata.kind.data;
        let txSC = txData['contract_identifier'];
        let txMethod = txData['method'];
        if (txMethod == 'deposit-stx-liquidity-provider') {
          expect(txSC as any).toBe(`${mainContract.address}.${mainContract.name}`);
          expect(txMethod as any).toBe('deposit-stx-liquidity-provider');
          expect((txMetadata as any)['success']).toBe(true);
          expect((txMetadata as any)['result']).toBe(`(ok true)`);
          console.log(`Deposit STX Metadata, (block index ${blockIndex}): `, txMetadata);
          depositTxIndex++;
        }
      }
    }

    // Allow pool in Pox-3

    await broadcastAllowContractCallerContracCall({
      network,
      nonce: (await getAccount(network, usersList[0].stxAddress)).nonce,
      senderKey: usersList[0].secretKey,
    });
    await broadcastAllowContractCallerContracCall({
      network,
      nonce: (await getAccount(network, usersList[1].stxAddress)).nonce,
      senderKey: usersList[1].secretKey,
    });
    await broadcastAllowContractCallerContracCall({
      network,
      nonce: (await getAccount(network, usersList[2].stxAddress)).nonce,
      senderKey: usersList[2].secretKey,
    });

    // Check the allow txs

    let allowTxIndex = 0;
    blockIndex = 0;

    while (allowTxIndex < 3) {
      chainUpdate = await orchestrator.waitForNextStacksBlock();
      txs = chainUpdate.new_blocks[0].block.transactions;
      blockIndex++;

      if (txs.length > 1) {
        for (let i = 1; i <= txs.length - 1; i++) {
          let txMetadata = txs[i].metadata;
          let txData = txMetadata.kind.data;
          let txSC = txData['contract_identifier'];
          let txMethod = txData['method'];

          if (txMethod == 'allow-contract-caller') {
            expect(txSC as any).toBe(`${Contracts.POX_3.address}.${Contracts.POX_3.name}`);
            expect(txMethod as any).toBe('allow-contract-caller');
            expect((txMetadata as any)['success']).toBe(true);
            expect((txMetadata as any)['result']).toBe(`(ok true)`);
            allowTxIndex++;
            console.log(`Allow Contract Caller Metadata ${allowTxIndex}, block index ${blockIndex}`, txMetadata);
          }
        }
      }
    }

    // Reserve STX for future rewards Liquidity Provider

    await broadcastReserveStxOwner({
      amountUstx: 11_000_000_000,
      nonce: (await getAccount(network, Accounts.DEPLOYER.stxAddress)).nonce,
      network: network,
      user: Accounts.DEPLOYER,
    });

    // Check the Reserve STX tx

    for (let i = 0; i <= 15; i++) {
      chainUpdate = await orchestrator.waitForNextStacksBlock();
      txs = chainUpdate.new_blocks[0].block.transactions;

      if (txs.length > 1) {
        let txMetadata = txs[1].metadata;
        let txData = txMetadata.kind.data;
        let txSC = txData['contract_identifier'];
        let txMethod = txData['method'];

        expect(txSC as any).toBe(`${mainContract.address}.${mainContract.name}`);
        expect(txMethod as any).toBe('reserve-funds-future-rewards');
        expect((txMetadata as any)['success']).toBe(true);
        expect((txMetadata as any)['result']).toBe(`(ok true)`);
        console.log(`Reserve STX Metadata, block index ${i + 1}`, txMetadata);
        i = 15;
      }
    }

    // 3 Stackers Join Pool

    for (let i = 0; i < usersList.length - 1; i++) {
      await broadcastJoinPool({
        nonce: (await getAccount(network, usersList[i].stxAddress)).nonce,
        network,
        user: usersList[i],
      });
    }

    // Check the Join txs

    let joinTxIndex = 0;
    blockIndex = 0;
    while (joinTxIndex < 3) {
      chainUpdate = await orchestrator.waitForNextStacksBlock();
      txs = chainUpdate.new_blocks[0].block.transactions;
      blockIndex++;
      if (txs.length > 1) {
        for (let i = 1; i <= txs.length - 1; i++) {
          let txMetadata = txs[i].metadata;
          let txData = txMetadata.kind.data;
          let txSC = txData['contract_identifier'];
          let txMethod = txData['method'];

          expect(txSC as any).toBe(`${mainContract.address}.${mainContract.name}`);
          expect(txMethod as any).toBe('join-stacking-pool');
          expect((txMetadata as any)['success']).toBe(true);
          expect((txMetadata as any)['result']).toBe(`(ok true)`);
          joinTxIndex++;
          console.log(`Join Pool Metadata ${joinTxIndex}, block index ${blockIndex}`, txMetadata);
        }
      }
    }
    console.log('Join done');

    // 3 Stackers Delegate STX

    await broadcastDelegateStx({
      amountUstx: 125_000_000_000,
      user: usersList[0],
      nonce: (await getAccount(network, usersList[0].stxAddress)).nonce,
      network,
    });

    console.log('1st delegation submitted');

    await broadcastDelegateStx({
      amountUstx: 125_000_000_000,
      user: usersList[1],
      nonce: (await getAccount(network, usersList[1].stxAddress)).nonce,
      network,
    });

    console.log('2nd delegation submitted');

    await broadcastDelegateStx({
      amountUstx: 50_286_942_145_278, // pox activation threshold
      user: usersList[2],
      nonce: (await getAccount(network, usersList[2].stxAddress)).nonce,
      network,
    });

    console.log('3rd delegation submitted');

    // Check the Delegate txs

    let delegateTxIndex = 0;
    blockIndex = 0;
    while (delegateTxIndex < 3) {
      console.log('block index searching for delegations: ', blockIndex);
      chainUpdate = await orchestrator.waitForNextStacksBlock();
      txs = chainUpdate.new_blocks[0].block.transactions;
      blockIndex++;
      if (txs.length > 1) {
        for (let i = 1; i <= txs.length - 1; i++) {
          let txMetadata = txs[i].metadata;
          let txData = txMetadata.kind.data;
          let txSC = txData['contract_identifier'];
          let txMethod = txData['method'];

          expect(txSC as any).toBe(`${mainContract.address}.${mainContract.name}`);
          expect(txMethod as any).toBe('delegate-stx');
          expect((txMetadata as any)['success']).toBe(true);
          // expect((txMetadata as any)['result']).toBe(`(ok true)`);
          delegateTxIndex++;
          console.log(`Delegate STX Metadata ${delegateTxIndex}, block index ${blockIndex}`, txMetadata);
        }
      }
    }

    console.log(
      'The last Delegation block: ' +
        (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata).bitcoin_anchor_block_identifier.index
    );
    // Friedger check table entry:

    let poxInfo = await getPoxInfo(network);
    console.log('pox info CURRENT CYCLE:', poxInfo.current_cycle);
    console.log('pox info NEXT CYCLE:', poxInfo.next_cycle);

    let poxAddrInfo0 = await readRewardCyclePoxAddressForAddress(
      network,
      poxInfo.current_cycle.id,
      Accounts.DEPLOYER.stxAddress
    );

    expect(poxAddrInfo0).toBeNull();
    console.log('POX ADDRESS INFO WALLET 1', poxAddrInfo0);

    let poxAddrInfo1 = await readRewardCyclePoxAddressListAtIndex(network, poxInfo.next_cycle.id, 0);
    // Check the Total Stacked STX
    console.log('poxAddrInfo1', poxAddrInfo1);
    expect(poxAddrInfo1?.['total-ustx']).toEqual(uintCV(50_536_942_145_278));
    console.log('POX ADDRESS INFO POOL', poxAddrInfo1);

    // Check balances

    let userAccount1 = await getAccount(network, usersList[0].stxAddress);
    console.log('first user:', userAccount1);

    let userAccount2 = await getAccount(network, usersList[1].stxAddress);
    console.log('second user:', userAccount2);

    let userAccount3 = await getAccount(network, usersList[2].stxAddress);
    console.log('third user:', userAccount3);

    let userAccount4 = await getAccount(network, usersList[3].stxAddress);
    console.log('fourth user:', userAccount4);

    // chainUpdate = await orchestrator.waitForNextStacksBlock();

    // Update SC balances

    await broadcastUpdateScBalances({
      user: Accounts.DEPLOYER,
      nonce: (await getAccount(network, Accounts.DEPLOYER.stxAddress)).nonce,
      network,
    });

    let updateBalancesTxIndex = 0;
    blockIndex = 0;

    while (updateBalancesTxIndex < 1) {
      chainUpdate = await orchestrator.waitForNextStacksBlock();
      txs = chainUpdate.new_blocks[0].block.transactions;
      blockIndex++;

      if (txs.length > 1) {
        for (let i = 1; i <= txs.length - 1; i++) {
          let txMetadata = txs[i].metadata;
          let txData = txMetadata.kind.data;
          let txSC = txData['contract_identifier'];
          let txMethod = txData['method'];
          console.log(
            '** ' +
              (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata).bitcoin_anchor_block_identifier.index
          );
          expect(txSC as any).toBe(`${mainContract.address}.${mainContract.name}`);
          expect(txMethod as any).toBe('update-sc-balances');
          expect((txMetadata as any)['success']).toBe(true);
          // expect((txMetadata as any)['result']).toBe(`(ok true)`);
          updateBalancesTxIndex++;
          console.log(`Update Balances Metadata ${updateBalancesTxIndex}, block index ${blockIndex}`, txMetadata);
        }
      }
    }
    let updateBalancesBlock = (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata)
      .bitcoin_anchor_block_identifier.index;
    console.log('The update balances block: ' + updateBalancesBlock);

    await getScLockedBalance(network); // 6 * block index + starting block

    // Check weights

    console.log(`DEPLOYER weight:`);
    let deployerWeight = await getStackerWeight(network, Accounts.DEPLOYER.stxAddress, poxInfo.next_cycle.id);
    // expect(deployerWeight as any).toBe('217');

    for (let i = 0; i <= 3; i++) {
      let userWeight = await getStackerWeight(network, usersList[i].stxAddress, poxInfo.next_cycle.id);
      i == 2
        ? expect(userWeight as any).toBe('994836')
        : i < 2
        ? expect(userWeight as any).toBe('2472')
        : expect(userWeight.value as any).toBe(null);
    }

    chainUpdate = await waitForRewardCycleId(network, orchestrator, poxInfo.next_cycle.id);
    console.log(
      '** ' + (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata).bitcoin_anchor_block_identifier.index
    );

    // Print Pox Addresses for the blocks from 130 to 133

    for (let i = 170; i <= 176; i++) await getBlockPoxAddresses(network, Accounts.DEPLOYER.stxAddress, i);

    // Print Block Rewards for the blocks from 130 to 133

    for (let i = 170; i <= 176; i++) await getBlockRewards(network, Accounts.DEPLOYER.stxAddress, i);

    // Distribute Rewards For The Previously Verified Blocks (even if won or not)

    await broadcastRewardDistribution({
      burnBlockHeight: 130,
      network,
      user: Accounts.DEPLOYER,
      nonce: (await getAccount(network, Accounts.DEPLOYER.stxAddress)).nonce,
    });

    await broadcastRewardDistribution({
      burnBlockHeight: 131,
      network,
      user: Accounts.WALLET_1,
      nonce: (await getAccount(network, Accounts.WALLET_1.stxAddress)).nonce,
    });

    await broadcastRewardDistribution({
      burnBlockHeight: 132,
      network,
      user: Accounts.WALLET_2,
      nonce: (await getAccount(network, Accounts.WALLET_2.stxAddress)).nonce,
    });

    await broadcastRewardDistribution({
      burnBlockHeight: 133,
      network,
      user: Accounts.WALLET_8,
      nonce: (await getAccount(network, Accounts.WALLET_8.stxAddress)).nonce,
    });

    chainUpdate = await orchestrator.waitForNextStacksBlock();
    console.log(chainUpdate.new_blocks[0].block.transactions);

    chainUpdate = await orchestrator.waitForNextStacksBlock();
    console.log(chainUpdate.new_blocks[0].block.transactions);

    // Check Balances

    console.log('deployer:', await getAccount(network, Accounts.DEPLOYER.stxAddress));
    console.log('first user:', await getAccount(network, usersList[0].stxAddress));
    console.log('second user:', await getAccount(network, usersList[1].stxAddress));
    console.log('third user:', await getAccount(network, usersList[2].stxAddress));
    console.log('fourth user:', await getAccount(network, usersList[3].stxAddress));

    console.log(
      '** ' + (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata).bitcoin_anchor_block_identifier.index
    );

    // NOW: burn block 142 (4th cycle)

    await getCheckDelegation(network, usersList[0].stxAddress);
    await getCheckDelegation(network, usersList[1].stxAddress);
    await getCheckDelegation(network, usersList[2].stxAddress);
    await getCheckDelegation(network, usersList[3].stxAddress);

    let nonceUser0 = 4;
    let nonceUser1 = 5;
    let nonceUser2 = 5;
    let nonceUser3 = 1;
    // Delegate again
    chainUpdate = await orchestrator.waitForNextStacksBlock();

    await broadcastDelegateStx({
      amountUstx: 10_000_000_000,
      user: usersList[0],
      nonce: ++nonceUser0,
      network,
    });

    await broadcastDelegateStx({
      amountUstx: 10_000_000_000,
      user: usersList[1],
      nonce: ++nonceUser1,
      network,
    });

    chainUpdate = await orchestrator.waitForNextStacksBlock();

    await broadcastDelegateStx({
      amountUstx: 20_940_000_000_000,
      user: usersList[2],
      nonce: ++nonceUser2,
      network,
    });

    // Try to delegate again with the first user, more STX
    chainUpdate = await orchestrator.waitForNextStacksBlock();
    await getCheckDelegation(network, usersList[0].stxAddress);

    await broadcastDelegateStx({
      amountUstx: 11_000_000_000,
      user: usersList[0],
      nonce: ++nonceUser0,
      network,
    });

    chainUpdate = await orchestrator.waitForNextStacksBlock();
    await getCheckDelegation(network, usersList[0].stxAddress);

    for (let i = 1; i < chainUpdate.new_blocks[0].block.transactions.length; i++) {
      let metadataDelegateI = chainUpdate.new_blocks[0].block.transactions[i]['metadata'];
      console.log('1st METADATA DELEGATE CYCLE 4', metadataDelegateI);
      expect((metadataDelegateI as any)['success']).toBe(true);
      // expect((metadataDelegateI as any)["result"]).toBe("(ok false)");
    }

    chainUpdate = await orchestrator.waitForNextStacksBlock();
    for (let i = 1; i < chainUpdate.new_blocks[0].block.transactions.length; i++) {
      let metadataDelegateI = chainUpdate.new_blocks[0].block.transactions[i]['metadata'];
      console.log('2nd METADATA DELEGATE CYCLE 4', metadataDelegateI);

      expect((metadataDelegateI as any)['success']).toBe(true);
      // expect((metadataDelegateI as any)["result"]).toBe("(ok false)");
    }
    chainUpdate = await orchestrator.waitForNextStacksBlock();
    for (let i = 1; i < chainUpdate.new_blocks[0].block.transactions.length; i++) {
      let metadataDelegateI = chainUpdate.new_blocks[0].block.transactions[i]['metadata'];
      console.log('3rd METADATA DELEGATE CYCLE 4', metadataDelegateI);

      expect((metadataDelegateI as any)['success']).toBe(true);
      // expect((metadataDelegateI as any)["result"]).toBe("(ok false)");
    }

    await orchestrator.waitForNextStacksBlock();

    // Friedger check table entry:

    poxInfo = await getPoxInfo(network);
    console.log('pox info CURRENT CYCLE:', poxInfo.current_cycle);
    console.log('pox info NEXT CYCLE:', poxInfo.next_cycle);

    poxAddrInfo0 = await readRewardCyclePoxAddressForAddress(network, 5, Accounts.DEPLOYER.stxAddress);

    expect(poxAddrInfo0).toBeNull();
    console.log('POX ADDRESS INFO WALLET 1', poxAddrInfo0);

    await orchestrator.waitForNextStacksBlock();

    poxAddrInfo1 = await readRewardCyclePoxAddressListAtIndex(network, 5, 0);

    expect(poxAddrInfo1?.['total-ustx']).toEqual(uintCV(50_536_942_145_278)); // 375_000_000_000 before
    console.log('POX ADDRESS INFO POOL', poxAddrInfo1);

    console.log('first user:', await getAccount(network, usersList[0].stxAddress));
    console.log('second user:', await getAccount(network, usersList[1].stxAddress));
    console.log('third user:', await getAccount(network, usersList[2].stxAddress));
    console.log('fourth user:', await getAccount(network, usersList[3].stxAddress));

    console.log(
      '** ' + (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata).bitcoin_anchor_block_identifier.index
    );

    chainUpdate = await orchestrator.waitForNextStacksBlock();

    getPoolMembers(network);

    await broadcastUpdateScBalances({
      user: Accounts.DEPLOYER,
      nonce: (await getAccount(network, Accounts.DEPLOYER.stxAddress)).nonce,
      network,
    });

    chainUpdate = await orchestrator.waitForNextStacksBlock();

    metadataUpdateBalances = chainUpdate.new_blocks[0].block.transactions[1]['metadata'];
    expect((metadataUpdateBalances as any)['success']).toBe(true);
    expect((metadataUpdateBalances as any)['result']).toBe('(ok true)');

    console.log(
      '** ' + (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata).bitcoin_anchor_block_identifier.index
    );

    await getScLockedBalance(network);

    console.log(`DEPLOYER weight:`);
    await getStackerWeight(network, Accounts.DEPLOYER.stxAddress, 5);

    for (let i = 0; i <= 3; i++) {
      console.log(`MINER ${i + 1} weight:`);
      await getStackerWeight(network, usersList[i].stxAddress, 5);
    }

    chainUpdate = await waitForRewardCycleId(network, orchestrator, 6);
    console.log(
      '** ' + (chainUpdate.new_blocks[0].block.metadata as StacksBlockMetadata).bitcoin_anchor_block_identifier.index
    );
  });
});
