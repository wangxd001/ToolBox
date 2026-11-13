export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
      {message}
    </div>
  )
}
