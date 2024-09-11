import dynamic from 'next/dynamic'

const DynamicParserComponent = dynamic(
  () => import('../components/ParserComponent'),
  { ssr: false }
)

export default function Home() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>EU Law Document Parser</h1>
      <DynamicParserComponent />
    </div>
  )
}
