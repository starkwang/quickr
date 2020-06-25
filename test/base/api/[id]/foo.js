export default function (req, res) {
  res.send('foo' + req.params.id)
}
