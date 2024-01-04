/* eslint-disable no-console */
import { ReactNode, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet'
import { TupleInBox, TupleInBoxClient } from '../../contracts/TupleInBoxClient'
import { decodeAddress } from 'algosdk'
import { enqueueSnackbar } from 'notistack'

/* Example usage
<TupleInBoxAddContact
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call addContact"
  typedClient={typedClient}
  addr={addr}
  name={name}
  phone={phone}
/>
*/
type TupleInBoxAddContactArgs = TupleInBox['methods']['addContact(address,string,string)void']['argsObj']

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: TupleInBoxClient | null
  addr: TupleInBoxAddContactArgs['addr']
  name: TupleInBoxAddContactArgs['name']
  phone: TupleInBoxAddContactArgs['phone']
  disabled?: boolean
}

const TupleInBoxAddContact = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }

  const callMethod = async () => {
    if (!props.typedClient) return
    if (!signer || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      return
    }
    setLoading(true)
    console.log(`Calling addContact`)
    try {
      enqueueSnackbar('Sending transaction...', { variant: 'info' })
      const tx = await props.typedClient.addContact(
        {
          addr: props.addr,
          name: props.name,
          phone: props.phone,
        },
        {
          boxes: [
            {
              appIndex: 0,
              name: decodeAddress(props.addr).publicKey,
            },
          ],
          sender,
        },
      )
      enqueueSnackbar(`Transaction sent: ${tx.transaction.txID()}`, { variant: 'success' })
    } catch (e) {
      console.error(e)
      enqueueSnackbar('Failed to send transaction', { variant: 'error' })
    }
    setLoading(false)
  }

  return (
    <button className={props.buttonClass} onClick={callMethod} disabled={props.disabled}>
      {loading ? props.buttonLoadingNode || props.buttonNode : props.buttonNode}
    </button>
  )
}

export default TupleInBoxAddContact
