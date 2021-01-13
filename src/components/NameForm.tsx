import React from "react";
import { useInput } from '../hooks/useInput';

export function NameForm({ onSend, ...f }: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & { onSend: (evt: React.FormEvent, name: string) => void }) {
  const { value, bind, reset } = useInput('');
  return (
    <form {...f} onSubmit={(evt) => onSend(evt, value)}>
      <label>
        Username:
        <input type="text" {...bind} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}