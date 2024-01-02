import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import { TupleInBoxClient } from '../contracts/clients/TupleInBoxClient';
import { algos, getOrCreateKmdWalletAccount, microAlgos } from '@algorandfoundation/algokit-utils';
import { decodeAddress, Account, ABITupleType } from 'algosdk';

const fixture = algorandFixture();

let appClient: TupleInBoxClient;
let sender: Account;
let mainAccount: Account;

function decodeContactsTuple(encodedTuple: Uint8Array) {
  const contactTupleType = ABITupleType.from('(string,string)');
  const decodedTuple = contactTupleType.decode(encodedTuple).valueOf() as string[];

  return {
    name: decodedTuple[0],
    phone: decodedTuple[1],
  };
}

const templateContact = {
  name: 'John Doe',
  phone: '555-555-5555',
};
describe('TupleInBox', () => {
  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    const { algod, testAccount, kmd } = fixture.context;
    mainAccount = testAccount;
    sender = await getOrCreateKmdWalletAccount(
      {
        name: 'tealscript-test-wallet',
        fundWith: algos(10),
      },
      algod,
      kmd
    );

    appClient = new TupleInBoxClient(
      {
        sender: mainAccount,
        resolveBy: 'id',
        id: 0,
      },
      algod
    );

    await appClient.create.createApplication({});
    await appClient.appClient.fundAppAccount(microAlgos(1000000));
  });

  test('should set my contact', async () => {
    const txn = await appClient.setMyContact(
      {
        ...templateContact,
      },
      {
        boxes: [
          {
            appIndex: 0,
            name: decodeAddress(sender.addr).publicKey,
          },
        ],
        sender,
      }
    );

    expect(txn).toBeDefined();

    const globalState = await appClient.getGlobalState();
    expect(globalState).toBeDefined();
    expect(globalState.me).toBeDefined();
    expect(decodeContactsTuple(globalState.me!.asByteArray())).toMatchObject(templateContact);
  });
});
