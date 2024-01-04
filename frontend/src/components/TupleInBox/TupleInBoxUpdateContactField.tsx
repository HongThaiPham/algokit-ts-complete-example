/* eslint-disable no-console */
import { ReactNode, useState } from 'react'

import { useWallet } from '@txnlab/use-wallet'
import { TupleInBox, TupleInBoxClient } from '../../contracts/TupleInBoxClient'
import { enqueueSnackbar } from 'notistack'
import { decodeAddress } from 'algosdk'

/* Example usage
<TupleInBoxUpdateContactField
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call updateContactField"
  typedClient={typedClient}
  addr={addr}
  field={field}
  value={value}
/>
*/
type TupleInBoxUpdateContactFieldArgs = TupleInBox['methods']['updateContactField(address,string,string)void']['argsObj']

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: TupleInBoxClient | null
  addr: TupleInBoxUpdateContactFieldArgs['addr']
  field: TupleInBoxUpdateContactFieldArgs['field']
  value: TupleInBoxUpdateContactFieldArgs['value']
  disabled?: boolean
}

const TupleInBoxUpdateContactField = (props: Props) => {
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
    console.log(`Calling updateContactField`)
    try {
      enqueueSnackbar('Sending transaction...', { variant: 'info' })
      const tx = await props.typedClient.updateContactField(
        {
          addr: props.addr,
          field: props.field,
          value: props.value,
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

export default TupleInBoxUpdateContactField
