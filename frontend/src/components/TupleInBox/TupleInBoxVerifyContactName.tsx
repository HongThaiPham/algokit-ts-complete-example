/* eslint-disable no-console */
import { ReactNode, useState } from 'react'

import { useWallet } from '@txnlab/use-wallet'
import { TupleInBox, TupleInBoxClient } from '../../contracts/TupleInBoxClient'
import { enqueueSnackbar } from 'notistack'
import { decodeAddress } from 'algosdk'

/* Example usage
<TupleInBoxVerifyContactName
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call verifyContactName"
  typedClient={typedClient}
  addr={addr}
  name={name}
/>
*/
type TupleInBoxVerifyContactNameArgs = TupleInBox['methods']['verifyContactName(address,string)void']['argsObj']

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: TupleInBoxClient | null
  addr: TupleInBoxVerifyContactNameArgs['addr']
  name: TupleInBoxVerifyContactNameArgs['name']
  disabled?: boolean
}

const TupleInBoxVerifyContactName = (props: Props) => {
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
    console.log(`Calling verifyContactName`)
    try {
      enqueueSnackbar('Sending transaction...', { variant: 'info' })
      const tx = await props.typedClient.verifyContactName(
        {
          addr: props.addr,
          name: props.name,
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

export default TupleInBoxVerifyContactName
