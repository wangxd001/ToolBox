import { Btn } from './ui'
import { BoltIcon } from './Icons'

export function ExampleButton({
  onClick,
  label = '填入示例',
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <Btn variant="ghost" onClick={onClick}>
      <BoltIcon size={16} />
      {label}
    </Btn>
  )
}
