/* eslint-disable no-console */
import { ReactNode, useState } from 'react'
import { TupleInBoxClient } from '../../contracts/TupleInBoxClient'
import { useWallet } from '@txnlab/use-wallet'
import { enqueueSnackbar } from 'notistack'

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: TupleInBoxClient | null
  onAppChange: (appId: number | bigint) => void
}

const TupleInBoxCreateApplication = (props: Props) => {
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
    try {
      enqueueSnackbar('Sending transaction...', { variant: 'info' })
      const tx = await props.typedClient.create.createApplication({}, { sender })
      const appRef = await props.typedClient.appClient.getAppReference()
      props.onAppChange(appRef.appId)
      enqueueSnackbar(`Transaction sent: ${tx.transaction.txID()}`, { variant: 'success' })
      setLoading(false)
    } catch (e) {
      console.error(e)
      enqueueSnackbar('Failed to send transaction', { variant: 'error' })
    }
    setLoading(false)
  }

  return (
    <button className={props.buttonClass} onClick={callMethod}>
      {loading ? props.buttonLoadingNode || props.buttonNode : props.buttonNode}
    </button>
  )
}

export default TupleInBoxCreateApplication
