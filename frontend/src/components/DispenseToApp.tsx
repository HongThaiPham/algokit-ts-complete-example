import { algos } from '@algorandfoundation/algokit-utils'
import { ApplicationClient } from '@algorandfoundation/algokit-utils/types/app-client'
import { useWallet } from '@txnlab/use-wallet'
import { enqueueSnackbar } from 'notistack'
import { useCallback } from 'react'

type Props = {
  appClient: ApplicationClient | undefined
  disabled?: boolean
}
const DispenseToApp: React.FC<Props> = ({ appClient, disabled }) => {
  if (!appClient) return null
  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }
  const callMethod = useCallback(async () => {
    if (!signer || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      return
    }
    const tx = await appClient.fundAppAccount({
      amount: algos(1),
      sender,
    })
    enqueueSnackbar(`Transaction sent: ${tx.transaction.txID()}`, { variant: 'success' })
  }, [appClient, activeAddress, signer])
  return (
    <button className="btn btn-neutral" onClick={callMethod} disabled={disabled}>
      Dispense to App
    </button>
  )
}

export default DispenseToApp
