export function ExampleButton({
  onClick,
  label = '填入示例',
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[44px] items-center justify-center rounded-md border border-gray-300 px-3 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200"
    >
      {label}
    </button>
  )
}
