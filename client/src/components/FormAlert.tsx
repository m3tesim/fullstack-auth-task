interface FormAlertProps {
  message: string | null;
}

export function FormAlert({ message }: FormAlertProps) {
  if (!message) {
    return null;
  }
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {message}
    </div>
  );
}
