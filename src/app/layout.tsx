export const metadata = { title: "Stacks Escrow", description: "Secure P2P trades on Stacks" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
