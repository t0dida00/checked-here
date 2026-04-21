import { redirect } from 'next/navigation';

// Root route → /globe
export default function Home() {
  redirect('/globe');
}
