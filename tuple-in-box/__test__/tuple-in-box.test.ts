import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import { TupleInBoxClient } from '../contracts/clients/TupleInBoxClient';
import { algos, getOrCreateKmdWalletAccount, microAlgos } from '@algorandfoundation/algokit-utils';
import { decodeAddress, Account, ABITupleType, Algodv2 } from 'algosdk';

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
    await appClient.appClient.fundAppAccount(algos(1));
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

  test('should add contact', async () => {
    const { algod, kmd } = fixture.context;
    const user = await getOrCreateKmdWalletAccount(
      {
        name: 'tealscript-test-wallet',
        fundWith: algos(5),
      },
      algod,
      kmd
    );

    const txn = await appClient.addContact(
      {
        addr: user.addr,
        ...templateContact,
      },
      {
        boxes: [
          {
            appIndex: 0,
            name: decodeAddress(user.addr).publicKey,
          },
        ],
        sender: user,
      }
    );

    expect(txn).toBeDefined();

    const box = await appClient.appClient.getBoxValue(decodeAddress(user.addr).publicKey);
    expect(decodeContactsTuple(box)).toMatchObject(templateContact);
  });

  test('should update contact field', async () => {
    const { algod, kmd } = fixture.context;
    const user = await getOrCreateKmdWalletAccount(
      {
        name: 'tealscript-test-wallet',
        fundWith: algos(5),
      },
      algod,
      kmd
    );

    const txn = await appClient.updateContactField(
      {
        addr: user.addr,
        field: 'name',
        value: 'Jane Doe',
      },
      {
        boxes: [
          {
            appIndex: 0,
            name: decodeAddress(user.addr).publicKey,
          },
        ],
        sender: user,
      }
    );

    expect(txn).toBeDefined();

    const box = await appClient.appClient.getBoxValue(decodeAddress(user.addr).publicKey);
    expect(decodeContactsTuple(box)).toMatchObject({ ...templateContact, name: 'Jane Doe' });
  });

  test('should verify contact name', async () => {
    const { algod, kmd } = fixture.context;
    const user = await getOrCreateKmdWalletAccount(
      {
        name: 'tealscript-test-wallet',
        fundWith: algos(5),
      },
      algod,
      kmd
    );

    const txn = await appClient.verifyContactName(
      {
        addr: user.addr,
        name: 'Jane Doe',
      },
      {
        boxes: [
          {
            appIndex: 0,
            name: decodeAddress(user.addr).publicKey,
          },
        ],
        sender: user,
      }
    );

    expect(txn).toBeDefined();
  });
});
