export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Love Kush Nursery API</h1>
      <p>API is running. Use the following endpoints:</p>
      <ul>
        <li><code>GET /api/plants</code> — List all plants</li>
        <li><code>POST /api/plants</code> — Create a plant (with image upload)</li>
        <li><code>GET /api/plants/[id]</code> — Get a single plant</li>
        <li><code>PUT /api/plants/[id]</code> — Update a plant</li>
        <li><code>DELETE /api/plants/[id]</code> — Delete a plant</li>
      </ul>
    </main>
  )
}
