import { useWallet } from '@txnlab/use-wallet'
import TupleInBoxCreateApplication from './TupleInBoxCreateApplication'
import { TupleInBoxClient } from '../../contracts/TupleInBoxClient'
import { Algodv2 } from 'algosdk'
import { useEffect, useMemo, useState } from 'react'
import TupleInBoxSetMyContact from './TupleInBoxSetMyContact'
import IndexerClient from 'algosdk/dist/types/client/v2/indexer/indexer'
import DispenseToApp from '../DispenseToApp'

type Props = {
  algodClient: Algodv2
  indexer: IndexerClient
}

const TupleInBox: React.FC<Props> = ({ algodClient, indexer }) => {
  const [name, setName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [appId, setAppId] = useState<number | bigint>(0)
  const [appClient, setAppClient] = useState<TupleInBoxClient | null>(null)
  const { activeAddress } = useWallet()

  const _tupleInBoxClient = useMemo(
    () =>
      new TupleInBoxClient(
        {
          resolveBy: 'id',
          id: 0,
          // creatorAddress: activeAddress,
          // findExistingUsing: indexer,
        },
        algodClient,
      ),
    [appId],
  )

  useEffect(() => {
    setAppClient(
      new TupleInBoxClient(
        {
          resolveBy: 'id',
          id: appId,
        },
        algodClient,
      ),
    )
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
          <DispenseToApp appClient={appClient?.appClient} />
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
          </div>

          <TupleInBoxSetMyContact
            buttonClass="btn"
            buttonLoadingNode={<span className="loading loading-spinner" />}
            buttonNode="Call setMyContact"
            typedClient={appClient}
            name={name}
            phone={phone}
          />
        </div>
      </div>
    </div>
  )
}

export default TupleInBox
