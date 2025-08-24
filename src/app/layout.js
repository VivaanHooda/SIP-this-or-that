import { DebateProvider } from '@/context/DebateContext';
import '@/styles/App.css'; 
import '@/styles/index.css';

// Note: Make sure the paths to your CSS files are correct.

export const metadata = {
  title: 'This or That Debate App',
  description: 'An interactive debate platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DebateProvider>
          {children}
        </DebateProvider>
      </body>
    </html>
  );
}