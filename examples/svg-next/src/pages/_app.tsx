// eslint-disable-next-line import/no-unresolved
import '@/shared/ui/index.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
