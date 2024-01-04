import { Contract } from '@algorandfoundation/tealscript';

type Contact = { name: string; phone: string };

// eslint-disable-next-line no-unused-vars
class TupleInBox extends Contract {
  contacts = BoxMap<Address, Contact>();

  me = GlobalStateKey<Contact>();

  setMyContact(name: string, phone: string): void {
    const contact: Contact = { name: name, phone: phone };
    this.me.value = contact;
    this.contacts(this.txn.sender).value = contact;
  }

  addContact(addr: Address, name: string, phone: string): void {
    const contact: Contact = { name: name, phone: phone };
    this.contacts(addr).value = contact;
  }

  updateContactField(addr: Address, field: string, value: string): void {
    if (field === 'name') {
      this.contacts(addr).value.name = value;
    } else if (field === 'phone') {
      this.contacts(addr).value.phone = value;
    } else throw Error('invalid field');
  }

  verifyContactName(addr: Address, name: string): void {
    assert(this.contacts(addr).value.name === name);
  }
}
