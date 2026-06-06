export default function handler(req, res) {
  res.status(200).json({
    message: 'Hello from the server!',
    serverTime: new Date().toISOString(),
  })
}
