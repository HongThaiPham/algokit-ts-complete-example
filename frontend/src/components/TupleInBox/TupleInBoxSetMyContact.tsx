/* eslint-disable no-console */
import { ReactNode, useCallback, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet'
import { TupleInBox, TupleInBoxClient } from '../../contracts/TupleInBoxClient'
import { decodeAddress } from 'algosdk'
import { enqueueSnackbar } from 'notistack'

/* Example usage
<TupleInBoxSetMyContact
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call setMyContact"
  typedClient={typedClient}
  name={name}
  phone={phone}
/>
*/
type TupleInBoxSetMyContactArgs = TupleInBox['methods']['setMyContact(string,string)void']['argsObj']

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: TupleInBoxClient | null
  name: TupleInBoxSetMyContactArgs['name']
  phone: TupleInBoxSetMyContactArgs['phone']
  disabled?: boolean
}

const TupleInBoxSetMyContact = (props: Props) => {
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
    console.log(`Calling setMyContact`)
    try {
      enqueueSnackbar('Sending transaction...', { variant: 'info' })
      const tx = await props.typedClient.setMyContact(
        {
          name: props.name,
          phone: props.phone,
        },
        {
          boxes: [
            {
              appIndex: 0,
              name: decodeAddress(sender.addr).publicKey,
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

export default TupleInBoxSetMyContact
