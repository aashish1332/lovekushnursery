import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Love Kush Nursery API',
  description: 'Backend API for Love Kush Nursery',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
