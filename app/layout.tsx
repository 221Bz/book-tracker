import './globals.css'

import { UserProvider } from '@/context/UserContext'

export const metadata = {
  title: "BookGraph",
  icons: {
    icon: '/BookGraphBlack.png',        // favicon utama
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="id">
    <head>
      <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    </head>
    <body className="bg-[#121212] min-h-screen">
        <UserProvider>
          {children}
        </UserProvider>
    </body>
  </html>
  
  )
}