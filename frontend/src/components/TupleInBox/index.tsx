import { useWallet } from '@txnlab/use-wallet'
import TupleInBoxCreateApplication from './TupleInBoxCreateApplication'
import { TupleInBoxClient } from '../../contracts/TupleInBoxClient'
import { Algodv2 } from 'algosdk'
import { useEffect, useMemo, useState } from 'react'
import TupleInBoxSetMyContact from './TupleInBoxSetMyContact'
import IndexerClient from 'algosdk/dist/types/client/v2/indexer/indexer'
import DispenseToApp from '../DispenseToApp'
import TupleInBoxAddContact from './TupleInBoxAddContact'
import TupleInBoxUpdateContactField from './TupleInBoxUpdateContactField'
import TupleInBoxVerifyContactName from './TupleInBoxVerifyContactName'

type Props = {
  algodClient: Algodv2
  indexer: IndexerClient
}

const TupleInBox: React.FC<Props> = ({ algodClient, indexer }) => {
  const [name, setName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [addr, setAddr] = useState<string>('')
  const [appId, setAppId] = useState<number | bigint>(0)
  const [appClient, setAppClient] = useState<TupleInBoxClient | null>(null)
  const { activeAddress } = useWallet()

  const _tupleInBoxClient = useMemo(
    () =>
      new TupleInBoxClient(
        {
          resolveBy: 'id',
          id: appId,
        },
        algodClient,
      ),
    [appId],
  )

  useEffect(() => {
    setAppClient(_tupleInBoxClient)
  }, [appId])
  if (!activeAddress) return null
  return (
    <div className="collapse collapse-arrow bg-base-200">
      <input type="radio" name="my-accordion-2" />
      <div className="collapse-title text-xl font-medium">Tuple in box (Contact manager)</div>
      <div className="collapse-content">
        <div className="flex gap-2">
          <TupleInBoxCreateApplication
            buttonClass={'btn'}
            typedClient={_tupleInBoxClient}
            buttonNode="Create application"
            onAppChange={setAppId}
          />

          <DispenseToApp appClient={appClient?.appClient} disabled={!appId} />
          <div className="flex gap-2">
            <input
              type="text"
              data-test-id="contact-name"
              placeholder="Provide contact name"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
              }}
            />

            <input
              type="text"
              data-test-id="contact-phone"
              placeholder="Provide contact phone"
              className="input input-bordered w-full"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
              }}
            />

            <input
              type="text"
              data-test-id="contact-addr"
              placeholder="Provide contact addr"
              className="input input-bordered w-full"
              value={addr}
              onChange={(e) => {
                setAddr(e.target.value)
              }}
            />
          </div>

          <TupleInBoxSetMyContact
            buttonClass="btn"
            buttonLoadingNode={<span className="loading loading-spinner" />}
            buttonNode="Call setMyContact"
            typedClient={appClient}
            name={name}
            phone={phone}
            disabled={!appId}
          />

          <TupleInBoxAddContact
            buttonClass="btn"
            buttonLoadingNode={<span className="loading loading-spinner" />}
            buttonNode="Call addContact"
            typedClient={appClient}
            name={name}
            phone={phone}
            disabled={!appId}
            addr={addr}
          />
          <TupleInBoxUpdateContactField
            buttonClass="btn"
            buttonLoadingNode={<span className="loading loading-spinner" />}
            buttonNode="Call updateContactField (phone)"
            typedClient={appClient}
            value={name}
            field={'phone'}
            disabled={!appId}
            addr={addr}
          />
          <TupleInBoxVerifyContactName
            buttonClass="btn"
            buttonLoadingNode={<span className="loading loading-spinner" />}
            buttonNode="Call verifyContactName"
            typedClient={appClient}
            name={name}
            disabled={!appId}
            addr={addr}
          />
        </div>
      </div>
    </div>
  )
}

export default TupleInBox
